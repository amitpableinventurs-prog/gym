import { Box, Grid, Typography } from "@mui/material";
import SignUpImage from "../assets/SignUpImage.svg";
import React from "react";
import { useTranslation } from "react-i18next";
const Image: React.FC<{
  width?: string;
  height?: string;
}> = ({ width = "75%", height = "95%" }) => {
  const { t } = useTranslation();
  return (
    <Grid
      item
      xs={false}
      md={6}
      lg={6}
      sx={{
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: width,
          height: height,
          borderRadius: "2rem",
          mb: 2,
          boxShadow: 5,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            backgroundImage: `url(${SignUpImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            width: "100%",
            height: "100%",
          }}
        ></Box>
        <Typography
          variant="h4"
          sx={{
            position: "absolute",
            top: "70%",
            left: { lg: "42%", md: "44%" },
            width: "95%",
            justifyContent: "center",
            alignItems: "center",
            transform: "translate(-40%, -10%)",
            color: "white",
            textShadow: "1px 1px 2px black",
            fontSize: {
              md: "2.1rem",
              lg: "2.1rem",
            },
          }}
        >
          {t("The path to triumph is paved with the")}
          <Typography component="span" color="primary" variant="inherit">
            {t("strength to train")}
          </Typography>{" "}
          {t("hard and the perseverance to")}
          <Typography component="span" color="primary" variant="inherit">
            {t("rise each time you fall.")}
          </Typography>
        </Typography>
      </Box>
    </Grid>
  );
};

export default Image;
