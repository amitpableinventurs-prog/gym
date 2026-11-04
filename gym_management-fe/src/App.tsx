import { Box } from "@mui/material";
import AppRoutes from "./routes/Routes.tsx";
import ThemeContextProvider from "./context/ThemeContextProvider.tsx";
import React from "react";
import { SnackbarProvider } from "notistack";
import { Provider } from "react-redux";
import store from "./redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { persistor } from "./redux/store";

//import UpdateProfile from "./components/UpdateProfile";

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeContextProvider>
          <SnackbarProvider
            maxSnack={3}
            anchorOrigin={{
              vertical: "top",
              horizontal: "center",
            }}
            autoHideDuration={3000}
          >
            <Box
              sx={{
                m: 0,
                height: "100%",
                width: "100%",
                overflowX: "hidden",
              }}
            >
              <AppRoutes />
            </Box>
          </SnackbarProvider>
        </ThemeContextProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
