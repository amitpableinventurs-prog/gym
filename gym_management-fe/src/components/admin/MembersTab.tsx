import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Stack,
  TableCell,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import {
  AdminMember,
  AdminMemberProfile,
  assignMembership,
  checkInMember,
  checkOutVisit,
  getAdminPlans,
  getMemberProfile,
  getMembers,
  PaymentDetails,
  setMemberSuspension,
} from "../../services/adminService";
import { apiErrorMessage } from "../../services/apiClient";
import { MembershipPlan } from "../../services/membershipService";
import { formatDate, formatMoney, formatTime } from "../../utils/format";
import StatusChip from "../StatusChip";
import { AdminCard, ConfirmDialog, DataTable, LoadState, usePagedList } from "./common";
import PaymentDialog from "./PaymentDialog";

const MemberProfileDialog: React.FC<{ userId: string | null; onClose: () => void }> = ({ userId, onClose }) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [profile, setProfile] = useState<AdminMemberProfile | null>(null);

  useEffect(() => {
    setProfile(null);
    if (!userId) return;
    getMemberProfile(userId)
      .then(setProfile)
      .catch((error) => {
        enqueueSnackbar(apiErrorMessage(error, t("Could not load this member.")), { variant: "error" });
        onClose();
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return (
    <Dialog open={!!userId} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {profile ? `${profile.user.firstName} ${profile.user.lastName}` : t("Member profile")}
      </DialogTitle>
      <DialogContent>
        <LoadState loading={!profile} error={null} onRetry={() => undefined} />
        {profile && (
          <Stack spacing={2.5}>
            <Typography color="text.secondary">
              {profile.user.email} · {t("Joined {{date}}", { date: formatDate(profile.user.createdAt) })} ·{" "}
              {t("{{count}} sessions booked", { count: profile.sessions })}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={7}>
                <Typography fontWeight={700} sx={{ mb: 1 }}>
                  {t("Memberships")}
                </Typography>
                <DataTable
                  label={t("Memberships")}
                  columns={[t("Plan"), t("Status"), t("Period")]}
                  empty={t("No memberships yet.")}
                  isEmpty={!profile.memberships.history.length}
                >
                  {profile.memberships.history.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.planName}</TableCell>
                      <TableCell>
                        <StatusChip status={item.status} />
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {formatDate(item.startDate)} – {formatDate(item.endDate)}
                      </TableCell>
                    </TableRow>
                  ))}
                </DataTable>
              </Grid>
              <Grid item xs={12} md={5}>
                <Typography fontWeight={700} sx={{ mb: 1 }}>
                  {t("Recent visits")}
                </Typography>
                <DataTable
                  label={t("Recent visits")}
                  columns={[t("Date"), t("In"), t("Out")]}
                  empty={t("No visits yet.")}
                  isEmpty={!profile.visits.length}
                >
                  {profile.visits.map((visit) => (
                    <TableRow key={visit._id}>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDate(visit.checkInAt)}</TableCell>
                      <TableCell>{formatTime(visit.checkInAt)}</TableCell>
                      <TableCell>{formatTime(visit.checkOutAt)}</TableCell>
                    </TableRow>
                  ))}
                </DataTable>
              </Grid>
            </Grid>
            <Box>
              <Typography fontWeight={700} sx={{ mb: 1 }}>
                {t("Payments")}
              </Typography>
              <DataTable
                label={t("Payments")}
                columns={[t("Invoice"), t("Plan"), t("Amount"), t("Date"), t("Status")]}
                empty={t("No payments yet.")}
                isEmpty={!profile.payments.length}
              >
                {profile.payments.map((payment) => (
                  <TableRow key={payment._id}>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>{payment.invoiceNumber}</TableCell>
                    <TableCell>{payment.planName}</TableCell>
                    <TableCell>{formatMoney(payment.amount)}</TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDate(payment.paidAt)}</TableCell>
                    <TableCell>
                      <StatusChip status={payment.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </DataTable>
            </Box>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("Close")}</Button>
      </DialogActions>
    </Dialog>
  );
};

const AssignPlanDialog: React.FC<{
  member: AdminMember | null;
  onClose: () => void;
  onDone: () => void;
}> = ({ member, onClose, onDone }) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [plan, setPlan] = useState<MembershipPlan | null>(null);

  useEffect(() => {
    if (!member) return;
    setPlan(null);
    getAdminPlans()
      .then((all) => setPlans(all.filter((item) => item.isActive)))
      .catch((error) =>
        enqueueSnackbar(apiErrorMessage(error, t("Could not load plans.")), { variant: "error" })
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member]);

  const submit = async (payment: PaymentDetails) => {
    if (!member || !plan) return;
    try {
      await assignMembership(member._id, plan._id, payment);
      enqueueSnackbar(t("Membership activated"), { variant: "success" });
      onDone();
    } catch (error) {
      enqueueSnackbar(apiErrorMessage(error, t("Could not activate the membership.")), { variant: "error" });
    }
  };

  return (
    <>
      <Dialog open={!!member && !plan} onClose={onClose} fullWidth maxWidth="xs">
        <DialogTitle>{t("Choose a plan")}</DialogTitle>
        <DialogContent>
          <Stack spacing={1} sx={{ pt: 0.5 }}>
            {plans.map((item) => (
              <Button
                key={item._id}
                variant="outlined"
                onClick={() => setPlan(item)}
                sx={{ justifyContent: "space-between", textTransform: "none" }}
              >
                <span>{item.name}</span>
                <span>{formatMoney(item.price)}</span>
              </Button>
            ))}
            {!plans.length && (
              <Typography color="text.secondary">{t("Create a plan in the Plans tab first.")}</Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t("Back")}</Button>
        </DialogActions>
      </Dialog>
      <PaymentDialog
        open={!!member && !!plan}
        title={plan?.name ?? ""}
        description={t("Record the payment from {{name}}. The membership starts immediately, or when their current one ends.", {
          name: member ? `${member.firstName} ${member.lastName}` : "",
        })}
        price={plan?.price ?? 0}
        onClose={() => setPlan(null)}
        onSubmit={submit}
      />
    </>
  );
};

const MembersTab: React.FC = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [membership, setMembership] = useState("");
  const [profileId, setProfileId] = useState<string | null>(null);
  const [assigning, setAssigning] = useState<AdminMember | null>(null);
  const [suspending, setSuspending] = useState<AdminMember | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { items, loading, error, reload, pagination } = usePagedList<AdminMember>(
    (query) =>
      getMembers({
        ...query,
        search: search || undefined,
        role: role || undefined,
        membership: membership || undefined,
      }),
    `${search}|${role}|${membership}`
  );

  const run = async (action: () => Promise<unknown>, success: string, fallback: string) => {
    try {
      await action();
      enqueueSnackbar(success, { variant: "success" });
      await reload();
    } catch (actionError) {
      enqueueSnackbar(apiErrorMessage(actionError, fallback), { variant: "error" });
    }
  };

  return (
    <AdminCard
      title={t("Members")}
      action={
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <TextField
            size="small"
            label={t("Search name or email")}
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <TextField
            select
            size="small"
            label={t("Type")}
            value={role}
            onChange={(event) => setRole(event.target.value)}
            sx={{ minWidth: 110 }}
          >
            <MenuItem value="">{t("All")}</MenuItem>
            <MenuItem value="client">{t("Client")}</MenuItem>
            <MenuItem value="coach">{t("Coach")}</MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            label={t("Membership")}
            value={membership}
            onChange={(event) => setMembership(event.target.value)}
            sx={{ minWidth: 130 }}
          >
            <MenuItem value="">{t("All")}</MenuItem>
            <MenuItem value="active">{t("Active")}</MenuItem>
            <MenuItem value="none">{t("None")}</MenuItem>
          </TextField>
        </Stack>
      }
    >
      <LoadState loading={loading && !items.length} error={error} onRetry={() => void reload()} />
      <DataTable
        label={t("Members")}
        columns={[t("Name"), t("Email"), t("Type"), t("Membership"), t("Ends"), t("Actions")]}
        empty={t("No members match these filters.")}
        isEmpty={!items.length}
      >
        {items.map((member) => (
          <TableRow key={member._id} hover>
            <TableCell sx={{ whiteSpace: "nowrap" }}>
              <Button
                size="small"
                onClick={() => setProfileId(member._id)}
                sx={{ textTransform: "none", p: 0, minWidth: 0 }}
              >
                {member.firstName} {member.lastName}
              </Button>
            </TableCell>
            <TableCell sx={{ whiteSpace: "nowrap" }}>{member.email}</TableCell>
            <TableCell>{member.isCoach ? t("Coach") : t("Client")}</TableCell>
            <TableCell sx={{ whiteSpace: "nowrap" }}>
              {member.isSuspended ? (
                <StatusChip status="SUSPENDED" />
              ) : member.membership ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <span>{member.membership.planName}</span>
                  {member.membership.status === "FROZEN" && <StatusChip status="FROZEN" />}
                </Stack>
              ) : (
                "—"
              )}
            </TableCell>
            <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDate(member.membership?.endDate)}</TableCell>
            <TableCell>
              <Stack direction="row" spacing={0.5}>
                {member.openVisitId ? (
                  <Button
                    size="small"
                    onClick={() =>
                      void run(
                        () => checkOutVisit(member.openVisitId as string),
                        t("Checked out"),
                        t("Could not check out.")
                      )
                    }
                  >
                    {t("Check out")}
                  </Button>
                ) : (
                  <Button
                    size="small"
                    disabled={member.isSuspended}
                    onClick={() =>
                      void run(() => checkInMember(member._id), t("Checked in"), t("Could not check in."))
                    }
                  >
                    {t("Check in")}
                  </Button>
                )}
                {!member.isCoach && (
                  <Button size="small" disabled={member.isSuspended} onClick={() => setAssigning(member)}>
                    {t("Assign plan")}
                  </Button>
                )}
                {member.isSuspended ? (
                  <Button
                    size="small"
                    onClick={() =>
                      void run(
                        () => setMemberSuspension(member._id, false),
                        t("Account restored"),
                        t("Could not update the account.")
                      )
                    }
                  >
                    {t("Restore")}
                  </Button>
                ) : (
                  <Button size="small" color="error" onClick={() => setSuspending(member)}>
                    {t("Suspend")}
                  </Button>
                )}
              </Stack>
            </TableCell>
          </TableRow>
        ))}
      </DataTable>
      {pagination}

      <MemberProfileDialog userId={profileId} onClose={() => setProfileId(null)} />
      <AssignPlanDialog
        member={assigning}
        onClose={() => setAssigning(null)}
        onDone={() => {
          setAssigning(null);
          void reload();
        }}
      />
      <ConfirmDialog
        open={!!suspending}
        destructive
        title={t("Suspend this account?")}
        message={t("{{name}} will be signed out and blocked from logging in until restored.", {
          name: suspending ? `${suspending.firstName} ${suspending.lastName}` : "",
        })}
        confirmLabel={t("Suspend")}
        reasonLabel={t("Reason")}
        onClose={() => setSuspending(null)}
        onConfirm={async (reason) => {
          if (suspending) {
            await run(
              () => setMemberSuspension(suspending._id, true, reason),
              t("Account suspended"),
              t("Could not update the account.")
            );
          }
          setSuspending(null);
        }}
      />
    </AdminCard>
  );
};

export default MembersTab;
