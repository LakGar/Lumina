import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { ProgressBar } from "../../components/ProgressBar";
import { Ionicons } from "@expo/vector-icons";
type CompleteScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "App"
>;

export default function CompleteScreen() {
  const navigation = useNavigation<CompleteScreenNavigationProp>();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={24} color="#fff" />
      </TouchableOpacity>

      <ProgressBar currentStep={6} totalSteps={6} />
      <Text style={styles.title}>
        You're all set, {"\n"}
        <Text style={styles.titleAccent}>Luminary.</Text>
      </Text>

      <Text style={styles.subtitle}>
        Ready to start your journaling journey?
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("App", { screen: "Home" })}
      >
        <Text style={styles.buttonText}>Start Journaling</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.promptButton}
        onPress={() => navigation.navigate("App", { screen: "Home" })}
      >
        <Text style={styles.promptButtonText}>
          "What's something you've been thinking about lately?"
        </Text>
      </TouchableOpacity>

      {/* <View style={styles.imageContainer}>
        <Image
          source={require("../../../assets/complete.png")}
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
  subtitle: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 30,
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
  promptButton: {
    backgroundColor: "#000",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    zIndex: 1,
  },
  promptButtonText: {
    color: "#7877d6",
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
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
