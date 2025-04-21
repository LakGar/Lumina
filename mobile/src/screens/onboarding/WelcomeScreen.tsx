import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Ionicons from "@expo/vector-icons/Ionicons";
import { OnboardingStackParamList } from "../../navigation/types";
import { ProgressBar } from "../../components/ProgressBar";
type WelcomeScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  "Welcome"
>;

export default function WelcomeScreen() {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={24} color="#fff" />
      </TouchableOpacity>

      <ProgressBar currentStep={1} totalSteps={6} />

      <Text style={styles.title}>
        Welcome, <Text style={styles.titleAccent}>Luminary.</Text>
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#666"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#666"
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Identity")}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>

      <View style={styles.socialContainer}>
        <TouchableOpacity style={styles.socialButton}>
          <Ionicons name="logo-google" size={24} color="#34a853" />
          <Text style={styles.socialButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton}>
          <Ionicons name="logo-apple" size={24} color="#000" />
          <Text style={styles.socialButtonText}>Continue with Apple</Text>
        </TouchableOpacity>
      </View>

      {/* <View style={styles.imageContainer}>
        <Image
          source={require("../../../assets/onboarding.png")}
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
  titleAccent: {
    color: "#7877d6",
    fontSize: 50,
    fontStyle: "italic",
  },
  inputContainer: {
    zIndex: 1,
    marginBottom: 20,
    gap: 10,
  },
  input: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#000",
    color: "#fff",
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
  socialContainer: {
    gap: 10,
    zIndex: 1,
    marginBottom: 20,
  },
  socialButton: {
    flexDirection: "row",
    backgroundColor: "#fff",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  socialButtonText: {
    color: "#000",
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
