import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

interface InsightCardProps {
  text: string;
  type: "trend" | "insight";
  onPress?: () => void;
}

const InsightCard = ({ text, type, onPress }: InsightCardProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <BlurView intensity={0} style={styles.blur}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={type === "trend" ? "trending-up" : "bulb"}
              size={24}
              color="#fff"
            />
          </View>
          <Text style={styles.text}>{text}</Text>
        </View>
        <View style={styles.footer}>
          <Text style={styles.typeText}>
            {type === "trend" ? "Trend" : "Insight"}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color="rgba(255, 255, 255, 0.6)"
          />
        </View>
      </BlurView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
  },
  blur: {
    padding: 16,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  typeText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    fontWeight: "500",
  },
});

export default InsightCard;
