import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useContent } from "../lib/content";
import SectionHeading from "./SectionHeading";
import { Sparkle } from "./icons";
import { formatDateID } from "../lib/format";

function diffFrom(date) {
  const diff = Math.max(0, Date.now() - new Date(date).getTime());
  const totalSeconds = Math.floor(diff / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

export default function TimeTogether() {
  const { content } = useContent();
  const [time, setTime] = useState(() => diffFrom(content.startDate));

  useEffect(() => {
    const id = setInterval(() => setTime(diffFrom(content.startDate)), 1000);
    return () => clearInterval(id);
  }, [content.startDate]);

  const units = [
    { label: "Hari", value: time.days },
    { label: "Jam", value: time.hours },
    { label: "Menit", value: time.minutes },
    { label: "Detik", value: time.seconds },
  ];

  return (
    <section id="time" className="relative px-6 py-24 md:py-32">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          eyebrow={content.time.eyebrow}
          title={content.time.title}
          description={content.time.description}
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[2rem] border border-rose-900/10 bg-white/70 p-8 shadow-xl shadow-rose-900/5 backdrop-blur-xl md:p-12"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-pink-500/15 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-pink-500/10 blur-3xl"
          />

          <div className="relative flex flex-col items-center text-center">
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-cream/50">
              {content.time.sinceLabel}
            </p>
            <p className="mt-2 font-script text-3xl text-pink-600">
              {formatDateID(content.startDate)}
            </p>

            <div className="mt-8 grid w-full grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
              {units.map((unit, index) => (
                <div
                  key={unit.label}
                  className={`relative rounded-2xl border border-dashed border-rose-900/10 px-4 py-5 ${
                    index % 2 ? "bg-pink-100/60" : "bg-white/70"
                  }`}
                >
                  <Sparkle className="absolute right-3 top-3 h-3 w-3 text-rose-400/50" />
                  <div className="font-serif text-4xl tabular-nums text-gradient md:text-5xl">
                    {String(unit.value).padStart(2, "0")}
                  </div>
                  <div className="mt-1 text-[0.65rem] uppercase tracking-[0.3em] text-cream/50">
                    {unit.label}
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-8 max-w-md text-sm leading-relaxed text-cream/60">
              {content.time.note}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
