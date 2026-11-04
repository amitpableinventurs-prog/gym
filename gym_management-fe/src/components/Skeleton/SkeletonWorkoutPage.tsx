import * as React from "react";
import { Skeleton, Card, CardContent, Box, Grid } from "@mui/material";

const SkeletonWorkoutPage: React.FC = () => {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <Grid item xs={12} sm={6} md={6} key={index}>
          <Card
            sx={{
              borderRadius: "16px",
              p: 1,
              minHeight: "220px",
              minWidth: "664px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <CardContent sx={{ flex: 1 }}>
              <Box sx={{ display: "flex" }}>
                <Skeleton
                  variant="text"
                  width="40%"
                  height={30}
                  sx={{ marginRight: 1 }}
                />
                <Box sx={{ flexGrow: 1 }} />
                <Skeleton variant="rectangular" width={80} height={32} />
              </Box>
              <Skeleton
                variant="text"
                width="100%"
                height={20}
                sx={{ pt: 1, pb: 2 }}
              />
              <Box
                sx={{ display: "flex", justifyContent: "left", width: "50%" }}
              >
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton
                  variant="text"
                  width="60%"
                  height={20}
                  sx={{ ml: 1 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </>
  );
};

export default SkeletonWorkoutPage;
