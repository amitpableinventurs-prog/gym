import React from "react";
import CustomAppBar from "../components/Appbar.tsx";
import { Box } from "@mui/material";
import logoImg from "../assets/Logo.svg";
import { Outlet } from "react-router-dom";
import SiteFooter from "../components/SiteFooter";

const MainPage: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      <CustomAppBar positioning="fixed" logo={logoImg} height="5rem" />
      <Box component="main" id="top">
        <Outlet />
      </Box>
      <SiteFooter />
    </Box>
  );
};

export default MainPage;
