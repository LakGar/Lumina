import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Switch,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { OnboardingStackParamList } from "../../navigation/types";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ProgressBar } from "../../components/ProgressBar";
import { Ionicons } from "@expo/vector-icons";

type DailyRitualScreenNavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  "DailyRitual"
>;

export default function DailyRitualScreen() {
  const navigation = useNavigation<DailyRitualScreenNavigationProp>();
  const [enableReminder, setEnableReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setReminderTime(selectedTime);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={24} color="#fff" />
      </TouchableOpacity>

      <ProgressBar currentStep={5} totalSteps={6} />

      <Text style={styles.title}>
        Want a daily {"\n"}
        reminder to reflect?
      </Text>

      <View style={styles.reminderContainer}>
        <View style={styles.reminderToggle}>
          <Text style={styles.reminderLabel}>Enable daily reminder</Text>
          <Switch
            value={enableReminder}
            onValueChange={setEnableReminder}
            trackColor={{ false: "#767577", true: "#7877d6" }}
          />
        </View>

        {enableReminder && (
          <TouchableOpacity
            style={styles.timePicker}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.timeText}>
              {reminderTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Complete")}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>

      {showTimePicker && (
        <DateTimePicker
          value={reminderTime}
          mode="time"
          onChange={onTimeChange}
          style={styles.timePicker}
        />
      )}

      {/* <View style={styles.imageContainer}>
        <Image
          source={require("../../../assets/ritual.png")}
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
    padding: 10,
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
  reminderContainer: {
    zIndex: 1,
    marginBottom: 20,
  },
  reminderToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  reminderLabel: {
    color: "#fff",
    fontSize: 16,
  },
  timePicker: {
    backgroundColor: "#000",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  timeText: {
    color: "#fff",
    fontSize: 16,
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
