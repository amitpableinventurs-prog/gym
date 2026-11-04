import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Rating,
  Stack,
  Typography,
} from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import FormatQuoteRoundedIcon from "@mui/icons-material/FormatQuoteRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getTestimonials } from "../services/testimonialsService";
import { getCoach } from "../services/userService";

interface MemberStory {
  id: string;
  firstName: string;
  lastName: string;
  date: string;
  rating: number;
  testimonial: string;
  coachName: string;
}

const TestimonialsPage: React.FC = () => {
  const { t } = useTranslation();
  const [stories, setStories] = useState<MemberStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadStories = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await getCoach("");
      const coaches = response.data.coach as Array<{
        _id: string;
        firstName: string;
        lastName: string;
      }>;
      const coachStories = await Promise.all(
        coaches.map(async (coach) => {
          const responseData = await getTestimonials(coach._id);
          const entries = responseData[coach._id];
          if (!Array.isArray(entries)) return [];

          return entries.map((entry: Omit<MemberStory, "id" | "coachName">, index: number) => ({
            ...entry,
            id: `${coach._id}-${entry.date}-${index}`,
            coachName: `${coach.firstName} ${coach.lastName}`,
          }));
        })
      );
      setStories(coachStories.flat().sort((first, second) => second.date.localeCompare(first.date)));
    } catch (loadError) {
      console.error("Unable to load member testimonials:", loadError);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStories();
  }, [loadStories]);

  return (
    <Box sx={{ maxWidth: 1120, mx: "auto", px: { xs: 2, sm: 3, md: 4 }, py: { xs: 5, md: 9 } }}>
      <Stack alignItems="center" textAlign="center" sx={{ mb: { xs: 4, md: 6 } }}>
        <Chip label={t("MEMBER STORIES")} color="primary" variant="outlined" sx={{ mb: 2 }} />
        <Typography
          component="h1"
          sx={{ fontSize: { xs: "2.3rem", sm: "3.4rem" }, fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.12 }}
        >
          {t("Progress feels better")}{" "}
          <Box component="span" sx={{ color: "primary.main" }}>{t("together.")}</Box>
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1.5, maxWidth: 650, lineHeight: 1.8 }}>
          {t("Read feedback shared by members after their coaching sessions.")}
        </Typography>
      </Stack>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => void loadStories()} startIcon={<RefreshRoundedIcon />}>
              {t("Retry")}
            </Button>
          }
        >
          {t("We could not load member stories right now. Please try again.")}
        </Alert>
      )}

      {loading ? (
        <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 220 }}>
          <CircularProgress aria-label={t("Loading member stories")} />
        </Stack>
      ) : stories.length ? (
        <Grid container spacing={2}>
          {stories.map((story) => (
            <Grid item xs={12} sm={6} md={4} key={story.id}>
              <Card elevation={0} sx={{ height: "100%", border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
                <CardContent sx={{ display: "flex", flexDirection: "column", height: "100%", p: { xs: 2.5, md: 3 } }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Rating value={story.rating} readOnly size="small" />
                    <FormatQuoteRoundedIcon sx={{ color: "primary.main", fontSize: 32, transform: "rotate(180deg)" }} />
                  </Stack>
                  <Typography color="text.primary" sx={{ mt: 1.5, flexGrow: 1, lineHeight: 1.8 }}>
                    {story.testimonial}
                  </Typography>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 3, pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
                    <Avatar sx={{ bgcolor: "primary.main", fontWeight: 600 }}>
                      {story.firstName.charAt(0)}{story.lastName.charAt(0)}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography fontWeight={600} noWrap>{story.firstName} {story.lastName}</Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {t("Session with")} {story.coachName}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: "auto !important", whiteSpace: "nowrap" }}>
                      {story.date}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : !error ? (
        <Stack alignItems="center" spacing={1.5} sx={{ py: { xs: 4, md: 6 }, px: 2, textAlign: "center", bgcolor: "background.paper", border: "1px solid", borderColor: "divider", borderRadius: 4 }}>
          <Typography component="h2" variant="h5" fontWeight={700}>{t("Your story could be next.")}</Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 500 }}>
            {t("Member feedback will appear here after it is shared. In the meantime, meet our coaches and find a session.")}
          </Typography>
          <Button component={Link} to="/coaches" variant="contained" endIcon={<ArrowForwardRoundedIcon />} sx={{ mt: 1, borderRadius: 2 }}>
            {t("Explore coaches")}
          </Button>
        </Stack>
      ) : null}
    </Box>
  );
};

export default TestimonialsPage;
