import { motion } from "framer-motion";
import { useContent } from "../lib/content";
import Bunting from "./Bunting";
import { ArrowDown, Heart, Sparkle, Star } from "./icons";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Hero() {
  const { content } = useContent();

  return (
    <section
      id="home"
      className="relative flex min-h-[100svh] flex-col items-center justify-center px-6 py-24 text-center"
    >
      <Bunting />
      <motion.div
        aria-hidden="true"
        animate={{ y: [0, -10, 0], rotate: [0, 10, -6, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute left-8 top-28 hidden text-pink-400/70 md:block"
      >
        <Sparkle className="h-9 w-9" />
      </motion.div>
      <motion.div
        aria-hidden="true"
        animate={{ y: [0, 8, 0], rotate: [0, -12, 8, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute right-12 top-40 hidden text-rose-400/60 md:block"
      >
        <Star className="h-7 w-7" />
      </motion.div>
      <motion.div
        aria-hidden="true"
        animate={{ y: [0, -7, 0], rotate: [0, 8, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute bottom-40 left-16 hidden text-rose-500/50 md:block"
      >
        <Heart className="h-5 w-5" />
      </motion.div>
      <motion.div
        aria-hidden="true"
        animate={{ y: [0, 9, 0], rotate: [0, -8, 6, 0] }}
        transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute bottom-52 right-20 hidden text-pink-500/50 md:block"
      >
        <Sparkle className="h-6 w-6" />
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex max-w-3xl flex-col items-center"
      >
        <motion.span
          variants={item}
          className="inline-flex items-center gap-2.5 rounded-full border border-rose-900/10 bg-white/60 px-4 py-1.5 text-[0.65rem] uppercase tracking-[0.3em] text-rose-800/80 backdrop-blur"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-400" />
          </span>
          {content.hero.badge}
        </motion.span>

        <motion.p
          variants={item}
          className="mt-8 font-script text-3xl text-pink-600 md:text-5xl"
        >
          {content.hero.script}
        </motion.p>

        <motion.h1
          variants={item}
          className="mt-2 font-serif text-6xl leading-[0.95] tracking-tight md:text-8xl"
        >
          <span className="text-gradient">{content.hero.title}</span>
        </motion.h1>

        <motion.div variants={item} className="mt-6 flex items-center gap-4">
          <span className="h-px w-10 bg-gradient-to-r from-transparent to-rose-500/50" />
          <Heart className="heartbeat h-5 w-5 text-rose-500" />
          <span className="h-px w-10 bg-gradient-to-l from-transparent to-rose-500/50" />
        </motion.div>

        <motion.p
          variants={item}
          className="mt-4 font-script text-4xl text-blush md:text-5xl"
        >
          {content.partnerOne} <span className="text-rose-400">&</span>{" "}
          {content.partnerTwo}
        </motion.p>

        <motion.p
          variants={item}
          className="mt-6 max-w-xl text-base leading-relaxed text-cream/70 md:text-lg"
        >
          {content.hero.subtitle}
        </motion.p>

        <motion.div
          variants={item}
          className="mt-6 flex flex-wrap items-center justify-center gap-2"
        >
          {["1 bulan bersama", "our little story", "sayang banget"].map(
            (tag, index) => (
              <span
                key={tag}
                className={`rounded-full border border-dashed border-rose-900/20 bg-white/60 px-3 py-1 text-[0.6rem] uppercase tracking-[0.18em] text-rose-700/70 ${
                  index % 2 ? "rotate-1" : "-rotate-1"
                }`}
              >
                {tag}
              </span>
            )
          )}
        </motion.div>

        <motion.div
          variants={item}
          className="mt-8 flex flex-col gap-3 sm:flex-row"
        >
          <a
            href="#gallery"
            className="rounded-full bg-gradient-to-r from-rose-700 via-rose-500 to-pink-400 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-700/30 transition hover:-translate-y-0.5 hover:shadow-rose-600/50"
          >
            Lihat Momen Kita
          </a>
          <a
            href="#letter"
            className="rounded-full border border-rose-900/15 bg-white/60 px-7 py-3 text-sm font-medium text-cream backdrop-blur transition hover:-translate-y-0.5 hover:bg-white"
          >
            Baca Surat
          </a>
        </motion.div>
      </motion.div>

      <motion.a
        href="#time"
        aria-label="Gulir ke bawah"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-8 flex flex-col items-center gap-2 text-rose-900/40 transition hover:text-rose-600"
      >
        <span className="text-[0.6rem] uppercase tracking-[0.35em]">Scroll</span>
        <ArrowDown className="h-4 w-4 animate-bounce" />
      </motion.a>
    </section>
  );
}
