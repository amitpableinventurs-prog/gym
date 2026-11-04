import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  Button,
  FormControl,
  Grid,
  Avatar,
  SelectChangeEvent,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import useUpdateUser from "../hooks/useUpdateUser";
import { enqueueSnackbar } from "notistack";
import { useSelector, useDispatch } from "react-redux";
import { setUser, UserState } from "../redux/userSlice";
import { DateTime } from "luxon";

type FormData = {
  firstName: string;
  lastName: string;
  email?: string;
  password?: string;
  target: string;
  activity: string;
  userSummary?: string;
  title?: string;
  profileImage?: File;
  timeSlots: string[];
};

const schema = z.object({
  firstName: z.string().min(3, "First Name is required"),
  lastName: z.string().min(3, "Last Name is required"),
  target: z.string().min(1, "Target is required"),
  activity: z.string().min(1, "Preferable Activity is required"),
  userSummary: z.string().optional(),
  title: z.string().optional(),
  timeSlots: z.array(z.string()).optional(),
});

const generateTimeOptions = () => {
  const times: string[] = ["All"];
  let time = DateTime.now().startOf("day"); // Start at 12:00 AM
  for (let hour = 0; hour < 24; hour++) {
    times.push(time.toFormat("hh:mm a")); // Format to 1:00 AM, 2:00 AM, etc.
    time = time.plus({ hours: 1 }); // Add an hour
  }
  return times;
};

function GeneralInformation() {
  const userData = useSelector((state: { user: UserState }) => state.user);
  const dispatch = useDispatch();
  const { update } = useUpdateUser();
  const timeOptions = generateTimeOptions();
  const [previewImage, setPreviewImage] = useState<string>(
    "/images/profile.png"
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      firstName: userData.firstName,
      lastName: userData.lastName,
      userSummary: userData.userSummary,
      target: userData.target,
      activity: userData.activity,
      title: userData.title,
      timeSlots: userData.timeSlots,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await update(data);
      dispatch(
        setUser({
          ...data,
          id: userData.id,
          email: userData.email,
          isCoach: userData.isCoach,
          isAdmin: userData.isAdmin,
          selectedLanguage: userData.selectedLanguage,
          activity: data.activity,
          timeSlots: Array.isArray(data.timeSlots)
            ? data.timeSlots
            : [data.timeSlots || ""],
        })
      );

      enqueueSnackbar("User updated successfully!", {
        variant: "success",
        anchorOrigin: {
          vertical: "top",
          horizontal: "center",
        },
      });
    } catch (error) {
      console.error("Error updating user:", error);
      enqueueSnackbar("Error updating user:", {
        variant: "error",
        anchorOrigin: {
          vertical: "top",
          horizontal: "center",
        },
      });
    }
  };
  const target = watch("target");
  const activity = watch("activity");
  const timeSlots = watch("timeSlots");

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTimeSlotChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];
    const allTimes = timeOptions.filter((time) => time !== "All");

    let newValue: string[];
    if (value.includes("All")) {
      newValue = allTimes;
    } else if (timeSlots?.includes("All")) {
      newValue = [];
    } else {
      newValue = value;
    }

    setValue("timeSlots", newValue);
  };

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={6}>
        <Grid
          item
          xs={12}
          md={12}
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <Avatar src={previewImage} sx={{ width: "40px", height: "40px" }} />
            <input
              accept="image/*"
              type="file"
              id="profile-image-upload"
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
            <label htmlFor="profile-image-upload">
              <Button component="span">Edit</Button>
            </label>
          </Box>

          <Box sx={{ ml: 1, mb: 4 }}>
            <Typography variant="h6" fontSize="16px">
              {userData.firstName} {userData.lastName} (
              {userData.isCoach ? "Coach" : "Client"})
            </Typography>
            <Typography variant="body1" fontSize="16px" fontWeight="300">
              {userData.email}
            </Typography>
          </Box>
        </Grid>
      </Grid>
      <Grid item xs={12} md={12} sx={{ mt: -4 }}>
        <Box
          sx={{
            display: "flex",
            width: "100%",
          }}
        >
          <Box
            component="form"
            noValidate
            sx={{
              width: "100%",
              maxWidth: "700px",
            }}
            onSubmit={handleSubmit(onSubmit)}
          >
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  autoComplete="firstName"
                  {...register("firstName")}
                  error={!!errors.firstName}
                  helperText={errors.firstName?.message}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  autoComplete="lastName"
                  {...register("lastName")}
                  error={!!errors.lastName}
                  helperText={errors.lastName?.message}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                    },
                  }}
                />
              </Grid>
              {userData.isCoach && (
                <>
                  <Grid item xs={12} md={12}>
                    <TextField
                      id="title"
                      label="Title"
                      fullWidth
                      multiline
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "8px",
                        },
                      }}
                      {...register("title")}
                    />
                  </Grid>
                  <Grid item xs={12} md={12}>
                    <TextField
                      id="summary"
                      label="About"
                      fullWidth
                      multiline
                      rows={4}
                      {...register("userSummary")}
                      error={!!errors.userSummary}
                      helperText={errors.userSummary?.message}
                      variant="outlined"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "8px",
                          mb: 1,
                        },
                      }}
                    />
                  </Grid>
                </>
              )}
            </Grid>
            {!userData.isCoach && (
              <FormControl
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                  },
                  mb: 3,
                }}
              >
                <InputLabel id="yourTargetLabel">Your Target</InputLabel>
                <Select
                  labelId="yourTargetLabel"
                  id="yourTarget"
                  value={target || ""}
                  label="Your Target"
                  {...register("target")}
                >
                  <MenuItem value="Lose weight">Lose weight</MenuItem>
                  <MenuItem value="Gain weight">Gain weight</MenuItem>
                  <MenuItem value="Improve flexibility">
                    Improve flexibility
                  </MenuItem>
                  <MenuItem value="General fitness">General fitness</MenuItem>
                  <MenuItem value="Build Muscle">Build Muscle</MenuItem>
                  <MenuItem value="Rehabilitation/Recovery">
                    Rehabilitation/Recovery
                  </MenuItem>
                </Select>
                {errors.target && (
                  <Typography color="error">{errors.target.message}</Typography>
                )}
              </FormControl>
            )}

            <FormControl
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                },
                mb: 2,
              }}
            >
              <InputLabel id="activity">
                {userData.isCoach ? "Specialization" : "Preferable Activity"}
              </InputLabel>
              <Select
                labelId="activity"
                id="activity"
                value={activity || ""}
                label={
                  userData.isCoach ? "Specialization" : "Preferable Activity"
                }
                {...register("activity")}
              >
                <MenuItem value="Yoga">Yoga</MenuItem>
                <MenuItem value="Climbing">Climbing</MenuItem>
                <MenuItem value="Strength training">Strength training</MenuItem>
                <MenuItem value="Cross-fit">Cross-fit</MenuItem>
                <MenuItem value="Cardio Training">Cardio Training</MenuItem>
                <MenuItem value="Rehabilitation">Rehabilitation</MenuItem>
              </Select>
              {errors.activity && (
                <Typography color="error">{errors.activity.message}</Typography>
              )}
            </FormControl>
            {userData.isCoach && (
              <Grid
                item
                xs={12}
                md={12}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <FormControl
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                    },
                    mt: 1,
                    mb: 2,
                  }}
                >
                  <InputLabel id="time">Time Slots</InputLabel>
                  <Select
                    labelId="timeSlots"
                    id="timeSlots"
                    multiple
                    value={timeSlots || []}
                    label="Time Slots"
                    {...register("timeSlots")}
                    onChange={handleTimeSlotChange}
                  >
                    {timeOptions.map((timeOption, index) => (
                      <MenuItem key={index} value={timeOption}>
                        {timeOption}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.timeSlots && (
                    <Typography color="error">
                      {errors.timeSlots.message}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
            )}

            <Box
              sx={{
                display: "flex",
                justifyContent: "right",
                width: "100%",
              }}
            >
              <Button
                type="submit"
                variant="outlined"
                disabled={!isValid}
                sx={{
                  borderRadius: "10px",
                  width: { xs: "100%", md: "auto" },
                }}
              >
                Save Changes
              </Button>
            </Box>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}
//translate("Aditya","en")
export default GeneralInformation;
