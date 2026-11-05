import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useContent } from "../lib/content";
import { extractDriveFileId, resolveImageUrl } from "../lib/drive";
import { formatMomentDate } from "../lib/format";
import { monthLabel } from "../lib/months";
import SectionHeading from "./SectionHeading";
import { Close, Heart } from "./icons";

const gradients = [
  "from-pink-500/40 via-rose-500/25 to-rose-700/40",
  "from-rose-500/40 via-pink-400/25 to-pink-600/30",
  "from-pink-400/35 via-rose-600/30 to-rose-800/40",
  "from-rose-600/35 via-pink-500/25 to-pink-300/30",
  "from-rose-700/35 via-rose-500/30 to-pink-400/30",
  "from-pink-600/30 via-rose-500/25 to-rose-700/30",
];

const ratios = ["aspect-[3/4]", "aspect-square", "aspect-[4/5]"];

function Placeholder({ index }) {
  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br ${
        gradients[index % gradients.length]
      } p-6 text-center`}
    >
      <Heart className="h-8 w-8 text-white/40" />
      <span className="font-script text-2xl text-white/75">Momen Kita</span>
      <span className="text-[0.6rem] uppercase tracking-[0.3em] text-white/40">
        Parman & Ucha
      </span>
    </div>
  );
}

function Photo({ item, index, size = 1600 }) {
  const [failed, setFailed] = useState(!item.src);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setFailed(!item.src);
    setAttempt(0);
  }, [item.src]);

  const direct = resolveImageUrl(item.src, size);
  const driveId = extractDriveFileId(item.src);
  const candidates = driveId
    ? [
        direct,
        `https://drive.google.com/thumbnail?id=${driveId}&sz=w${size}`,
        `https://wsrv.nl/?url=${encodeURIComponent(
          `https://drive.google.com/thumbnail?id=${driveId}&sz=w${size}`
        )}`,
      ]
    : [direct];

  if (failed || !item.src) {
    return <Placeholder index={index} />;
  }

  const src = candidates[Math.min(attempt, candidates.length - 1)];

  return (
    <img
      src={src}
      alt={item.caption}
      referrerPolicy="no-referrer"
      decoding="async"
      onError={() => {
        if (attempt < candidates.length - 1) {
          setAttempt((value) => value + 1);
        } else {
          setFailed(true);
        }
      }}
      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
    />
  );
}

export default function Gallery() {
  const { content, moments, isRemote, selectedMonthId, months } = useContent();
  const [active, setActive] = useState(null);

  const visibleMoments = selectedMonthId
    ? moments.filter((moment) =>
        (moment.date || "").startsWith(selectedMonthId)
      )
    : moments;

  const items = isRemote
    ? visibleMoments.map((moment) => ({
        src: moment.photoUrl || "",
        caption: moment.caption || "Momen kita",
        date: formatMomentDate(moment.date),
      }))
    : content.gallery.items;

  useEffect(() => {
    if (active === null) return;

    const onKey = (event) => {
      if (event.key === "Escape") setActive(null);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [active]);

  const activeItem =
    active === null || !items[active] ? null : items[active];
  const activeDriveId = activeItem ? extractDriveFileId(activeItem.src) : "";

  return (
    <section id="gallery" className="relative px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow={content.gallery.eyebrow}
          title={content.gallery.title}
          description={content.gallery.description}
        />

        {!items.length ? (
          <p className="rounded-2xl border border-dashed border-rose-900/15 bg-white/50 px-6 py-14 text-center text-sm text-cream/50">
            {months.length && selectedMonthId
              ? `Belum ada momen foto di ${monthLabel(
                  selectedMonthId
                )}. Tambahkan lewat panel admin.`
              : "Belum ada momen foto. Tambahkan lewat panel admin."}
          </p>
        ) : null}

        <div className="columns-2 gap-4 [&>*]:mb-4 md:columns-3 md:gap-5 md:[&>*]:mb-5">
          {items.map((item, index) => (
            <motion.button
              key={`${item.caption}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.6,
                delay: (index % 3) * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={`group relative block w-full break-inside-avoid text-left transition-transform duration-300 hover:z-10 hover:-translate-y-1 hover:rotate-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50 ${
                index % 2 ? "rotate-[1.2deg]" : "-rotate-[1.2deg]"
              }`}
            >
              <div className="relative rounded-[1.4rem] border border-rose-900/10 bg-white p-2.5 pb-4 shadow-[0_14px_40px_-18px_rgba(142,14,53,0.45)]">
                <span
                  aria-hidden="true"
                  className={`absolute -top-2 left-1/2 z-10 h-5 w-16 -translate-x-1/2 -rotate-3 rounded-sm shadow-sm backdrop-blur ${
                    index % 2 ? "bg-pink-300/60" : "bg-rose-300/50"
                  }`}
                />
                <div
                  className={`relative w-full overflow-hidden rounded-xl ${
                    ratios[index % ratios.length]
                  }`}
                >
                  <Photo item={item} index={index} size={1200} />
                  <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/85 text-rose-500 shadow-sm backdrop-blur">
                    <Heart className="h-3.5 w-3.5" />
                  </span>
                </div>
                <div className="mt-3 px-1.5">
                  <p className="line-clamp-2 font-script text-xl leading-tight text-rose-700">
                    {item.caption}
                  </p>
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <p className="text-[0.6rem] uppercase tracking-[0.22em] text-rose-700/50">
                      {item.date}
                    </p>
                    <span className="text-[0.55rem] uppercase tracking-[0.18em] text-pink-500/70">
                      Buka
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activeItem ? (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.92, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onClick={(event) => event.stopPropagation()}
              className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-rose-900/15 bg-plum shadow-2xl shadow-rose-900/20"
            >
              <button
                type="button"
                onClick={() => setActive(null)}
                aria-label="Tutup foto"
                className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition hover:bg-black/70"
              >
                <Close className="h-4 w-4" />
              </button>

              <div className="group relative aspect-[4/3] w-full">
                <Photo item={activeItem} index={active} size={2000} />
              </div>

              <div className="flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="text-[0.6rem] uppercase tracking-[0.25em] text-rose-700/70">
                    {activeItem.date}
                  </p>
                  <p className="mt-1 font-serif text-lg text-cream">
                    {activeItem.caption}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {activeDriveId ? (
                    <a
                      href={`https://drive.google.com/file/d/${activeDriveId}/view`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-rose-700/80 underline underline-offset-2 transition hover:text-rose-800"
                    >
                      Buka di Drive
                    </a>
                  ) : null}
                  <Heart className="h-5 w-5 text-rose-500" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
