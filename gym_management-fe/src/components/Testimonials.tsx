import React, { useEffect, useState } from "react";
import Testimonial from "./Testimonial.tsx";
import { Box, CircularProgress } from "@mui/material";
import { getTestimonials } from "../services/testimonialsService";

interface TestimonialsProps {
  coachId: string;
}

const Testimonials: React.FC<TestimonialsProps> = ({ coachId }) => {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const fetchedTestimonials = await getTestimonials(coachId);
        setTestimonials(fetchedTestimonials[coachId] || []);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, [coachId]);

  const component = (testimonials || []).map((testimonial, index) => (
    <Testimonial key={index} testimonial={testimonial} />
  ));

  return loading ? (
    <CircularProgress />
  ) : (
    <Box
      sx={{
        display: "flex",
        overflowX: "auto",
        padding: 2,
        width: "100%",
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": {
          display: "none",
        },
      }}
    >
      {component}
    </Box>
  );
};

export default Testimonials;
