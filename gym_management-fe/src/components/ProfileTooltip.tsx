import Box from "@mui/material/Box";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import { Typography } from "@mui/material";
import Logout from "./LogoutButton";
import { useNavigate } from "react-router-dom";
import MyAccount from "../assets/MyAccount.svg";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { useTranslation } from "react-i18next";
interface ProfileTooltipProps {
  anchorEl: HTMLElement | null;
  setAnchorEl: (element: HTMLElement | null) => void;
  handleClose: () => void;
  open: boolean;
}

export default function ProfileTooltip({
  anchorEl,
  setAnchorEl,
  handleClose,
  open,
}: ProfileTooltipProps) {
  const navigate = useNavigate();
  const handleAccountClick = () => {
    navigate("/my-account");
    handleClose(); // Close the menu after navigation
  };
  const userData = useSelector((state: RootState) => state.user);
  const { t } = useTranslation();
  return (
    <Box>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: "visible",
              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
              mt: 1.5,
              zIndex: 1,
              width: 250, // Add fixed width
              maxHeight: "400px",
              "&::before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            p: [2, 2, 1, 2],
          }}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
            fontFamily="unset"
            noWrap
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "200px",
              whiteSpace: "nowrap",
            }}
            title={`${userData.firstName} ${userData.lastName} (Client)`}
          >
            {userData.firstName} {userData.lastName}
          </Typography>
          <Typography
            variant="h6"
            noWrap
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              mb: 1,
              width: "90%",
              maxWidth: "200px",
              textAlign: "center",
              fontSize: "1rem",
              whiteSpace: "nowrap",
            }}
            title={userData.email}
          >
            {userData.email}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <Divider sx={{ width: "80%" }} />
        </Box>

        <MenuItem
          onClick={handleAccountClick}
          sx={{
            display: "flex",
            alignItems: "start",
            width: "100%",
            p: [3, 2, 0, 2],
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "end",
              flexDirection: "column",
              backgroundImage: `url(${MyAccount})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              mt: 1.5,
              mr: 1,
              width: "2rem",
              height: "2rem",
              filter: (theme) =>
                theme.palette.mode === "dark" ? "invert(1)" : "none",
            }}
          ></Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              flexDirection: "column",
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              {t("My Account")}
            </Typography>
            <Typography variant="body2" fontSize="1rem">
              {t("Edit Account Profile")}
            </Typography>
          </Box>
        </MenuItem>
        <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <Logout
            handleClose={handleClose}
            setAnchorEl={setAnchorEl}
            padding={1}
            width={"70%"}
          />
        </Box>
      </Menu>
    </Box>
  );
}
