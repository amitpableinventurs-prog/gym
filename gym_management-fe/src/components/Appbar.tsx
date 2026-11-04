import React, { useState, MouseEvent } from "react";
import {
  styled,
  Toolbar,
  Box,
  IconButton,
  Avatar,
  Tabs,
  Button,
  Tab,
  Grid,
  Menu,
  MenuItem,
  useMediaQuery,
} from "@mui/material";
import MuiAppBar from "@mui/material/AppBar";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import ProfileTooltip from "./ProfileTooltip";
import { useThemeContext } from "../context/ThemeContextProvider";
import { useLocation } from "react-router-dom";
import { useReducer } from "react"; // Import type
import Cookies from "js-cookie";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { Link } from "react-router-dom";
import TranslateIcon from "@mui/icons-material/Translate";
import LanguageSelector from "./languageSelector";
import InfoIcon from "@mui/icons-material/Info";
import MenuIcon from "@mui/icons-material/Menu";
import { useTranslation } from "react-i18next";
// Define props for the component
interface CustomAppBarProps {
  positioning?: "fixed" | "absolute" | "sticky" | "static" | "relative";
  logo: string; // URL for the logo image
  height?: string; // Height of the AppBar
}

// Styled AppBar component with TypeScript support
const AppBar = styled(MuiAppBar)<{ color: string; height?: string }>(
  ({ color, height }) => ({
    backgroundColor: color,
    height: height,
  })
);

// Add reducer types and state
type NavigationState = {
  activeTab: number;
};

type NavigationAction = {
  type: "SET_TAB";
  payload: number;
};

// Add reducer function
const navigationReducer = (
  state: NavigationState,
  action: NavigationAction
): NavigationState => {
  switch (action.type) {
    case "SET_TAB":
      return { ...state, activeTab: action.payload };
    default:
      return state;
  }
};

const CustomAppBar: React.FC<CustomAppBarProps> = React.memo(
  ({ positioning = "fixed", logo, height = "4rem" }) => {
    const location = useLocation();
    const userData = useSelector((state: RootState) => state.user);
    const isAuthenticated = !!Cookies.get("authToken");
    const isClient = isAuthenticated && !userData.isCoach && !userData.isAdmin;
    const [open, setOpen] = React.useState(false);
    const handleOpenLanguageSelector = () => setOpen(true);
    const { t } = useTranslation();

    // Create a function to get initial tab based on current route
    const getInitialTab = React.useCallback(() => {
      const currentPath = location.pathname;

      // Define routes and their corresponding tab indices
      if (isAuthenticated) {
        if (!userData.isCoach) {
          switch (currentPath) {
            case "/home":
              return 0;
            case "/workouts":
              return 1;
            case "/coaches":
              return 2;
            case "/membership":
              return 3;
            default:
              return 0; // Default to home for clients
          }
        } else {
          // Updated logic for non-client roles
          switch (currentPath) {
            case "/workouts":
              return 0; // Default to workouts if the role isn't client // Redirect to workouts if home or coaches is accessed
            default:
              return 0; // Default to workouts for any other path
          }
        }
      } else {
        switch (currentPath) {
          case "/home":
            return 0;
          case "/coaches":
            return 1;
          default:
            return 0;
        }
      }
    }, [location.pathname, isAuthenticated, userData.isCoach]);

    // Initialize reducer with current route's tab
    const [state, dispatch] = useReducer(navigationReducer, {
      activeTab: getInitialTab(),
    });

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [navigationAnchor, setNavigationAnchor] =
      useState<null | HTMLElement>(null);
    const isMobile = useMediaQuery("(max-width:899px)");
    const { toggleTheme, mode } = useThemeContext();

    // Add effect to sync tab with route on hard refresh
    React.useEffect(() => {
      const currentTab = getInitialTab();
      if (state.activeTab !== currentTab) {
        dispatch({ type: "SET_TAB", payload: currentTab });
      }
    }, [location.pathname, getInitialTab, state.activeTab]);

    // Handle avatar (profile) icon click
    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    };

    // Close the tooltip
    const handleClose = () => {
      setAnchorEl(null);
    };

    // Handle tab change and navigation
    const handleTabChange = (
      _event: React.SyntheticEvent,
      newValue: number
    ) => {
      dispatch({ type: "SET_TAB", payload: newValue });
    };

    const mobilePages = [
      { label: t("Home"), to: "/home", visible: !userData.isCoach || !isAuthenticated },
      { label: t("Workouts"), to: "/workouts", visible: isAuthenticated },
      { label: t("Coaches"), to: "/coaches", visible: !userData.isCoach || !isAuthenticated },
      { label: t("Membership"), to: "/membership", visible: isClient },
      { label: t("About"), to: "/about", visible: true },
      { label: t("Programs"), to: "/programs", visible: true },
      { label: t("Testimonials"), to: "/testimonials", visible: true },
      { label: t("FAQ"), to: "/faq", visible: true },
      { label: t("Contact"), to: "/contact", visible: true },
      { label: t("Admin panel"), to: "/admin", visible: isAuthenticated && userData.isAdmin },
    ];

    return (
      <Grid container>
        <Grid item xs={12}>
          <AppBar
            position={positioning}
            color={mode === "light" ? "default" : "primary"}
            height={height}
          >
            <Toolbar sx={{ minHeight: "5rem", px: { xs: 1, sm: 3 } }}>
              {/* Logo */}
              <Box sx={{ p: { xs: 0, md: 2 }, display: "flex", flexShrink: 0 }}>
                <img
                  src={logo}
                  alt="Logo"
                  style={{
                    height: isMobile ? "1.6rem" : "2rem",
                    filter: mode === "dark" ? "invert(1)" : "none",
                  }}
                />
              </Box>

              {isMobile && (
                <IconButton
                  aria-label={t("Open navigation")}
                  aria-controls={navigationAnchor ? "mobile-navigation" : undefined}
                  aria-haspopup="true"
                  onClick={(event) => setNavigationAnchor(event.currentTarget)}
                  sx={{ ml: "auto", color: "primary.main" }}
                >
                  <MenuIcon />
                </IconButton>
              )}

              {/* Tabs */}
              <Tabs
                value={state.activeTab}
                onChange={handleTabChange}
                textColor="primary"
                indicatorColor="primary"
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  flexGrow: 0,
                  display: { xs: "none", md: "flex" },
                  minWidth: 0,
                  minHeight: "5rem",
                  "& .MuiTab-root": { minHeight: "5rem", minWidth: 90 },
                }}
              >
                {(!userData.isCoach || !isAuthenticated) && (
                  <Tab
                    component={Link}
                    to="/home"
                    label={t("Home")}
                    sx={{ fontSize: "1.1rem" }}
                  />
                )}
                {isAuthenticated && (
                  <Tab
                    component={Link}
                    to="/workouts"
                    label={t("Workouts")}
                    sx={{ fontSize: "1.1rem" }}
                  />
                )}
                {(!userData.isCoach || !isAuthenticated) && (
                  <Tab
                    component={Link}
                    to="/coaches"
                    label={t("Coaches")}
                    sx={{ fontSize: "1.1rem" }}
                  />
                )}
                {isClient && (
                  <Tab
                    component={Link}
                    to="/membership"
                    label={t("Membership")}
                    sx={{ fontSize: "1.1rem" }}
                  />
                )}
              </Tabs>
              <Box
                component="nav"
                aria-label={t("Explore pages")}
                sx={{
                  display: { xs: "none", md: "flex" },
                  flex: "1 1 auto",
                  minWidth: 0,
                  overflowX: "auto",
                  scrollbarWidth: "none",
                  "&::-webkit-scrollbar": { display: "none" },
                  whiteSpace: "nowrap",
                  justifyContent: "center",
                }}
              >
                {[
                  { label: t("About"), to: "/about" },
                  { label: t("Programs"), to: "/programs" },
                  { label: t("Testimonials"), to: "/testimonials" },
                  { label: t("FAQ"), to: "/faq" },
                  { label: t("Contact"), to: "/contact" },
                ].map((page) => (
                  <Button
                    key={page.to}
                    component={Link}
                    to={page.to}
                    aria-current={location.pathname === page.to ? "page" : undefined}
                    sx={{
                      flexShrink: 0,
                      minWidth: 0,
                      px: { md: 0.75, lg: 1 },
                      color:
                        location.pathname === page.to
                          ? "primary.main"
                          : "text.primary",
                      fontSize: { md: "0.8rem", lg: "0.9rem" },
                      fontWeight: location.pathname === page.to ? 700 : 500,
                      textTransform: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {page.label}
                  </Button>
                ))}
              </Box>
              {isAuthenticated && userData.isAdmin && (
                <Button
                  component={Link}
                  to="/admin"
                  variant="contained"
                  size="small"
                  sx={{ display: { xs: "none", md: "inline-flex" }, mr: 1, whiteSpace: "nowrap" }}
                >
                  {t("Admin panel")}
                </Button>
              )}
              <IconButton
                sx={{ color: "primary.main", display: { xs: "none", sm: "inline-flex" } }}
                href="https://github.com/adityasinghz/gym-management/blob/main/README.md"
                target="_blank"
                aria-label={t("Project information")}
              >
                <InfoIcon />
              </IconButton>

              {/* Theme Toggle Button */}
              <IconButton
                sx={{ color: "primary.main" }}
                onClick={toggleTheme}
                data-testid="theme-toggle"
                aria-label={t("Toggle color theme")}
              >
                {mode === "light" ? (
                  <Brightness7Icon />
                ) : (
                  <Brightness4Icon />
                )}
              </IconButton>
              <IconButton
                sx={{ color: "primary.main" }}
                onClick={handleOpenLanguageSelector}
                aria-label={t("Choose language")}
              >
                <TranslateIcon />
              </IconButton>

              {/* Profile Avatar */}
              {isAuthenticated ? (
                <IconButton
                  onClick={handleClick}
                  sx={{ color: "primary.main" }}
                  data-testid="profile-button"
                >
                  <Avatar
                    data-testid="profile-avatar"
                    sx={{
                      bgcolor: "primary.main",
                      justifyContent: "center",
                      alignItems: "center",
                      display: "flex",
                    }}
                  >
                    {userData.firstName.charAt(0)}
                  </Avatar>
                </IconButton>
              ) : (
                <Link to="/login" style={{ textDecoration: "none" }}>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      borderRadius: "8px",
                      textTransform: "none",
                    }}
                  >
                    {t("Login")}
                  </Button>
                </Link>
              )}
            </Toolbar>

            <Menu
              id="mobile-navigation"
              anchorEl={navigationAnchor}
              open={Boolean(navigationAnchor)}
              onClose={() => setNavigationAnchor(null)}
              MenuListProps={{ "aria-label": t("Main navigation") }}
            >
              {mobilePages.filter((item) => item.visible).map((item) => (
                <MenuItem
                  key={item.to}
                  component={Link}
                  to={item.to}
                  selected={location.pathname === item.to}
                  onClick={() => setNavigationAnchor(null)}
                >
                  {item.label}
                </MenuItem>
              ))}
            </Menu>

            {/* Profile Tooltip */}
            <ProfileTooltip
              handleClose={handleClose}
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              setAnchorEl={setAnchorEl}
            />
          </AppBar>

          {/* Add Toolbar Spacer Here */}
          <Toolbar />
        </Grid>

        <LanguageSelector open={open} setOpen={setOpen} />
      </Grid>
    );
  }
);

export default CustomAppBar;
