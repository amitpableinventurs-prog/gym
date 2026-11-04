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
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
interface WorkoutDialogProps {
  open: boolean;
  onClose: () => void;
}

const BookedWorkoutDialog: React.FC<WorkoutDialogProps> = ({
  open,
  onClose,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const handleResumeWorkout = () => {
    onClose();
  };

  const loginRouter = async () => {
    try {
      navigate("/login");
      onClose();
    } catch (error) {
      console.error("Error login:", error);
    }
  };

  const getDialogContent = () => {
    return {
      title: t("Log in to book workout"),
      content: t(
        "You must be logged in to book a workout. Please log in to access available slots and book your session."
      ),
    };
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
          {t("Close")}
        </Button>

        <Button
          variant="contained"
          size="large"
          sx={{
            backgroundColor: "primary.main",
            fontWeight: "bold",
            borderRadius: "8px",
          }}
          onClick={loginRouter}
        >
          {t("Login")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookedWorkoutDialog;
