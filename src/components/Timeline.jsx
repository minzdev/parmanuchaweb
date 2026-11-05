import { motion } from "framer-motion";
import { useContent } from "../lib/content";
import SectionHeading from "./SectionHeading";
import { Heart } from "./icons";

export default function Timeline() {
  const { content } = useContent();

  return (
    <section id="journey" className="relative px-6 py-24 md:py-32">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          eyebrow={content.journey.eyebrow}
          title={content.journey.title}
          description={content.journey.description}
        />

        <div className="relative mx-auto max-w-3xl">
          <div
            aria-hidden="true"
            className="absolute left-4 top-0 h-full w-px bg-gradient-to-b from-rose-600/60 via-pink-500/30 to-transparent md:left-1/2 md:-translate-x-1/2"
          />

          <div className="space-y-10 md:space-y-14">
            {content.journey.items.map((item, index) => {
              const right = index % 2 === 1;

              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="relative pl-12 md:grid md:grid-cols-2 md:gap-12 md:pl-0"
                >
                  <div
                    className={
                      right
                        ? "md:col-start-2"
                        : "md:col-start-1 md:text-right"
                    }
                  >
                    <div className="group rounded-2xl border border-dashed border-rose-900/15 bg-white/70 p-5 backdrop-blur transition-colors hover:border-rose-500/30 hover:bg-white md:p-6">
                      <div
                        className={`flex items-center gap-3 ${
                          right ? "" : "md:justify-end"
                        }`}
                      >
                        <span className="inline-flex items-center gap-2 rounded-full border border-dashed border-rose-300/60 bg-white/60 px-3 py-1">
                          <Heart className="h-3 w-3 text-rose-500" />
                          <span className="text-[0.6rem] uppercase tracking-[0.22em] text-rose-700/80">
                            {item.date}
                          </span>
                        </span>
                      </div>
                      <h3 className="mt-3 font-serif text-xl text-cream md:text-2xl">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-cream/60">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <span
                    aria-hidden="true"
                    className="absolute left-4 top-6 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-rose-400 ring-4 ring-rose-400/15 shadow-[0_0_18px_rgba(255,90,149,0.9)] md:left-1/2 md:top-1/2 md:-translate-y-1/2"
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
