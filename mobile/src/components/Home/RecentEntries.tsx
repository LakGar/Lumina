import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

const mockEntries = [
  {
    id: 1,
    date: "Today, 2:30 PM",
    preview: "Had a great meeting with the team...",
    mood: "Excited",
    moodColor: "#7877D6",
    tags: ["Work", "Success"],
  },
  {
    id: 2,
    date: "Today, 10:00 AM",
    preview: "Morning meditation was refreshing...",
    mood: "Peaceful",
    moodColor: "#64B687",
    tags: ["Wellness"],
  },
  {
    id: 3,
    date: "Yesterday, 9:30 PM",
    preview: "Finished reading that book finally...",
    mood: "Accomplished",
    moodColor: "#B4A7D6",
    tags: ["Personal", "Reading"],
  },
];

const RecentEntries = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Entries</Text>
        <TouchableOpacity>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      {mockEntries.map((entry) => (
        <TouchableOpacity key={entry.id} style={styles.entryCard}>
          <View style={styles.entryHeader}>
            <Text style={styles.date}>{entry.date}</Text>
            <View
              style={[
                styles.moodChip,
                { backgroundColor: `${entry.moodColor}15` },
              ]}
            >
              <View
                style={[styles.moodDot, { backgroundColor: entry.moodColor }]}
              />
              <Text style={[styles.moodText, { color: entry.moodColor }]}>
                {entry.mood}
              </Text>
            </View>
          </View>

          <Text style={styles.preview} numberOfLines={2}>
            {entry.preview}
          </Text>

          <View style={styles.tags}>
            {entry.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default RecentEntries;

const styles = StyleSheet.create({
  container: {
    width: "90%",
    marginVertical: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  viewAll: {
    color: "#7877D6",
    fontSize: 14,
  },
  entryCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  date: {
    color: "#fff",
    opacity: 0.6,
    fontSize: 14,
  },
  moodChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  moodDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  moodText: {
    fontSize: 12,
    fontWeight: "500",
  },
  preview: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    color: "#fff",
    fontSize: 12,
    opacity: 0.8,
  },
});
