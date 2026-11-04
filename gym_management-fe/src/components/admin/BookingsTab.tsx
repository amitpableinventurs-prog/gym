import { useState } from "react";
import { Button, MenuItem, TableCell, TableRow, TextField } from "@mui/material";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import { AdminBooking, cancelBooking, getBookings } from "../../services/adminService";
import { apiErrorMessage } from "../../services/apiClient";
import StatusChip from "../StatusChip";
import { AdminCard, ConfirmDialog, DataTable, LoadState, usePagedList } from "./common";

const person = (value: AdminBooking["userId"], fallback: string) =>
  value ? `${value.firstName} ${value.lastName}` : fallback;

const BookingsTab: React.FC = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [status, setStatus] = useState("");
  const [cancelling, setCancelling] = useState<AdminBooking | null>(null);

  const { items, loading, error, reload, pagination } = usePagedList<AdminBooking>(
    (query) => getBookings({ ...query, status: status || undefined }),
    status
  );

  return (
    <AdminCard
      title={t("Bookings")}
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
          <MenuItem value="SCHEDULED">{t("Scheduled")}</MenuItem>
          <MenuItem value="WAITING_FOR_FEEDBACK">{t("Waiting for feedback")}</MenuItem>
          <MenuItem value="FINISHED">{t("Finished")}</MenuItem>
          <MenuItem value="CANCELLED">{t("Cancelled")}</MenuItem>
        </TextField>
      }
    >
      <LoadState loading={loading && !items.length} error={error} onRetry={() => void reload()} />
      <DataTable
        label={t("Bookings")}
        columns={[t("Activity"), t("Client"), t("Coach"), t("Date"), t("Status"), t("Actions")]}
        empty={t("No bookings with this status.")}
        isEmpty={!items.length}
      >
        {items.map((booking) => (
          <TableRow key={booking._id} hover>
            <TableCell sx={{ whiteSpace: "nowrap" }}>{booking.activity}</TableCell>
            <TableCell sx={{ whiteSpace: "nowrap" }}>{person(booking.userId, t("Unknown"))}</TableCell>
            <TableCell sx={{ whiteSpace: "nowrap" }}>{person(booking.coachId, t("Unknown"))}</TableCell>
            <TableCell sx={{ whiteSpace: "nowrap" }}>
              {booking.date} · {booking.time}
            </TableCell>
            <TableCell>
              <StatusChip status={booking.status} />
            </TableCell>
            <TableCell>
              {booking.status === "SCHEDULED" && (
                <Button size="small" color="error" onClick={() => setCancelling(booking)}>
                  {t("Cancel")}
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </DataTable>
      {pagination}

      <ConfirmDialog
        open={!!cancelling}
        destructive
        title={t("Cancel this booking?")}
        message={t("The slot opens up again and the session goes back to the member's plan.")}
        confirmLabel={t("Cancel booking")}
        onClose={() => setCancelling(null)}
        onConfirm={async () => {
          if (!cancelling) return;
          try {
            await cancelBooking(cancelling._id);
            enqueueSnackbar(t("Booking cancelled"), { variant: "success" });
            await reload();
          } catch (actionError) {
            enqueueSnackbar(apiErrorMessage(actionError, t("Could not cancel the booking.")), {
              variant: "error",
            });
          }
          setCancelling(null);
        }}
      />
    </AdminCard>
  );
};

export default BookingsTab;
