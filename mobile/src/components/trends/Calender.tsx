import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import React, { useState, useRef } from "react";
import { Calendar, DateData } from "react-native-calendars";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const SCREEN_HEIGHT = Dimensions.get("window").height;

const CalendarView = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const showModal = () => {
    setModalVisible(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const hideModal = () => {
    setModalVisible(false);
    Animated.spring(slideAnim, {
      toValue: SCREEN_HEIGHT,
      useNativeDriver: true,
    }).start();
  };

  const onDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
    showModal();
  };

  const formatDate = (date: string) => {
    //April 1, 2025
    const dateObj = new Date(date);
    const month = dateObj.toLocaleString("default", { month: "long" });
    const day = dateObj.getDate();
    const year = dateObj.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calendar</Text>

      <Calendar
        onDayPress={onDayPress}
        theme={{
          backgroundColor: "transparent",
          calendarBackground: "transparent",
          textSectionTitleColor: "#B4A7D6",
          selectedDayBackgroundColor: "#7877D6",
          selectedDayTextColor: "#ffffff",
          todayTextColor: "#7877D6",
          dayTextColor: "#ffffff",
          textDisabledColor: "#444444",
          dotColor: "#7877D6",
          monthTextColor: "#ffffff",
          textMonthFontWeight: "600",
          arrowColor: "#B4A7D6",
        }}
      />

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={hideModal}
        statusBarTranslucent
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={hideModal}
        >
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={hideModal}>
                  <Ionicons name="chevron-back" size={20} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
                <TouchableOpacity style={[styles.headerButton]}>
                  <Ionicons name="add" size={24} color="#7877d6" />
                </TouchableOpacity>
              </View>

              <View style={styles.noEntriesContainer}>
                <Text style={styles.noEntriesText}>
                  This day currently has no journal entries.
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default CalendarView;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 20,
  },
  title: {
    color: "white",
    opacity: 0.7,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    height: SCREEN_HEIGHT * 0.92,
    backgroundColor: "#1F1F1F",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(180, 167, 214, 0.15)",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(120, 119, 214, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  dateText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  noEntriesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noEntriesText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 16,
    textAlign: "center",
  },
});
