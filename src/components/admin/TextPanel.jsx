import { useState } from "react";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useContent } from "../../lib/content";
import {
  Field,
  Panel,
  StatusMessage,
  TextArea,
  TextInput,
  dangerButtonClass,
  ghostButtonClass,
  primaryButtonClass,
} from "./ui";

export default function TextPanel({ monthId }) {
  const { content } = useContent();
  const [hero, setHero] = useState(content.hero);
  const [letter, setLetter] = useState(content.letter);
  const [closing, setClosing] = useState(content.closing);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  const updateParagraph = (index, value) => {
    setLetter((prev) => ({
      ...prev,
      paragraphs: prev.paragraphs.map((paragraph, i) =>
        i === index ? value : paragraph
      ),
    }));
  };

  const addParagraph = () => {
    setLetter((prev) => ({
      ...prev,
      paragraphs: [...prev.paragraphs, ""],
    }));
  };

  const removeParagraph = (index) => {
    setLetter((prev) => ({
      ...prev,
      paragraphs: prev.paragraphs.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!db) return;

    if (!monthId) {
      setStatus({
        type: "error",
        message: "Pilih edisi bulan dulu sebelum menyimpan ucapan.",
      });
      return;
    }

    setSaving(true);
    setStatus(null);

    try {
      await setDoc(
        doc(db, "months", monthId),
        { hero, letter, closing, updatedAt: serverTimestamp() },
        { merge: true }
      );
      setStatus({
        type: "success",
        message: "Ucapan dan surat edisi ini berhasil disimpan.",
      });
    } catch (error) {
      console.error(error);
      setStatus({ type: "error", message: "Gagal menyimpan perubahan." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Panel
        title="Tampilan Depan"
        description="Judul utama untuk edisi bulan ini. Judul otomatis menyesuaikan bulan, tapi tetap bisa diubah."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Badge tanggal">
            <TextInput
              value={hero.badge}
              onChange={(event) =>
                setHero((prev) => ({ ...prev, badge: event.target.value }))
              }
            />
          </Field>

          <Field label="Tulisan script">
            <TextInput
              value={hero.script}
              onChange={(event) =>
                setHero((prev) => ({ ...prev, script: event.target.value }))
              }
            />
          </Field>

          <Field label="Judul besar">
            <TextInput
              value={hero.title}
              onChange={(event) =>
                setHero((prev) => ({ ...prev, title: event.target.value }))
              }
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="Subjudul">
              <TextArea
                rows={3}
                value={hero.subtitle}
                onChange={(event) =>
                  setHero((prev) => ({ ...prev, subtitle: event.target.value }))
                }
              />
            </Field>
          </div>
        </div>
      </Panel>

      <Panel
        title="Surat & Ucapan"
        description="Ucapan yang tampil di bagian surat. Kamu bisa menambah atau menghapus paragraf."
      >
        <div className="space-y-4">
          <Field label="Sapaan">
            <TextInput
              value={letter.greeting}
              onChange={(event) =>
                setLetter((prev) => ({
                  ...prev,
                  greeting: event.target.value,
                }))
              }
            />
          </Field>

          <div>
            <p className="mb-2 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-cream/45">
              Paragraf surat
            </p>
            <div className="space-y-3">
              {letter.paragraphs.map((paragraph, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="mt-3 w-5 shrink-0 text-center text-xs text-cream/30">
                    {index + 1}
                  </span>
                  <TextArea
                    rows={4}
                    value={paragraph}
                    onChange={(event) =>
                      updateParagraph(index, event.target.value)
                    }
                  />
                  <button
                    type="button"
                    onClick={() => removeParagraph(index)}
                    className={`${dangerButtonClass} mt-1 shrink-0 px-3 py-2`}
                    aria-label={`Hapus paragraf ${index + 1}`}
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addParagraph}
              className={`${ghostButtonClass} mt-3`}
            >
              Tambah Paragraf
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Penutup">
              <TextInput
                value={letter.closing}
                onChange={(event) =>
                  setLetter((prev) => ({
                    ...prev,
                    closing: event.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Tanda tangan">
              <TextInput
                value={letter.signature}
                onChange={(event) =>
                  setLetter((prev) => ({
                    ...prev,
                    signature: event.target.value,
                  }))
                }
              />
            </Field>
          </div>
        </div>
      </Panel>

      <Panel
        title="Penutup Situs"
        description="Bagian terakhir sebelum footer."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Tulisan script">
            <TextInput
              value={closing.script}
              onChange={(event) =>
                setClosing((prev) => ({ ...prev, script: event.target.value }))
              }
            />
          </Field>
          <Field label="Judul penutup">
            <TextInput
              value={closing.title}
              onChange={(event) =>
                setClosing((prev) => ({ ...prev, title: event.target.value }))
              }
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Deskripsi">
              <TextArea
                rows={3}
                value={closing.description}
                onChange={(event) =>
                  setClosing((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
              />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Footer">
              <TextInput
                value={closing.footnote}
                onChange={(event) =>
                  setClosing((prev) => ({
                    ...prev,
                    footnote: event.target.value,
                  }))
                }
              />
            </Field>
          </div>
        </div>
      </Panel>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className={primaryButtonClass}>
          {saving ? "Menyimpan..." : "Simpan Ucapan"}
        </button>
      </div>

      <StatusMessage status={status} />
    </form>
  );
}
