import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Link,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  IconButton,
} from "@mui/material";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import Image from "../components/Image.tsx";
import useLoginUser from "../hooks/useLoginUser"; // Import the custom hook
import { useSnackbar } from "notistack"; // Import useSnackbar
import { useDispatch } from "react-redux"; // Import useDispatch
import { setUser } from "../redux/userSlice"; // Import your action to set user data
import Cookies from "js-cookie";
import KeyIcon from "@mui/icons-material/Key";
import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";
import { apiErrorCode } from "../services/apiClient";
// Define schema using Zod
const schema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

// Define the form data type
type FormData = z.infer<typeof schema>;

function LoginPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar(); // Initialize useSnackbar
  const [openCredentials, setOpenCredentials] = useState(false);
  const { login, loading: loginLoading } = useLoginUser(); // Destructure the login function and loading state
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });
  const dispatch = useDispatch(); // Initialize useDispatch

  // Handle form submission
  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      const response = await login(data.email, data.password); // Call the login function with email and password
      if (response.status === 200) {
        const { token, userData } = response.data; // Destructure to exclude token
        // Store token in HTTP-only cookie
        Cookies.set("authToken", token, {
          expires: 1 / 24, // 1 hour, matching the JWT lifetime
          secure: window.location.protocol === "https:",
          sameSite: "strict",
        });

        // Store user data in Redux
        dispatch(setUser(userData));

        enqueueSnackbar(t("Login successful! Welcome back!"), {
          // Show success message
          variant: "success",
          anchorOrigin: {
            vertical: "top",
            horizontal: "center",
          },
        });

        // Navigate to home after a brief delay to show the skeleton
        setTimeout(() => {
          if (userData.isAdmin) {
            navigate("/admin");
          } else if (userData.isCoach) {
            navigate("/home");
          } else {
            navigate("/workouts");
          }
        }, 1000); // Adjust the delay as needed
      }
    } catch (err) {
      console.error("Login failed:", err); // Handle any errors if needed
      enqueueSnackbar(
        apiErrorCode(err) === "ACCOUNT_SUSPENDED"
          ? t("This account has been suspended")
          : t("Login failed. Please check your credentials and try again."), // Show error message
        {
          variant: "error",
          anchorOrigin: {
            vertical: "top",
            horizontal: "center",
          },
        }
      );
    }
  };

  const handleCredentials = () => {
    setOpenCredentials(true);
  };

  return loginLoading ? (
    <Box sx={{ pt: 50, pl: 20, pr: 20 }}>
      <LinearProgress color="primary" />
    </Box>
  ) : (
    <Grid
      container
      spacing={6}
      sx={{
        height: {
          sm: "auto",
          xs: "auto", // 40vh for xs screens
          md: "100vh", // 100vh for larger screens
        },
        mt: {
          md: 0,
          lg: 0,
        },
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Grid
        item
        xs={12}
        md={6}
        lg={6}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 2,
        }}
      >
        <Box
          component="form"
          noValidate
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            maxWidth: "496px",
            p: 3,
          }}
          onSubmit={handleSubmit(onSubmit)}
        >
          <Typography
            component="h1"
            variant="body1"
            align="left"
            width="100%"
            sx={{ fontWeight: "300" }}
          >
            {t("WELCOME BACK")}
          </Typography>

          <Typography
            component="h1"
            variant="h5"
            align="left"
            sx={{
              fontWeight: "500",
            }}
            width="100%"
          >
            {t("Log In to Your Account")}
          </Typography>

          <TextField
            margin="normal"
            id="email"
            label={t("Email Address")}
            {...register("email")}
            error={!!errors.email}
            helperText={
              errors.email ? errors.email.message : "e.g. username@domain.com"
            }
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
              },
            }}
          />
          <TextField
            margin="normal"
            type="password"
            id="password"
            label={t("Password")}
            placeholder={t("Enter your password")}
            {...register("password")}
            error={!!errors.password}
            helperText={
              errors.password
                ? errors.password.message
                : t("Password is required")
            }
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
              },
            }}
          />
          <Box
            sx={{
              width: "100%",
              justifyContent: "flex-start",
              alignItems: "center",
              display: "flex",
              color: "primary.main",
            }}
          >
            <Button
              variant="outlined"
              onClick={() => {
                handleCredentials();
              }}
              sx={{
                borderRadius: "6px",
                color: "primary.main",
                borderColor: "primary.main",

                "&:hover": {
                  borderColor: "primary.main",
                },
              }}
            >
              {t("Credentials")} <KeyIcon />
            </Button>
          </Box>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              m: 1,
              borderRadius: "6px",
              height: "3rem",
              textTransform: "none",
            }}
            disabled={!isValid}
          >
            {t("Log In")}
          </Button>
          <Grid item xs={12} md={12}>
            <Typography>
              {t("Don't have an account?")}{" "}
              <Link
                href="/register"
                variant="body2"
                sx={{
                  color: (theme) =>
                    theme.palette.mode === "dark" ? "#fff" : "#000",
                  textDecorationColor: (theme) =>
                    theme.palette.mode === "dark" ? "#fff" : "#000",
                }}
              >
                {t("CREATE NEW ACCOUNT")}
              </Link>
            </Typography>
          </Grid>
        </Box>
      </Grid>
      <Image />
      <Dialog
        open={openCredentials}
        onClose={() => setOpenCredentials(false)}
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
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {t("Credentials")}
          <IconButton
            aria-label="close"
            sx={{
              color: (theme) =>
                theme.palette.mode === "light" ? "grey.500" : "white",
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Box sx={{ fontWeight: "bold", color: "primary.main" }}>
              {t("Coach Credentials")}:
            </Box>
            <br />
            {t("Email")}: username1@domain.com
            <br />
            {t("Password")}: a@00119922A
            <br />
            <br />
            <Box sx={{ fontWeight: "bold", color: "primary.main" }}>
              {t("User Credentials")}:
            </Box>
            <br />
            {t("Email")}: username@domain.com
            <br />
            {t("Password")}: a@00119922A
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </Grid>
  );
}

export default LoginPage;
