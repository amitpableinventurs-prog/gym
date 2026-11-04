import React, { useEffect, useState } from "react";
import Testimonials from "../components/Testimonials.tsx";
import { Button, Grid, Typography } from "@mui/material";
import TimeSlotSelector from "../components/Slots.tsx";
import BookWorkoutProfileCard from "../components/bookWorkoutProfileCard.tsx";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import CalenderComponent from "../components/CalenderComponent.tsx";
import SessionCard from "../components/SessionCard.tsx";
import { format } from "date-fns";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store.ts";
import {
  bookWorkout,
  getBookedWorkoutsByUsers,
} from "../services/workoutService.ts";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import { apiErrorCode, apiErrorMessage } from "../services/apiClient.ts";

const MEMBERSHIP_ERRORS = [
  "MEMBERSHIP_REQUIRED",
  "MEMBERSHIP_FROZEN",
  "MEMBERSHIP_DATE_NOT_COVERED",
  "SESSION_LIMIT_REACHED",
];

interface BookedWorkout {
  _id: string;
  userId: string;
  coachId: string;
  date: string;
  time: string;
  activity: string;
  status: string;
}

const BookCoachPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const location = useLocation();
  const navigate = useNavigate();
  const coach = location.state?.coach;
  const image = location.state?.image;
  const availableSlots = coach.timeSlots;
  const user = useSelector((state: RootState) => state.user);
  const userId = user.id;
  const activity = coach.activity;

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookedWorkouts, setBookedWorkouts] = useState<BookedWorkout[]>([]);
  const [booked, setBooked] = useState([]);
  const isCoach = user.isCoach;
  useEffect(() => {
    const fetchBookedWorkouts = async () => {
      try {
        const response = await getBookedWorkoutsByUsers(userId, isCoach);
        setBookedWorkouts(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error("Error fetching booked workouts:", error);
        setBookedWorkouts([]);
      }
    };
    fetchBookedWorkouts();
  }, [userId, booked]);

  const handleSlotSelection = (slot: string) => {
    setSelectedSlot(slot);
  };
  if (!coach) {
    return <Navigate to="/coaches" replace />;
  }

  return (
    <Grid container spacing={2}>
      <BookWorkoutProfileCard
        selectedSlot={selectedSlot}
        selectedDate={format(selectedDate, "MMM d, yyyy")}
        coach={coach}
        image={image}
        onSelect={async (coachId: string) => {
          if (selectedSlot && selectedDate) {
            try {
              const response = await bookWorkout(
                coachId,
                format(selectedDate, "MMM d, yyyy"),
                selectedSlot,
                activity
              );
              setBooked(response);
              enqueueSnackbar(t("Workout booked successfully"), {
                variant: "success",
              });
            } catch (error) {
              const isMembershipIssue = MEMBERSHIP_ERRORS.includes(apiErrorCode(error) ?? "");
              enqueueSnackbar(t(apiErrorMessage(error, "This slot is already booked")), {
                variant: "error",
                autoHideDuration: isMembershipIssue ? 8000 : undefined,
                action: isMembershipIssue ? (
                  <Button color="inherit" size="small" onClick={() => navigate("/membership")}>
                    {t("View membership")}
                  </Button>
                ) : undefined,
              });
              console.error("Error booking workout:", error);
            }
          }
        }}
      />
      <Grid item xs={12} md={9} sx={{ padding: "2 rem" }}>
        <Grid
          container
          spacing={1}
          display="flex"
          justifyContent="space-between"
        >
          <Grid item xs={12} md={12}>
            <Typography variant="body2">
              {t("SCHEDULE YOUR SESSION")}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <CalenderComponent
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TimeSlotSelector
              date={format(selectedDate, "MMM d")}
              availableSlots={availableSlots}
              onSelect={handleSlotSelection}
            />
          </Grid>
          <Grid item xs={12} md={12} display="flex" marginTop="10px">
            <Typography variant="body2">
              {t("YOUR UPCOMING WORKOUTS")}
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            md={12}
            display="flex"
            flexDirection="column"
            justifyContent="flex-start"
            alignItems="center"
            gap={2}
          >
            {(bookedWorkouts || [])
              .filter((workout) => workout.status === "SCHEDULED")
              .map((workout, index) => (
                <SessionCard
                  key={workout.time + index}
                  title={workout.activity}
                  date={workout.date}
                  time={workout.time}
                  duration="1 hour"
                />
              ))}
          </Grid>
          <Grid item xs={12} md={12} display="flex" marginTop="10px">
            <Typography variant="body2">{t("FEEDBACK")}</Typography>
          </Grid>
          <Grid item xs={12} md={12} display="flex" justifyContent="flex-start">
            <Testimonials coachId={coach._id} />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default BookCoachPage;
