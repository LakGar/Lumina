import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

interface PromptInputProps {
  onPromptChange: (prompt: string) => void;
}

const PromptInput = ({ onPromptChange }: PromptInputProps) => {
  const [prompt, setPrompt] = useState("What are you feeling today?");
  const [isEditing, setIsEditing] = useState(false);

  const handlePromptChange = (text: string) => {
    setPrompt(text);
    onPromptChange(text);
  };

  return (
    <View style={styles.container}>
      <View style={styles.promptContainer}>
        <Ionicons name="sparkles-outline" size={20} color="#7877D6" />
        <Text style={styles.label}>AI Prompt</Text>
        <TouchableOpacity onPress={() => setIsEditing(true)}>
          <Ionicons name="pencil" size={16} color="rgba(255, 255, 255, 0.4)" />
        </TouchableOpacity>
      </View>

      {isEditing ? (
        <View style={styles.editContainer}>
          <TextInput
            style={styles.input}
            value={prompt}
            onChangeText={handlePromptChange}
            onBlur={() => setIsEditing(false)}
            autoFocus
            multiline
            blurOnSubmit
            selectionColor="#7877D6"
          />
          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => setIsEditing(false)}
          >
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.promptTextContainer}
          onPress={() => setIsEditing(true)}
        >
          <Text style={styles.promptText}>{prompt}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default PromptInput;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  promptContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  label: {
    color: "#7877D6",
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  promptTextContainer: {
    backgroundColor: "rgba(120, 119, 214, 0.1)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(120, 119, 214, 0.2)",
  },
  promptText: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
  },
  editContainer: {
    backgroundColor: "rgba(120, 119, 214, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(120, 119, 214, 0.3)",
    overflow: "hidden",
  },
  input: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 24,
    padding: 16,
    fontWeight: "500",
  },
  doneButton: {
    borderTopWidth: 1,
    borderTopColor: "rgba(120, 119, 214, 0.2)",
    padding: 12,
    alignItems: "center",
    backgroundColor: "rgba(120, 119, 214, 0.1)",
  },
  doneText: {
    color: "#7877D6",
    fontSize: 14,
    fontWeight: "600",
  },
});
