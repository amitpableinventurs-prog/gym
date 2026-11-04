import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../redux/userSlice"; // Import the updateUser action
import { RootState } from "../redux/store"; // Import the RootState type
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";

interface LanguageSelectorProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  open,
  setOpen,
}) => {
  const dispatch = useDispatch(); // Initialize dispatch
  const userData = useSelector((state: RootState) => state.user);
  const [language, setLanguage] = React.useState<string>(
    userData.selectedLanguage || "en"
  ); // Set default to user's selected language

  const { i18n } = useTranslation();

  React.useEffect(() => {
    // Update language state when userData changes
    setLanguage(userData.selectedLanguage || "en");
    i18n.changeLanguage(userData.selectedLanguage || "en"); // Set the language based on userData
  }, [userData.selectedLanguage, i18n]);

  const handleChange = (event: SelectChangeEvent) => {
    const newLanguage = event.target.value as string;
    setLanguage(newLanguage);
    dispatch(updateUser({ ...userData, selectedLanguage: newLanguage })); // Update Redux state
    i18n.changeLanguage(newLanguage); // Change the language in i18next
  };

  const handleOk = () => {
    setOpen(false);
  };

  const handleClose = (_: React.SyntheticEvent<unknown>, reason?: string) => {
    if (reason !== "backdropClick") {
      setOpen(false);
    }
  };

  return (
    <Box>
      <Dialog
        disableEscapeKeyDown
        open={open}
        onClose={handleClose}
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: "10px",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {i18n.t("Select Language")}
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              color: (theme) =>
                theme.palette.mode === "light" ? "grey.500" : "white",
              marginLeft: "auto",
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ display: "flex", flexWrap: "wrap" }}>
            <FormControl
              sx={{
                mt: 1,
                minWidth: "552px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                },
              }}
            >
              <InputLabel id="language-select-label">
                {i18n.t("Select Language")}
              </InputLabel>
              <Select
                labelId="language-select-label"
                id="language-select"
                value={language}
                onChange={handleChange}
                input={<OutlinedInput label="Language" />}
                sx={{ height: 56 }}
              >
                {["en", "hi", "tel"].map((code, index) => (
                  <MenuItem key={index} value={code}>
                    {code === "en"
                      ? i18n.t("English")
                      : code === "hi"
                      ? i18n.t("Hindi")
                      : i18n.t("Telugu")}
                    ({code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={handleOk}
            disabled={!language}
            size="large"
            sx={{ fontWeight: "bold", borderRadius: "8px" }}
          >
            {i18n.t("Ok")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LanguageSelector;
