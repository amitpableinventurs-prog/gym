import { useEffect, useState } from "react";
import { Autocomplete, Button, Chip, Stack, TableCell, TableRow, TextField } from "@mui/material";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import {
  AdminMember,
  AdminVisit,
  checkInMember,
  checkOutVisit,
  getAttendance,
  getMembers,
  Paged,
} from "../../services/adminService";
import { apiErrorMessage } from "../../services/apiClient";
import { formatTime, todayInputValue } from "../../utils/format";
import { AdminCard, DataTable, LoadState, usePagedList } from "./common";

type AttendancePage = Paged<AdminVisit> & { inside: number };

const AttendanceTab: React.FC = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [date, setDate] = useState(todayInputValue());
  const [lookup, setLookup] = useState("");
  const [options, setOptions] = useState<AdminMember[]>([]);
  const [selected, setSelected] = useState<AdminMember | null>(null);
  const [busy, setBusy] = useState(false);

  const { data, items, loading, error, reload, pagination } = usePagedList<AdminVisit, AttendancePage>(
    (query) => getAttendance({ ...query, date }),
    date
  );

  useEffect(() => {
    const term = lookup.trim();
    if (term.length < 2) {
      setOptions([]);
      return;
    }
    const timer = setTimeout(() => {
      getMembers({ page: 1, limit: 8, search: term })
        .then((result) => setOptions(result.items))
        .catch(() => setOptions([]));
    }, 250);
    return () => clearTimeout(timer);
  }, [lookup]);

  const checkIn = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      await checkInMember(selected._id);
      enqueueSnackbar(t("{{name}} checked in", { name: selected.firstName }), { variant: "success" });
      setSelected(null);
      setLookup("");
      setDate(todayInputValue());
      await reload();
    } catch (actionError) {
      enqueueSnackbar(apiErrorMessage(actionError, t("Could not check in.")), { variant: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stack spacing={2.5}>
      <AdminCard title={t("Front desk check-in")}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ px: 1 }}>
          <Autocomplete
            fullWidth
            size="small"
            options={options}
            value={selected}
            filterOptions={(all) => all}
            isOptionEqualToValue={(option, value) => option._id === value._id}
            getOptionLabel={(option) => `${option.firstName} ${option.lastName} · ${option.email}`}
            noOptionsText={t("Type at least 2 letters of a name or email")}
            onChange={(_, value) => setSelected(value)}
            onInputChange={(_, value) => setLookup(value)}
            renderInput={(params) => <TextField {...params} label={t("Find member")} />}
          />
          <Button variant="contained" disabled={!selected || busy} onClick={() => void checkIn()} sx={{ flexShrink: 0 }}>
            {t("Check in")}
          </Button>
        </Stack>
      </AdminCard>

      <AdminCard
        title={t("Visits")}
        action={
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip size="small" label={t("{{count}} in the gym now", { count: data?.inside ?? 0 })} />
            <TextField
              size="small"
              type="date"
              label={t("Date")}
              value={date}
              onChange={(event) => setDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        }
      >
        <LoadState loading={loading && !items.length} error={error} onRetry={() => void reload()} />
        <DataTable
          label={t("Visits")}
          columns={[t("Name"), t("Type"), t("In"), t("Out"), t("Actions")]}
          empty={t("No visits on this day.")}
          isEmpty={!items.length}
        >
          {items.map((visit) => (
            <TableRow key={visit._id} hover>
              <TableCell sx={{ whiteSpace: "nowrap" }}>
                {visit.userId ? `${visit.userId.firstName} ${visit.userId.lastName}` : t("Unknown")}
              </TableCell>
              <TableCell>{visit.userId?.isCoach ? t("Coach") : t("Client")}</TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>{formatTime(visit.checkInAt)}</TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>
                {visit.autoClosed ? t("Not recorded") : formatTime(visit.checkOutAt)}
              </TableCell>
              <TableCell>
                {visit.isOpen && (
                  <Button
                    size="small"
                    onClick={async () => {
                      try {
                        await checkOutVisit(visit._id);
                        await reload();
                      } catch (actionError) {
                        enqueueSnackbar(apiErrorMessage(actionError, t("Could not check out.")), {
                          variant: "error",
                        });
                      }
                    }}
                  >
                    {t("Check out")}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </DataTable>
        {pagination}
      </AdminCard>
    </Stack>
  );
};

export default AttendanceTab;
