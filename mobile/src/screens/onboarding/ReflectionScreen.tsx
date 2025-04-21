import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { OnboardingStackParamList } from "../../navigation/types";
import { ProgressBar } from "../../components/ProgressBar";
import { Ionicons } from "@expo/vector-icons";

type ReflectionScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  "Reflection"
>;

export default function ReflectionScreen() {
  const navigation = useNavigation<ReflectionScreenNavigationProp>();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <ProgressBar currentStep={2} totalSteps={4} />

      <Text style={styles.title}>
        How do you want to {"\n"}
        reflect on your day?
      </Text>

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => navigation.navigate("DailyRitual")}
        >
          <Text style={styles.optionText}>Daily Journaling</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => navigation.navigate("DailyRitual")}
        >
          <Text style={styles.optionText}>Voice Notes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => navigation.navigate("DailyRitual")}
        >
          <Text style={styles.optionText}>Photo Journal</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111011",
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 1,
    padding: 10,
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    marginTop: 30,
    color: "#fff",
    textAlign: "left",
    width: "100%",
  },
  optionsContainer: {
    marginTop: 40,
    gap: 20,
  },
  optionButton: {
    backgroundColor: "#2A2A2A",
    padding: 20,
    borderRadius: 12,
  },
  optionText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
  },
});
