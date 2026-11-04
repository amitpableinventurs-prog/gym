import React, { useState } from "react";
import { Box, Typography, List, ListItem, useTheme } from "@mui/material";

interface TimeSlotSelectorProps {
  date: string;
  availableSlots: string[];
  onSelect: (slot: string) => void;
}

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  date,
  availableSlots,
  onSelect,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const primaryColor = theme.palette.primary.main;

  const handleSlotSelect = (slot: string) => {
    setSelectedSlot(slot);
    onSelect(slot);
  };

  return (
    <Box
      width="100%" // Matches calendar width
      height="422px" // Fixed height
      p={1}
      bgcolor={isDarkMode ? "#1e1e1e" : "#fff"}
      borderRadius="10px"
      //border="1px solid"
      borderColor={isDarkMode ? "#444" : "#ddd"}
      color={isDarkMode ? "#fff" : "#000"}
      textAlign="center"
      overflow="hidden"
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 1,
        }}
      >
        <Typography variant="h6">{date}</Typography>
        <Typography variant="body2" color={isDarkMode ? "#bbb" : "gray"}>
          {availableSlots.length} slots available
        </Typography>
      </Box>
      {/* Time Slots */}
      <List
        sx={{
          mt: 2,
          overflowY: "auto", // Scrollable but no scrollbar
          height: "350px",
          "&::-webkit-scrollbar": { display: "none" }, // Hide scrollbar for Webkit browsers
          msOverflowStyle: "none", // Hide scrollbar for IE
          scrollbarWidth: "none", // Hide scrollbar for Firefox
        }}
      >
        {availableSlots.map((slot, index) => (
          <ListItem
            key={index}
            sx={{
              cursor: "pointer",
              backgroundColor:
                selectedSlot === slot
                  ? isDarkMode
                    ? "#76c7c0" // Highlight color for Dark Mode
                    : "#e8f5e9"
                  : isDarkMode
                  ? "#2a2a2a"
                  : "#f5fdf5",
              border:
                selectedSlot === slot ? `2px solid ${primaryColor}` : "none",
              textAlign: "center",

              borderRadius: "8px",
              padding: "12px",
              margin: "5px 0",
              transition: "all 0.2s ease",
              height: "56px",
              color:
                selectedSlot === slot ? "#000" : isDarkMode ? "#fff" : "#000",
              "&:hover": {
                border: `2px solid ${primaryColor}`,
                backgroundColor: primaryColor,
              },
            }}
            onClick={() => handleSlotSelect(slot)}
          >
            {slot}
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default TimeSlotSelector;
