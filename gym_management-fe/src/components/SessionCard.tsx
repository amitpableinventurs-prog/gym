import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

interface SessionCardProps {
  title: string;
  date: string;
  time: string;
  duration: string;
}

const SessionCard: React.FC<SessionCardProps> = ({
  title,
  date,
  time,
  duration,
}) => {
  const theme = useTheme();

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      p={2}
      bgcolor={theme.palette.mode === "dark" ? "#1e1e1e" : "#f8fcff"} // Light blue
      borderRadius="10px"
      boxShadow={
        theme.palette.mode === "dark" ? "none" : "0 2px 4px rgba(0,0,0,0.1)"
      }
      borderLeft={`4px solid ${theme.palette.primary.main}`} // Blue left border
      minWidth="100%"
    >
      {/* Left Section: Title and Date */}
      <Box>
        <Typography fontWeight="bold">{title}</Typography>
        <Typography variant="body2" color="gray">
          {date}, {time}
        </Typography>
      </Box>

      {/* Right Section: Time Icon & Duration */}
      <Box display="flex" alignItems="center">
        <AccessTimeIcon sx={{ fontSize: 18, color: "gray", mr: 0.5 }} />
        <Typography variant="body2" color="gray">
          {duration}
        </Typography>
      </Box>
    </Box>
  );
};

export default SessionCard;
