import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  LinearProgress,
  Stack,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import HowToRegRoundedIcon from "@mui/icons-material/HowToRegRounded";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { AdminCard, DataTable, MetricCard } from "../components/admin/common";
import { METHOD_LABELS } from "../components/admin/PaymentDialog";
import StatusChip from "../components/StatusChip";
import { apiErrorMessage } from "../services/apiClient";
import {
  getMyAttendance,
  getMyMembership,
  getMyPayments,
  getPlans,
  MemberAttendance,
  Membership,
  MembershipPlan,
  MembershipSummary,
  Payment,
  requestPlan,
  withdrawRequest,
} from "../services/membershipService";
import { formatDate, formatMoney, formatTime } from "../utils/format";

const CurrentMembership: React.FC<{ membership: Membership }> = ({ membership }) => {
  const { t } = useTranslation();
  const daysLeft = membership.daysRemaining ?? 0;
  const elapsed = Math.min(100, ((membership.durationDays - daysLeft) / membership.durationDays) * 100);

  return (
    <AdminCard>
      <Stack spacing={2} sx={{ px: 1, py: 0.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          <Typography component="h2" variant="h5" fontWeight={700}>
            {membership.planName}
          </Typography>
          <StatusChip status={membership.status} />
        </Stack>

        {membership.status === "FROZEN" ? (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            {t("Your membership is frozen. Bookings and check-ins are paused, and the frozen days are added back when it resumes.")}
          </Alert>
        ) : (
          <Box>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
              <Typography variant="body2" color="text.secondary">
                {t("Ends {{date}}", { date: formatDate(membership.endDate) })}
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {t("{{days}} days left", { days: daysLeft })}
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={elapsed}
              aria-label={t("Membership time used")}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        )}

        <Typography color="text.secondary">
          {membership.sessionLimit === null
            ? t("Unlimited coach sessions · {{used}} booked so far", { used: membership.sessionsUsed })
            : t("{{remaining}} of {{limit}} coach sessions left", {
                remaining: membership.sessionsRemaining,
                limit: membership.sessionLimit,
              })}
        </Typography>

        {membership.status === "ACTIVE" && (
          <Box>
            <Button component={Link} to="/coaches" variant="contained" sx={{ borderRadius: 2, textTransform: "none" }}>
              {t("Book a session")}
            </Button>
          </Box>
        )}
      </Stack>
    </AdminCard>
  );
};

const PlanCard: React.FC<{
  plan: MembershipPlan;
  actionLabel: string;
  disabled: boolean;
  onChoose: () => void;
}> = ({ plan, actionLabel, disabled, onChoose }) => {
  const { t } = useTranslation();
  return (
    <Card elevation={0} sx={{ height: "100%", border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
      <CardContent sx={{ p: 2.5, height: "100%", display: "flex", flexDirection: "column" }}>
        <Typography component="h3" variant="h6" fontWeight={700}>
          {plan.name}
        </Typography>
        <Typography sx={{ fontSize: "1.9rem", fontWeight: 700, mt: 0.5 }}>{formatMoney(plan.price)}</Typography>
        <Typography variant="body2" color="text.secondary">
          {t("for {{days}} days", { days: plan.durationDays })}
        </Typography>
        {plan.description && (
          <Typography variant="body2" sx={{ mt: 1.5 }}>
            {plan.description}
          </Typography>
        )}
        <Stack component="ul" spacing={0.75} sx={{ listStyle: "none", p: 0, my: 2, flexGrow: 1 }}>
          {plan.features.map((feature) => (
            <Stack component="li" direction="row" spacing={1} key={feature}>
              <CheckRoundedIcon fontSize="small" color="primary" />
              <Typography variant="body2">{feature}</Typography>
            </Stack>
          ))}
        </Stack>
        <Button
          variant="outlined"
          fullWidth
          disabled={disabled}
          onClick={onChoose}
          sx={{ borderRadius: 2, textTransform: "none" }}
        >
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
};

const MembershipPage: React.FC = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [summary, setSummary] = useState<MembershipSummary | null>(null);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [attendance, setAttendance] = useState<MemberAttendance | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [nextSummary, nextPlans, nextPayments, nextAttendance] = await Promise.all([
        getMyMembership(),
        getPlans(),
        getMyPayments(),
        getMyAttendance(),
      ]);
      setSummary(nextSummary);
      setPlans(nextPlans);
      setPayments(nextPayments);
      setAttendance(nextAttendance);
    } catch (loadError) {
      setError(apiErrorMessage(loadError, t("Could not load your membership. Please try again.")));
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const run = async (action: () => Promise<unknown>, success: string) => {
    setBusy(true);
    try {
      await action();
      enqueueSnackbar(success, { variant: "success" });
      await load();
    } catch (actionError) {
      enqueueSnackbar(apiErrorMessage(actionError, t("That did not work. Please try again.")), {
        variant: "error",
      });
    } finally {
      setBusy(false);
    }
  };

  if (error && !summary) {
    return (
      <Box sx={{ maxWidth: 1100, mx: "auto", px: 2, py: 6 }}>
        <Alert
          severity="error"
          sx={{ borderRadius: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => void load()}>
              {t("Retry")}
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (!summary || !attendance) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 320 }}>
        <CircularProgress aria-label={t("Loading")} />
      </Stack>
    );
  }

  const { current, pending, upcoming } = summary;

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", px: { xs: 2, sm: 3 }, py: { xs: 4, md: 6 } }}>
      <Typography component="h1" sx={{ fontSize: { xs: "2rem", sm: "2.5rem" }, fontWeight: 700, letterSpacing: "-0.04em", mb: 3 }}>
        {t("My membership")}
      </Typography>

      <Stack spacing={2.5}>
        {pending && (
          <Alert
            severity="warning"
            sx={{ borderRadius: 2 }}
            action={
              <Button
                color="inherit"
                size="small"
                disabled={busy}
                onClick={() => void run(() => withdrawRequest(pending.id), t("Request withdrawn"))}
              >
                {t("Withdraw")}
              </Button>
            }
          >
            {t("You requested {{plan}} ({{price}}). Pay at the front desk to activate it.", {
              plan: pending.planName,
              price: formatMoney(pending.price),
            })}
          </Alert>
        )}

        {upcoming.map((item) => (
          <Alert key={item.id} severity="success" sx={{ borderRadius: 2 }}>
            {t("Your renewal of {{plan}} starts on {{date}}.", {
              plan: item.planName,
              date: formatDate(item.startDate),
            })}
          </Alert>
        ))}

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            {current ? (
              <CurrentMembership membership={current} />
            ) : (
              <AdminCard>
                <Box sx={{ px: 1, py: 0.5 }}>
                  <Typography component="h2" variant="h5" fontWeight={700}>
                    {t("No active membership")}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 1 }}>
                    {t("Choose a plan below to start booking sessions and using the gym.")}
                  </Typography>
                </Box>
              </AdminCard>
            )}
          </Grid>
          <Grid item xs={6} md={3}>
            <MetricCard
              title={t("This month")}
              value={attendance.visitsThisMonth}
              detail={t("Gym visits")}
              icon={<HowToRegRoundedIcon />}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <MetricCard
              title={t("All time")}
              value={attendance.totalVisits}
              detail={t("Gym visits")}
              icon={<EventAvailableRoundedIcon />}
            />
          </Grid>
        </Grid>

        <Box>
          <Typography component="h2" variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
            {current ? t("Renew or change plan") : t("Choose a plan")}
          </Typography>
          {plans.length ? (
            <Grid container spacing={2}>
              {plans.map((plan) => (
                <Grid item xs={12} sm={6} md={3} key={plan._id}>
                  <PlanCard
                    plan={plan}
                    actionLabel={current ? t("Renew with this plan") : t("Choose plan")}
                    disabled={busy || !!pending}
                    onChoose={() =>
                      void run(
                        () => requestPlan(plan._id),
                        t("Request sent. Pay at the front desk to activate it.")
                      )
                    }
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography color="text.secondary">{t("Plans will appear here once the gym publishes them.")}</Typography>
          )}
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={7}>
            <AdminCard title={t("Payment history")}>
              <DataTable
                label={t("Payment history")}
                columns={[t("Invoice"), t("Plan"), t("Amount"), t("Method"), t("Date"), t("Status")]}
                empty={t("No payments yet.")}
                isEmpty={!payments.length}
              >
                {payments.map((payment) => (
                  <TableRow key={payment._id}>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>{payment.invoiceNumber}</TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>{payment.planName}</TableCell>
                    <TableCell>{formatMoney(payment.amount)}</TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>{t(METHOD_LABELS[payment.method])}</TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDate(payment.paidAt)}</TableCell>
                    <TableCell>
                      <StatusChip status={payment.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </DataTable>
            </AdminCard>
          </Grid>
          <Grid item xs={12} md={5}>
            <AdminCard title={t("Recent visits")}>
              <DataTable
                label={t("Recent visits")}
                columns={[t("Date"), t("In"), t("Out")]}
                empty={t("No visits yet.")}
                isEmpty={!attendance.visits.length}
              >
                {attendance.visits.slice(0, 10).map((visit) => (
                  <TableRow key={visit._id}>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDate(visit.checkInAt)}</TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>{formatTime(visit.checkInAt)}</TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {visit.isOpen ? t("In the gym") : visit.autoClosed ? "—" : formatTime(visit.checkOutAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </DataTable>
            </AdminCard>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
};

export default MembershipPage;
