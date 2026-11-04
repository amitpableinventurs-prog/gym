import { Grid, Box, Card, Skeleton } from "@mui/material";

const SkeletonCoachCard = () => (
  <Grid item xs={12} sm={6} md={3} lg={3}>
    <Card
      sx={{
        borderRadius: "16px",
        height: "100%",
        width: { xs: "100%", sm: "90%", md: "100%", lg: "80%" },
        margin: "0 auto",
      }}
    >
      <Skeleton variant="rectangular" height={240} />
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Box>
            <Skeleton variant="text" width={120} height={32} />
            <Skeleton variant="text" width={160} />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Skeleton variant="text" width={40} />
            <Skeleton
              variant="circular"
              width={24}
              height={24}
              sx={{ ml: 1 }}
            />
          </Box>
        </Box>
        <Skeleton variant="text" height={80} sx={{ mt: 2 }} />
        <Skeleton
          variant="rectangular"
          height={36}
          sx={{ mt: 2, borderRadius: 1 }}
        />
      </Box>
    </Card>
  </Grid>
);

const SkeletonCoachPage = () => {
  return (
    <Grid container spacing={2}>
      {[...Array(8)].map((_, index) => (
        <SkeletonCoachCard key={index} />
      ))}
    </Grid>
  );
};

export default SkeletonCoachPage;
