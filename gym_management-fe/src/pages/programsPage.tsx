import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import FitnessCenterRoundedIcon from "@mui/icons-material/FitnessCenterRounded";
import DirectionsRunRoundedIcon from "@mui/icons-material/DirectionsRunRounded";
import SelfImprovementRoundedIcon from "@mui/icons-material/SelfImprovementRounded";
import TerrainRoundedIcon from "@mui/icons-material/TerrainRounded";
import HealingRoundedIcon from "@mui/icons-material/HealingRounded";
import SportsMartialArtsRoundedIcon from "@mui/icons-material/SportsMartialArtsRounded";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ProgramsPage: React.FC = () => {
  const { t } = useTranslation();
  const programs = [
    {
      title: t("Yoga"),
      description: t("Build balance, mobility, and a calmer connection with your body."),
      icon: <SelfImprovementRoundedIcon />,
    },
    {
      title: t("Strength training"),
      description: t("Work on strength and confidence with a coach-led training session."),
      icon: <FitnessCenterRoundedIcon />,
    },
    {
      title: t("Cardio Training"),
      description: t("Get moving with energetic workouts designed to keep you active."),
      icon: <DirectionsRunRoundedIcon />,
    },
    {
      title: t("Climbing"),
      description: t("Challenge yourself with climbing sessions for different experience levels."),
      icon: <TerrainRoundedIcon />,
    },
    {
      title: t("Cross-fit"),
      description: t("Explore varied, functional workouts with guidance from a coach."),
      icon: <SportsMartialArtsRoundedIcon />,
    },
    {
      title: t("Rehabilitation"),
      description: t("Find supportive sessions focused on mobility and getting stronger."),
      icon: <HealingRoundedIcon />,
    },
  ];

  return (
    <Box sx={{ maxWidth: 1120, mx: "auto", px: { xs: 2, sm: 3, md: 4 }, py: { xs: 5, md: 9 } }}>
      <Stack alignItems="center" textAlign="center" sx={{ mb: { xs: 4, md: 6 } }}>
        <Chip label={t("TRAIN YOUR WAY")} color="primary" variant="outlined" sx={{ mb: 2 }} />
        <Typography
          component="h1"
          sx={{ fontSize: { xs: "2.3rem", sm: "3.4rem" }, fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.12 }}
        >
          {t("Find your kind of")}{" "}
          <Box component="span" sx={{ color: "primary.main" }}>{t("strong.")}</Box>
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1.5, maxWidth: 650, lineHeight: 1.8 }}>
          {t("Explore the activities available on our platform and find a coach to help you get started.")}
        </Typography>
      </Stack>

      <Grid container spacing={2}>
        {programs.map((program, index) => (
          <Grid item xs={12} sm={6} md={4} key={program.title}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
                transition: "transform 180ms ease, box-shadow 180ms ease",
                "&:hover": { transform: "translateY(-3px)", boxShadow: "0 14px 34px rgba(27,54,38,0.1)" },
              }}
            >
              <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: 2,
                      color: "primary.dark",
                      bgcolor: "primary.light",
                    }}
                  >
                    {program.icon}
                  </Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {String(index + 1).padStart(2, "0")}
                  </Typography>
                </Stack>
                <Typography component="h2" variant="h6" fontWeight={700} sx={{ mt: 2 }}>
                  {program.title}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1, minHeight: { sm: 72 }, lineHeight: 1.7 }}>
                  {program.description}
                </Typography>
                <Button
                  component={Link}
                  to="/coaches"
                  endIcon={<ArrowForwardRoundedIcon />}
                  sx={{ mt: 2, px: 0, fontWeight: 600 }}
                >
                  {t("Find a coach")}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ProgramsPage;
