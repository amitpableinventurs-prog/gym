import { useState } from "react";
import { Button, MenuItem, TableCell, TableRow, TextField } from "@mui/material";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import { AdminPayment, getPayments, refundPayment } from "../../services/adminService";
import { apiErrorMessage } from "../../services/apiClient";
import { formatDate, formatMoney } from "../../utils/format";
import StatusChip from "../StatusChip";
import { AdminCard, ConfirmDialog, DataTable, LoadState, usePagedList } from "./common";
import { METHOD_LABELS } from "./PaymentDialog";

const PaymentsTab: React.FC = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [status, setStatus] = useState("");
  const [refunding, setRefunding] = useState<AdminPayment | null>(null);

  const { items, loading, error, reload, pagination } = usePagedList<AdminPayment>(
    (query) => getPayments({ ...query, status: status || undefined }),
    status
  );

  return (
    <AdminCard
      title={t("Payments")}
      action={
        <TextField
          select
          size="small"
          label={t("Status")}
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">{t("All")}</MenuItem>
          <MenuItem value="PAID">{t("Paid")}</MenuItem>
          <MenuItem value="REFUNDED">{t("Refunded")}</MenuItem>
        </TextField>
      }
    >
      <LoadState loading={loading && !items.length} error={error} onRetry={() => void reload()} />
      <DataTable
        label={t("Payments")}
        columns={[
          t("Invoice"),
          t("Member"),
          t("Plan"),
          t("Amount"),
          t("Method"),
          t("Date"),
          t("Status"),
          t("Actions"),
        ]}
        empty={t("No payments yet.")}
        isEmpty={!items.length}
      >
        {items.map((payment) => (
          <TableRow key={payment._id} hover>
            <TableCell sx={{ whiteSpace: "nowrap" }}>{payment.invoiceNumber}</TableCell>
            <TableCell sx={{ whiteSpace: "nowrap" }}>
              {payment.userId ? `${payment.userId.firstName} ${payment.userId.lastName}` : t("Unknown")}
            </TableCell>
            <TableCell sx={{ whiteSpace: "nowrap" }}>{payment.planName}</TableCell>
            <TableCell>{formatMoney(payment.amount)}</TableCell>
            <TableCell sx={{ whiteSpace: "nowrap" }}>
              {t(METHOD_LABELS[payment.method])}
              {payment.reference ? ` · ${payment.reference}` : ""}
            </TableCell>
            <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDate(payment.paidAt)}</TableCell>
            <TableCell>
              <StatusChip status={payment.status} />
            </TableCell>
            <TableCell>
              {payment.status === "PAID" && (
                <Button size="small" color="error" onClick={() => setRefunding(payment)}>
                  {t("Refund")}
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </DataTable>
      {pagination}

      <ConfirmDialog
        open={!!refunding}
        destructive
        title={t("Mark this payment as refunded?")}
        message={t("{{invoice}} for {{amount}} will no longer count as revenue. This only updates the record: return the money yourself, and cancel the membership in Memberships if needed.", {
          invoice: refunding?.invoiceNumber ?? "",
          amount: formatMoney(refunding?.amount ?? 0),
        })}
        confirmLabel={t("Mark as refunded")}
        reasonLabel={t("Reason")}
        onClose={() => setRefunding(null)}
        onConfirm={async (reason) => {
          if (!refunding) return;
          try {
            await refundPayment(refunding._id, reason);
            enqueueSnackbar(t("Payment marked as refunded"), { variant: "success" });
            await reload();
          } catch (actionError) {
            enqueueSnackbar(apiErrorMessage(actionError, t("Could not refund this payment.")), {
              variant: "error",
            });
          }
          setRefunding(null);
        }}
      />
    </AdminCard>
  );
};

export default PaymentsTab;
