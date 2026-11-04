import { Grid, Pagination, Box, Typography } from "@mui/material";
import WorkoutCard from "../components/WorkoutCard.tsx";
import { useEffect, useState } from "react";
import { getBookedWorkoutsByUsers } from "../services/workoutService.ts";
import SkeletonWorkoutPage from "../components/Skeleton/SkeletonWorkoutPage.tsx";
import { enqueueSnackbar } from "notistack";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store.ts";

interface BookedWorkout {
  activity: string;
  coachId: string;
  coachFirstName: string;
  coachLastName: string;
  date: string;
  time: string;
  status: string;
  workoutId: string;
  userFirstName: string;
  userLastName: string;
}

const Workouts: React.FC = () => {
  const itemsPerPage = 8;
  const [page, setPage] = useState<number>(1);
  const [bookedWorkouts, setBookedWorkouts] = useState<BookedWorkout[]>([]);
  const user = useSelector((state: RootState) => state.user);
  const userId = user.id;
  useEffect(() => {
    const fetchBookedWorkouts = async () => {
      try {
        const response = await getBookedWorkoutsByUsers(userId, user.isCoach);
        setBookedWorkouts(response);
      } catch (error) {
        enqueueSnackbar("Error fetching booked workouts:", {
          variant: "error",
        });
        console.error("Error fetching booked workouts:", error);
      }
    };
    fetchBookedWorkouts();
  }, [userId]);

  const sortedWorkouts = (bookedWorkouts || []).sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`); // Convert to Date object
    const dateB = new Date(`${b.date}T${b.time}`); // Convert to Date object

    const now = new Date(); // Current date and time

    // Check if both dates are upcoming
    if (dateA >= now && dateB >= now) {
      return dateA.getTime() - dateB.getTime(); // Sort upcoming dates in ascending order
    }
    // Check if both dates are past
    else if (dateA < now && dateB < now) {
      return dateB.getTime() - dateA.getTime(); // Sort past dates in descending order
    }
    // One date is upcoming and the other is past
    else {
      return dateA >= now ? -1 : 1; // Upcoming dates come first
    }
  });

  const components = sortedWorkouts.map((workout, index) => (
    <WorkoutCard key={index} workout={workout} userId={userId} />
  ));

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedComponents = (components || []).slice(startIndex, endIndex);

  const totalItems = bookedWorkouts.length;

  const handleChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ): void => {
    setPage(value);
  };
  return (
    <>
      {bookedWorkouts.length === 0 ? (
        <Grid
          container
          spacing={6}
          sx={{
            width: "100%",
            pl: 5,
            mb: 2,
          }}
        >
          <SkeletonWorkoutPage />
        </Grid>
      ) : (
        <>
          <Grid
            container
            spacing={6}
            sx={{
              width: "100%",
              pl: 5,
              mb: 2,
            }}
          >
            {bookedWorkouts.length > 0 ? (
              displayedComponents
            ) : (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                  height: "100%",
                  p: 2,
                }}
              >
                <Typography variant="h6">No workouts found</Typography>
              </Box>
            )}
          </Grid>

          {/* Pagination controls */}
          {bookedWorkouts.length > 6 ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                p: 2,
              }}
            >
              <Pagination
                count={Math.ceil(totalItems / itemsPerPage)} // Total number of pages
                page={page}
                onChange={handleChange}
                color="primary"
                size="large"
              />
            </Box>
          ) : (
            <></>
          )}
        </>
      )}
    </>
  );
};

export default Workouts;
