import { Box, Tab, Tabs, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import AttendanceTab from "../components/admin/AttendanceTab";
import BookingsTab from "../components/admin/BookingsTab";
import MembersTab from "../components/admin/MembersTab";
import MembershipsTab from "../components/admin/MembershipsTab";
import OverviewTab from "../components/admin/OverviewTab";
import PaymentsTab from "../components/admin/PaymentsTab";
import PlansTab from "../components/admin/PlansTab";
import ReviewsTab from "../components/admin/ReviewsTab";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "members", label: "Members" },
  { id: "memberships", label: "Memberships" },
  { id: "plans", label: "Plans" },
  { id: "payments", label: "Payments" },
  { id: "attendance", label: "Attendance" },
  { id: "bookings", label: "Bookings" },
  { id: "reviews", label: "Reviews" },
];

const AdminPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get("tab");
  const tab = TABS.some((item) => item.id === requested) ? (requested as string) : "overview";
  const openTab = (next: string) => setSearchParams({ tab: next });

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, sm: 3, md: 4 }, py: { xs: 4, md: 7 } }}>
      <Box sx={{ mb: 2 }}>
        <Typography component="h1" sx={{ fontSize: { xs: "2rem", sm: "2.7rem" }, fontWeight: 700, letterSpacing: "-0.04em" }}>
          {t("Admin dashboard")}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          {t("Run your gym: members, memberships, payments, and daily attendance.")}
        </Typography>
      </Box>

      <Tabs
        value={tab}
        onChange={(_, next) => openTab(next)}
        variant="scrollable"
        scrollButtons="auto"
        aria-label={t("Admin sections")}
        sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
      >
        {TABS.map((item) => (
          <Tab key={item.id} value={item.id} label={t(item.label)} sx={{ textTransform: "none" }} />
        ))}
      </Tabs>

      {tab === "overview" && <OverviewTab onOpenTab={openTab} />}
      {tab === "members" && <MembersTab />}
      {tab === "memberships" && <MembershipsTab />}
      {tab === "plans" && <PlansTab />}
      {tab === "payments" && <PaymentsTab />}
      {tab === "attendance" && <AttendanceTab />}
      {tab === "bookings" && <BookingsTab />}
      {tab === "reviews" && <ReviewsTab />}
    </Box>
  );
};

export default AdminPage;
