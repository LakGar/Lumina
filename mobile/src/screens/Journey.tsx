import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "../components/Header";
import TimelineEntry from "../components/Journey/TimelineEntry";
import MilestoneCard from "../components/Journey/MilestoneCard";
import InsightCard from "../components/Journey/InsightCard";

// Mock data - replace with actual data from your backend
const mockEntries = [
  {
    id: "1",
    date: "2024-03-20",
    text: "Had a breakthrough moment with the project today. Finally seeing the light at the end of the tunnel.",
    mood: "excited",
    moodColor: "#4CAF50",
  },
  {
    id: "2",
    date: "2024-03-18",
    text: "Feeling overwhelmed with deadlines. Need to take a step back and breathe.",
    mood: "stressed",
    moodColor: "#E67E76",
  },
  {
    id: "3",
    date: "2024-03-15",
    text: "Started a new meditation routine. Feeling more centered and focused.",
    mood: "calm",
    moodColor: "#7877D6",
  },
];

const mockMilestones = [
  {
    id: "1",
    title: "Week of Burnout",
    date: "March 10-17",
    entries: 5,
    color: "#E67E76",
  },
  {
    id: "2",
    title: "Creative Breakthrough",
    date: "March 18-20",
    entries: 3,
    color: "#4CAF50",
  },
];

const mockInsights = [
  {
    id: "1",
    text: "You've been writing about stress 4 times this month — want to reflect on it?",
    type: "trend" as const,
  },
  {
    id: "2",
    text: "Your mood has been improving steadily over the past week",
    type: "insight" as const,
  },
];

const Journey = () => {
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(
    null
  );

  return (
    <View style={styles.container}>
      <Header title="Journey" />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Timeline</Text>
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="options-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          {mockEntries.map((entry) => (
            <TimelineEntry
              key={entry.id}
              date={new Date(entry.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
              text={entry.text}
              mood={entry.mood}
              moodColor={entry.moodColor}
            />
          ))}
        </View>

        <View style={[styles.section, { paddingHorizontal: 20 }]}>
          <Text style={styles.sectionTitle}>Milestones</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.milestonesScroll}
            contentContainerStyle={styles.milestonesContent}
          >
            {mockMilestones.map((milestone) => (
              <MilestoneCard
                key={milestone.id}
                title={milestone.title}
                date={milestone.date}
                entries={milestone.entries}
                color={milestone.color}
                isSelected={selectedMilestone === milestone.id}
                onPress={() => setSelectedMilestone(milestone.id)}
              />
            ))}
          </ScrollView>
        </View>

        <View style={[styles.section, { paddingHorizontal: 20 }]}>
          <Text style={styles.sectionTitle}>AI Insights</Text>
          {mockInsights.map((insight) => (
            <InsightCard
              key={insight.id}
              text={insight.text}
              type={insight.type}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111011",
    paddingTop: 120,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    color: "white",
    opacity: 0.7,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    justifyContent: "center",
    alignItems: "center",
  },
  milestonesScroll: {
    marginHorizontal: -16,
  },
  milestonesContent: {
    paddingHorizontal: 16,
  },
});

export default Journey;
