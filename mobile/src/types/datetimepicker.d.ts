declare module "@react-native-community/datetimepicker" {
  import { ViewProps } from "react-native";

  interface DateTimePickerProps extends ViewProps {
    value: Date;
    mode?: "date" | "time" | "datetime";
    display?: "default" | "spinner" | "clock" | "calendar";
    onChange?: (event: any, date?: Date) => void;
    minimumDate?: Date;
    maximumDate?: Date;
    is24Hour?: boolean;
  }

  const DateTimePicker: React.FC<DateTimePickerProps>;
  export default DateTimePicker;
}
