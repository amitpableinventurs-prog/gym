import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Divider,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Checkbox,
  Link,
} from "@mui/material";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "../components/Image.tsx";
import useRegisterUser from "../hooks/useRegisterUser";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";

function RegisterPage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const schema = z.object({
    firstName: z.string().min(1, t("First Name is required")),
    lastName: z.string().min(1, t("Last Name is required")),
    email: z
      .string()
      .email(t("Invalid email address"))
      .min(1, t("Email is required")),
    password: z
      .string()
      .regex(/^\S*$/, t("Password must not contain spaces"))
      .min(8, t("Password must be at least 8 characters long"))
      .regex(/[A-Z]/, t("Password must contain at least one uppercase letter")),
    target: z.string().min(1, t("Target is required")),
    isCoach: z.boolean(),
    activity: z.string().min(1, t("Activity is required")),
  });

  // Define the TypeScript interface for form data based on the schema
  type RegisterFormData = z.infer<typeof schema>;

  // Destructure the useForm hook with zodResolver and schema validation
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const { registerUser } = useRegisterUser(); // Get the function from the hook

  const onSubmit: SubmitHandler<RegisterFormData> = async (data) => {
    try {
      await registerUser({
        ...data,
        activity: data.activity,
      });

      // Show success message
      enqueueSnackbar("Account has been created successfully! 😀", {
        variant: "success",
        anchorOrigin: {
          vertical: "top",
          horizontal: "center",
        },
      });

      // Navigate after a delay
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message ||
          t(
            "We're experiencing technical difficulties. Please try again later."
          ),
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

  const target = watch("target");
  const activity = watch("activity");

  return (
    <Grid
      container
      spacing={6}
      sx={{
        height: {
          xs: "auto",
          md: "100vh",
        },
        mt: {
          xs: 4,
          md: 0,
          lg: 0,
        },
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        pb: { xs: 4 },
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
            {t("LET'S GET YOU STARTED")}
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
            {t("CREATE AN ACCOUNT")}
          </Typography>
          <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
            {" "}
            <TextField
              margin="normal"
              id="firstName"
              label={t("First Name")}
              autoComplete="given-name"
              placeholder={t("Enter your first name")}
              {...register("firstName")}
              error={!!errors.firstName}
              helperText={
                errors.firstName ? errors.firstName.message : t("e.g. Johnson")
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
              id="lastName"
              label={t("Last Name")}
              placeholder={t("Enter your last name")}
              autoComplete="family-name"
              {...register("lastName")}
              error={!!errors.lastName}
              helperText={
                errors.lastName ? errors.lastName.message : t("e.g. Doe")
              }
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                },
              }}
            />
          </Box>

          <TextField
            margin="normal"
            id="email"
            label={t("Email Address")}
            placeholder={t("Enter your email")}
            {...register("email")}
            error={!!errors.email}
            helperText={
              errors.email
                ? errors.email.message
                : t("e.g. username@domain.com")
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
                : t("At least one capital letter required")
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
              justifyContent: "flex-start",
              alignItems: "center",
              display: "flex",
              width: "100%",
            }}
          >
            <Checkbox
              {...register("isCoach")}
              inputProps={{ "aria-label": "controlled" }}
              onChange={(e) => {
                // Ensure the value is true when checked
                register("isCoach").onChange(e);
              }}
            />
            <Typography variant="body2" color="textSecondary">
              {t("Are you a Coach?")}
            </Typography>
          </Box>

          <Divider sx={{ width: "100%", my: 2 }} />

          <FormControl
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
              },
              mb: { lg: 2, md: 2, xs: 2, sm: 2 },
            }}
          >
            <InputLabel id="yourTargetLabel">{t("Target")}</InputLabel>
            <Select
              labelId="yourTargetLabel"
              id="yourTarget"
              value={target || "Lose weight"}
              label={t("Target")}
              {...register("target")}
            >
              <MenuItem value="Lose weight">{t("Lose weight")}</MenuItem>
              <MenuItem value="Gain weight">{t("Gain weight")}</MenuItem>
              <MenuItem value="Improve flexibility">
                {t("Improve flexibility")}
              </MenuItem>
              <MenuItem value="General fitness">
                {t("General fitness")}
              </MenuItem>
              <MenuItem value="Build Muscle">{t("Build Muscle")}</MenuItem>
              <MenuItem value="Rehabilitation/Recovery">
                {t("Rehabilitation/Recovery")}
              </MenuItem>
            </Select>
            {errors.target && (
              <Typography color="error">{errors.target.message}</Typography>
            )}
          </FormControl>

          <FormControl
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
              },
              mb: 2,
            }}
          >
            <InputLabel id="activity">{t("Activity")}</InputLabel>
            <Select
              labelId="activity"
              id="activity"
              value={activity || "Yoga"}
              label={t("Activity")}
              {...register("activity")}
            >
              <MenuItem value="Yoga">{t("Yoga")}</MenuItem>
              <MenuItem value="Climbing">{t("Climbing")}</MenuItem>
              <MenuItem value="Strength training">
                {t("Strength training")}
              </MenuItem>
              <MenuItem value="Cross-fit">{t("Cross-fit")}</MenuItem>
              <MenuItem value="Cardio Training">
                {t("Cardio Training")}
              </MenuItem>
              <MenuItem value="Rehabilitation">{t("Rehabilitation")}</MenuItem>
            </Select>
            {errors.activity && (
              <Typography color="error">{errors.activity.message}</Typography>
            )}
          </FormControl>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mb: { lg: 2, md: 0, xs: 2, sm: 2 },
              borderRadius: "6px",
              height: "3rem",
              textTransform: "none",
            }}
            disabled={!isValid}
          >
            {t("Create An Account")}
          </Button>
          <Grid item xs={12} md={12}>
            <Typography>
              {t("Already have an account?")}
              <Link
                href="/login"
                variant="body2"
                sx={{
                  color: (theme) =>
                    theme.palette.mode === "dark" ? "#fff" : "#000",
                  textDecorationColor: (theme) =>
                    theme.palette.mode === "dark" ? "#fff" : "#000",
                }}
              >
                {t("LOGIN HERE")}
              </Link>
            </Typography>
          </Grid>
        </Box>
      </Grid>
      <Image />
    </Grid>
  );
}

export default RegisterPage;
