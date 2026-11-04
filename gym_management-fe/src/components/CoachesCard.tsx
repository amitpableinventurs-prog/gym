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
import { useNavigate } from "react-router-dom";
import { Suspense, useEffect, useState } from "react";
import { Coach } from "../types/coach.ts";
import { getTestimonials } from "../services/testimonialsService.ts";
import { useTranslation } from "react-i18next";
interface Testimonial {
  rating: number;
  date: string;
  firstName: string;
  lastName: string;
  testimonial: string;
  workoutId: string;
}
// Define the props interface
interface CoachesCardProps {
  coach: Coach;
  image: string;
}

// CoachesCard component
const CoachesCard: React.FC<CoachesCardProps> = ({ coach, image }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [totalRatings, setTotalRatings] = useState<Testimonial[]>([]);
  // Handle booking navigation
  const handleBookWorkout = (coach: Coach) => {
    navigate("/book-coach", {
      state: {
        coach: coach,
        image: image,
      },
    });
  };
  useEffect(() => {
    const fetchTotalRatings = async () => {
      try {
        const response = await getTestimonials(coach._id);
        // Extract the testimonials array from the response object
        const testimonialsArray = response[coach._id] || []; // Fallback to an empty array if undefined
        if (Array.isArray(testimonialsArray)) {
          setTotalRatings(testimonialsArray);
        } else {
          console.error("Expected an array but got:", testimonialsArray);
          setTotalRatings([]); // Fallback to an empty array
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error);
        setTotalRatings([]); // Fallback to an empty array on error
      }
    };
    fetchTotalRatings();
  }, [coach._id]); // Add coach._id as a dependency
  const cumulativeRating = (totalRatings || []).reduce(
    (sum: number, data: Testimonial) => sum + data.rating,
    0
  );
  const averageRating =
    (totalRatings || []).length > 0
      ? cumulativeRating / (totalRatings || []).length
      : 0;

  return (
    <Grid
      item
      xs={12}
      sm={6}
      md={3}
      lg={3}
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Card
        sx={{
          borderRadius: "16px",
          height: "100%",
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
          <Box sx={{ display: "flex" }}>
            <Box>
              <Typography gutterBottom variant="h6">
                {coach.firstName + " " + coach.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {coach.title}
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            <Typography>{averageRating.toFixed(1)}</Typography>
            <Rating name="read-only" value={averageRating} max={1} readOnly />
          </Box>

          <Box sx={{ pt: 3, height: "60px" }}>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: "2",
                WebkitBoxOrient: "vertical",
              }}
            >
              {coach.userSummary}
            </Typography>
          </Box>
        </CardContent>

        {/* Card Actions */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            p: [0, 2],
            gap: 2,
            mb: 1,
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Button
            variant="contained"
            size="medium"
            fullWidth
            onClick={() => handleBookWorkout(coach)}
            sx={{
              fontFamily: "Lexend, Arial, sans-serif",
              textTransform: "none",
            }}
          >
            {t("Book Workout")}
          </Button>
        </Box>
      </Card>
    </Grid>
  );
};

export default CoachesCard;
