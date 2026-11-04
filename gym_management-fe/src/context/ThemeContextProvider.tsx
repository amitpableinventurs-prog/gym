import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import "@fontsource/lexend/300.css"; // Light
import "@fontsource/lexend/500.css"; // Medium
import "@fontsource/lexend/700.css"; // Bold

type ThemeMode = "light" | "dark";

interface ThemeContextType {
  toggleTheme: () => void;
  mode: ThemeMode;
}

interface ThemeContextProviderProps {
  children: ReactNode;
}

const ThemeContext = createContext<ThemeContextType>({
  toggleTheme: () => {},
  mode: "light",
});

export const useThemeContext = () => useContext(ThemeContext);

const ThemeContextProvider: React.FC<ThemeContextProviderProps> = ({
  children,
}) => {
  const storedMode = (localStorage.getItem("mode") as ThemeMode) || "light";
  const [mode, setMode] = useState<ThemeMode>(storedMode);

  useEffect(() => {
    localStorage.setItem("mode", mode);
  }, [mode]);

  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: "#2E7D53",
        light: mode === "light" ? "#E5F3EA" : "#1C3829",
        dark: "#20583A",
      },
      secondary: {
        main: "#E9A44A",
      },
      background: {
        default: mode === "light" ? "#F7F9F6" : "#111914",
        paper: mode === "light" ? "#FFFFFF" : "#19231D",
      },
      text: {
        primary: mode === "light" ? "#18251D" : "#F2F6F3",
        secondary: mode === "light" ? "#627067" : "#B1BDB5",
      },
    },
    typography: {
      fontFamily: "Lexend, Arial, sans-serif", // Use Lexend with fallbacks
      h1: {
        fontWeight: 700,
      },
      h2: {
        fontWeight: 600,
      },
      body1: {
        fontWeight: 400,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            fontFamily: "Lexend, Arial, sans-serif", // Apply Lexend specifically to Button
            textTransform: "none", // Remove uppercase transformation if desired
          },
        },
      },
    },
  });

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ toggleTheme, mode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContextProvider;
