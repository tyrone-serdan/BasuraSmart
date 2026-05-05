import React, { useMemo, useRef } from "react";
import { StyleSheet, View, Text } from "react-native";
import { WebView } from "react-native-webview";
import { MAP_CONFIG, COLORS } from "@/lib/constants";
import type { RouteStop } from "@/lib/types";

interface RouteMapProps {
  stops?: RouteStop[];
  showRoute?: boolean;
  height?: number;
}

export function RouteMap({
  stops = [],
  showRoute = true,
  height = 350,
}: RouteMapProps): JSX.Element {
  const webViewRef = useRef<WebView>(null);

  if (!stops || stops.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer, { height }]}>
        <Text style={styles.emptyText}>No route stops available</Text>
      </View>
    );
  }

  const completedStops = stops.filter((s) => s.status === "completed");
  const pendingStops = stops.filter((s) => s.status === "pending");

  const markers = useMemo(() => {
    return stops.map((stop, index) => ({
      id: stop.id,
      lat: stop.latitude,
      lng: stop.longitude,
      title: stop.address,
      purok: stop.purok,
      status: stop.status,
      order: index + 1,
    }));
  }, [stops]);

  const completedCoords = useMemo(() => {
    return completedStops.map((s) => [s.latitude, s.longitude]);
  }, [completedStops]);

  const pendingCoords = useMemo(() => {
    return pendingStops.map((s) => [s.latitude, s.longitude]);
  }, [pendingStops]);

  const htmlContent = useMemo(() => {
    const markersHtml = markers
      .map(
        (m) => `
        L.marker([${m.lat}, ${m.lng}], {
          icon: L.divIcon({
            html: '<div style="background-color: ${
              m.status === "completed" ? "#10b981" : "#6b7280"
            }; border: 2px solid white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${
              m.status === "completed" ? "✓" : m.order
            }</div>',
            className: '',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          })
        }).addTo(map).bindPopup('<b>${m.title}</b><br>${m.purok}');
      `
      )
      .join("");

    const completedPolyline = completedCoords.length > 1
      ? `L.polyline(${JSON.stringify(completedCoords)}, {color: '#10b981', weight: 4}).addTo(map);`
      : "";

    const pendingPolyline = pendingCoords.length > 0
      ? `L.polyline(${JSON.stringify(pendingCoords)}, {color: '#9ca3af', weight: 2, dashArray: '8, 8'}).addTo(map);`
      : "";

    return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      zoomControl: true,
      attributionControl: true
    }).setView([${MAP_CONFIG.defaultRegion.latitude}, ${MAP_CONFIG.defaultRegion.longitude}], ${MAP_CONFIG.zoomLevel});
    
    L.tileLayer('${MAP_CONFIG.tileUrl}', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    ${completedPolyline}
    ${pendingPolyline}
    ${markersHtml}
  </script>
</body>
</html>
    `;
  }, [markers, completedCoords, pendingCoords]);

  return (
    <View style={[styles.container, { height }]}>
      <WebView
        ref={webViewRef}
        style={styles.map}
        source={{ html: htmlContent }}
        scrollEnabled={false}
        bounces={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        originWhitelist={["*"]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#e5e7eb",
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
  },
  emptyText: {
    color: "#6b7280",
    fontSize: 16,
  },
  map: {
    flex: 1,
  },
});

export default RouteMap;