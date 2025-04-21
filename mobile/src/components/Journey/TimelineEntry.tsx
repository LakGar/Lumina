import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface TimelineEntryProps {
  date: string;
  text: string;
  mood: string;
  moodColor: string;
  onPress?: () => void;
}

const TimelineEntry = ({
  date,
  text,
  mood,
  moodColor,
  onPress,
}: TimelineEntryProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.timelineDot}>
        <View style={[styles.moodDot, { backgroundColor: moodColor }]} />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.date}>{date}</Text>
          <View style={styles.moodContainer}>
            <Ionicons name="happy-outline" size={14} color={moodColor} />
            <Text style={[styles.mood, { color: moodColor }]}>{mood}</Text>
          </View>
        </View>
        <Text style={styles.text} numberOfLines={2}>
          {text}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  moodDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  content: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 12,
    padding: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  date: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    fontWeight: "500",
  },
  moodContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  mood: {
    fontSize: 12,
    fontWeight: "500",
  },
  text: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 20,
  },
});

export default TimelineEntry;
