import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { updateStatus } from "../services/workoutService";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
interface WorkoutDialogProps {
  open: boolean;
  dialogType: "cancel" | "finish" | null;
  onClose: () => void;
  onFinishWorkout: () => void;
  onCancelWorkout: () => void;
  workoutId: string;
  coachId: string;
  userName: string;
}

const WorkoutDialog: React.FC<WorkoutDialogProps> = ({
  open,
  dialogType,
  onClose,
  onFinishWorkout,
  onCancelWorkout,
  workoutId,
}) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const handleResumeWorkout = () => {
    onClose();
  };

  const handleCancelWorkout = async () => {
    try {
      await updateStatus(workoutId, "CANCELLED");
      onCancelWorkout();
    } catch (error) {
      console.error("Error cancelling workout:", error);
    }
  };

  const handleFinishWorkout = async () => {
    try {
      onFinishWorkout();
      dispatch({ type: "WAITING_FOR_FEEDBACK" });
      onClose();
    } catch (error) {
      console.error("Error finishing workout:", error);
    }
  };

  const getDialogContent = () => {
    if (dialogType === "cancel") {
      return {
        title: t("Cancel Workout"),
        content: t(
          "You’re about to mark this workout as canceled. Are you sure you want to cancel this session? Any progress or data from this workout will not be saved."
        ),
      };
    }
    if (dialogType === "finish") {
      return {
        title: t("Complete Workout"),
        content: t(
          "You’re about to mark this workout as Finished. Are you sure you want to finish this session? Any progress or data from this workout will not be saved."
        ),
      };
    }
  };

  const { title, content } = getDialogContent() || {};

  return (
    <Dialog
      open={open}
      onClose={handleResumeWorkout}
      PaperProps={{
        sx: {
          minWidth: "552px",
          minHeight: "224px",
          borderRadius: "16px",
          border: "1px solid rgba(0, 0, 0, 0.12)",
          padding: "24px",
          "& .MuiDialogContent-root": {
            padding: "8px 24px 0 24px",
            overflowY: "visible",
            marginLeft: "-24px",
            marginRight: "-24px",
          },
          "& .MuiDialogActions-root": {
            padding: "24px",
            gap: "2px",
            marginTop: "15px",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          padding: "0",
          fontSize: "18px",
          fontWeight: "bold",
          marginBottom: "32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {title}
        <IconButton
          aria-label="close"
          onClick={handleResumeWorkout}
          sx={{
            color: (theme) =>
              theme.palette.mode === "light" ? "grey.500" : "white",
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <DialogContentText
          sx={{
            fontSize: "16px",
            paddingLeft: "0",
          }}
        >
          {content}
        </DialogContentText>
      </DialogContent>
      <DialogActions
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          mb: -3,
          pr: 2,
          minHeight: "68px",
          alignItems: "center",
        }}
      >
        <Button
          variant="contained"
          size="large"
          sx={{
            backgroundColor: "white",
            fontWeight: "bold",
            borderRadius: "8px",
            border: "1px solid black",
          }}
          onClick={onClose}
        >
          {t("Resume Workout")}
        </Button>

        <Button
          variant="contained"
          size="large"
          sx={{
            backgroundColor: "primary.main",
            fontWeight: "bold",
            borderRadius: "8px",
          }}
          onClick={
            dialogType === "cancel" ? handleCancelWorkout : handleFinishWorkout
          }
        >
          {dialogType === "cancel" ? t("Cancel Workout") : t("Finish Workout")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WorkoutDialog;
