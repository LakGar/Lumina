import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

interface Mood {
  emoji: string;
  label: string;
  color: string;
}

const moods: Mood[] = [
  { emoji: "😊", label: "Happy", color: "#FFD93D" },
  { emoji: "😌", label: "Peaceful", color: "#7877D6" },
  { emoji: "🤔", label: "Thoughtful", color: "#64B687" },
  { emoji: "😔", label: "Sad", color: "#6BB8B3" },
  { emoji: "😤", label: "Frustrated", color: "#E67E76" },
  { emoji: "😰", label: "Anxious", color: "#B4A7D6" },
  { emoji: "😴", label: "Tired", color: "#8B7355" },
  { emoji: "🥳", label: "Excited", color: "#FF8FB1" },
];

interface MoodSelectorProps {
  onMoodSelect: (mood: Mood) => void;
}

const MoodSelector = ({ onMoodSelect }: MoodSelectorProps) => {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood);
    onMoodSelect(mood);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="heart-outline" size={20} color="#7877D6" />
          <Text style={styles.title}>How are you feeling?</Text>
        </View>
        {selectedMood && (
          <View
            style={[
              styles.selectedMood,
              { backgroundColor: `${selectedMood.color}15` },
            ]}
          >
            <Text style={styles.selectedEmoji}>{selectedMood.emoji}</Text>
            <Text style={[styles.selectedLabel, { color: selectedMood.color }]}>
              {selectedMood.label}
            </Text>
          </View>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.moodList}
      >
        {moods.map((mood) => (
          <TouchableOpacity
            key={mood.label}
            style={[
              styles.moodButton,
              selectedMood?.label === mood.label && {
                backgroundColor: `${mood.color}15`,
                borderColor: `${mood.color}30`,
              },
            ]}
            onPress={() => handleMoodSelect(mood)}
          >
            <Text style={styles.emoji}>{mood.emoji}</Text>
            <Text
              style={[
                styles.label,
                selectedMood?.label === mood.label && { color: mood.color },
              ]}
            >
              {mood.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default MoodSelector;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    color: "#7877D6",
    fontSize: 14,
    fontWeight: "600",
  },
  selectedMood: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  selectedEmoji: {
    fontSize: 16,
  },
  selectedLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  moodList: {
    paddingHorizontal: 20,
    gap: 12,
    flexDirection: "row",
  },
  moodButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    width: 100,
  },
  emoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  label: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
    fontWeight: "500",
  },
});
