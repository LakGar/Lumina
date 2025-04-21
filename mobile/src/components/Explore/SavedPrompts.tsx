import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
} from "react-native";
import React, { useRef } from "react";
import { Ionicons } from "@expo/vector-icons";

const mockSavedPrompts = [
  {
    id: 1,
    prompt: "What's one small win you had today?",
    category: "Gratitude",
    color: "#7877D6",
    isBookmarked: true,
  },
  {
    id: 2,
    prompt: "Describe a moment that made you proud this week",
    category: "Self-Reflection",
    color: "#64B687",
    isBookmarked: true,
  },
  {
    id: 3,
    prompt: "What's a challenge you're facing and how can you overcome it?",
    category: "Growth",
    color: "#B4A7D6",
    isBookmarked: true,
  },
];

const PromptCard = ({ item }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bookmarkAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const onBookmarkPress = () => {
    Animated.sequence([
      Animated.timing(bookmarkAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(bookmarkAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
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
        <View style={styles.cardContent}>
          <Text style={styles.promptText}>{item.prompt}</Text>
          <View
            style={[
              styles.categoryChip,
              { backgroundColor: `${item.color}15` },
            ]}
          >
            <View
              style={[styles.categoryDot, { backgroundColor: item.color }]}
            />
            <Text style={[styles.categoryText, { color: item.color }]}>
              {item.category}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.bookmarkButton,
            { backgroundColor: `${item.color}15` },
          ]}
          onPress={onBookmarkPress}
        >
          <Animated.View style={{ transform: [{ scale: bookmarkAnim }] }}>
            <Ionicons name="bookmark" size={20} color={item.color} />
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </TouchableOpacity>
  );
};

const SavedPrompts = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Saved Prompts</Text>
        <TouchableOpacity>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      {mockSavedPrompts.map((item) => (
        <PromptCard key={item.id} item={item} />
      ))}
    </View>
  );
};

export default SavedPrompts;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    color: "white",
    opacity: 0.7,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  viewAll: {
    color: "#7877D6",
    fontSize: 14,
    fontWeight: "500",
  },
  promptCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  cardContent: {
    flex: 1,
    marginRight: 12,
  },
  promptText: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
    fontWeight: "500",
  },
  categoryChip: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
  },
  bookmarkButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
