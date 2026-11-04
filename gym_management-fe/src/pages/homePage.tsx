import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import FitnessCenterRoundedIcon from "@mui/icons-material/FitnessCenterRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { DateTime } from "luxon";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import HomeCard from "../components/homeCard";
import SkeletonHomeCard from "../components/Skeleton/SkeletonHomePage";
import { filterCoaches } from "../services/userService";
import useFetchCoaches from "../hooks/useFetchCoaches";
import Cookies from "js-cookie";
import { Coach } from "../types/coach";
import { useTranslation } from "react-i18next";

type FormData = {
  activity: string;
  date: string;
  time: string;
  coach: string;
};

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1400&q=85";

const generateTimeOptions = () => {
  const times: string[] = ["All"];
  let time = DateTime.now().startOf("day");
  for (let hour = 0; hour < 24; hour++) {
    times.push(time.toFormat("hh:mm a"));
    time = time.plus({ hours: 1 });
  }
  return times;
};

const HomePage: React.FC = () => {
  const token = Cookies.get("authToken") || "";
  const timeOptions = generateTimeOptions();
  const { data: coaches, loading } = useFetchCoaches(token);
  const coachesData =
    coaches?.coach?.map((coach: Coach) => ({ coach })) || [];
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      activity: "All",
      date: dayjs(DateTime.now().toJSDate()).format("YYYY-MM-DD"),
      time: "All",
      coach: "All",
    },
  });

  const [workouts, setWorkouts] = useState<Coach[]>([]);
  const [searchData, setSearchData] = useState<FormData | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const onSubmit = (data: FormData) => {
    setHasSearched(true);
    setSearchData({
      activity: data.activity,
      date: dayjs(data.date).format("YYYY, MMMM DD"),
      time: data.time,
      coach: data.coach,
    });
  };

  useEffect(() => {
    const fetchWorkouts = async () => {
      if (!searchData) return;

      try {
        const response = await filterCoaches(searchData);
        setWorkouts(response);
      } catch (error) {
        console.error("Error fetching workouts:", error);
        setWorkouts([]);
      }
    };

    void fetchWorkouts();
  }, [searchData]);

  const activity = watch("activity");
  const time = watch("time");
  const selectedCoach = watch("coach");

  return (
    <Box sx={{ pb: { xs: 6, md: 10 } }}>
      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          px: { xs: 2, sm: 3, md: 4 },
          pt: { xs: 2, md: 4 },
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 0.9fr" },
            alignItems: "center",
            gap: { xs: 4, md: 7 },
            minHeight: { md: 390 },
            py: { xs: 4, md: 5 },
          }}
        >
          <Box sx={{ maxWidth: 590 }}>
            <Chip
              icon={<FitnessCenterRoundedIcon />}
              label={t("A better way to find your fit")}
              sx={{
                mb: 2.5,
                px: 0.5,
                bgcolor: "primary.light",
                color: "primary.dark",
                fontWeight: 600,
                "& .MuiChip-icon": { color: "primary.dark" },
              }}
            />
            <Typography
              component="h1"
              sx={{
                fontSize: { xs: "2.5rem", sm: "3.25rem", md: "4rem" },
                lineHeight: 1.08,
                letterSpacing: "-0.045em",
                fontWeight: 700,
                color: "text.primary",
              }}
            >
              {t("Your goals.")}
              <Box component="span" sx={{ color: "primary.main" }}>
                {" "}{t("Your pace.")}
              </Box>
            </Typography>
            <Typography
              sx={{
                mt: 2,
                maxWidth: 500,
                color: "text.secondary",
                fontSize: { xs: "1rem", sm: "1.1rem" },
                lineHeight: 1.8,
              }}
            >
              {t(
                "Find a workout that fits your schedule, meet coaches who get you, and make every session count."
              )}
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{ mt: 3.5, alignItems: { xs: "stretch", sm: "center" } }}
            >
              <Button
                component="a"
                href="#find-workout"
                variant="contained"
                endIcon={<ArrowForwardRoundedIcon />}
                sx={{
                  px: 3,
                  py: 1.4,
                  borderRadius: 2.5,
                  fontWeight: 600,
                  boxShadow: "0 10px 24px rgba(46,125,83,0.2)",
                }}
              >
                {t("Find your workout")}
              </Button>
              <Button
                component={Link}
                to="/coaches"
                variant="text"
                sx={{ py: 1.4, fontWeight: 600 }}
              >
                {t("Meet the coaches")}
              </Button>
            </Stack>
            <Stack
              direction="row"
              spacing={{ xs: 1.5, sm: 3 }}
              sx={{ mt: 4, flexWrap: "wrap", rowGap: 1.5 }}
            >
              {[
                { icon: <GroupsRoundedIcon />, label: t("Supportive coaches") },
                { icon: <EventAvailableRoundedIcon />, label: t("Flexible sessions") },
              ].map(({ icon, label }) => (
                <Stack
                  key={label}
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ color: "text.secondary" }}
                >
                  <Box sx={{ color: "primary.main", display: "flex" }}>{icon}</Box>
                  <Typography variant="body2" fontWeight={500}>
                    {label}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>

          <Box
            sx={{
              position: "relative",
              minHeight: { xs: 250, sm: 340, md: 390 },
              overflow: "hidden",
              borderRadius: { xs: 4, md: 6 },
              bgcolor: "primary.light",
              boxShadow: "0 24px 60px rgba(27,54,38,0.14)",
            }}
          >
            <Box
              component="img"
              src={HERO_IMAGE}
              alt={t("Athletes training in a modern gym")}
              loading="eager"
              sx={{
                display: "block",
                width: "100%",
                height: "100%",
                minHeight: { xs: 250, sm: 340, md: 390 },
                objectFit: "cover",
                objectPosition: "center 45%",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, transparent 48%, rgba(12,28,19,0.76) 100%)",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                left: { xs: 2.5, sm: 3.5 },
                right: { xs: 2.5, sm: 3.5 },
                bottom: { xs: 2.5, sm: 3.5 },
                color: "#fff",
              }}
            >
              <Typography variant="overline" sx={{ letterSpacing: 1.5, opacity: 0.85 }}>
                {t("SMALL STEPS. STRONGER YOU.")}
              </Typography>
              <Typography
                component="p"
                sx={{ mt: 0.5, fontSize: { xs: "1.25rem", sm: "1.6rem" }, fontWeight: 600 }}
              >
                {t("Show up for yourself.")}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Card
          id="find-workout"
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          elevation={0}
          sx={{
            mt: { xs: 2, md: 3 },
            p: { xs: 2, sm: 3, md: 3.5 },
            border: "1px solid",
            borderColor: "divider",
            borderRadius: { xs: 3, md: 4 },
            boxShadow: "0 16px 44px rgba(27,54,38,0.07)",
            scrollMarginTop: "6rem",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1}
            sx={{ mb: 2.5 }}
          >
            <Box>
              <Typography component="h2" variant="h5" fontWeight={700}>
                {t("Find your next workout")}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {t("Choose what works for you. Your next session starts here.")}
              </Typography>
            </Box>
            <Chip
              icon={<EventAvailableRoundedIcon />}
              label={t("Coach-led sessions")}
              variant="outlined"
              color="primary"
              sx={{ fontWeight: 500 }}
            />
          </Stack>

          <Grid container spacing={1.5} alignItems="center">
            <Grid item xs={12} sm={6} md={2.7}>
              <FormControl fullWidth size="small">
                <InputLabel id="activity-label">{t("Activity")}</InputLabel>
                <Select
                  labelId="activity-label"
                  id="activity"
                  value={activity || "All"}
                  label={t("Activity")}
                  {...register("activity")}
                >
                  <MenuItem value="All">{t("All activities")}</MenuItem>
                  <MenuItem value="Yoga">{t("Yoga")}</MenuItem>
                  <MenuItem value="Climbing">{t("Climbing")}</MenuItem>
                  <MenuItem value="Strength training">{t("Strength training")}</MenuItem>
                  <MenuItem value="Cross-fit">{t("Cross-fit")}</MenuItem>
                  <MenuItem value="Cardio Training">{t("Cardio Training")}</MenuItem>
                  <MenuItem value="Rehabilitation">{t("Rehabilitation")}</MenuItem>
                </Select>
                {errors.activity && (
                  <Typography color="error" variant="caption">
                    {errors.activity.message}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2.7}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label={t("Select Date")}
                  value={dayjs(watch("date"))}
                  onChange={(newValue) => {
                    if (newValue && dayjs.isDayjs(newValue)) {
                      setValue("date", newValue.format("YYYY-MM-DD"));
                    }
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      inputProps: { ...register("date") },
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6} md={2.1}>
              <FormControl fullWidth size="small">
                <InputLabel id="time-label">{t("Time")}</InputLabel>
                <Select
                  labelId="time-label"
                  id="time"
                  value={time || "All"}
                  label={t("Time")}
                  {...register("time")}
                >
                  {timeOptions.map((timeOption) => (
                    <MenuItem key={timeOption} value={timeOption}>
                      {timeOption === "All" ? t("Any time") : timeOption}
                    </MenuItem>
                  ))}
                </Select>
                {errors.time && (
                  <Typography color="error" variant="caption">
                    {errors.time.message}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2.1}>
              <FormControl fullWidth size="small">
                <InputLabel id="coach-label">{t("Coach")}</InputLabel>
                <Select
                  labelId="coach-label"
                  id="coach"
                  value={selectedCoach || "All"}
                  label={t("Coach")}
                  {...register("coach")}
                >
                  <MenuItem value="All">{t("Any coach")}</MenuItem>
                  {coachesData.map(({ coach }) => (
                    <MenuItem key={coach._id} value={coach._id}>
                      {coach.firstName} {coach.lastName}
                    </MenuItem>
                  ))}
                </Select>
                {errors.coach && (
                  <Typography color="error" variant="caption">
                    {errors.coach.message}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2.4}>
              <Button
                variant="contained"
                type="submit"
                fullWidth
                endIcon={<ArrowForwardRoundedIcon />}
                sx={{ minHeight: 42, borderRadius: 2, fontWeight: 600 }}
              >
                {t("Find Workout")}
              </Button>
            </Grid>
          </Grid>
        </Card>

        {loading && hasSearched ? (
          <Box sx={{ mt: 4 }}>
            <SkeletonHomeCard />
          </Box>
        ) : workouts.length > 0 ? (
          <Box sx={{ mt: 5 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "flex-end" }}
              spacing={1}
              sx={{ mb: 2.5 }}
            >
              <Box>
                <Typography component="h2" variant="h5" fontWeight={700}>
                  {t("Available workouts")}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {t("Choose a coach and book a time that works for you.")}
                </Typography>
              </Box>
              <Chip
                label={`${workouts.length} ${t("coaches available")}`}
                color="primary"
                variant="outlined"
              />
            </Stack>
            <Grid container spacing={2}>
              {workouts.map((workout, index) => (
                <HomeCard
                  key={workout._id}
                  image={`/Images/image${(index % 9) + 1}.svg`}
                  date={watch("date")}
                  time={watch("time")}
                  coach={workout}
                />
              ))}
            </Grid>
          </Box>
        ) : hasSearched ? (
          <Box sx={{ mt: 4 }}>
            <Alert
              severity="info"
              action={
                <Button
                  component={Link}
                  to="/coaches"
                  color="inherit"
                  size="small"
                >
                  {t("Meet our coaches")}
                </Button>
              }
              sx={{ borderRadius: 3, alignItems: "center" }}
            >
              <Typography fontWeight={600}>
                {t("No workouts available")}
              </Typography>
              <Typography variant="body2">
                {t("Try another date or activity to find your next session.")}
              </Typography>
            </Alert>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
};

export default HomePage;
