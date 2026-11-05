import { useRef, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useContent } from "../../lib/content";
import {
  compressImage,
  driveConfig,
  extractDriveFileId,
  isDriveUploadConfigured,
  resolveImageUrl,
  testDriveConnection,
  uploadToDrive,
} from "../../lib/drive";
import {
  connectDrive,
  disconnectDrive,
  isDriveConnected,
  isDriveOAuthConfigured,
  uploadToDriveOAuth,
} from "../../lib/driveOAuth";
import { formatMomentDate, toDateInputValue } from "../../lib/format";
import { monthLabel } from "../../lib/months";
import {
  Field,
  Panel,
  StatusMessage,
  TextInput,
  dangerButtonClass,
  ghostButtonClass,
  primaryButtonClass,
} from "./ui";

const MAX_IMAGE_SIZE = 15 * 1024 * 1024;

function defaultDateForMonth(monthId) {
  const today = toDateInputValue(new Date().toISOString());
  return monthId && today.slice(0, 7) !== monthId
    ? `${monthId}-01`
    : today;
}

function describeError(error) {
  const code = error?.code || "";
  const message = String(error?.message || "");
  const status = Number(error?.status || 0);
  const detail = String(error?.detail || "");
  const lowerDetail = detail.toLowerCase();

  if (status === 401) {
    return "Sesi Google Drive berakhir. Klik Hubungkan Google Drive lagi.";
  }
  if (status === 403) {
    if (
      lowerDetail.includes("has not been used in project") ||
      lowerDetail.includes("accessnotconfigured") ||
      lowerDetail.includes("disabled")
    ) {
      return "Google Drive API belum diaktifkan di Google Cloud project. Aktifkan Google Drive API lalu coba lagi.";
    }
    if (
      lowerDetail.includes("insufficient") ||
      lowerDetail.includes("permission") ||
      lowerDetail.includes("cannot")
    ) {
      return `Akun Google tidak punya izin mengedit folder Drive. Share folder ke akun yang terhubung dengan akses Editor.${
        detail ? ` (${detail})` : ""
      }`;
    }
    return `Google Drive menolak akses (403).${
      detail ? ` ${detail}` : " Periksa izin folder Drive."
    }`;
  }
  if (status === 404) {
    return "Folder atau file Drive tidak ditemukan, atau akun tidak punya akses. Pastikan folder di-share Editor dan folder ID benar.";
  }
  if (status === 429) {
    return "Terlalu banyak permintaan ke Google Drive. Coba lagi beberapa saat.";
  }
  if (status >= 500) {
    return "Server Google Drive sedang bermasalah. Coba lagi.";
  }
  if (message.includes("DRIVE_FOLDER_NO_ACCESS")) {
    return "Folder Drive tidak bisa diedit oleh akun Google yang terhubung. Share folder dengan akses Editor, lalu hubungkan ulang.";
  }
  if (message.includes("DRIVE_FOLDER_NOT_SET")) {
    return "Folder Drive belum diset. Isi VITE_DRIVE_FOLDER_ID di .env.";
  }
  if (code === "permission-denied") {
    return "Izin Firestore ditolak. Deploy firestore.rules ke project Firebase.";
  }
  if (code === "unavailable") {
    return "Koneksi ke server gagal. Periksa internet lalu coba lagi.";
  }
  if (message.includes("DRIVE_NOT_CONFIGURED")) {
    return "Google Drive belum dikonfigurasi di .env.";
  }
  if (message.includes("DRIVE_OAUTH_NOT_CONFIGURED")) {
    return "OAuth Drive belum dikonfigurasi. Isi VITE_GOOGLE_CLIENT_ID di .env.";
  }
  if (message.includes("DRIVE_OAUTH_REQUIRED")) {
    return "Klik Hubungkan Google Drive dulu sebelum upload foto.";
  }
  if (message.includes("DRIVE_OAUTH_EXPIRED")) {
    return "Sesi Google Drive berakhir. Klik Hubungkan Google Drive lagi.";
  }
  if (message.includes("DRIVE_OAUTH_PERMISSION_FAILED")) {
    return "Foto terupload, tapi gagal dijadikan publik. Periksa izin file di Drive.";
  }
  if (message.includes("DRIVE_OAUTH_HTTP_")) {
    return "Upload ke Google Drive ditolak. Periksa izin akun dan folder Drive.";
  }
  if (message.includes("DRIVE_OAUTH_UPLOAD_FAILED")) {
    return "Google Drive tidak mengembalikan ID file. Coba upload ulang.";
  }
  if (message.includes("GOOGLE_SCRIPT_FAILED")) {
    return "Gagal memuat Google Identity. Periksa koneksi internet lalu coba lagi.";
  }
  if (message.includes("access_denied")) {
    return "Izin Google Drive ditolak. Coba hubungkan lagi dan setujui akses.";
  }
  if (message.includes("popup_closed")) {
    return "Jendela izin Google ditutup. Klik Hubungkan Google Drive lagi.";
  }
  if (message.includes("invalid_client")) {
    return "OAuth Client ID tidak valid. Periksa VITE_GOOGLE_CLIENT_ID di .env.";
  }
  if (message.includes("redirect_uri_mismatch")) {
    return "Origin http://localhost:5173 belum ditambahkan di Authorized JavaScript origins pada OAuth Client ID.";
  }
  if (message.includes("idpiframe_initialization_failed")) {
    return "Google Identity gagal dimuat. Periksa cookie pihak ketiga dan koneksi internet.";
  }
  if (message.includes("DRIVE_OAUTH_FAILED")) {
    return "Gagal menghubungkan Google Drive. Coba klik Hubungkan lagi.";
  }
  if (message.includes("DRIVE_HTTP_403")) {
    return "Google Drive menolak akses (403). Buka Apps Script → Deploy → Manage deployments → Who has access = Anyone, lalu deploy ulang.";
  }
  if (message.includes("DRIVE_HTTP_401")) {
    return "Google Drive menolak akses (401). Periksa pengaturan deployment Apps Script.";
  }
  if (message.includes("DRIVE_UNAUTHORIZED")) {
    return "Token upload Drive tidak cocok dengan Script Property UPLOAD_TOKEN.";
  }
  if (message.includes("DRIVE_RESPONSE_INVALID")) {
    return "Respons Drive bukan JSON. Pastikan URL berakhiran /exec dan akses web app = Anyone.";
  }
  if (
    message.includes("DRIVE_UPLOAD_FAILED") ||
    message.includes("Failed to fetch") ||
    message.includes("NetworkError")
  ) {
    return "Koneksi ke Google Drive gagal (CORS/403). Set deployment Apps Script ke Anyone, lalu coba lagi.";
  }

  return "Gagal menyimpan momen. Periksa koneksi dan konfigurasi Firebase/Drive.";
}

export default function MomentsPanel({ monthId }) {
  const { moments } = useContent();
  const monthMoments = moments.filter((moment) =>
    (moment.date || "").startsWith(monthId)
  );
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    caption: "",
    date: defaultDateForMonth(monthId),
    photoUrl: "",
  });
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [testingDrive, setTestingDrive] = useState(false);
  const [oauthConnected, setOauthConnected] = useState(isDriveConnected());
  const [connectingDrive, setConnectingDrive] = useState(false);
  const [status, setStatus] = useState(null);

  const canUpload = isDriveOAuthConfigured
    ? oauthConnected
    : isDriveUploadConfigured;

  const handleConnectDrive = async () => {
    setConnectingDrive(true);
    setStatus({ type: "info", message: "Membuka izin Google Drive..." });

    try {
      await connectDrive();
      setOauthConnected(true);
      setStatus({
        type: "success",
        message: "Google Drive terhubung. Sekarang foto bisa diupload.",
      });
    } catch (error) {
      console.error(error);
      setOauthConnected(false);
      setStatus({ type: "error", message: describeError(error) });
    } finally {
      setConnectingDrive(false);
    }
  };

  const handleDisconnectDrive = () => {
    disconnectDrive();
    setOauthConnected(false);
    setStatus({ type: "info", message: "Koneksi Google Drive diputus." });
  };

  const handleTestDrive = async () => {
    setTestingDrive(true);
    setStatus({ type: "info", message: "Menguji koneksi Google Drive..." });

    try {
      await testDriveConnection();
      setStatus({
        type: "success",
        message: "Google Drive terhubung dan token valid.",
      });
    } catch (error) {
      console.error(error);
      setStatus({ type: "error", message: describeError(error) });
    } finally {
      setTestingDrive(false);
    }
  };

  const resetForm = () => {
    if (filePreview.startsWith("blob:")) URL.revokeObjectURL(filePreview);
    setForm({
      caption: "",
      date: defaultDateForMonth(monthId),
      photoUrl: "",
    });
    setFile(null);
    setFilePreview("");
    setEditingId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFile = (event) => {
    const selected = event.target.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      setStatus({ type: "error", message: "File harus berupa gambar." });
      return;
    }

    if (selected.size > MAX_IMAGE_SIZE) {
      setStatus({ type: "error", message: "Ukuran gambar maksimal 15 MB." });
      return;
    }

    if (filePreview.startsWith("blob:")) URL.revokeObjectURL(filePreview);
    setFile(selected);
    setFilePreview(URL.createObjectURL(selected));
    setStatus(null);
  };

  const startEdit = (moment) => {
    if (filePreview.startsWith("blob:")) URL.revokeObjectURL(filePreview);
    setEditingId(moment.id);
    setForm({
      caption: moment.caption || "",
      date: moment.date || defaultDateForMonth(monthId),
      photoUrl: moment.photoUrl || "",
    });
    setFile(null);
    setFilePreview("");
    setStatus(null);
    document
      .getElementById("moment-form")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.caption.trim() || !form.date) {
      setStatus({
        type: "error",
        message: "Keterangan dan tanggal momen wajib diisi.",
      });
      return;
    }

    if (!file && form.photoUrl.includes("/folders/")) {
      setStatus({
        type: "error",
        message:
          "Itu link folder Drive. Gunakan link file fotonya, bukan link folder.",
      });
      return;
    }

    if (file && isDriveOAuthConfigured && !isDriveConnected()) {
      setOauthConnected(false);
      setStatus({
        type: "error",
        message:
          "Sesi Google Drive belum terhubung. Klik Hubungkan Google Drive dulu.",
      });
      return;
    }

    if (file && !isDriveOAuthConfigured && !isDriveUploadConfigured) {
      setStatus({
        type: "error",
        message:
          "Google Drive belum aktif. Gunakan link Drive manual atau isi konfigurasi Drive di .env.",
      });
      return;
    }

    if (!db) return;

    setSaving(true);
    setStatus(null);

    try {
      let photoUrl = form.photoUrl.trim()
        ? resolveImageUrl(form.photoUrl.trim(), 2000)
        : "";
      let driveNote = "";

      if (file) {
        const prepared = await compressImage(file);

        if (isDriveOAuthConfigured) {
          const uploaded = await uploadToDriveOAuth(
            prepared,
            driveConfig.folderId
          );
          photoUrl = uploaded.url;
          driveNote = uploaded.permissionWarning
            ? " Foto masuk Drive, tapi gagal dijadikan publik. Set manual 'Anyone with link' di Drive."
            : " Foto tersimpan di Google Drive.";
        } else {
          const uploaded = await uploadToDrive(prepared);
          photoUrl = uploaded.url;
          driveNote = " Foto tersimpan di Google Drive.";
        }
      }

      const payload = {
        caption: form.caption.trim(),
        date: form.date,
        photoUrl,
        updatedAt: serverTimestamp(),
      };

      const savedMonth = form.date.slice(0, 7);
      const monthNote =
        monthId && savedMonth !== monthId
          ? ` Momen masuk ke ${monthLabel(savedMonth)}.`
          : "";

      if (editingId) {
        await updateDoc(doc(db, "moments", editingId), payload);
        setStatus({
          type: "success",
          message: `Momen berhasil diperbarui.${driveNote}${monthNote}`,
        });
      } else {
        await addDoc(collection(db, "moments"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        setStatus({
          type: "success",
          message: `Momen baru ditambahkan.${driveNote}${monthNote}`,
        });
      }

      resetForm();
    } catch (error) {
      console.error(error);
      const message = String(error?.message || "");
      if (
        message.includes("DRIVE_OAUTH_REQUIRED") ||
        message.includes("DRIVE_OAUTH_EXPIRED")
      ) {
        setOauthConnected(false);
      }
      setStatus({ type: "error", message: describeError(error) });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (moment) => {
    if (!db) return;
    if (!window.confirm("Hapus momen ini?")) return;

    try {
      await deleteDoc(doc(db, "moments", moment.id));
      setStatus({ type: "success", message: "Momen berhasil dihapus." });
    } catch (error) {
      console.error(error);
      setStatus({ type: "error", message: describeError(error) });
    }
  };

  const previewSrc =
    filePreview || (form.photoUrl ? resolveImageUrl(form.photoUrl, 800) : "");

  return (
    <div className="space-y-6">
      <div id="moment-form">
        <Panel
          title={editingId ? "Edit Momen" : `Tambah Momen · ${monthLabel(monthId)}`}
          description="Foto dikompres otomatis, disimpan ke Google Drive, lalu dikelompokkan ke bulan sesuai tanggal momen."
        >
          <div
            className={`mb-5 rounded-2xl border p-4 text-xs leading-relaxed ${
              canUpload
                ? "border-emerald-600/20 bg-emerald-50 text-emerald-800"
                : "border-amber-600/20 bg-amber-50 text-amber-800"
            }`}
          >
            <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
              <span>
                {isDriveOAuthConfigured
                  ? oauthConnected
                    ? "Google Drive terhubung. Foto baru akan langsung masuk ke folder Drive."
                    : "Hubungkan Google Drive sekali, lalu setiap foto otomatis tersimpan ke folder Drive. Akun yang dipilih harus punya akses Editor ke folder."
                  : isDriveUploadConfigured
                    ? "Google Drive aktif lewat Apps Script. Foto baru akan diunggah ke folder Drive."
                    : "Google Drive belum aktif. Kamu masih bisa menempel link file Drive secara manual."}
              </span>
              {driveConfig.folderUrl ? (
                <a
                  href={driveConfig.folderUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-current/40 underline-offset-2 hover:opacity-70"
                >
                  Buka folder Drive
                </a>
              ) : null}
              {isDriveOAuthConfigured ? (
                <>
                  <button
                    type="button"
                    onClick={handleConnectDrive}
                    disabled={connectingDrive}
                    className="rounded-full border border-current/30 px-3 py-1 text-[0.65rem] font-medium transition hover:bg-white/50 disabled:opacity-50"
                  >
                    {connectingDrive
                      ? "Menghubungkan..."
                      : oauthConnected
                        ? "Hubungkan Ulang"
                        : "Hubungkan Google Drive"}
                  </button>
                  {oauthConnected ? (
                    <button
                      type="button"
                      onClick={handleDisconnectDrive}
                      className="rounded-full border border-current/20 px-3 py-1 text-[0.65rem] font-medium transition hover:bg-white/50"
                    >
                      Putuskan
                    </button>
                  ) : null}
                </>
              ) : isDriveUploadConfigured ? (
                <button
                  type="button"
                  onClick={handleTestDrive}
                  disabled={testingDrive}
                  className="rounded-full border border-current/20 px-3 py-1 text-[0.65rem] font-medium transition hover:bg-white/50 disabled:opacity-50"
                >
                  {testingDrive ? "Menguji..." : "Tes koneksi Drive"}
                </button>
              ) : null}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <Field label="Keterangan momen">
              <TextInput
                value={form.caption}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, caption: event.target.value }))
                }
                placeholder="Contoh: Jalan sore keliling kota"
                required
              />
            </Field>

            <Field
              label="Tanggal"
              hint="Momen otomatis masuk ke bulan sesuai tanggal ini."
            >
              <TextInput
                type="date"
                value={form.date}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, date: event.target.value }))
                }
                required
              />
            </Field>

            <div className="md:col-span-2">
              <Field
                label="Link foto Google Drive"
                hint="Tempel link file Drive yang sudah dibagikan ke publik. Kosongkan jika upload file baru."
              >
                <TextInput
                  type="url"
                  value={form.photoUrl}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      photoUrl: event.target.value,
                    }))
                  }
                  placeholder="https://drive.google.com/file/d/..."
                />
              </Field>
            </div>

            <div className="md:col-span-2">
              <Field
                label="Upload foto baru"
                hint={
                  canUpload
                    ? "JPG, PNG, atau WEBP. Maksimal 15 MB. Otomatis dikompres ke maksimal 1600px."
                    : isDriveOAuthConfigured
                      ? "Klik Hubungkan Google Drive dulu untuk mengaktifkan upload."
                      : "Google Drive belum aktif. Gunakan link Drive manual di atas."
                }
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                  disabled={!canUpload}
                  className="w-full cursor-pointer rounded-xl border border-rose-900/15 bg-white/70 px-3.5 py-2.5 text-sm text-rose-900/60 file:mr-3 file:rounded-full file:border-0 file:bg-rose-500/15 file:px-3 file:py-1.5 file:text-xs file:text-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
                />
              </Field>
            </div>

            {previewSrc ? (
              <div className="md:col-span-2">
                <p className="mb-2 text-[0.65rem] uppercase tracking-[0.18em] text-cream/40">
                  Pratinjau
                </p>
                <img
                  src={previewSrc}
                  alt="Pratinjau momen"
                  referrerPolicy="no-referrer"
                  className="h-48 w-full rounded-2xl border border-rose-900/10 object-cover md:w-80"
                />
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-2 md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className={primaryButtonClass}
              >
                {saving
                  ? "Menyimpan..."
                  : editingId
                    ? "Simpan Perubahan"
                    : "Tambah Momen"}
              </button>

              {editingId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className={ghostButtonClass}
                >
                  Batal Edit
                </button>
              ) : null}
            </div>
          </form>

          <StatusMessage status={status} />
        </Panel>
      </div>

      <Panel
        title={`Momen ${monthLabel(monthId)}`}
        description={`${monthMoments.length} momen di edisi ini. Momen terbaru muncul lebih dulu.`}
      >
        {monthMoments.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {monthMoments.map((moment) => {
              const onDrive = Boolean(extractDriveFileId(moment.photoUrl));

              return (
                <article
                  key={moment.id}
                  className="overflow-hidden rounded-2xl border border-rose-900/10 bg-white/70"
                >
                  <div className="relative aspect-[4/3] w-full bg-plum">
                    {moment.photoUrl ? (
                      <img
                        src={resolveImageUrl(moment.photoUrl, 1000)}
                        alt={moment.caption}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-500/30 to-fuchsia-500/20 text-sm text-white/60">
                        Tanpa foto
                      </div>
                    )}
                    {onDrive ? (
                      <span className="absolute left-2 top-2 rounded-full bg-emerald-500/80 px-2 py-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.15em] text-white backdrop-blur">
                        Drive
                      </span>
                    ) : null}
                  </div>

                  <div className="p-4">
                    <p className="text-[0.6rem] uppercase tracking-[0.22em] text-rose-700/70">
                      {formatMomentDate(moment.date)}
                    </p>
                    <p className="mt-1 font-serif text-base text-cream">
                      {moment.caption}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(moment)}
                        className={ghostButtonClass}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(moment)}
                        className={dangerButtonClass}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-rose-900/15 px-4 py-10 text-center text-sm text-cream/40">
            Belum ada momen di {monthLabel(monthId)}. Tambahkan foto kegiatan
            kalian di atas.
          </p>
        )}
      </Panel>
    </div>
  );
}
