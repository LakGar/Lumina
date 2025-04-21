import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface NotificationDaysProps {
  selectedDays: number[];
  onSelectDay: (dayIndex: number) => void;
}

const NotificationDays = ({
  selectedDays,
  onSelectDay,
}: NotificationDaysProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notification Days</Text>
      <View style={styles.weekContainer}>
        {DAYS_OF_WEEK.map((day, index) => (
          <TouchableOpacity
            key={day}
            style={[
              styles.dayContainer,
              selectedDays.includes(index) && styles.selectedDayContainer,
            ]}
            onPress={() => onSelectDay(index)}
          >
            <Text
              style={[
                styles.dayText,
                selectedDays.includes(index) && styles.selectedDayText,
              ]}
            >
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "transparent",
    gap: 16,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.3,
    opacity: 0.9,
    paddingHorizontal: 24,
  },
  weekContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 8,
  },
  dayContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(180, 167, 214, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(180, 167, 214, 0.2)",
  },
  selectedDayContainer: {
    backgroundColor: "#B4A7D6",
    borderColor: "#B4A7D6",
  },
  dayText: {
    color: "#B4A7D6",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  selectedDayText: {
    color: "#fff",
  },
});

export default NotificationDays;
