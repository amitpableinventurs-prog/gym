import * as React from "react";
import {
  Grid,
  Typography,
  CardMedia,
  Button,
  CardContent,
  Box,
  Card,
  Rating,
} from "@mui/material";
import { Suspense } from "react";
import { Coach } from "../types/coach";
import { useTranslation } from "react-i18next";
// Define the props interface
interface CoachesCardProps {
  coach: Coach;
  onSelect?: (coachId: string) => void;
  selectedSlot: string | null;
  selectedDate: string | null;
  image: string;
}

// CoachesCard component
const BookWorkoutProfileCard: React.FC<CoachesCardProps> = ({
  coach,
  onSelect,
  selectedSlot,
  selectedDate,
  image,
}) => {
  // Handle booking navigation
  const { t } = useTranslation();
  return (
    <Grid item xs={12} sm={12} md={3} lg={3}>
      <Card
        sx={{
          borderRadius: "16px",
          height: "auto",
          width: { xs: "100%", sm: "90%", md: "100%", lg: "80%" },
          maxWidth: { xs: "100%", sm: "400px", md: "400px", lg: "400px" },
          margin: "0 auto",
        }}
      >
        {/* Media Section */}
        <Suspense fallback={<Box sx={{ height: 240 }} />}>
          <CardMedia
            sx={{ height: 240 }}
            image={image}
            title={coach.firstName + " " + coach.lastName}
            component="img"
            alt={coach.firstName + " " + coach.lastName}
          />
        </Suspense>
        {/* Card Content */}
        <CardContent>
          <Box sx={{ display: "flex", mb: 2 }}>
            <Box>
              <Typography gutterBottom variant="h6">
                {coach.firstName + " " + coach.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {coach.title}
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            <Typography>{coach.ratings}</Typography>
            <Rating name="read-only" value={1} max={1} readOnly />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              {t("About Coach")}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
              }}
            >
              {coach.userSummary}
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" gutterBottom>
              {t("Specialization")}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
              }}
            >
              {coach.activity}
            </Typography>
          </Box>

          {/* Card Actions */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              p: [0, 2],
              gap: 2,
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Button
              variant="contained"
              size="medium"
              disabled={!selectedSlot || !selectedDate}
              fullWidth
              onClick={() => onSelect?.(coach._id)}
              sx={{
                fontFamily: "Lexend, Arial, sans-serif",
                textTransform: "none",
              }}
            >
              {t("Book Workout")}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default BookWorkoutProfileCard;
