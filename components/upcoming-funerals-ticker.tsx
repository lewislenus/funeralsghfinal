"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export interface UpcomingFuneralLite {
  id: string;
  deceased_name: string;
  funeral_date: string | null;
  funeral_time: string | null;
  venue: string | null;
  poster_url: string | null;
  image_url: string | null;
  location: string | null;
}

interface UpcomingFuneralsTickerProps {
  funerals: UpcomingFuneralLite[];
}

// A smooth, continuous auto-scrolling marquee for upcoming funerals.
export function UpcomingFuneralsTicker({ funerals }: UpcomingFuneralsTickerProps) {
  const shouldScroll = funerals.length >= 3; // Only scroll when 3 or more
  const [isHovering, setIsHovering] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const scrollPosRef = useRef(0);

  useEffect(() => {
    if (!shouldScroll) return;
    let frame: number;
    const speed = 0.3; // pixels per frame for gentle scroll

    const animate = () => {
      if (!scrollRef.current) return;
      if (!isHovering) {
        scrollPosRef.current += speed;
        const contentWidth = scrollRef.current.scrollWidth / 2; // since duplicated
        if (scrollPosRef.current >= contentWidth) {
          scrollPosRef.current = 0; // loop seamlessly
        }
        scrollRef.current.style.transform = `translateX(-${scrollPosRef.current}px)`;
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [shouldScroll, isHovering]);

  const items = shouldScroll ? [...funerals, ...funerals] : funerals;

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 text-white border-b border-slate-700/40">
      <div className="max-w-7xl mx-auto py-4 px-4">
        <div className="flex items-center gap-3 mb-3">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500 text-slate-900 font-semibold text-sm shadow">UP</span>
          <h2 className="text-lg font-medium tracking-wide">Upcoming Funerals</h2>
          {funerals.length === 0 && (
            <span className="text-xs text-slate-400">No upcoming funerals</span>
          )}
        </div>
        {funerals.length > 0 && (
          <div
            className={`relative ${shouldScroll ? "cursor-pointer" : ""}`}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <div
              ref={scrollRef}
              className={`flex ${shouldScroll ? "will-change-transform" : "flex-wrap gap-4"}`}
              style={{ transition: isHovering ? "transform 0.4s ease-out" : undefined }}
            >
              {items.map((f, idx) => {
                const dateLabel = f.funeral_date ? new Date(f.funeral_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'TBA';
                const poster = f.poster_url || f.image_url || "/funeral2.jpg";
                return (
                  <motion.div
                    key={idx === funerals.length ? `${f.id}-dup` : f.id + '-' + idx}
                    className="flex-shrink-0 w-72 md:w-80 mr-4 last:mr-0 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 hover:bg-white/10 transition relative"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <Link href={`/funeral/${f.id}`} className="flex space-x-3 group">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 ring-2 ring-amber-500/30"> 
                        <Image src={poster} alt={f.deceased_name} fill sizes="80px" className="object-cover object-top" />
                        <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-[10px] text-center py-0.5 font-medium tracking-wide">{dateLabel}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate group-hover:text-amber-300 transition-colors">{f.deceased_name}</p>
                        <p className="text-xs text-slate-300 line-clamp-2 mt-1">{f.venue || f.location || 'Service Venue TBA'}</p>
                        {f.funeral_time && (
                          <p className="text-[11px] text-slate-400 mt-1">{f.funeral_time}</p>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
            {shouldScroll && (
              <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-slate-800 via-slate-800/60 to-transparent" />
            )}
            {shouldScroll && (
              <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-slate-800 via-slate-800/60 to-transparent" />
            )}
          </div>
        )}
      </div>
    </section>
  );
}
