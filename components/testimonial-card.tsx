"use client";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import Image from "next/image";

interface TestimonialCardProps {
  name: string;
  role: string;
  message: string;
  avatar: string;
}

export function TestimonialCard({
  name,
  role,
  message,
  avatar,
}: TestimonialCardProps) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="h-full border-0 shadow-lg bg-white/90 backdrop-blur-sm flex flex-col">
        <CardContent className="p-8 flex flex-col flex-1">
          <div className="flex items-center mb-6">
            <Image
              src={avatar}
              alt={name}
              width={56}
              height={56}
              className="w-14 h-14 rounded-full object-cover border-2 border-amber-500 shadow-md mr-4"
            />
            <div>
              <h4 className="text-lg font-bold text-slate-800 mb-1">{name}</h4>
              <p className="text-amber-600 font-medium text-sm">{role}</p>
            </div>
          </div>
          <p className="text-slate-600 text-base leading-relaxed flex-1">
            “{message}”
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
