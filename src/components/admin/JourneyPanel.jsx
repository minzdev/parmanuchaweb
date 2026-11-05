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

export default function JourneyPanel({ monthId }) {
  const { content } = useContent();
  const [items, setItems] = useState(content.journey.items);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  const updateItem = (index, key, value) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [key]: value } : item))
    );
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { date: "", title: "", description: "" },
    ]);
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
        message: "Pilih edisi bulan dulu sebelum menyimpan perjalanan.",
      });
      return;
    }

    setSaving(true);
    setStatus(null);

    try {
      await setDoc(
        doc(db, "months", monthId),
        {
          journey: { ...content.journey, items },
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      setStatus({ type: "success", message: "Perjalanan berhasil disimpan." });
    } catch (error) {
      console.error(error);
      setStatus({ type: "error", message: "Gagal menyimpan perjalanan." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Panel
        title="Perjalanan Bulan Ini"
        description="Susun momen penting untuk edisi bulan ini. Urutan tampil sesuai daftar."
        actions={
          <button
            type="button"
            onClick={addItem}
            className={ghostButtonClass}
          >
            Tambah Item
          </button>
        }
      >
        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl border border-rose-900/10 bg-white/70 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[0.65rem] uppercase tracking-[0.2em] text-cream/35">
                  Item {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className={`${dangerButtonClass} px-3 py-1.5 text-xs`}
                >
                  Hapus
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Tanggal / label">
                  <TextInput
                    value={item.date}
                    onChange={(event) =>
                      updateItem(index, "date", event.target.value)
                    }
                    placeholder="4 Oktober 2026"
                  />
                </Field>
                <Field label="Judul">
                  <TextInput
                    value={item.title}
                    onChange={(event) =>
                      updateItem(index, "title", event.target.value)
                    }
                    placeholder="Hari Pertama"
                  />
                </Field>
                <div className="md:col-span-2">
                  <Field label="Cerita">
                    <TextArea
                      rows={2}
                      value={item.description}
                      onChange={(event) =>
                        updateItem(index, "description", event.target.value)
                      }
                      placeholder="Ceritakan momen ini"
                    />
                  </Field>
                </div>
              </div>
            </div>
          ))}

          {!items.length ? (
            <p className="rounded-2xl border border-dashed border-rose-900/15 px-4 py-8 text-center text-sm text-cream/40">
              Belum ada item perjalanan.
            </p>
          ) : null}
        </div>
      </Panel>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className={primaryButtonClass}>
          {saving ? "Menyimpan..." : "Simpan Perjalanan"}
        </button>
      </div>

      <StatusMessage status={status} />
    </form>
  );
}
