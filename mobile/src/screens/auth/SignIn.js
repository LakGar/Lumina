import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import Ionicons from "@expo/vector-icons/Ionicons";
export default function SignIn({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn } = useAuth();

  const handleSignIn = async () => {
    try {
      await signIn(email, password);
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to sign in"
      );
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={16} color="white" />
      </TouchableOpacity>
      <Text style={styles.title}>
        Welcome {"\n"}
        Back, <Text style={styles.titleAccent}>Luminary!</Text>
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#666"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        placeholderTextColor="#666"
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleSignIn}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.link}
        onPress={() => navigation.navigate("Onboarding", { screen: "Welcome" })}
      >
        <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
      <View style={styles.imageContainer}>
        <Image
          source={require("../../../assets/login.png")}
          style={styles.image}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111011",
    padding: 20,
    paddingTop: 120,
    // backgroundColor: "#fdfdfc",
  },
  backButton: {
    position: "absolute",
    top: 80,
    left: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    marginTop: 30,
    color: "#fff",
    textAlign: "left",
    width: "100%",
    flex: 1,
    zIndex: 1,
  },
  titleAccent: {
    color: "#7877d6",
    fontSize: 50,
    fontStyle: "italic",
  },
  input: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#000",
    zIndex: 1,
  },
  button: {
    backgroundColor: "#7877d6",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    zIndex: 1,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  link: {
    marginTop: 20,
    alignItems: "center",
  },
  linkText: {
    color: "#7877d6",
    fontSize: 16,
    marginBottom: 10,
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
    width: "90%",
    height: "80%",
    resizeMode: "contain",
    marginTop: 100,
    zIndex: 0,
  },
});
