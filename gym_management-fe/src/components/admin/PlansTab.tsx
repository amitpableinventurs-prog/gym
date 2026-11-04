import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  TableCell,
  TableRow,
  TextField,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import { createPlan, getAdminPlans, PlanInput, updatePlan } from "../../services/adminService";
import { apiErrorMessage } from "../../services/apiClient";
import { MembershipPlan } from "../../services/membershipService";
import { formatMoney } from "../../utils/format";
import { AdminCard, DataTable, LoadState } from "./common";

interface PlanForm {
  name: string;
  description: string;
  price: string;
  durationDays: string;
  sessionLimit: string;
  features: string;
  isActive: boolean;
}

const EMPTY_FORM: PlanForm = {
  name: "",
  description: "",
  price: "",
  durationDays: "30",
  sessionLimit: "",
  features: "",
  isActive: true,
};

const toForm = (plan: MembershipPlan): PlanForm => ({
  name: plan.name,
  description: plan.description,
  price: String(plan.price),
  durationDays: String(plan.durationDays),
  sessionLimit: plan.sessionLimit === null ? "" : String(plan.sessionLimit),
  features: plan.features.join("\n"),
  isActive: plan.isActive,
});

const toInput = (form: PlanForm): PlanInput => ({
  name: form.name.trim(),
  description: form.description.trim(),
  price: Number(form.price),
  durationDays: Number(form.durationDays),
  sessionLimit: form.sessionLimit === "" ? null : Number(form.sessionLimit),
  features: form.features
    .split("\n")
    .map((feature) => feature.trim())
    .filter(Boolean),
  isActive: form.isActive,
});

const isWholeNumber = (value: string, min: number) =>
  value !== "" && Number.isInteger(Number(value)) && Number(value) >= min;

const PlansTab: React.FC = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<MembershipPlan | "new" | null>(null);
  const [form, setForm] = useState<PlanForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setPlans(await getAdminPlans());
    } catch (loadError) {
      setError(apiErrorMessage(loadError, t("Could not load plans.")));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const open = (plan: MembershipPlan | "new") => {
    setForm(plan === "new" ? EMPTY_FORM : toForm(plan));
    setEditing(plan);
  };

  const field = (key: keyof PlanForm) => ({
    value: form[key] as string,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
      setForm((current) => ({ ...current, [key]: event.target.value })),
  });

  const valid =
    form.name.trim().length >= 2 &&
    isWholeNumber(form.price, 0) &&
    isWholeNumber(form.durationDays, 1) &&
    (form.sessionLimit === "" || isWholeNumber(form.sessionLimit, 1));

  const save = async () => {
    setSaving(true);
    try {
      if (editing === "new") {
        await createPlan(toInput(form));
      } else if (editing) {
        await updatePlan(editing._id, toInput(form));
      }
      enqueueSnackbar(t("Plan saved"), { variant: "success" });
      setEditing(null);
      await load();
    } catch (saveError) {
      enqueueSnackbar(apiErrorMessage(saveError, t("Could not save the plan.")), { variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminCard
      title={t("Membership plans")}
      action={
        <Button variant="contained" size="small" onClick={() => open("new")} sx={{ alignSelf: "flex-start" }}>
          {t("New plan")}
        </Button>
      }
    >
      <LoadState loading={loading && !plans.length} error={error} onRetry={() => void load()} />
      <DataTable
        label={t("Membership plans")}
        columns={[t("Plan"), t("Price"), t("Duration"), t("Sessions"), t("Status"), t("Actions")]}
        empty={t("No plans yet. Create one so members can join.")}
        isEmpty={!plans.length}
      >
        {plans.map((plan) => (
          <TableRow key={plan._id} hover sx={{ opacity: plan.isActive ? 1 : 0.6 }}>
            <TableCell sx={{ whiteSpace: "nowrap" }}>{plan.name}</TableCell>
            <TableCell>{formatMoney(plan.price)}</TableCell>
            <TableCell sx={{ whiteSpace: "nowrap" }}>{t("{{days}} days", { days: plan.durationDays })}</TableCell>
            <TableCell>{plan.sessionLimit ?? t("Unlimited")}</TableCell>
            <TableCell>{plan.isActive ? t("On sale") : t("Archived")}</TableCell>
            <TableCell>
              <Button size="small" onClick={() => open(plan)}>
                {t("Edit")}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </DataTable>

      <Dialog open={!!editing} onClose={() => setEditing(null)} fullWidth maxWidth="sm">
        <DialogTitle>{editing === "new" ? t("New plan") : t("Edit plan")}</DialogTitle>
        <DialogContent>
          {editing !== "new" && (
            <DialogContentText sx={{ mb: 2 }}>
              {t("Changes apply to new sales only. Existing members keep the terms they bought.")}
            </DialogContentText>
          )}
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label={t("Plan name")} {...field("name")} />
            <TextField label={t("Description")} multiline minRows={2} {...field("description")} />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField label={t("Price")} type="number" fullWidth {...field("price")} />
              <TextField label={t("Duration in days")} type="number" fullWidth {...field("durationDays")} />
              <TextField
                label={t("Coach sessions")}
                type="number"
                fullWidth
                helperText={t("Leave empty for unlimited")}
                {...field("sessionLimit")}
              />
            </Stack>
            <TextField
              label={t("Features")}
              helperText={t("One per line")}
              multiline
              minRows={3}
              {...field("features")}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.isActive}
                  onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
                />
              }
              label={t("On sale to members")}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditing(null)}>{t("Back")}</Button>
          <Button variant="contained" disabled={!valid || saving} onClick={() => void save()}>
            {t("Save plan")}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminCard>
  );
};

export default PlansTab;
