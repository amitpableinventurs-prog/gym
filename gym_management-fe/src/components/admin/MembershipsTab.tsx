import { useState } from "react";
import { Button, MenuItem, Stack, TableCell, TableRow, TextField } from "@mui/material";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import {
  activateMembership,
  AdminMembership,
  cancelMembership,
  freezeMembership,
  getMemberships,
  unfreezeMembership,
} from "../../services/adminService";
import { apiErrorMessage } from "../../services/apiClient";
import { formatDate, formatMoney } from "../../utils/format";
import StatusChip from "../StatusChip";
import { AdminCard, ConfirmDialog, DataTable, LoadState, usePagedList } from "./common";
import PaymentDialog from "./PaymentDialog";

const FILTERS = [
  { value: "PENDING", label: "Awaiting payment" },
  { value: "ACTIVE", label: "Active" },
  { value: "EXPIRING", label: "Expiring soon" },
  { value: "FROZEN", label: "Frozen" },
  { value: "EXPIRED", label: "Expired" },
  { value: "CANCELLED", label: "Cancelled" },
];

const MembershipsTab: React.FC = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [status, setStatus] = useState("PENDING");
  const [activating, setActivating] = useState<AdminMembership | null>(null);
  const [cancelling, setCancelling] = useState<AdminMembership | null>(null);
  const [freezing, setFreezing] = useState<AdminMembership | null>(null);

  const { items, loading, error, reload, pagination } = usePagedList<AdminMembership>(
    (query) => getMemberships({ ...query, status: status || undefined }),
    status
  );

  const memberName = (membership: AdminMembership | null) =>
    membership?.member ? `${membership.member.firstName} ${membership.member.lastName}` : t("Unknown");

  const sessionsNote = (count: number) =>
    count ? ` ${t("{{count}} upcoming session(s) cancelled.", { count })}` : "";

  const fail = (actionError: unknown, fallback: string) =>
    enqueueSnackbar(apiErrorMessage(actionError, fallback), { variant: "error" });

  return (
    <AdminCard
      title={t("Memberships")}
      action={
        <TextField
          select
          size="small"
          label={t("Status")}
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">{t("All")}</MenuItem>
          {FILTERS.map((filter) => (
            <MenuItem key={filter.value} value={filter.value}>
              {t(filter.label)}
            </MenuItem>
          ))}
        </TextField>
      }
    >
      <LoadState loading={loading && !items.length} error={error} onRetry={() => void reload()} />
      <DataTable
        label={t("Memberships")}
        columns={[t("Member"), t("Plan"), t("Price"), t("Status"), t("Period"), t("Sessions"), t("Actions")]}
        empty={t("No memberships with this status.")}
        isEmpty={!items.length}
      >
        {items.map((membership) => (
          <TableRow key={membership.id} hover>
            <TableCell sx={{ whiteSpace: "nowrap" }}>{memberName(membership)}</TableCell>
            <TableCell sx={{ whiteSpace: "nowrap" }}>{membership.planName}</TableCell>
            <TableCell>{formatMoney(membership.price)}</TableCell>
            <TableCell>
              <StatusChip status={membership.status} />
            </TableCell>
            <TableCell sx={{ whiteSpace: "nowrap" }}>
              {membership.startDate
                ? `${formatDate(membership.startDate)} – ${formatDate(membership.endDate)}`
                : t("{{days}} days", { days: membership.durationDays })}
            </TableCell>
            <TableCell sx={{ whiteSpace: "nowrap" }}>
              {membership.sessionLimit === null
                ? t("{{used}} used", { used: membership.sessionsUsed })
                : `${membership.sessionsUsed} / ${membership.sessionLimit}`}
            </TableCell>
            <TableCell>
              <Stack direction="row" spacing={0.5}>
                {membership.status === "PENDING" && (
                  <Button size="small" variant="contained" onClick={() => setActivating(membership)}>
                    {t("Record payment")}
                  </Button>
                )}
                {membership.status === "ACTIVE" && (
                  <Button size="small" onClick={() => setFreezing(membership)}>
                    {t("Freeze")}
                  </Button>
                )}
                {membership.status === "FROZEN" && (
                  <Button
                    size="small"
                    onClick={async () => {
                      try {
                        await unfreezeMembership(membership.id);
                        enqueueSnackbar(t("Membership resumed. Frozen days were added back."), {
                          variant: "success",
                        });
                        await reload();
                      } catch (actionError) {
                        fail(actionError, t("Could not resume the membership."));
                      }
                    }}
                  >
                    {t("Unfreeze")}
                  </Button>
                )}
                {["PENDING", "ACTIVE", "UPCOMING", "FROZEN"].includes(membership.status) && (
                  <Button size="small" color="error" onClick={() => setCancelling(membership)}>
                    {t("Cancel")}
                  </Button>
                )}
              </Stack>
            </TableCell>
          </TableRow>
        ))}
      </DataTable>
      {pagination}

      <PaymentDialog
        open={!!activating}
        title={activating?.planName ?? ""}
        description={t("Record the payment from {{name}}. The membership starts immediately, or when their current one ends.", {
          name: memberName(activating),
        })}
        price={activating?.price ?? 0}
        onClose={() => setActivating(null)}
        onSubmit={async (payment) => {
          if (!activating) return;
          try {
            await activateMembership(activating.id, payment);
            enqueueSnackbar(t("Membership activated"), { variant: "success" });
            setActivating(null);
            await reload();
          } catch (actionError) {
            fail(actionError, t("Could not activate the membership."));
          }
        }}
      />
      <ConfirmDialog
        open={!!freezing}
        title={t("Freeze this membership?")}
        message={t("{{name}} cannot book or check in while frozen. Upcoming sessions are cancelled, and the frozen days are added back on unfreeze.", {
          name: memberName(freezing),
        })}
        confirmLabel={t("Freeze")}
        onClose={() => setFreezing(null)}
        onConfirm={async () => {
          if (!freezing) return;
          try {
            const result = await freezeMembership(freezing.id);
            enqueueSnackbar(`${t("Membership frozen.")}${sessionsNote(result.cancelledSessions)}`, {
              variant: "success",
            });
            await reload();
          } catch (actionError) {
            fail(actionError, t("Could not freeze the membership."));
          }
          setFreezing(null);
        }}
      />
      <ConfirmDialog
        open={!!cancelling}
        destructive
        title={t("Cancel this membership?")}
        message={t("{{name}} loses access and their upcoming sessions are cancelled. Refunds are handled separately in Payments.", {
          name: memberName(cancelling),
        })}
        confirmLabel={t("Cancel membership")}
        reasonLabel={t("Reason")}
        onClose={() => setCancelling(null)}
        onConfirm={async (reason) => {
          if (!cancelling) return;
          try {
            const result = await cancelMembership(cancelling.id, reason);
            enqueueSnackbar(`${t("Membership cancelled.")}${sessionsNote(result.cancelledSessions)}`, {
              variant: "success",
            });
            await reload();
          } catch (actionError) {
            fail(actionError, t("Could not cancel the membership."));
          }
          setCancelling(null);
        }}
      />
    </AdminCard>
  );
};

export default MembershipsTab;
