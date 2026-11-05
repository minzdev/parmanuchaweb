import { useState } from "react";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useContent } from "../../lib/content";
import { toDateInputValue } from "../../lib/format";
import {
  Field,
  Panel,
  StatusMessage,
  TextInput,
  primaryButtonClass,
} from "./ui";

export default function SettingsPanel() {
  const { content } = useContent();
  const [form, setForm] = useState({
    partnerOne: content.partnerOne,
    partnerTwo: content.partnerTwo,
    startDate: toDateInputValue(content.startDate),
  });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!db) return;

    setSaving(true);
    setStatus(null);

    try {
      const startDate = form.startDate
        ? `${form.startDate}T00:00:00+07:00`
        : content.startDate;

      await setDoc(
        doc(db, "site", "main"),
        {
          partnerOne: form.partnerOne.trim(),
          partnerTwo: form.partnerTwo.trim(),
          startDate,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      setStatus({ type: "success", message: "Pengaturan berhasil disimpan." });
    } catch (error) {
      console.error(error);
      setStatus({ type: "error", message: "Gagal menyimpan pengaturan." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Panel
        title="Pengaturan Dasar"
        description="Nama pasangan dan tanggal jadian. Berlaku untuk semua edisi bulan; konten per bulan diatur di tab Bulan."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Nama pertama">
            <TextInput
              value={form.partnerOne}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, partnerOne: event.target.value }))
              }
              placeholder="Parman"
            />
          </Field>

          <Field label="Nama kedua">
            <TextInput
              value={form.partnerTwo}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, partnerTwo: event.target.value }))
              }
              placeholder="Ucha"
            />
          </Field>

          <Field label="Tanggal jadian" hint="Dihitung mulai pukul 00.00 WIB.">
            <TextInput
              type="date"
              value={form.startDate}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, startDate: event.target.value }))
              }
            />
          </Field>
        </div>
      </Panel>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className={primaryButtonClass}>
          {saving ? "Menyimpan..." : "Simpan Pengaturan"}
        </button>
      </div>

      <StatusMessage status={status} />
    </form>
  );
}
