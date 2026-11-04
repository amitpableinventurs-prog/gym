import { ReactNode, useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { Paged, PageQuery } from "../../services/adminService";
import { apiErrorMessage } from "../../services/apiClient";

export const AdminCard: React.FC<{ title?: string; action?: ReactNode; children: ReactNode }> = ({
  title,
  action,
  children,
}) => (
  <Card elevation={0} sx={{ height: "100%", border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
    <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
      {(title || action) && (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={1.5}
          sx={{ px: 1, pb: 1.5 }}
        >
          {title && (
            <Typography component="h2" variant="h6" fontWeight={700}>
              {title}
            </Typography>
          )}
          {action}
        </Stack>
      )}
      {children}
    </CardContent>
  </Card>
);

export const MetricCard: React.FC<{
  title: string;
  value: ReactNode;
  detail: string;
  icon: ReactNode;
}> = ({ title, value, detail, icon }) => (
  <Card elevation={0} sx={{ height: "100%", border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
    <CardContent sx={{ p: 2.5 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
        <Box sx={{ minWidth: 0 }}>
          <Typography color="text.secondary" variant="body2" fontWeight={600}>
            {title}
          </Typography>
          <Typography component="p" sx={{ fontSize: "2.1rem", fontWeight: 700, lineHeight: 1.2, mt: 0.75 }}>
            {value}
          </Typography>
        </Box>
        <Box sx={{ color: "primary.main", display: "flex" }}>{icon}</Box>
      </Stack>
      <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
        {detail}
      </Typography>
    </CardContent>
  </Card>
);

export const DataTable: React.FC<{
  label: string;
  columns: string[];
  empty: string;
  isEmpty: boolean;
  children: ReactNode;
}> = ({ label, columns, empty, isEmpty, children }) => (
  <TableContainer sx={{ overflowX: "auto" }}>
    <Table size="small" aria-label={label}>
      <TableHead>
        <TableRow>
          {columns.map((column) => (
            <TableCell key={column} sx={{ whiteSpace: "nowrap" }}>
              {column}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {isEmpty ? (
          <TableRow>
            <TableCell colSpan={columns.length} align="center" sx={{ py: 4, color: "text.secondary" }}>
              {empty}
            </TableCell>
          </TableRow>
        ) : (
          children
        )}
      </TableBody>
    </Table>
  </TableContainer>
);

export const LoadState: React.FC<{ loading: boolean; error: string | null; onRetry: () => void }> = ({
  loading,
  error,
  onRetry,
}) => {
  const { t } = useTranslation();
  if (error) {
    return (
      <Alert
        severity="error"
        sx={{ mb: 2, borderRadius: 2 }}
        action={
          <Button color="inherit" size="small" onClick={onRetry}>
            {t("Retry")}
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }
  return loading ? (
    <Stack alignItems="center" sx={{ py: 2 }}>
      <CircularProgress size={28} aria-label={t("Loading")} />
    </Stack>
  ) : null;
};

/** Loads a server-paged list and reloads it when the query changes. */
export function usePagedList<T, R extends Paged<T> = Paged<T>>(
  fetchPage: (query: PageQuery) => Promise<R>,
  queryKey: string
) {
  const { t } = useTranslation();
  const [data, setData] = useState<R | null>(null);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setPage(0), [queryKey]);

  // queryKey stands in for fetchPage, which is a new function on every render.
  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchPage({ page: page + 1, limit }));
    } catch (loadError) {
      setError(apiErrorMessage(loadError, t("Could not load this list. Please try again.")));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, queryKey, t]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const pagination = (
    <TablePagination
      component="div"
      count={data?.total ?? 0}
      page={page}
      rowsPerPage={limit}
      rowsPerPageOptions={[10, 25, 50]}
      onPageChange={(_, next) => setPage(next)}
      onRowsPerPageChange={(event) => {
        setLimit(Number(event.target.value));
        setPage(0);
      }}
    />
  );

  return { data, items: data?.items ?? [], loading, error, reload, pagination };
}

export const ConfirmDialog: React.FC<{
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  destructive?: boolean;
  /** When set, the admin must give a reason, which is passed to onConfirm. */
  reasonLabel?: string;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}> = ({ open, title, message, confirmLabel, destructive, reasonLabel, onClose, onConfirm }) => {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) setReason("");
  }, [open]);

  const confirm = async () => {
    setBusy(true);
    try {
      await onConfirm(reason.trim());
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
        {reasonLabel && (
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={2}
            label={reasonLabel}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            sx={{ mt: 2 }}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("Keep as is")}</Button>
        <Button
          variant="contained"
          color={destructive ? "error" : "primary"}
          disabled={busy || (!!reasonLabel && reason.trim().length < 3)}
          onClick={() => void confirm()}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
