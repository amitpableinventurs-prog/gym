import React from "react";
import { Card, Grid, CardContent, Skeleton, Box } from "@mui/material";

const SkeletonHomeCard: React.FC = () => {
  return (
    <>
      {Array.from({ length: 4 }).map((_, index) => (
        <Grid item xs={12} md={6} sx={{ pb: 1, pr: 1, pt: 1 }} key={index}>
          <Card
            sx={{
              borderRadius: "16px",
              minWidth: "100%",
              minHeight: "100%",
              margin: "0 auto",
            }}
          >
            <CardContent
              sx={{
                my: 1,
                display: "flex",
                flexDirection: "column",
                gap: 1,
                pb: 0,
              }}
            >
              <Grid container spacing={2} sx={{ mb: 0 }}>
                <Grid item xs={7} md={7} sx={{ display: "flex" }}>
                  <Grid item xs={3.2} md={3.2}>
                    <Skeleton variant="circular" width={88} height={88} />
                  </Grid>
                  <Grid item xs={8.8} md={8.8}>
                    <Skeleton variant="text" width="80%" height={24} />
                    <Skeleton variant="text" width="60%" height={20} />
                    <Skeleton variant="text" width="40%" height={20} />
                  </Grid>
                </Grid>
                <Grid
                  item
                  xs={5}
                  md={5}
                  sx={{
                    alignItems: "flex-start",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Skeleton variant="text" width="80%" height={20} />
                  <Skeleton variant="text" width="80%" height={20} />
                  <Skeleton variant="text" width="80%" height={20} />
                </Grid>
                <Grid item xs={12} md={12}>
                  <Skeleton variant="text" width="90%" height={20} />
                </Grid>
                <Grid item xs={12} md={12}>
                  <Skeleton variant="text" width="90%" height={20} />
                </Grid>
                <Grid item xs={12} md={12}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 1,
                    }}
                  >
                    {Array.from({ length: 4 }).map((_, index) => (
                      <Skeleton
                        key={index}
                        variant="rectangular"
                        height={28}
                        width="20%"
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </>
  );
};

export default SkeletonHomeCard;
