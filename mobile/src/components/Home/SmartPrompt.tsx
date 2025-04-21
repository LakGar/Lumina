import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
} from "react-native";
import React, { useRef, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";

const prompts = [
  "What's weighing on your mind today?",
  "What made you smile today?",
  "How are you feeling right now?",
  "What are you grateful for today?",
  "What's one thing you'd like to accomplish today?",
];

const SmartPrompt = () => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];

  useEffect(() => {
    const pulse = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]);

    Animated.loop(pulse).start();
  }, []);

  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.8}>
      <Animated.View
        style={[
          styles.iconContainer,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <Ionicons name="bulb-outline" size={24} color="#7877D6" />
      </Animated.View>
      <View style={styles.contentContainer}>
        <Text style={styles.label}>Daily Prompt</Text>
        <Text style={styles.promptText}>{randomPrompt}</Text>
      </View>
      <View style={styles.arrowContainer}>
        <Ionicons name="chevron-forward" size={20} color="#7877D6" />
      </View>
    </TouchableOpacity>
  );
};

export default SmartPrompt;

const styles = StyleSheet.create({
  container: {
    width: "90%",
    backgroundColor: "rgba(120, 119, 214, 0.05)",
    borderRadius: 16,
    padding: 16,
    marginVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(120, 119, 214, 0.2)",
    shadowColor: "#7877D6",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(120, 119, 214, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  contentContainer: {
    flex: 1,
    marginRight: 8,
  },
  label: {
    color: "#7877D6",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
    opacity: 0.8,
  },
  promptText: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 22,
    opacity: 0.9,
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(120, 119, 214, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
});
