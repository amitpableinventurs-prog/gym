import { Alert, Typography } from "@mui/material";
import BaseImage from "../assets/Base.svg";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { useTranslation } from "react-i18next";

const AlertComp = () => {
  const userData = useSelector((state: RootState) => state.user);
  const { t } = useTranslation();

  return (
    <Alert
      variant="filled"
      icon={false}
      sx={{
        backgroundImage: `url(${BaseImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Typography
        variant="h5"
        sx={{
          justifyContent: "center",
          alignItems: "start",
          fontFamily: "lexend",
          p: 4,
        }}
      >
        {`${t("Hello")}${
          userData.firstName
            ? `, ${userData.firstName} ${userData.lastName}!`
            : "!"
        }`}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          justifyContent: "center",
          alignItems: "start",
          fontFamily: "lexend",
          pl: 4,
        }}
      >
        {t("Using free version of Render so the initial load may take 2-3 minutes.")}
      </Typography>
    </Alert>
  );
};

export default AlertComp;
