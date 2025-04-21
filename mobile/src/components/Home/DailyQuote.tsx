import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

const DailyQuote = () => {
  // This would be fetched from an API or local database
  const quote = {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
  };

  return (
    <View style={styles.container}>
      <View style={styles.quoteContainer}>
        <Ionicons
          name="chatbubble-ellipses"
          size={24}
          color="#7877D6"
          style={styles.icon}
        />
        <Text style={styles.quoteText}>{quote.text}</Text>
        <Text style={styles.author}>— {quote.author}</Text>
      </View>
    </View>
  );
};

export default DailyQuote;

const styles = StyleSheet.create({
  container: {
    width: "90%",
    marginVertical: 10,
  },
  quoteContainer: {
    backgroundColor: "rgba(120, 119, 214, 0.1)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(120, 119, 214, 0.2)",
  },
  icon: {
    marginBottom: 10,
  },
  quoteText: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 24,
    fontStyle: "italic",
    marginBottom: 8,
  },
  author: {
    color: "#fff",
    opacity: 0.7,
    fontSize: 14,
    textAlign: "right",
  },
});
