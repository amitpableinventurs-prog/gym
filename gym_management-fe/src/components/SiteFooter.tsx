import {
  Box,
  Button,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import FitnessCenterRoundedIcon from "@mui/icons-material/FitnessCenterRounded";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const SiteFooter: React.FC = () => {
  const { t } = useTranslation();
  const links = [
    { label: t("Home"), to: "/home" },
    { label: t("Coaches"), to: "/coaches" },
    { label: t("Programs"), to: "/programs" },
    { label: t("About"), to: "/about" },
    { label: t("Testimonials"), to: "/testimonials" },
    { label: t("FAQ"), to: "/faq" },
    { label: t("Contact"), to: "/contact" },
  ];

  return (
    <Box
      component="footer"
      sx={{
        mt: { xs: 5, md: 8 },
        bgcolor: "#14251b",
        color: "#f4f8f4",
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 }, px: { xs: 2.5, sm: 3 } }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.2fr 0.8fr" },
            gap: { xs: 4, md: 8 },
            alignItems: "start",
          }}
        >
          <Box>
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "#d9f3df",
                  color: "#20583a",
                }}
              >
                <FitnessCenterRoundedIcon />
              </Box>
              <Typography component="span" sx={{ fontSize: "1.4rem", fontWeight: 700, letterSpacing: "-0.04em" }}>
                EnergyX
              </Typography>
            </Stack>
            <Typography
              sx={{
                mt: 2,
                maxWidth: 420,
                color: "rgba(244,248,244,0.72)",
                lineHeight: 1.8,
              }}
            >
              {t("Find a workout that fits your schedule, meet coaches who get you, and make every session count.")}
            </Typography>
            <Button
              component={Link}
              to="/coaches"
              variant="contained"
              endIcon={<ArrowForwardRoundedIcon />}
              sx={{
                mt: 2.5,
                px: 2.5,
                py: 1.15,
                borderRadius: 2,
                bgcolor: "#9ef300",
                color: "#14251b",
                fontWeight: 700,
                "&:hover": { bgcolor: "#8bd600" },
              }}
            >
              {t("Meet the coaches")}
            </Button>
          </Box>

          <Box>
            <Typography component="h2" variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
              {t("Explore")}
            </Typography>
            <Box
              component="nav"
              aria-label={t("Footer navigation")}
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(3, minmax(0, 1fr))", md: "repeat(2, minmax(0, 1fr))" },
                gap: 1.2,
              }}
            >
              {links.map((link) => (
                <Box
                  key={link.to}
                  component={Link}
                  to={link.to}
                  sx={{
                    color: "rgba(244,248,244,0.72)",
                    textDecoration: "none",
                    fontSize: "0.92rem",
                    "&:hover": { color: "#9ef300" },
                    "&:focus-visible": { outline: "2px solid #9ef300", outlineOffset: 3 },
                  }}
                >
                  {link.label}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: { xs: 3.5, md: 4.5 }, borderColor: "rgba(244,248,244,0.16)" }} />

        <Stack
          direction={{ xs: "column-reverse", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
        >
          <Typography variant="body2" sx={{ color: "rgba(244,248,244,0.62)" }}>
            © {new Date().getFullYear()} EnergyX. {t("All rights reserved.")}
          </Typography>
          <Button
            component="a"
            href="#top"
            endIcon={<KeyboardArrowUpRoundedIcon />}
            sx={{ color: "#f4f8f4", px: 0, "&:hover": { color: "#9ef300", bgcolor: "transparent" } }}
          >
            {t("Back to top")}
          </Button>
        </Stack>
      </Container>
    </Box>
  );
};

export default SiteFooter;
