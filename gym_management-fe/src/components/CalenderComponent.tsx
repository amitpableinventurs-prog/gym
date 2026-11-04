import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
} from "date-fns";
import { Box, Typography, IconButton, useTheme } from "@mui/material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";

type CalendarComponentProps = {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
};

const CalendarComponent: React.FC<CalendarComponentProps> = ({
  selectedDate,
  setSelectedDate,
}) => {
  const theme = useTheme(); // 🎨 Get MUI theme
  const isDarkMode = theme.palette.mode === "dark"; // 🌙 Check for dark mode

  const [currentMonth, setCurrentMonth] = useState(new Date()); // Set initial month to current month

  const today = new Date(); // Get today's date
  today.setHours(0, 0, 0, 0); // Set time to midnight for accurate comparison

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const weekStart = startOfWeek(monthStart);
  const weekEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const handlePrevMonth = () => {
    if (
      currentMonth.getMonth() !== today.getMonth() ||
      currentMonth.getFullYear() !== today.getFullYear()
    ) {
      setCurrentMonth(
        (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
      );
    }
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  return (
    <Box
      width="100%"
      textAlign="center"
      //border="1px solid"
      borderColor={isDarkMode ? "#444" : "#ddd"} // 🎨 Adjust border color for dark mode
      borderRadius="10px"
      p={2}
      bgcolor={isDarkMode ? "#1e1e1e" : "#fff"} // 🌙 Dark mode background
      color={isDarkMode ? "#fff" : "#000"} // 🔤 Text color adjustment
    >
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <IconButton
          onClick={handlePrevMonth}
          size="small"
          sx={{ color: isDarkMode ? "#fff" : "#000" }}
        >
          <ArrowBackIos fontSize="small" />
        </IconButton>
        <Typography variant="h6">
          {format(currentMonth, "MMMM yyyy")}
        </Typography>
        <IconButton
          onClick={handleNextMonth}
          size="small"
          sx={{ color: isDarkMode ? "#fff" : "#000" }}
        >
          <ArrowForwardIos fontSize="small" />
        </IconButton>
      </Box>

      {/* Days of the week */}
      <Box display="grid" gridTemplateColumns="repeat(7, 1fr)" mt={2} gap={3}>
        {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
          <Typography
            key={day}
            variant="subtitle2"
            fontWeight="bold"
            color={isDarkMode ? "#bbb" : "#000"}
          >
            {day}
          </Typography>
        ))}
      </Box>

      {/* Days Grid */}
      <Box display="grid" gridTemplateColumns="repeat(7, 1fr)" gap={1} mt={2}>
        {days.map((day) => (
          <Box
            key={day.toISOString()}
            display="flex"
            alignItems="center"
            justifyContent="center"
            width="55px"
            height="55px"
            borderRadius="50%"
            fontSize="16px"
            bgcolor={
              isSameDay(day, selectedDate)
                ? isDarkMode
                  ? "#444"
                  : "#d3f4c1"
                : "transparent"
            }
            color={
              day.getMonth() === monthStart.getMonth()
                ? isDarkMode
                  ? "#fff"
                  : "#000"
                : "#777"
            }
            position="relative"
            onClick={() => {
              if (day >= today) {
                // Only allow selection if the day is today or in the future
                setSelectedDate(day);
              }
            }}
            sx={{
              cursor: "pointer",
              border: isSameDay(day, selectedDate)
                ? `2px solid ${isDarkMode ? "#76c7c0" : "#3a8d35"}`
                : "none",
            }}
          >
            {format(day, "d")}
            {isSameDay(day, new Date(2024, 6, 9)) && (
              <Box
                width="6px"
                height="6px"
                bgcolor="green"
                borderRadius="50%"
                position="absolute"
                bottom="5px"
              ></Box>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default CalendarComponent;
