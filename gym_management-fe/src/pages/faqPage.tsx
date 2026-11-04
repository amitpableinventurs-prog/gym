import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Chip, Stack, Typography } from "@mui/material";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const FaqPage: React.FC = () => {
  const { t } = useTranslation();
  const questions = [
    {
      question: t("How do I find a workout?"),
      answer: t("Open the home page, choose an activity, date, time, or coach, then select Find Workout to see available sessions."),
    },
    {
      question: t("Do I need an account to book a session?"),
      answer: t("You can explore coaches and sessions without signing in. Create an account and log in when you are ready to book and manage workouts."),
    },
    {
      question: t("How do I manage or cancel a booking?"),
      answer: t("Sign in and open Workouts to see your bookings. Available session actions are shown with each workout."),
    },
    {
      question: t("How can I find the right coach?"),
      answer: t("Browse the Coaches page to compare activity specializations, coach profiles, availability, and client feedback."),
    },
    {
      question: t("How do I leave feedback?"),
      answer: t("After a completed session, open your workout details and use the feedback option when it is available."),
    },
  ];

  return (
    <Box sx={{ maxWidth: 860, mx: "auto", px: { xs: 2, sm: 3 }, py: { xs: 5, md: 9 } }}>
      <Stack alignItems="center" textAlign="center" sx={{ mb: 4 }}>
        <Chip label={t("HELP CENTER")} color="primary" variant="outlined" sx={{ mb: 2 }} />
        <Typography component="h1" sx={{ fontSize: { xs: "2.3rem", sm: "3.4rem" }, fontWeight: 700, letterSpacing: "-0.04em" }}>
          {t("Frequently asked questions")}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1.5, maxWidth: 600, lineHeight: 1.8 }}>
          {t("Quick answers to help you find a coach, book a workout, and manage your sessions.")}
        </Typography>
      </Stack>

      {questions.map(({ question, answer }, index) => (
        <Accordion key={question} disableGutters elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: "12px !important", mb: 1.25, "&::before": { display: "none" } }}>
          <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />} aria-controls={`faq-answer-${index}`} id={`faq-question-${index}`} sx={{ px: { xs: 2, sm: 2.5 }, py: 0.5 }}>
            <Typography fontWeight={600}>{question}</Typography>
          </AccordionSummary>
          <AccordionDetails id={`faq-answer-${index}`} sx={{ px: { xs: 2, sm: 2.5 }, pt: 0, color: "text.secondary", lineHeight: 1.75 }}>
            {answer}
          </AccordionDetails>
        </Accordion>
      ))}

      <Stack alignItems="center" spacing={1.5} sx={{ mt: 5, p: { xs: 2.5, sm: 4 }, textAlign: "center", bgcolor: "primary.light", borderRadius: 4 }}>
        <Typography component="h2" variant="h5" fontWeight={700}>{t("Still deciding where to start?")}</Typography>
        <Typography color="text.secondary">{t("Meet the coaches and find a session that feels right for you.")}</Typography>
        <Button component={Link} to="/coaches" variant="contained" endIcon={<ArrowForwardRoundedIcon />} sx={{ mt: 1, borderRadius: 2 }}>
          {t("Browse coaches")}
        </Button>
      </Stack>
    </Box>
  );
};

export default FaqPage;
