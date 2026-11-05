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

export default function ReasonsPanel({ monthId }) {
  const { content } = useContent();
  const [items, setItems] = useState(content.reasons.items);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  const updateItem = (index, key, value) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [key]: value } : item))
    );
  };

  const addItem = () => {
    setItems((prev) => [...prev, { title: "", text: "" }]);
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!db) return;

    if (!monthId) {
      setStatus({
        type: "error",
        message: "Pilih edisi bulan dulu sebelum menyimpan alasan.",
      });
      return;
    }

    setSaving(true);
    setStatus(null);

    try {
      await setDoc(
        doc(db, "months", monthId),
        {
          reasons: { ...content.reasons, items },
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      setStatus({ type: "success", message: "Alasan berhasil disimpan." });
    } catch (error) {
      console.error(error);
      setStatus({ type: "error", message: "Gagal menyimpan alasan." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Panel
        title="Alasan Sayang Bulan Ini"
        description="Hal-hal kecil yang membuat kamu jatuh hati di edisi bulan ini."
        actions={
          <button
            type="button"
            onClick={addItem}
            className={ghostButtonClass}
          >
            Tambah Alasan
          </button>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl border border-rose-900/10 bg-white/70 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[0.65rem] uppercase tracking-[0.2em] text-cream/35">
                  Alasan {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className={`${dangerButtonClass} px-3 py-1.5 text-xs`}
                >
                  Hapus
                </button>
              </div>

              <div className="space-y-3">
                <Field label="Judul">
                  <TextInput
                    value={item.title}
                    onChange={(event) =>
                      updateItem(index, "title", event.target.value)
                    }
                    placeholder="Senyummu"
                  />
                </Field>
                <Field label="Penjelasan">
                  <TextArea
                    rows={3}
                    value={item.text}
                    onChange={(event) =>
                      updateItem(index, "text", event.target.value)
                    }
                    placeholder="Ceritakan alasannya"
                  />
                </Field>
              </div>
            </div>
          ))}

          {!items.length ? (
            <p className="rounded-2xl border border-dashed border-rose-900/15 px-4 py-8 text-center text-sm text-cream/40 md:col-span-2">
              Belum ada alasan.
            </p>
          ) : null}
        </div>
      </Panel>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className={primaryButtonClass}>
          {saving ? "Menyimpan..." : "Simpan Alasan"}
        </button>
      </div>

      <StatusMessage status={status} />
    </form>
  );
}
