import { motion } from "framer-motion";
import { Heart, Sparkle } from "./icons";

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}) {
  const alignment =
    align === "left" ? "items-start text-left" : "items-center text-center";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`mx-auto mb-12 flex max-w-2xl flex-col ${alignment}`}
    >
      <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-rose-600/20 bg-white/60 px-4 py-1.5 text-[0.65rem] font-medium uppercase tracking-[0.32em] text-rose-700/80">
        <Heart className="h-3 w-3 text-rose-500" />
        {eyebrow}
      </span>
      <h2 className="font-serif text-4xl leading-tight text-cream md:text-5xl">
        {title}
      </h2>
      <span
        aria-hidden="true"
        className="mt-4 flex items-center gap-2 text-rose-400/70"
      >
        <span className="h-px w-8 bg-gradient-to-r from-transparent to-rose-400/50" />
        <Sparkle className="h-3 w-3" />
        <span className="h-1.5 w-1.5 rounded-full bg-pink-400" />
        <Sparkle className="h-3 w-3" />
        <span className="h-px w-8 bg-gradient-to-l from-transparent to-rose-400/50" />
      </span>
      {description ? (
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-cream/60 md:text-base">
          {description}
        </p>
      ) : null}
    </motion.div>
  );
}
