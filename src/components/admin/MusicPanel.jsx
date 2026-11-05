import { useRef, useState } from "react";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "../../lib/firebase";
import { useContent } from "../../lib/content";
import { getYouTubeId, isYouTubeUrl } from "../../lib/youtube";
import {
  Field,
  Panel,
  StatusMessage,
  TextInput,
  ghostButtonClass,
  primaryButtonClass,
} from "./ui";

const MAX_AUDIO_SIZE = 15 * 1024 * 1024;

export default function MusicPanel({ monthId }) {
  const { content } = useContent();
  const [music, setMusic] = useState(content.music);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const fileInputRef = useRef(null);
  const youtubeId = getYouTubeId(music.url);
  const looksYouTube = isYouTubeUrl(music.url);

  const handleFile = (event) => {
    const selected = event.target.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith("audio/")) {
      setStatus({ type: "error", message: "File harus berupa audio." });
      return;
    }

    if (selected.size > MAX_AUDIO_SIZE) {
      setStatus({ type: "error", message: "Ukuran audio maksimal 15 MB." });
      return;
    }

    setFile(selected);
    setStatus(null);
  };

  const handleUpload = async () => {
    if (!file || !storage) return;

    setUploading(true);
    setStatus(null);

    try {
      const path = `music/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      setMusic((prev) => ({ ...prev, url, enabled: true }));
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setStatus({
        type: "success",
        message: "Audio terunggah. Klik Simpan Musik untuk menerapkan.",
      });
    } catch (error) {
      console.error(error);
      setStatus({
        type: "error",
        message: "Gagal mengunggah audio. Periksa izin Storage.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (looksYouTube && !youtubeId) {
      setStatus({
        type: "error",
        message:
          "Link YouTube tidak valid. Gunakan link video, bukan link playlist, channel, atau homepage.",
      });
      return;
    }

    if (!db) return;

    if (!monthId) {
      setStatus({
        type: "error",
        message: "Pilih edisi bulan dulu sebelum menyimpan musik.",
      });
      return;
    }

    setSaving(true);
    setStatus(null);

    try {
      await setDoc(
        doc(db, "months", monthId),
        { music, updatedAt: serverTimestamp() },
        { merge: true }
      );
      setStatus({ type: "success", message: "Pengaturan musik tersimpan." });
    } catch (error) {
      console.error(error);
      setStatus({ type: "error", message: "Gagal menyimpan pengaturan musik." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Panel
        title="Backsound Bulan Ini"
        description="Tempel link YouTube atau URL audio langsung untuk edisi bulan ini. Tombol musik akan muncul jika backsound aktif."
      >
        <div className="mb-5 rounded-2xl border border-amber-600/20 bg-amber-50 p-4 text-xs leading-relaxed text-amber-800">
          Link YouTube diputar lewat pemutar resmi YouTube, jadi video harus
          publik dan mengizinkan embed. Upload file audio membutuhkan Firebase
          Storage yang sudah aktif.
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Judul lagu">
            <TextInput
              value={music.title || ""}
              onChange={(event) =>
                setMusic((prev) => ({ ...prev, title: event.target.value }))
              }
              placeholder="Lagu kita"
            />
          </Field>

          <Field
            label="URL audio / YouTube"
            hint="Contoh: https://youtu.be/xxxx atau https://contoh.com/lagu.mp3"
          >
            <TextInput
              value={music.url || ""}
              onChange={(event) =>
                setMusic((prev) => ({ ...prev, url: event.target.value }))
              }
              placeholder="https://youtu.be/..."
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="Unggah file audio" hint="MP3, WAV, atau M4A. Maksimal 15 MB.">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFile}
                className="w-full cursor-pointer rounded-xl border border-rose-900/15 bg-white/70 px-3.5 py-2.5 text-sm text-rose-900/60 file:mr-3 file:rounded-full file:border-0 file:bg-rose-500/15 file:px-3 file:py-1.5 file:text-xs file:text-rose-700"
              />
            </Field>
          </div>

          {file ? (
            <div className="md:col-span-2">
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                className={ghostButtonClass}
              >
                {uploading ? "Mengunggah..." : `Unggah ${file.name}`}
              </button>
            </div>
          ) : null}

          <label className="flex items-center gap-3 md:col-span-2">
            <input
              type="checkbox"
              checked={Boolean(music.enabled)}
              onChange={(event) =>
                setMusic((prev) => ({
                  ...prev,
                  enabled: event.target.checked,
                }))
              }
              className="h-4 w-4 rounded border-white/20 bg-ink accent-rose-500"
            />
            <span className="text-sm text-cream/70">
              Tampilkan tombol backsound di situs
            </span>
          </label>

          {music.url ? (
            <div className="md:col-span-2">
              <div className="mb-2 flex items-center gap-2">
                <p className="text-[0.65rem] uppercase tracking-[0.18em] text-cream/40">
                  Pratinjau
                </p>
                {youtubeId ? (
                  <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.15em] text-red-200">
                    YouTube
                  </span>
                ) : null}
              </div>

              {youtubeId ? (
                <iframe
                  title="Pratinjau backsound YouTube"
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="aspect-video w-full max-w-xl rounded-2xl border border-rose-900/10"
                />
              ) : (
                <audio controls src={music.url} className="w-full">
                  Browser kamu tidak mendukung pemutar audio.
                </audio>
              )}

              {looksYouTube && !youtubeId ? (
                <p className="mt-2 text-xs text-rose-700">
                  Link YouTube tidak valid. Gunakan link video, bukan playlist
                  atau channel.
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </Panel>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className={primaryButtonClass}>
          {saving ? "Menyimpan..." : "Simpan Musik"}
        </button>
      </div>

      <StatusMessage status={status} />
    </form>
  );
}
