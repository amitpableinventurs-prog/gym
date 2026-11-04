import { Box, Button, Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import FitnessCenterRoundedIcon from "@mui/icons-material/FitnessCenterRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ContactPage: React.FC = () => {
  const { t } = useTranslation();
  const options = [
    {
      icon: <FitnessCenterRoundedIcon />,
      title: t("Finding a workout"),
      description: t("Explore coaches and available sessions to find a workout that suits you."),
      label: t("Browse coaches"),
      href: "/coaches",
    },
    {
      icon: <AccountCircleRoundedIcon />,
      title: t("Your account"),
      description: t("Sign in to manage your profile, bookings, and workout schedule."),
      label: t("Sign in"),
      href: "/login",
    },
    {
      icon: <HelpOutlineRoundedIcon />,
      title: t("Quick answers"),
      description: t("Read booking, account, and coaching answers in our help center."),
      label: t("Visit FAQ"),
      href: "/faq",
    },
  ];

  return (
    <Box sx={{ maxWidth: 1080, mx: "auto", px: { xs: 2, sm: 3, md: 4 }, py: { xs: 5, md: 9 } }}>
      <Box sx={{ maxWidth: 660, mx: "auto", textAlign: "center", mb: { xs: 4, md: 6 } }}>
        <Typography component="h1" sx={{ fontSize: { xs: "2.3rem", sm: "3.4rem" }, fontWeight: 700, letterSpacing: "-0.04em" }}>
          {t("How can we help?")}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1.5, lineHeight: 1.8 }}>
          {t("Choose the option that best matches what you need and we will point you in the right direction.")}
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {options.map((option) => (
          <Grid item xs={12} md={4} key={option.title}>
            <Card elevation={0} sx={{ height: "100%", border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
              <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", height: "100%", p: { xs: 2.5, md: 3 } }}>
                <Box sx={{ width: 46, height: 46, borderRadius: 2, display: "grid", placeItems: "center", color: "primary.dark", bgcolor: "primary.light" }}>
                  {option.icon}
                </Box>
                <Typography variant="h6" fontWeight={700} sx={{ mt: 2 }}>{option.title}</Typography>
                <Typography color="text.secondary" sx={{ mt: 1, mb: 2.5, lineHeight: 1.7, flexGrow: 1 }}>{option.description}</Typography>
                <Button component={Link} to={option.href} endIcon={<ArrowForwardRoundedIcon />} sx={{ px: 0, fontWeight: 600 }}>
                  {option.label}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} sx={{ mt: 5, p: { xs: 2.5, sm: 3 }, borderRadius: 3, bgcolor: "primary.light" }}>
        <Box>
          <Typography fontWeight={700}>{t("Need more help?")}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {t("For booking questions, check the FAQ or sign in to view your sessions.")}
          </Typography>
        </Box>
        <Button component={Link} to="/faq" variant="contained" sx={{ flexShrink: 0, borderRadius: 2 }}>
          {t("Open help center")}
        </Button>
      </Stack>
    </Box>
  );
};

export default ContactPage;
