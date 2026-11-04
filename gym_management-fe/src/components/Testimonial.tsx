import * as React from "react";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import { Rating } from "@mui/material";

interface TestimonialData {
  // Add specific fields based on your data structure
  // For now it's empty since the data prop isn't being used
  id: string;
  coachId: string;
  firstName: string;
  lastName: string;
  rating: number;
  testimonial: string;
  workoutId: string;
  date: string;
}

interface TestimonialProps {
  testimonial: TestimonialData;
}

const Testimonial: React.FC<TestimonialProps> = ({ testimonial }) => {
  return (
    <Card
      sx={{
        minWidth: "19.75rem",
        minHeight: "15rem",
        margin: [0, 1, 0, 1],
        p: 1,
        borderRadius: "10px",
      }}
    >
      <CardHeader
        avatar={
          <Avatar
            sx={{
              bgcolor: "primary.main",
              fontSize: "large",
            }}
            aria-label="testimonial"
          >
            {(testimonial.firstName || "").charAt(0)}
            {(testimonial.lastName || "").charAt(0)}
          </Avatar>
        }
        action={
          <Rating
            name="size-small"
            defaultValue={testimonial.rating}
            readOnly
            size="small"
          />
        }
        title={`${testimonial.firstName} ${testimonial.lastName}`}
        subheader={testimonial.date}
      />

      <CardContent>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {testimonial.testimonial}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default Testimonial;
