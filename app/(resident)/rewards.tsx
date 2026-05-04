import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Header, Card, Button, SideMenu } from "@/components/ui";
import { useAppStore, useAuthStore } from "@/lib/store";
import { COLORS, commonStyles } from "@/lib/styles";
import { REWARDS, REWARD_NETWORKS } from "@/lib/constants";
import type { Reward, RewardNetwork } from "@/lib/types";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_WIDTH = (SCREEN_WIDTH - 48 - 16) / 2;

type NetworkFilter = (typeof REWARD_NETWORKS)[number];

const networkColors: Record<RewardNetwork, string> = {
  GLOBE: "#00A0DC",
  SMART: "#00B900",
  TNT: "#E8112D",
};

function RewardCard({
  reward,
  currentPoints,
  onRedeem,
}: {
  reward: Reward;
  currentPoints: number;
  onRedeem: (reward: Reward) => void;
}): JSX.Element {
  const canRedeem = currentPoints >= reward.pointsCost;

  return (
    <Card
      variant="elevated"
      style={[styles.rewardCard, !canRedeem && styles.rewardCardDisabled]}
    >
      <View style={styles.rewardHeader}>
        <View
          style={[
            styles.networkBadge,
            { backgroundColor: networkColors[reward.network] },
          ]}
        >
          <Text style={styles.networkBadgeText}>{reward.network}</Text>
        </View>
      </View>

      <Text style={styles.rewardAmount}>PHP {reward.amount}</Text>

      <Text style={styles.pointsCost}>{reward.pointsCost} points</Text>

      <Button
        title="Redeem"
        size="sm"
        variant={canRedeem ? "primary" : "outline"}
        onPress={() => canRedeem && onRedeem(reward)}
        disabled={!canRedeem}
        style={styles.redeemButton}
      />
    </Card>
  );
}

export default function RewardsScreen(): JSX.Element {
  const router = useRouter();
  const { user, redeemPoints } = useAuthStore();
  const { setMenuOpen } = useAppStore();
  const [isRedeeming, setIsRedeeming] = useState<string | null>(null);

  const currentPoints = user?.points || 0;

  const handleRedeem = (reward: Reward) => {
    Alert.alert(
      "Confirm Redemption",
      `Redeem ${reward.pointsCost} points for PHP ${reward.amount} ${reward.network} load?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => {
            setIsRedeeming(reward.id);
            setTimeout(() => {
              const success = redeemPoints(
                reward.pointsCost,
                reward,
                `Redeemed for PHP ${reward.amount} ${reward.network} load`
              );
              setIsRedeeming(null);
              if (success) {
                Alert.alert(
                  "Redemption Successful",
                  `Your PHP ${reward.amount} ${reward.network} load will be sent to your registered phone number within 24-48 hours.`
                );
              } else {
                Alert.alert("Error", "Failed to redeem. Please try again.");
              }
            }, 500);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <Header title="Rewards" onMenuPress={() => setMenuOpen(true)} showMenu />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card variant="primary" style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Your Points</Text>
          <Text style={styles.balanceValue}>{currentPoints}</Text>
          <Text style={styles.balanceHint}>
            Earn 20 points for proper segregation
          </Text>
        </Card>

        <View style={styles.rewardsGrid}>
          {REWARDS.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              currentPoints={currentPoints}
              onRedeem={handleRedeem}
            />
          ))}
        </View>
      </ScrollView>

      <SideMenu />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 32,
  },
  balanceCard: {
    alignItems: "center",
    marginBottom: 24,
  },
  balanceLabel: {
    color: COLORS.white,
    fontSize: 14,
    opacity: 0.9,
  },
  balanceValue: {
    color: COLORS.white,
    fontSize: 48,
    fontWeight: "bold",
    marginVertical: 8,
  },
  balanceHint: {
    color: COLORS.white,
    fontSize: 12,
    opacity: 0.8,
  },
  rewardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  rewardCard: {
    width: CARD_WIDTH,
    padding: 16,
  },
  rewardCardDisabled: {
    opacity: 0.6,
  },
  rewardHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  networkBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  networkBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "bold",
  },
  rewardAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  rewardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pointsCost: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  redeemButton: {
    marginTop: "auto",
  },
});