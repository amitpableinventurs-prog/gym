import React, { useState } from "react";
import { Grid, Pagination, Box, Typography } from "@mui/material";
import CoachesCard from "../components/CoachesCard";
//import useFetchCoaches from "../hooks/useFetchCoaches";
import SkeletonCoachPage from "../components/Skeleton/SkeletonCoachPage";
import useFetchCoaches from "../hooks/useFetchCoaches";
import Cookies from "js-cookie";
import { Coach } from "../types/coach";
import { useTranslation } from "react-i18next";

const Coaches: React.FC = () => {
  const token = Cookies.get("authToken") || "";
  const { t } = useTranslation();
  const { data: coaches, loading } = useFetchCoaches(token);
  const [page, setPage] = useState(1); // Moved up

  if (!coaches) return <SkeletonCoachPage />;
  const coachesData = coaches.coach.map((coach: Coach) => ({
    coach: coach,
  }));

  const itemsPerPage = coachesData.length >= 8 ? 8 : coachesData.length;
  const totalPages = Math.ceil(coachesData.length / itemsPerPage);

  const currentPageData = coachesData.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return loading ? (
    <SkeletonCoachPage />
  ) : (
    <Box>
      {coachesData.length === 0 ? (
        <Typography variant="h5" align="center" sx={{ mt: 4 }}>
          {t("No coaches available at the moment")}
        </Typography>
      ) : (
        <>
          {/* Coaches Grid */}
          <Grid container spacing={2} sx={{ display: "flex" }}>
            {currentPageData.map((coach, index) => (
              <CoachesCard
                key={index}
                coach={coach.coach}
                image={`/Images/image${(index + 1) % 10}.svg`}
              />
            ))}
          </Grid>

          {coachesData.length > 8 ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          ) : (
            <></>
          )}
        </>
      )}
    </Box>
  );
};

export default Coaches;
