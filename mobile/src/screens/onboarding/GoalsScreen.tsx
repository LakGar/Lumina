import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { OnboardingStackParamList } from "../../navigation/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ProgressBar } from "../../components/ProgressBar";

type GoalsScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  "Goals"
>;

const goals = [
  { id: "clarity", label: "Emotional clarity", icon: "heart" },
  { id: "growth", label: "Self-growth", icon: "trending-up" },
  { id: "mental", label: "Mental health tracking", icon: "brain" },
  { id: "creative", label: "Creative thinking", icon: "bulb" },
  { id: "productivity", label: "Productivity reflection", icon: "time" },
  { id: "curious", label: "Just curious", icon: "help-circle" },
];

export default function GoalsScreen() {
  const navigation = useNavigation<GoalsScreenNavigationProp>();
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const toggleGoal = (id: string) => {
    if (selectedGoals.includes(id)) {
      setSelectedGoals(selectedGoals.filter((goal) => goal !== id));
    } else if (selectedGoals.length < 2) {
      setSelectedGoals([...selectedGoals, id]);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={24} color="#fff" />
      </TouchableOpacity>

      <ProgressBar currentStep={4} totalSteps={6} />
      <Text style={styles.title}>
        What brings you {"\n"}
        to Lumina?
      </Text>

      <ScrollView style={styles.goalsContainer}>
        {goals.map((goal) => (
          <TouchableOpacity
            key={goal.id}
            style={[
              styles.goal,
              selectedGoals.includes(goal.id) && styles.selectedGoal,
            ]}
            onPress={() => toggleGoal(goal.id)}
          >
            <Ionicons
              name={goal.icon as any}
              size={24}
              color={selectedGoals.includes(goal.id) ? "#fff" : "#7877d6"}
            />
            <Text
              style={[
                styles.goalText,
                selectedGoals.includes(goal.id) && styles.selectedGoalText,
              ]}
            >
              {goal.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.button,
          selectedGoals.length === 0 && styles.disabledButton,
        ]}
        onPress={() => navigation.navigate("DailyRitual")}
        disabled={selectedGoals.length === 0}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>

      {/* <View style={styles.imageContainer}>
        <Image
          source={require("../../../assets/goals.png")}
          style={styles.image}
        />
      </View> */}
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
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    marginTop: 30,
    color: "#fff",
    textAlign: "left",
    width: "100%",
  },
  goalsContainer: {
    flex: 1,
    marginTop: 20,
    zIndex: 1,
  },
  goal: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    gap: 10,
  },
  selectedGoal: {
    backgroundColor: "#7877d6",
  },
  goalText: {
    color: "#fff",
    fontSize: 16,
    flex: 1,
  },
  selectedGoalText: {
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#7877d6",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    zIndex: 1,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  imageContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  image: {
    width: "80%",
    height: "80%",
    resizeMode: "contain",
    marginTop: 80,
    zIndex: 0,
  },
});
