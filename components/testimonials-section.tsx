"use client";
import { TestimonialCard } from "./testimonial-card";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const testimonials = [
  {
    name: "Ama Osei",
    role: "Family Member",
    message:
      "damarifadue made it easy for our family to share memories and receive support from friends near and far. The memorial page was beautiful and comforting.",
    avatar: "/placeholder-user.jpg",
  },
  {
    name: "Kwame Mensah",
    role: "Friend",
    message:
      "The platform allowed us to honor our loved one in a dignified way. The condolence messages and donations meant so much to us during a difficult time.",
    avatar: "/placeholder-user.jpg",
  },
  {
    name: "Akosua Boateng",
    role: "Community Leader",
    message:
      "I was impressed by how easy it was to connect with the family and participate in the funeral events, even from abroad. Highly recommended!",
    avatar: "/placeholder-user.jpg",
  },
  {
    name: "Yaw Adusei",
    role: "Organizer",
    message:
      "Setting up a memorial page was straightforward and the support team was very responsive. Our family appreciated the thoughtful features and easy sharing.",
    avatar: "/placeholder-user.jpg",
  },
  {
    name: "Efua Serwaa",
    role: "Supporter",
    message:
      "I was able to send my condolences and support the family from afar. The platform made it easy to stay connected and show I care.",
    avatar: "/placeholder-user.jpg",
  },
];

export function TestimonialsSection() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Helper to get the correct testimonial for a given offset
  const getTestimonial = (offset: number) => {
    const len = testimonials.length;
    return testimonials[(index + offset + len) % len];
  };

  return (
    <section className="py-20 bg-gradient-to-br from-amber-50 to-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            What Families Are Saying
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
            Hear from families and friends who have used damarifadue to honor
            their loved ones and connect with their communities.
          </p>
        </motion.div>
        <div className="flex justify-center items-center min-h-[340px] gap-4 relative">
          {/* Previous testimonial (left, partially visible) */}
          <motion.div
            key={index - 1}
            initial={{ opacity: 0.5, scale: 0.85, x: -60 }}
            animate={{ opacity: 0.5, scale: 0.85, x: 0 }}
            exit={{ opacity: 0, scale: 0.85, x: -60 }}
            transition={{ duration: 0.5 }}
            className="hidden md:block absolute left-0 w-1/3 max-w-xs pointer-events-none z-0"
            style={{ top: 0, bottom: 0, margin: "auto" }}
          >
            <TestimonialCard {...getTestimonial(-1)} />
          </motion.div>
          {/* Center testimonial (main, fully visible) */}
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9, x: 60 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: -60 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-xl z-10"
            >
              <TestimonialCard {...getTestimonial(0)} />
            </motion.div>
          </AnimatePresence>
          {/* Next testimonial (right, partially visible) */}
          <motion.div
            key={index + 1}
            initial={{ opacity: 0.5, scale: 0.85, x: 60 }}
            animate={{ opacity: 0.5, scale: 0.85, x: 0 }}
            exit={{ opacity: 0, scale: 0.85, x: 60 }}
            transition={{ duration: 0.5 }}
            className="hidden md:block absolute right-0 w-1/3 max-w-xs pointer-events-none z-0"
            style={{ top: 0, bottom: 0, margin: "auto" }}
          >
            <TestimonialCard {...getTestimonial(1)} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
