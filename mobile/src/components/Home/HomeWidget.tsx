import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React from "react";
import { format } from "date-fns";
import { Ionicons } from "@expo/vector-icons";

const HomeWidget = ({ date }: { date: Date }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.dateText}>{format(date, "MMMM d, yyyy")}</Text>

      <TouchableOpacity style={styles.addEntryContainer}>
        <View style={styles.addEntryContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="add-circle-outline" size={24} color="#B4A7D6" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.addEntryText}>Add Entry</Text>
            <Text style={styles.addEntrySubText}>
              Schedule your daily reminder
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#B4A7D6" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default HomeWidget;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingTop: 20,
    paddingHorizontal: 20,
    gap: 16,
  },
  dateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    opacity: 0.9,
    letterSpacing: 0.3,
  },
  addEntryContainer: {
    width: "100%",
    backgroundColor: "rgba(180, 167, 214, 0.1)",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(180, 167, 214, 0.2)",
  },
  addEntryContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(180, 167, 214, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  addEntryText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  addEntrySubText: {
    color: "white",
    opacity: 0.6,
    fontSize: 13,
    letterSpacing: 0.2,
  },
});
