import { StyleSheet, View, Image, TouchableOpacity, Text } from "react-native";
import React from "react";

const auth = ({ navigation }: { navigation: any }) => {
  return (
    <View style={styles.container}>
      <Image
        source={require("../../../assets/Lumina.png")}
        style={styles.logo}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#7877d6" }]}
          onPress={() => navigation.navigate("SignIn")}
        >
          <Text style={[styles.buttonText, { color: "#fff" }]}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate("Onboarding", {
              screen: "Welcome",
            })
          }
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default auth;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111011",
    // backgroundColor: "#fdfdfc",
  },
  logo: {
    width: 300,
    height: 300,
    borderRadius: 100,
  },
  buttonContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    width: "100%",
    gap: 10,
    alignItems: "center",
    alignSelf: "flex-end",
    padding: 20,
    position: "absolute",
    bottom: 40,
  },
  button: {
    width: "100%",
    height: 50,
    borderRadius: 10,
    backgroundColor: "#fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
});
