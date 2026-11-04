import * as React from "react";
import {
  Grid,
  Typography,
  Button,
  CardContent,
  CardActions,
  Card,
  Box,
  Chip,
} from "@mui/material";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import WorkoutDialog from "./WorkoutDialog";
import WorkoutFeedback from "./WorkoutFeedback";
import { waitingForFeedback } from "../services/workoutService";
import { useTranslation } from "react-i18next";

export type EventStatus =
  | "SCHEDULED"
  | "WAITING_FOR_FEEDBACK"
  | "FEEDBACK_SUBMITTED"
  | "FINISHED"
  | "CANCELLED";

type WorkoutAction =
  | { type: "FINISH_WORKOUT" }
  | { type: "CANCEL_WORKOUT" }
  | { type: "LEAVE_FEEDBACK" }
  | { type: "OPEN_DIALOG"; payload: "cancel" | "finish" }
  | { type: "CLOSE_DIALOG" };

interface WorkoutState {
  status: EventStatus;
  openDialog: boolean;
  dialogType: "cancel" | "finish" | null;
}

function workoutReducer(
  state: WorkoutState,
  action: WorkoutAction
): WorkoutState {
  switch (action.type) {
    case "FINISH_WORKOUT":
      return { ...state, status: "FINISHED", openDialog: false };
    case "CANCEL_WORKOUT":
      return { ...state, status: "CANCELLED", openDialog: false };
    case "LEAVE_FEEDBACK":
      return { ...state, status: "WAITING_FOR_FEEDBACK" };
    case "OPEN_DIALOG":
      return { ...state, openDialog: true, dialogType: action.payload };
    case "CLOSE_DIALOG":
      return { ...state, openDialog: false, dialogType: null };
    default:
      return state;
  }
}

interface WorkoutCardProps {
  workout: {
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
  };
  userId: string;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, userId }) => {
  const { t } = useTranslation();
  const [state, dispatch] = React.useReducer(workoutReducer, {
    status: workout.status as EventStatus,
    openDialog: false,
    dialogType: null,
  });
  const [feedbackDialogOpen, setFeedbackDialogOpen] = React.useState(false);

  const workOutSummary = {
    yoga: t(
      "Yoga is a mind and body practice that originated in India. It involves a series of physical postures, breathing exercises, and meditation techniques. The goal of yoga is to promote physical, mental, and spiritual well-being."
    ),
    climbing: t(
      "Climbing is a sport that involves climbing a wall or a rope. It is a great way to get fit and improve your strength and endurance."
    ),
    strengthtraining: t(
      "Strength training is a type of exercise that focuses on building muscle strength and endurance. It is a great way to get fit and improve your strength and endurance."
    ),
    crossfit: t(
      "Crossfit is a type of exercise that focuses on building muscle strength and endurance. It is a great way to get fit and improve your strength and endurance."
    ),
    cardiotraining: t(
      "Cardio training is a type of exercise that focuses on building muscle strength and endurance. It is a great way to get fit and improve your strength and endurance."
    ),
    rehabilitation: t(
      "Rehabilitation is a type of exercise that focuses on building muscle strength and endurance. It is a great way to get fit and improve your strength and endurance."
    ),
  };

  React.useEffect(() => {
    const checkFeedback = async () => {
      const workoutDate = new Date(
        `${workout.date.replace(/(\d+)(th|st|nd|rd)/, "$1")} ${workout.time}`
      );
      if (new Date() > workoutDate && workout.status === "SCHEDULED") {
        await waitingForFeedback(workout.workoutId || "");
      }
    };
    checkFeedback().catch((error) =>
      console.error("Error opening workout feedback:", error)
    );
  }, [workout]);

  return (
    <>
      <Grid item xs={12} sm={12} md={6} lg={6}>
        <Card
          sx={{
            borderRadius: "16px",
            p: 1,
            minHeight: "220px", // Set a minimum height to maintain consistency
            minWidth: "664px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <CardContent sx={{ flex: 1 }}>
            <Box sx={{ display: "flex" }}>
              <Typography variant="h6" fontWeight={"bold"}>
                {workout.activity}
              </Typography>
              <Box sx={{ flexGrow: 1 }} />
              <Chip
                label={
                  state.status === "SCHEDULED"
                    ? t("Scheduled")
                    : state.status === "WAITING_FOR_FEEDBACK"
                    ? t("Waiting for feedback")
                    : state.status === "FEEDBACK_SUBMITTED" ||
                      state.status === "FINISHED"
                    ? t("Finished")
                    : t("Cancelled")
                }
                sx={{
                  backgroundColor:
                    state.status === "SCHEDULED"
                      ? "#009ECC"
                      : state.status === "WAITING_FOR_FEEDBACK"
                      ? "#6C6F80"
                      : state.status === "FEEDBACK_SUBMITTED"
                      ? "#FDD63B"
                      : state.status === "FINISHED"
                      ? "#FDD63B"
                      : "#FF4242",
                  color: "#fff",
                  height: "32px", // Increase height
                  "& .MuiChip-label": {
                    fontSize: "0.95rem", // Increase font size
                    padding: "0 12px", // Add more horizontal padding
                    fontWeight: "bold",
                  },
                }}
              />
            </Box>
            <Typography variant="h6" sx={{ pt: 1, pb: 2 }}>
              {
                workOutSummary[
                  workout.activity
                    .replace(/\s+/g, "")
                    .toLowerCase() as keyof typeof workOutSummary
                ]
              }
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "left", width: "50%" }}>
              <EventAvailableIcon
                fontSize="medium"
                sx={{
                  color: "grey.500",
                }}
              />
              <Typography variant="body1" sx={{ ml: 1 }}>
                {workout.date}, {workout.time}
              </Typography>
            </Box>
          </CardContent>
          <CardActions
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              pb: 2,
              pr: 2,
              minHeight: "68px",
              alignItems: "center",
            }}
          >
            {state.status === "SCHEDULED" ? (
              <>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    backgroundColor: "white",
                    fontWeight: "bold",
                    borderRadius: "8px",
                    border: "1px solid black",
                  }}
                  onClick={() =>
                    dispatch({ type: "OPEN_DIALOG", payload: "cancel" })
                  }
                >
                  {t("Cancel Workout")}
                </Button>
              </>
            ) : state.status === "WAITING_FOR_FEEDBACK" ? (
              <Button
                variant="contained"
                size="medium"
                sx={{
                  backgroundColor: "white",
                  borderRadius: "8px",
                  border: "1px solid black",
                }}
                onClick={() => setFeedbackDialogOpen(true)}
              >
                {t("Leave Feedback")}
              </Button>
            ) : null}
          </CardActions>
        </Card>
      </Grid>

      <WorkoutDialog
        coachId={workout.coachId}
        userName={workout.userFirstName + " " + workout.userLastName}
        open={state.openDialog}
        dialogType={state.dialogType}
        onClose={() => dispatch({ type: "CLOSE_DIALOG" })}
        workoutId={workout.workoutId || ""}
        onFinishWorkout={() => {
          dispatch({ type: "FINISH_WORKOUT" });
          dispatch({ type: "OPEN_DIALOG", payload: "finish" });
          dispatch({ type: "LEAVE_FEEDBACK" });
        }}
        onCancelWorkout={() => dispatch({ type: "CANCEL_WORKOUT" })}
      />

      <WorkoutFeedback
        open={feedbackDialogOpen}
        onClose={() => setFeedbackDialogOpen(false)}
        onSubmit={() => {
          dispatch({ type: "FINISH_WORKOUT" });
          setFeedbackDialogOpen(false);
        }}
        workout={workout}
        userId={userId}
      />
    </>
  );
};

export default WorkoutCard;
