import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import React, { useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const topics = [
  {
    id: 1,
    title: "Confidence",
    icon: "shield-outline",
    color: "#7877D6",
    gradientColors: ["#7877D6", "#5758A6"],
  },
  {
    id: 2,
    title: "Grief",
    icon: "heart-outline",
    color: "#E67E76",
    gradientColors: ["#E67E76", "#B85F58"],
  },
  {
    id: 3,
    title: "Creativity",
    icon: "color-palette-outline",
    color: "#64B687",
    gradientColors: ["#64B687", "#4A8B64"],
  },
  {
    id: 4,
    title: "Goals",
    icon: "flag-outline",
    color: "#B4A7D6",
    gradientColors: ["#B4A7D6", "#8F84AB"],
  },
  {
    id: 5,
    title: "Self-Care",
    icon: "leaf-outline",
    color: "#6BB8B3",
    gradientColors: ["#6BB8B3", "#4E8A86"],
  },
  {
    id: 6,
    title: "Burnout",
    icon: "flame-outline",
    color: "#E6A876",
    gradientColors: ["#E6A876", "#B88459"],
  },
];

const { width } = Dimensions.get("window");
const CARD_MARGIN = 8;
const CARD_WIDTH = (width - 30 - CARD_MARGIN * 4) / 2;

const TopicCard = ({ topic }: { topic: any }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <Animated.View
        style={[styles.topicCard, { transform: [{ scale: scaleAnim }] }]}
      >
        <LinearGradient
          colors={topic.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.iconContainer}>
            <Ionicons name={topic.icon} size={28} color="#fff" />
          </View>
          <Text style={styles.topicTitle}>{topic.title}</Text>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

const TopicsGrid = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Explore Topics</Text>
      <View style={styles.grid}>
        {topics.map((topic) => (
          <TopicCard key={topic.id} topic={topic} />
        ))}
      </View>
    </View>
  );
};

export default TopicsGrid;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 24,
  },
  sectionTitle: {
    color: "white",
    opacity: 0.7,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    textTransform: "uppercase",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: CARD_MARGIN * 2,
  },
  topicCard: {
    width: CARD_WIDTH,
    aspectRatio: 1,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  gradient: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  topicTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
});
