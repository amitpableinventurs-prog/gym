import { Testimonial, ITestimonial } from '../models/Testimonial';

export class TestimonialService {
  public async createTestimonial(testimonialData: any): Promise<ITestimonial> {
    const testimonial = new Testimonial(testimonialData);
    return await testimonial.save();
  }

  public async getTestimonialsByCoachId(coachId: string): Promise<ITestimonial | null> {
    const testimonial = await Testimonial.findOne({coachId});
    if (!testimonial) return null;
    return testimonial;
  }
}

export const testimonialService = new TestimonialService(); 