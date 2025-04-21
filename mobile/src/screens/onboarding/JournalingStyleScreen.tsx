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

type JournalingStyleScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  "JournalingStyle"
>;

const options = [
  { id: "writing", label: "I prefer writing", icon: "pencil" },
  { id: "speaking", label: "I like to speak my thoughts", icon: "mic" },
  { id: "structure", label: "I want structure & prompts", icon: "list" },
  { id: "freedom", label: "I want freedom & flow", icon: "infinite" },
];

export default function JournalingStyleScreen() {
  const navigation = useNavigation<JournalingStyleScreenNavigationProp>();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const toggleOption = (id: string) => {
    setSelectedOptions((prev) =>
      prev.includes(id) ? prev.filter((option) => option !== id) : [...prev, id]
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={24} color="#fff" />
      </TouchableOpacity>

      <ProgressBar currentStep={3} totalSteps={6} />

      <Text style={styles.title}>
        How do you {"\n"}
        journal?
      </Text>

      <ScrollView style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.option,
              selectedOptions.includes(option.id) && styles.selectedOption,
            ]}
            onPress={() => toggleOption(option.id)}
          >
            <Ionicons
              name={option.icon as any}
              size={24}
              color={selectedOptions.includes(option.id) ? "#fff" : "#7877d6"}
            />
            <Text
              style={[
                styles.optionText,
                selectedOptions.includes(option.id) &&
                  styles.selectedOptionText,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Goals")}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>

      {/* <View style={styles.imageContainer}>
        <Image
          source={require("../../../assets/journaling.png")}
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
  optionsContainer: {
    flex: 1,
    marginTop: 20,
    zIndex: 1,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    gap: 10,
  },
  selectedOption: {
    backgroundColor: "#7877d6",
  },
  optionText: {
    color: "#fff",
    fontSize: 16,
    flex: 1,
  },
  selectedOptionText: {
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
