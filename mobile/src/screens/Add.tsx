import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Animated,
  Text,
} from "react-native";
import React, { useState, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import Header from "../components/Header";
import JournalToggle from "../components/Add/JournalToggle";
import PromptInput from "../components/Add/PromptInput";
import MoodSelector from "../components/Add/MoodSelector";

type JournalMode = "text" | "voice";

const Add = () => {
  const [journalMode, setJournalMode] = useState<JournalMode>("text");
  const [journalText, setJournalText] = useState("");
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const startPulseAnimation = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={styles.container}>
      <Header title="New Entry" />

      <View style={styles.content}>
        <View style={styles.topSection}>
          <JournalToggle onModeChange={setJournalMode} />
          <PromptInput onPromptChange={() => {}} />
          <MoodSelector onMoodSelect={() => {}} />
        </View>

        {journalMode === "text" ? (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.journalInput}
              placeholder="Start writing..."
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              multiline
              value={journalText}
              onChangeText={setJournalText}
              selectionColor="#7877D6"
            />
          </View>
        ) : (
          <View style={styles.voiceContainer}>
            <TouchableOpacity
              style={styles.recordButton}
              onPress={startPulseAnimation}
            >
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Ionicons name="mic" size={24} color="#E67E76" />
              </Animated.View>
            </TouchableOpacity>
            <Text style={styles.voiceHint}>Tap to start recording</Text>
          </View>
        )}
      </View>

      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.reflectButton}>
          <Ionicons name="sparkles-outline" size={18} color="#fff" />
          <Text style={styles.reflectText}>Reflect with Lumina</Text>
        </TouchableOpacity>

        {journalMode === "text" && (
          <TouchableOpacity
            style={styles.voiceButton}
            onPress={() => setJournalMode("voice")}
          >
            <Ionicons name="mic-outline" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default Add;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111011",
    paddingTop: 130,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  topSection: {
    gap: 16,
  },
  inputContainer: {
    flex: 1,
    marginTop: 16,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  journalInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    lineHeight: 24,
    padding: 16,
    textAlignVertical: "top",
  },
  voiceContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  recordButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(230, 126, 118, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(230, 126, 118, 0.3)",
  },
  voiceHint: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 14,
  },
  bottomSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    paddingBottom: 32,
  },
  reflectButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7877D6",
    padding: 14,
    borderRadius: 24,
    gap: 8,
  },
  reflectText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  voiceButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(120, 119, 214, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(120, 119, 214, 0.3)",
  },
});
