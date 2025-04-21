import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { format, addDays, startOfWeek } from "date-fns";
import HomeWidget from "./Home/HomeWidget";

const WeekCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const weekStart = startOfWeek(new Date());

  const renderWeek = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i);
      const isSelected =
        format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
      const isToday =
        format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

      days.push(
        <TouchableOpacity
          key={i}
          style={[
            styles.dayContainer,
            isSelected && styles.selectedDayContainer,
          ]}
          onPress={() => setSelectedDate(date)}
        >
          <Text
            style={[
              styles.dayText,
              isSelected && styles.selectedDayText,
              isToday && !isSelected && styles.todayText,
            ]}
          >
            {format(date, "EEE")}
          </Text>
          <View
            style={[
              styles.dateCircle,
              isSelected && styles.selectedDateCircle,
              isToday && !isSelected && styles.todayCircle,
            ]}
          >
            <Text
              style={[
                styles.dateText,
                isSelected && styles.selectedDateText,
                isToday && !isSelected && styles.todayText,
              ]}
            >
              {format(date, "d")}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }
    return days;
  };

  return (
    <View style={styles.container}>
      <View style={styles.calendarContainer}>
        <View style={styles.weekContainer}>{renderWeek()}</View>
      </View>
      <HomeWidget date={selectedDate} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "transparent",
  },
  calendarContainer: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(180, 167, 214, 0.1)",
  },
  weekContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 75,
  },
  dayContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    paddingHorizontal: 4,
  },
  selectedDayContainer: {
    opacity: 1,
  },
  dayText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 8,
    opacity: 0.7,
    letterSpacing: 0.2,
  },
  selectedDayText: {
    opacity: 1,
    color: "#fff",
  },
  todayText: {
    color: "#B4A7D6",
  },
  dateCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedDateCircle: {
    backgroundColor: "#B4A7D6",
  },
  todayCircle: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#B4A7D6",
  },
  dateText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    opacity: 0.9,
  },
  selectedDateText: {
    color: "#fff",
    opacity: 1,
  },
});

export default WeekCalendar;
