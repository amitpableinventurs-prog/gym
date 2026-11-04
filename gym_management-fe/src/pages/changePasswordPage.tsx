import { Box, TextField, Button, Grid } from "@mui/material";
import { useForm } from "react-hook-form";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import usePasswordUser from "../hooks/usePasswordUser";
import { enqueueSnackbar } from "notistack";
import { setUser } from "../redux/userSlice";

import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

type FormData = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

function ChangePassword() {
  const userData = useSelector((state: RootState) => state.user);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { updatePasswordUser } = usePasswordUser();

  const schema = z
    .object({
      oldPassword: z
        .string()
        .min(8, t("Password must be at least 8 characters")),
      newPassword: z
        .string()
        .min(8, t("Password must be at least 8 characters")),
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("Passwords don't match"),
      path: ["confirmPassword"],
    });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    const newData = {
      oldPassword: data.oldPassword,
      newPassword: data.newPassword,
    };
    const userId = userData.id;
    try {
      await updatePasswordUser(newData, userId);
      dispatch(setUser({ ...userData, password: newData.newPassword }));
      enqueueSnackbar(t("Password updated successfully!"), {
        variant: "success",
        anchorOrigin: {
          vertical: "top",
          horizontal: "center",
        },
      });
    } catch (error) {
      console.error("Error updating password:", error);
      enqueueSnackbar(t("Error updating password:"), {
        variant: "error",
        anchorOrigin: {
          vertical: "top",
          horizontal: "center",
        },
      });
    }
  };

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={12}>
        <Box
          sx={{
            display: "flex",
            width: "100%",
          }}
        >
          <Box
            component="form"
            noValidate
            sx={{
              width: "100%",
              maxWidth: "700px",
            }}
            onSubmit={handleSubmit(onSubmit)}
          >
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={12}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="oldPassword"
                  label={t("Current Password")}
                  type="password"
                  {...register("oldPassword")}
                  error={!!errors.oldPassword}
                  helperText={
                    errors.oldPassword
                      ? errors.oldPassword.message
                      : t("Enter your current password")
                  }
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      mb: 1,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={12}>
                <TextField
                  margin="normal"
                  type="password"
                  id="newPassword"
                  label={t("New Password")}
                  placeholder={t("Enter your password")}
                  {...register("newPassword")}
                  error={!!errors.newPassword}
                  helperText={
                    errors.newPassword
                      ? errors.newPassword.message
                      : t("At least one capital letter required")
                  }
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={12}>
                <TextField
                  margin="normal"
                  type="password"
                  id="confirmPassword"
                  label={t("Confirm New Password")}
                  placeholder={t("Enter your password")}
                  {...register("confirmPassword")}
                  error={!!errors.confirmPassword}
                  helperText={
                    errors.confirmPassword
                      ? errors.confirmPassword.message
                      : t("Passwords don't match")
                  }
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                    },
                  }}
                />
              </Grid>
            </Grid>
            <Box
              sx={{
                display: "flex",
                justifyContent: "right",
                width: "100%",
              }}
            >
              <Button
                type="submit"
                variant="outlined"
                disabled={!isValid}
                sx={{
                  borderRadius: "10px",
                  width: { xs: "100%", md: "auto" },
                }}
              >
                {t("Save Changes")}
              </Button>
            </Box>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}
//translate("Aditya","en")
export default ChangePassword;
