import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import GeneralInformation from "./generalInformationPage";
import ChangePassword from "./changePasswordPage";
import Logout from "../components/LogoutButton";
import { useTheme, useMediaQuery } from "@mui/material";
import { useTranslation } from "react-i18next";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    "aria-controls": `vertical-tabpanel-${index}`,
  };
}

export default function MyAccount() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [value, setValue] = React.useState(0);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const { t } = useTranslation();

  return (
    <Box
      sx={{
        flexGrow: 1,
        bgcolor: "background.paper",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        ml: { xs: 0, md: 2 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "column" },
          width: { xs: "100%", md: "auto" },
        }}
      >
        <Tabs
          orientation={isMobile ? "horizontal" : "vertical"}
          variant="scrollable"
          value={value}
          onChange={handleChange}
          aria-label="Vertical tabs example"
          TabIndicatorProps={{
            sx: {
              [theme.breakpoints.up("md")]: {
                left: 0,
                width: "3px",
                height: "56px",
              },
            },
          }}
          sx={{
            borderBottom: { xs: 1, md: 0 },
            borderColor: { xs: "divider", md: "transparent" },
          }}
        >
          <Tab
            label={t("General Information")}
            {...a11yProps(0)}
            sx={{
              width: { xs: "auto", md: "316px" },
              height: "56px",
              p: "16px",
              fontWeight: 400,
              alignItems: { xs: "center", md: "flex-start" },
            }}
          />
          <Tab
            label={t("Change Password")}
            {...a11yProps(1)}
            sx={{
              width: { xs: "auto", md: "316px" },
              height: "56px",
              p: "16px",
              fontWeight: 400,
              alignItems: { xs: "center", md: "flex-start" },
            }}
          />
        </Tabs>
        <Box
          sx={{
            width: { xs: "70%", md: "50%" },
            display: { xs: "none", sm: "none", md: "flex", lg: "flex" },
            justifyContent: "center",
            alignItems: "center",
            mt: 2,
          }}
        >
          <Logout padding={0} />
        </Box>
      </Box>
      <TabPanel value={value} index={0}>
        <GeneralInformation />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <ChangePassword />
      </TabPanel>
    </Box>
  );
}
