import { useCallback, useEffect, useState } from "react";
import { Button, Rating, TableCell, TableRow } from "@mui/material";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import { AdminReview, deleteReview, getReviews } from "../../services/adminService";
import { apiErrorMessage } from "../../services/apiClient";
import { AdminCard, ConfirmDialog, DataTable, LoadState } from "./common";

const ReviewsTab: React.FC = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<AdminReview | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setReviews((await getReviews()).items);
    } catch (loadError) {
      setError(apiErrorMessage(loadError, t("Could not load reviews.")));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AdminCard title={t("Reviews")}>
      <LoadState loading={loading && !reviews.length} error={error} onRetry={() => void load()} />
      <DataTable
        label={t("Reviews")}
        columns={[t("Coach"), t("From"), t("Rating"), t("Review"), t("Date"), t("Actions")]}
        empty={t("No reviews yet.")}
        isEmpty={!reviews.length}
      >
        {reviews.map((review) => (
          <TableRow key={`${review.coachId}-${review.workoutId}-${review.isCoach}`} hover>
            <TableCell sx={{ whiteSpace: "nowrap" }}>{review.coachName ?? t("Unknown")}</TableCell>
            <TableCell sx={{ whiteSpace: "nowrap" }}>
              {review.firstName} {review.lastName}
            </TableCell>
            <TableCell>
              <Rating size="small" readOnly value={review.rating} />
            </TableCell>
            <TableCell sx={{ minWidth: 220 }}>{review.testimonial}</TableCell>
            <TableCell sx={{ whiteSpace: "nowrap" }}>{review.date}</TableCell>
            <TableCell>
              <Button size="small" color="error" onClick={() => setRemoving(review)}>
                {t("Remove")}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </DataTable>

      <ConfirmDialog
        open={!!removing}
        destructive
        title={t("Remove this review?")}
        message={t("It disappears from the coach's profile and cannot be restored.")}
        confirmLabel={t("Remove review")}
        onClose={() => setRemoving(null)}
        onConfirm={async () => {
          if (!removing) return;
          try {
            await deleteReview(removing.coachId, removing.workoutId);
            enqueueSnackbar(t("Review removed"), { variant: "success" });
            await load();
          } catch (actionError) {
            enqueueSnackbar(apiErrorMessage(actionError, t("Could not remove the review.")), {
              variant: "error",
            });
          }
          setRemoving(null);
        }}
      />
    </AdminCard>
  );
};

export default ReviewsTab;
