import { useCallback, useEffect, useState } from "react";
import { Alert, Box, Button, CircularProgress, Grid, Stack, TableCell, TableRow } from "@mui/material";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import RateReviewRoundedIcon from "@mui/icons-material/RateReviewRounded";
import CardMembershipRoundedIcon from "@mui/icons-material/CardMembershipRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import HowToRegRoundedIcon from "@mui/icons-material/HowToRegRounded";
import FitnessCenterRoundedIcon from "@mui/icons-material/FitnessCenterRounded";
import HourglassBottomRoundedIcon from "@mui/icons-material/HourglassBottomRounded";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { AdminOverview, getAdminOverview } from "../../services/adminService";
import { persistor } from "../../redux/store";
import { clearUser } from "../../redux/userSlice";
import { formatDate, formatMoney } from "../../utils/format";
import { AdminCard, DataTable, MetricCard } from "./common";
import RevenueChart from "./RevenueChart";

const OverviewTab: React.FC<{ onOpenTab: (tab: string) => void }> = ({ onOpenTab }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setOverview(await getAdminOverview());
    } catch (loadError) {
      console.error("Admin overview request failed:", loadError);
      // Admin access was removed: clear the session so the stale role is forgotten
      const status = axios.isAxiosError(loadError) ? loadError.response?.status : undefined;
      if (status === 403 || !Cookies.get("authToken")) {
        Cookies.remove("authToken");
        dispatch(clearUser());
        void persistor.purge();
        navigate("/login", { replace: true });
        return;
      }
      setError(t("Could not load dashboard data. Please try again."));
    } finally {
      setLoading(false);
    }
  }, [t, dispatch, navigate]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  if (loading && !overview) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 240 }}>
        <CircularProgress aria-label={t("Loading admin dashboard")} />
      </Stack>
    );
  }

  if (!overview) {
    return (
      <Alert
        severity="error"
        sx={{ borderRadius: 2 }}
        action={
          <Button color="inherit" size="small" onClick={() => void loadOverview()}>
            {t("Retry")}
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  const { metrics } = overview;
  const metricCards = [
    {
      title: t("Active memberships"),
      value: metrics.activeMembers,
      detail: t("{{clients}} clients, {{coaches}} coaches registered", {
        clients: metrics.clients,
        coaches: metrics.coaches,
      }),
      icon: <CardMembershipRoundedIcon />,
    },
    {
      title: t("Revenue this month"),
      value: formatMoney(metrics.revenueThisMonth),
      detail: t("Payments received, net of refunds"),
      icon: <PaymentsRoundedIcon />,
    },
    {
      title: t("Check-ins today"),
      value: metrics.checkInsToday,
      detail: t("{{count}} in the gym now", { count: metrics.insideNow }),
      icon: <HowToRegRoundedIcon />,
    },
    {
      title: t("Expiring soon"),
      value: metrics.expiringSoon,
      detail: t("Memberships ending within 7 days"),
      icon: <HourglassBottomRoundedIcon />,
    },
    {
      title: t("Members"),
      value: metrics.totalUsers,
      detail: t("Registered clients and coaches"),
      icon: <PeopleAltRoundedIcon />,
    },
    {
      title: t("Coaches"),
      value: metrics.coaches,
      detail: t("Active coach profiles"),
      icon: <FitnessCenterRoundedIcon />,
    },
    {
      title: t("Workouts"),
      value: metrics.totalWorkouts,
      detail: t("Bookings across the platform"),
      icon: <EventAvailableRoundedIcon />,
    },
    {
      title: t("Feedback"),
      value: metrics.totalTestimonials,
      detail: t("Submitted session reviews"),
      icon: <RateReviewRoundedIcon />,
    },
  ];

  return (
    <Box>
      {metrics.pendingRequests > 0 && (
        <Alert
          severity="warning"
          sx={{ mb: 2.5, borderRadius: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => onOpenTab("memberships")}>
              {t("Review")}
            </Button>
          }
        >
          {t("{{count}} membership request(s) waiting for payment", { count: metrics.pendingRequests })}
        </Alert>
      )}

      <Grid container spacing={2}>
        {metricCards.map((metric) => (
          <Grid item xs={12} sm={6} lg={3} key={metric.title}>
            <MetricCard {...metric} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
        <Grid item xs={12} lg={7}>
          <RevenueChart data={overview.revenueByMonth} />
        </Grid>
        <Grid item xs={12} lg={5}>
          <AdminCard title={t("Renewals to chase")}>
            <DataTable
              label={t("Renewals to chase")}
              columns={[t("Name"), t("Plan"), t("Ends")]}
              empty={t("No memberships are about to expire.")}
              isEmpty={!overview.expiringMemberships.length}
            >
              {overview.expiringMemberships.map((membership) => (
                <TableRow key={membership.id} hover>
                  <TableCell>
                    {membership.member?.firstName} {membership.member?.lastName}
                  </TableCell>
                  <TableCell>{membership.planName}</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDate(membership.endDate)}</TableCell>
                </TableRow>
              ))}
            </DataTable>
          </AdminCard>
        </Grid>
        <Grid item xs={12} lg={6}>
          <AdminCard title={t("Recent members")}>
            <DataTable
              label={t("Recent members")}
              columns={[t("Name"), t("Email"), t("Type")]}
              empty={t("No members yet.")}
              isEmpty={!overview.recentUsers.length}
            >
              {overview.recentUsers.map((member) => (
                <TableRow key={member._id} hover>
                  <TableCell>
                    {member.firstName} {member.lastName}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{member.email}</TableCell>
                  <TableCell>{member.isCoach ? t("Coach") : t("Client")}</TableCell>
                </TableRow>
              ))}
            </DataTable>
          </AdminCard>
        </Grid>
        <Grid item xs={12} lg={6}>
          <AdminCard title={t("Recent workouts")}>
            <DataTable
              label={t("Recent workouts")}
              columns={[t("Activity"), t("Client"), t("Date")]}
              empty={t("No workouts yet.")}
              isEmpty={!overview.recentWorkouts.length}
            >
              {overview.recentWorkouts.map((workout) => (
                <TableRow key={workout._id} hover>
                  <TableCell>{workout.activity}</TableCell>
                  <TableCell>
                    {workout.userId ? `${workout.userId.firstName} ${workout.userId.lastName}` : t("Unknown")}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {workout.date} · {workout.time}
                  </TableCell>
                </TableRow>
              ))}
            </DataTable>
          </AdminCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OverviewTab;
