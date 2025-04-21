import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

interface MilestoneCardProps {
  title: string;
  date: string;
  entries: number;
  color: string;
  isSelected?: boolean;
  onPress?: () => void;
}

const MilestoneCard = ({
  title,
  date,
  entries,
  color,
  isSelected,
  onPress,
}: MilestoneCardProps) => {
  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.selected]}
      onPress={onPress}
    >
      <LinearGradient
        colors={[color, `${color}80`]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Ionicons
              name={isSelected ? "chevron-down" : "chevron-forward"}
              size={20}
              color="#fff"
            />
          </View>
          <View style={styles.details}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={16} color="#fff" />
              <Text style={styles.detailText}>{date}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="document-text-outline" size={16} color="#fff" />
              <Text style={styles.detailText}>{entries} entries</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width * 0.7,
    height: 120,
    marginRight: 12,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selected: {
    transform: [{ scale: 1.02 }],
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  details: {
    gap: 8,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
  },
});

export default MilestoneCard;
