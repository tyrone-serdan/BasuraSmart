import React from "react";
import { View, Text, TouchableOpacity, Modal, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore, useAppStore } from "@/lib/store";
import { COLORS } from "@/lib/styles";

interface MenuItemProps {
  label: string;
  onPress: () => void;
  isLogout?: boolean;
}

function MenuItem({ label, onPress, isLogout = false }: MenuItemProps): JSX.Element {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.menuItem, isLogout && styles.logoutItem]}
    >
      <Text style={[styles.menuText, isLogout && styles.logoutText]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function SideMenu(): JSX.Element {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { isMenuOpen, setMenuOpen } = useAppStore();

  const handleEditDetails = () => {
    setMenuOpen(false);
  };

  const handleReportDumping = () => {
    setMenuOpen(false);
    router.push("/(resident)/report");
  };

  const handleRewards = () => {
    setMenuOpen(false);
    router.replace("/(resident)/rewards");
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    router.replace("/");
  };

  return (
    <Modal
      visible={isMenuOpen}
      transparent
      animationType="fade"
      onRequestClose={() => setMenuOpen(false)}
    >
      <Pressable style={styles.overlay} onPress={() => setMenuOpen(false)}>
        <View style={styles.menuContainer}>
          <View style={styles.header}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </Text>
            </View>
            <Text style={styles.userName}>{user?.name || "User"}</Text>
            <Text style={styles.userPhone}>{user?.phone}</Text>
          </View>

          <View style={styles.menuItems}>
            <MenuItem label="Edit User Details" onPress={handleEditDetails} />
            <MenuItem label="Report Illegal Dumping" onPress={handleReportDumping} />
            <MenuItem label="Rewards" onPress={handleRewards} />
          </View>

          <MenuItem label="Log Out" onPress={handleLogout} isLogout />
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    flexDirection: "row",
  },
  menuContainer: {
    backgroundColor: COLORS.white,
    width: 288,
    height: "100%",
  },
  header: {
    backgroundColor: COLORS.primary[500],
    padding: 24,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: {
    color: COLORS.primary[600],
    fontSize: 28,
    fontWeight: "bold",
  },
  userName: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "600",
  },
  userPhone: {
    color: COLORS.white,
    opacity: 0.8,
    fontSize: 14,
    marginTop: 4,
  },
  menuItems: {
    flex: 1,
    paddingTop: 16,
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  menuText: {
    fontSize: 16,
    color: COLORS.text,
  },
  logoutItem: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    marginTop: 16,
    borderBottomWidth: 0,
  },
  logoutText: {
    color: COLORS.error,
    fontWeight: "600",
  },
});

export default SideMenu;