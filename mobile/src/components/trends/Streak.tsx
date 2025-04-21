import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Pressable,
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import NotificationDays from "./NotificationDays";

type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

const Streak = () => {
  const [hasStreak, setHasStreak] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTime, setSelectedTime] = useState<TimeOfDay | null>(null);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  const timeOptions: { label: string; value: TimeOfDay; icon: string }[] = [
    { label: "Morning", value: "morning", icon: "sunny-outline" },
    { label: "Afternoon", value: "afternoon", icon: "partly-sunny-outline" },
    { label: "Evening", value: "evening", icon: "moon-outline" },
    { label: "Night", value: "night", icon: "star-outline" },
  ];

  const handleDaySelect = (dayIndex: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayIndex)
        ? prev.filter((d) => d !== dayIndex)
        : [...prev, dayIndex]
    );
  };

  const renderNoStreak = () => (
    <TouchableOpacity
      style={styles.noStreakContainer}
      onPress={() => setShowModal(true)}
    >
      <View style={styles.noStreakContent}>
        <View style={styles.iconContainer}>
          <Ionicons name="flame-outline" size={24} color="#B4A7D6" />
        </View>
        <Text style={styles.noStreakText}>Start Your Streak</Text>
        <Text style={styles.noStreakSubText}>
          Set a daily schedule to build your habit
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderStreak = () => (
    <View style={styles.streakContainer}>
      <View style={styles.streakHeader}>
        <View style={styles.streakCount}>
          <Text style={styles.streakNumber}>7</Text>
          <View style={styles.iconContainer}>
            <Ionicons name="flame" size={24} color="#B4A7D6" />
          </View>
        </View>
        <View style={styles.streakActions}>
          <Text style={styles.streakSubText}>Day Streak</Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => setShowModal(true)}
          >
            <Ionicons name="settings-outline" size={22} color="#B4A7D6" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.streakProgress}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: "70%" }]} />
        </View>
        <Text style={styles.streakGoal}>3 days until next milestone</Text>
      </View>
    </View>
  );

  const canSave = selectedTime !== null && selectedDays.length > 0;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Streak</Text>
      {hasStreak ? renderStreak() : renderNoStreak()}

      <Modal
        visible={showModal}
        animationType="none"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <Pressable
          style={styles.modalContainer}
          onPress={() => setShowModal(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Set Your Schedule</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowModal(false)}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <NotificationDays
              selectedDays={selectedDays}
              onSelectDay={handleDaySelect}
            />

            <View style={styles.timeSelection}>
              <Text style={styles.timeTitle}>Notification Time</Text>
              <View style={styles.timeOptions}>
                {timeOptions.map((option) => (
                  <Pressable
                    key={option.value}
                    style={[
                      styles.timeOption,
                      selectedTime === option.value &&
                        styles.selectedTimeOption,
                    ]}
                    onPress={() => setSelectedTime(option.value)}
                  >
                    <View
                      style={[
                        styles.timeIconContainer,
                        selectedTime === option.value &&
                          styles.selectedTimeIconContainer,
                      ]}
                    >
                      <Ionicons
                        name={option.icon as any}
                        size={20}
                        color={
                          selectedTime === option.value ? "#fff" : "#B4A7D6"
                        }
                      />
                    </View>
                    <Text
                      style={[
                        styles.timeOptionText,
                        selectedTime === option.value &&
                          styles.selectedTimeOptionText,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
              onPress={() => {
                if (canSave) {
                  setHasStreak(true);
                  setShowModal(false);
                }
              }}
              disabled={!canSave}
            >
              <Text
                style={[
                  styles.saveButtonText,
                  !canSave && styles.saveButtonTextDisabled,
                ]}
              >
                Start Streak
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default Streak;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  text: {
    color: "white",
    opacity: 0.7,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  noStreakContainer: {
    backgroundColor: "rgba(180, 167, 214, 0.1)",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(180, 167, 214, 0.2)",
  },
  noStreakContent: {
    alignItems: "center",
  },
  iconContainer: {
    backgroundColor: "rgba(180, 167, 214, 0.15)",
    borderRadius: 16,
    padding: 12,
  },
  noStreakText: {
    color: "#B4A7D6",
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
    letterSpacing: 0.5,
  },
  noStreakSubText: {
    color: "#fff",
    opacity: 0.7,
    fontSize: 14,
    marginTop: 8,
    letterSpacing: 0.3,
  },
  streakContainer: {
    backgroundColor: "rgba(180, 167, 214, 0.1)",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(180, 167, 214, 0.2)",
  },
  streakHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  streakCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  streakNumber: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  streakSubText: {
    color: "#fff",
    opacity: 0.7,
    fontSize: 16,
    letterSpacing: 0.3,
  },
  streakProgress: {
    gap: 10,
  },
  progressBar: {
    height: 6,
    backgroundColor: "rgba(180, 167, 214, 0.2)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#B4A7D6",
    borderRadius: 3,
  },
  streakGoal: {
    color: "#fff",
    opacity: 0.7,
    fontSize: 14,
    letterSpacing: 0.3,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1c1c1e",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    borderWidth: 1,
    borderColor: "rgba(180, 167, 214, 0.2)",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  closeButton: {
    backgroundColor: "rgba(180, 167, 214, 0.15)",
    borderRadius: 12,
    padding: 8,
  },
  timeSelection: {
    paddingHorizontal: 24,
    gap: 16,
    marginVertical: 24,
  },
  timeTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  timeOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  timeOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(180, 167, 214, 0.1)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    flex: 1,
    minWidth: "45%",
    borderWidth: 1,
    borderColor: "rgba(180, 167, 214, 0.2)",
  },
  selectedTimeOption: {
    backgroundColor: "#B4A7D6",
    borderColor: "#B4A7D6",
  },
  timeIconContainer: {
    backgroundColor: "rgba(180, 167, 214, 0.15)",
    borderRadius: 10,
    padding: 8,
  },
  selectedTimeIconContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  timeOptionText: {
    color: "#B4A7D6",
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  selectedTimeOptionText: {
    color: "#fff",
  },
  saveButton: {
    backgroundColor: "#B4A7D6",
    marginBottom: 24,
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "rgba(180, 167, 214, 0.3)",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  saveButtonTextDisabled: {
    opacity: 0.7,
  },
  streakActions: {
    alignItems: "flex-end",
    gap: 8,
  },
  settingsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(180, 167, 214, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
});
