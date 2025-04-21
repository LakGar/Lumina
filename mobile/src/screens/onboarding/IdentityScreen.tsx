import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Switch,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { OnboardingStackParamList } from "../../navigation/types";
import { Ionicons } from "@expo/vector-icons";
import { ProgressBar } from "../../components/ProgressBar";

type IdentityScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  "Identity"
>;

export default function IdentityScreen() {
  const navigation = useNavigation<IdentityScreenNavigationProp>();
  const [name, setName] = useState("");
  const [showPronouns, setShowPronouns] = useState(false);
  const [pronouns, setPronouns] = useState("");

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={24} color="#fff" />
      </TouchableOpacity>

      <ProgressBar currentStep={2} totalSteps={6} />

      <Text style={styles.title}>
        What should we {"\n"}
        call you?
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="First name or preferred name"
          placeholderTextColor="#666"
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.pronounsContainer}>
        <View style={styles.pronounsToggle}>
          <Text style={styles.pronounsLabel}>Add pronouns (optional)</Text>
          <Switch
            value={showPronouns}
            onValueChange={setShowPronouns}
            trackColor={{ false: "#767577", true: "#7877d6" }}
          />
        </View>

        {showPronouns && (
          <TextInput
            style={styles.input}
            placeholder="They/them, she/her, he/him"
            placeholderTextColor="#666"
            value={pronouns}
            onChangeText={setPronouns}
          />
        )}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("JournalingStyle")}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>

      {/* <View style={styles.imageContainer}>
        <Image
          source={require("../../../assets/identity.png")}
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
    flex: 1,
  },
  inputContainer: {
    zIndex: 1,
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#000",
    color: "#fff",
  },
  pronounsContainer: {
    zIndex: 1,
    marginBottom: 20,
  },
  pronounsToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  pronounsLabel: {
    color: "#fff",
    fontSize: 16,
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
