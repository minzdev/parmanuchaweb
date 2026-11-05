import { motion } from "framer-motion";
import { useContent } from "../lib/content";
import SectionHeading from "./SectionHeading";
import { Heart, Sparkle } from "./icons";

export default function LoveLetter() {
  const { content } = useContent();

  return (
    <section id="letter" className="relative px-6 py-24 md:py-32">
      <div className="mx-auto max-w-3xl">
        <SectionHeading
          eyebrow={content.letter.eyebrow}
          title={content.letter.title}
          description={content.letter.description}
        />

        <motion.div
          initial={{ opacity: 0, y: 32, rotate: -0.6 }}
          whileInView={{ opacity: 1, y: 0, rotate: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[2rem] bg-paper p-8 text-[#4a071b] shadow-[0_30px_80px_-30px_rgba(142,14,53,0.35)] md:p-14"
        >
          <div
            aria-hidden="true"
            className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-rose-200/50 blur-2xl"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-16 -left-16 h-44 w-44 rounded-full bg-pink-200/50 blur-2xl"
          />
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-0 h-5 w-24 -translate-x-1/2 rotate-[-2deg] rounded-b-sm bg-pink-300/60 shadow-sm"
          />
          <div
            aria-hidden="true"
            className="absolute right-5 top-5 hidden rotate-3 rounded-lg border-2 border-dashed border-rose-300/70 px-2.5 py-1.5 text-center text-rose-400/80 sm:block md:right-8 md:top-8"
          >
            <Heart className="mx-auto h-3.5 w-3.5" />
            <span className="mt-0.5 block text-[0.45rem] font-semibold uppercase tracking-[0.2em]">
              with love
            </span>
          </div>
          <Sparkle className="absolute bottom-24 right-10 hidden h-5 w-5 text-rose-300/60 sm:block" />
          <Sparkle className="absolute left-8 top-28 hidden h-3.5 w-3.5 text-pink-300/70 sm:block" />

          <div className="relative">
            <p className="font-script text-4xl text-rose-500 md:text-5xl">
              {content.letter.greeting}
            </p>

            <div className="mt-6 space-y-4 font-serif text-base leading-relaxed text-[#6b0a28] md:text-lg">
              {content.letter.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-10 flex flex-col gap-1">
              <p className="text-sm text-[#8e0e35]">{content.letter.closing}</p>
              <p className="font-script text-3xl text-rose-500">
                {content.letter.signature}
              </p>
            </div>

            <div className="absolute bottom-0 right-0 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-rose-600 text-white shadow-lg shadow-rose-500/30 md:h-20 md:w-20">
              <Heart className="h-7 w-7 md:h-9 md:w-9" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
