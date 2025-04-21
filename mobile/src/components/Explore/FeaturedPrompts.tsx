import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import React, { useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const featuredPrompts = [
  {
    id: 1,
    title: "End of Week Review",
    description: "Reflect on your achievements and challenges this week",
    icon: "calendar-outline",
    color: "#7877D6",
    gradientColors: ["#7877D6", "#5758A6"],
  },
  {
    id: 2,
    title: "Monthly Energy Check",
    description: "What drained you this month? What energized you?",
    icon: "battery-charging-outline",
    color: "#64B687",
    gradientColors: ["#64B687", "#4A8B64"],
  },
  {
    id: 3,
    title: "Future Vision",
    description: "Where do you see yourself in 3 months?",
    icon: "eye-outline",
    color: "#B4A7D6",
    gradientColors: ["#B4A7D6", "#8F84AB"],
  },
];

const PromptCard = ({ prompt }: { prompt: any }) => {
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
        style={[styles.promptCard, { transform: [{ scale: scaleAnim }] }]}
      >
        <LinearGradient
          colors={prompt.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.iconContainer}>
            <Ionicons name={prompt.icon} size={24} color="#fff" />
          </View>
          <Text style={styles.promptTitle}>{prompt.title}</Text>
          <Text style={styles.promptDescription}>{prompt.description}</Text>
          <View style={styles.arrow}>
            <Ionicons name="arrow-forward-outline" size={20} color="#fff" />
          </View>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

const FeaturedPrompts = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Featured Prompts</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={296}
        snapToAlignment="center"
      >
        {featuredPrompts.map((prompt) => (
          <PromptCard key={prompt.id} prompt={prompt} />
        ))}
      </ScrollView>
    </View>
  );
};

export default FeaturedPrompts;

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
    marginLeft: 20,
    textTransform: "uppercase",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  promptCard: {
    width: 280,
    height: 180,
    marginRight: 16,
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
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  promptTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  promptDescription: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
    width: "87%",
  },
  arrow: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
});
