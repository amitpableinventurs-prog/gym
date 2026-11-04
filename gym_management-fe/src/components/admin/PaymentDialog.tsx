import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { PaymentDetails } from "../../services/adminService";
import { PAYMENT_METHODS, PaymentMethod } from "../../services/membershipService";
import { formatMoney } from "../../utils/format";

export const METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Cash",
  CARD: "Card",
  UPI: "UPI",
  BANK_TRANSFER: "Bank transfer",
};

const PaymentDialog: React.FC<{
  open: boolean;
  title: string;
  description: string;
  price: number;
  onClose: () => void;
  onSubmit: (payment: PaymentDetails) => Promise<void>;
}> = ({ open, title, description, price, onClose, onSubmit }) => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState(String(price));
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setAmount(String(price));
      setMethod("CASH");
      setReference("");
      setNote("");
    }
  }, [open, price]);

  const parsedAmount = Number(amount);
  const amountValid = amount !== "" && Number.isInteger(parsedAmount) && parsedAmount >= 0;

  const submit = async () => {
    setBusy(true);
    try {
      await onSubmit({
        amount: parsedAmount,
        method,
        reference: reference.trim() || undefined,
        note: note.trim() || undefined,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>{description}</DialogContentText>
        <Stack spacing={2}>
          <TextField
            label={t("Amount received")}
            type="number"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            error={!amountValid}
            helperText={t("Plan price: {{price}}", { price: formatMoney(price) })}
            inputProps={{ min: 0, step: 1 }}
          />
          <TextField
            select
            label={t("Payment method")}
            value={method}
            onChange={(event) => setMethod(event.target.value as PaymentMethod)}
          >
            {PAYMENT_METHODS.map((option) => (
              <MenuItem key={option} value={option}>
                {t(METHOD_LABELS[option])}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label={t("Reference (optional)")}
            helperText={t("UPI transaction ID, card slip number, and so on")}
            value={reference}
            onChange={(event) => setReference(event.target.value)}
          />
          <TextField
            label={t("Note (optional)")}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("Back")}</Button>
        <Button variant="contained" disabled={!amountValid || busy} onClick={() => void submit()}>
          {t("Record payment and activate")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentDialog;
