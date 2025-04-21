import { StyleSheet, Text, View } from "react-native";
import React from "react";

const Greetings = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Welcome back, {`\n`}
        <Text style={styles.name}>John</Text>
      </Text>
      <Text style={styles.date}>
        {new Date().toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
      </Text>
    </View>
  );
};

export default Greetings;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  title: {
    color: "#fff",
    fontSize: 18,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  date: {
    color: "#777",
    fontSize: 14,
  },
});
