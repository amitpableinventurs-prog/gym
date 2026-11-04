import { Box, Button, Card, CardContent, Chip, Grid, Stack, Typography } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const AboutPage: React.FC = () => {
  const { t } = useTranslation();
  const values = [
    {
      icon: <FavoriteRoundedIcon />,
      title: t("Fitness for real life"),
      description: t("Build healthy habits at a pace that feels right for you."),
    },
    {
      icon: <GroupsRoundedIcon />,
      title: t("People make the difference"),
      description: t("Find supportive coaches who help you keep moving forward."),
    },
    {
      icon: <EventAvailableRoundedIcon />,
      title: t("Your time matters"),
      description: t("Browse activities and session times that fit your schedule."),
    },
  ];

  return (
    <Box sx={{ maxWidth: 1120, mx: "auto", px: { xs: 2, sm: 3, md: 4 }, py: { xs: 5, md: 9 } }}>
      <Box sx={{ maxWidth: 760, mx: "auto", textAlign: "center" }}>
        <Chip label={t("ABOUT US")} color="primary" variant="outlined" sx={{ mb: 2 }} />
        <Typography component="h1" sx={{ fontSize: { xs: "2.3rem", sm: "3.4rem" }, fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.12 }}>
          {t("Movement is better")} <Box component="span" sx={{ color: "primary.main" }}>{t("together.")}</Box>
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 2, fontSize: { xs: "1rem", sm: "1.15rem" }, lineHeight: 1.8 }}>
          {t("We make it easier to find a workout, connect with a coach, and build a routine that works for you.")}
        </Typography>
      </Box>

      <Box
        component="img"
        src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1600&q=85"
        alt={t("Athlete training with a coach")}
        loading="lazy"
        sx={{ display: "block", width: "100%", height: { xs: 220, sm: 330 }, objectFit: "cover", objectPosition: "center 42%", borderRadius: { xs: 3, md: 5 }, mt: { xs: 4, md: 6 } }}
      />

      <Grid container spacing={2} sx={{ mt: { xs: 2, md: 3 } }}>
        {values.map((value) => (
          <Grid item xs={12} md={4} key={value.title}>
            <Card elevation={0} sx={{ height: "100%", border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
              <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 2, display: "grid", placeItems: "center", color: "primary.dark", bgcolor: "primary.light" }}>
                  {value.icon}
                </Box>
                <Typography variant="h6" fontWeight={700} sx={{ mt: 2 }}>{value.title}</Typography>
                <Typography color="text.secondary" sx={{ mt: 1, lineHeight: 1.7 }}>{value.description}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Stack alignItems="center" spacing={2} sx={{ mt: { xs: 5, md: 7 }, textAlign: "center" }}>
        <Typography component="h2" variant="h4" fontWeight={700}>{t("Ready to get moving?")}</Typography>
        <Typography color="text.secondary">{t("Find a coach and choose a session that fits your day.")}</Typography>
        <Button component={Link} to="/coaches" variant="contained" endIcon={<ArrowForwardRoundedIcon />} sx={{ borderRadius: 2, px: 3, py: 1.2 }}>
          {t("Explore coaches")}
        </Button>
      </Stack>
    </Box>
  );
};

export default AboutPage;
