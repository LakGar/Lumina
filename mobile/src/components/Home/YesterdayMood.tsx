import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

const YesterdayMood = () => {
  // This would be fetched from your data store
  const yesterdayMood = {
    mood: "Peaceful",
    color: "#7877D6",
    icon: "sunny",
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Yesterday's Mood</Text>
      <View style={styles.moodChip}>
        <Ionicons
          name={yesterdayMood.icon as any}
          size={20}
          color={yesterdayMood.color}
        />
        <Text style={[styles.moodText, { color: yesterdayMood.color }]}>
          {yesterdayMood.mood}
        </Text>
      </View>
    </View>
  );
};

export default YesterdayMood;

const styles = StyleSheet.create({
  container: {
    width: "90%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  label: {
    color: "#fff",
    opacity: 0.7,
    fontSize: 16,
  },
  moodChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(120, 119, 214, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(120, 119, 214, 0.2)",
  },
  moodText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "500",
  },
});
