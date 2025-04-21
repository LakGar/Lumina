import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
} from "react-native";
import React, { useState, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";

type JournalMode = "text" | "voice";

interface JournalToggleProps {
  onModeChange: (mode: JournalMode) => void;
}

const JournalToggle = ({ onModeChange }: JournalToggleProps) => {
  const [mode, setMode] = useState<JournalMode>("text");
  const slideAnim = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;
  const voiceOpacity = useRef(new Animated.Value(0.6)).current;

  const toggleMode = (newMode: JournalMode) => {
    if (newMode === mode) return;

    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: newMode === "text" ? 0 : 1,
        useNativeDriver: true,
        damping: 15,
        stiffness: 120,
      }),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: newMode === "text" ? 1 : 0.6,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(voiceOpacity, {
          toValue: newMode === "voice" ? 1 : 0.6,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    setMode(newMode);
    onModeChange(newMode);
  };

  return (
    <View style={styles.container}>
      <View style={styles.toggleContainer}>
        <Animated.View
          style={[
            styles.slider,
            {
              transform: [
                {
                  translateX: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 125],
                  }),
                },
              ],
            },
          ]}
        />
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => toggleMode("text")}
        >
          <Animated.View
            style={[styles.buttonContent, { opacity: textOpacity }]}
          >
            <Ionicons name="pencil-outline" size={18} color="#fff" />
            <Text style={styles.toggleText}>Text</Text>
          </Animated.View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => toggleMode("voice")}
        >
          <Animated.View
            style={[styles.buttonContent, { opacity: voiceOpacity }]}
          >
            <Ionicons name="mic-outline" size={18} color="#fff" />
            <Text style={styles.toggleText}>Voice</Text>
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default JournalToggle;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 20,
    padding: 4,
    position: "relative",
    width: 240,
  },
  slider: {
    position: "absolute",
    width: 120,
    height: "120%",
    backgroundColor: "#7877D6",
    borderRadius: 16,
    top: 0,
    left: 0,
    shadowColor: "#7877D6",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    zIndex: 1,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  toggleText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
