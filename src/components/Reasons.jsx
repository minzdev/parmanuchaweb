import { motion } from "framer-motion";
import { useContent } from "../lib/content";
import SectionHeading from "./SectionHeading";
import { Cloud, Heart, Sparkle, Star } from "./icons";

const reasonIcons = [Heart, Sparkle, Star, Cloud, Heart, Sparkle];

export default function Reasons() {
  const { content } = useContent();

  return (
    <section id="reasons" className="relative px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow={content.reasons.eyebrow}
          title={content.reasons.title}
          description={content.reasons.description}
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {content.reasons.items.map((reason, index) => {
            const Icon = reasonIcons[index % reasonIcons.length];

            return (
              <motion.div
                key={reason.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.6,
                  delay: (index % 3) * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group relative overflow-hidden rounded-[1.5rem] border border-dashed border-rose-900/15 bg-white/70 p-6 backdrop-blur transition hover:-translate-y-1 hover:rotate-[-0.5deg] hover:border-rose-500/30 hover:bg-white"
              >
                <span
                  aria-hidden="true"
                  className="absolute right-5 top-4 font-serif text-4xl text-rose-900/5 transition group-hover:text-rose-500/10"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-700/10 text-pink-700 ring-1 ring-rose-900/10">
                  <Icon className="h-4 w-4" />
                </div>

                <h3 className="mt-4 font-serif text-lg text-cream">
                  {reason.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-cream/60">
                  {reason.text}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
