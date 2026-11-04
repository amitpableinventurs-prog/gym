import { Box, Button } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { persistor } from "../redux/store";
import { clearUser } from "../redux/userSlice";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
interface LogoutProps {
  padding: number | string | [number, number, number, number];
  handleClose?: () => void;
  setAnchorEl?: (element: HTMLElement | null) => void;
  width?: string;
}

const Logout: React.FC<LogoutProps> = ({
  padding,
  handleClose: externalHandleClose,
  setAnchorEl,
  width,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleClose = (): void => {
    Cookies.remove("authToken");
    dispatch(clearUser());
    persistor.purge();
    navigate("/home");
    window.location.reload();
    externalHandleClose?.();
    setAnchorEl?.(null);
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: padding,
        width: width ? width : "100%",
      }}
      onClick={handleClose}
    >
      <Button
        variant="outlined"
        fullWidth
        color="error"
        sx={{ borderRadius: "10px" }}
      >
        {t("Log Out")}
      </Button>
    </Box>
  );
};

export default Logout;
