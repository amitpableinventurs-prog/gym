import { Chip, ChipProps } from "@mui/material";
import { useTranslation } from "react-i18next";

const STATUS: Record<string, { label: string; color: ChipProps["color"] }> = {
  ACTIVE: { label: "Active", color: "success" },
  UPCOMING: { label: "Upcoming", color: "primary" },
  PENDING: { label: "Awaiting payment", color: "warning" },
  FROZEN: { label: "Frozen", color: "info" },
  EXPIRED: { label: "Expired", color: "default" },
  CANCELLED: { label: "Cancelled", color: "error" },
  PAID: { label: "Paid", color: "success" },
  REFUNDED: { label: "Refunded", color: "default" },
  SCHEDULED: { label: "Scheduled", color: "primary" },
  WAITING_FOR_FEEDBACK: { label: "Waiting for feedback", color: "warning" },
  FEEDBACK_SUBMITTED: { label: "Finished", color: "success" },
  FINISHED: { label: "Finished", color: "success" },
  SUSPENDED: { label: "Suspended", color: "error" },
};

const StatusChip: React.FC<{ status: string }> = ({ status }) => {
  const { t } = useTranslation();
  const { label, color } = STATUS[status] ?? { label: status, color: "default" };
  return <Chip size="small" variant="outlined" color={color} label={t(label)} />;
};

export default StatusChip;
