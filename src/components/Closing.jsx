import { motion } from "framer-motion";
import { useContent } from "../lib/content";
import { Heart, Sparkle, Star } from "./icons";

export default function Closing() {
  const { content } = useContent();

  return (
    <section
      id="closing"
      className="relative flex min-h-[85vh] flex-col items-center justify-center px-6 py-24 text-center"
    >
      <motion.div
        aria-hidden="true"
        animate={{ y: [0, -10, 0], rotate: [0, 10, -8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute left-12 top-1/3 hidden text-pink-400/60 md:block"
      >
        <Sparkle className="h-8 w-8" />
      </motion.div>
      <motion.div
        aria-hidden="true"
        animate={{ y: [0, 8, 0], rotate: [0, -10, 6, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute right-16 top-1/4 hidden text-rose-400/50 md:block"
      >
        <Star className="h-6 w-6" />
      </motion.div>
      <motion.div
        aria-hidden="true"
        animate={{ y: [0, -6, 0], rotate: [0, 8, -6, 0] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute bottom-1/4 right-24 hidden text-rose-500/40 md:block"
      >
        <Heart className="h-5 w-5" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center"
      >
        <p className="font-script text-3xl text-pink-600 md:text-4xl">
          {content.closing.script}
        </p>

        <h2 className="mt-4 font-serif text-5xl leading-tight text-gradient md:text-7xl">
          {content.closing.title}
        </h2>

        <div className="my-8 flex items-center gap-3">
          <span className="h-px w-12 bg-gradient-to-r from-transparent to-rose-500/40" />
          <Heart className="heartbeat h-8 w-8 text-rose-500" />
          <span className="h-px w-12 bg-gradient-to-l from-transparent to-rose-500/40" />
        </div>

        <p className="max-w-lg text-sm leading-relaxed text-cream/65 md:text-base">
          {content.closing.description}
        </p>

        <a
          href="#home"
          className="mt-10 inline-flex items-center gap-2 rounded-full border border-rose-900/15 bg-white/60 px-7 py-3 text-sm text-cream backdrop-blur transition hover:-translate-y-0.5 hover:border-rose-500/40 hover:bg-white"
        >
          <Heart className="h-4 w-4 text-rose-500" />
          Ulangi dari awal
        </a>
      </motion.div>

      <footer className="absolute bottom-6 text-[0.65rem] uppercase tracking-[0.3em] text-rose-900/35">
        {content.closing.footnote}
      </footer>
    </section>
  );
}
