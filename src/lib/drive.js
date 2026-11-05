export const driveConfig = {
  folderId: (import.meta.env.VITE_DRIVE_FOLDER_ID || "").trim(),
  folderUrl: (import.meta.env.VITE_DRIVE_FOLDER_URL || "").trim(),
  uploadUrl: (import.meta.env.VITE_DRIVE_UPLOAD_URL || "").trim(),
  token: (import.meta.env.VITE_DRIVE_UPLOAD_TOKEN || "").trim(),
};

export const isDriveUploadConfigured = Boolean(
  driveConfig.uploadUrl && driveConfig.folderId
);

export function driveImageUrl(fileId, size = 1600) {
  if (!fileId) return "";
  return `https://lh3.googleusercontent.com/d/${fileId}=w${size}`;
}

export function extractDriveFileId(value) {
  if (!value || typeof value !== "string") return "";

  const patterns = [
    /lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]{10,})/,
    /\/file\/d\/([a-zA-Z0-9_-]{10,})/,
    /\/d\/([a-zA-Z0-9_-]{10,})/,
    /[?&]id=([a-zA-Z0-9_-]{10,})/,
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match) return match[1];
  }

  const trimmed = value.trim();
  if (/^[a-zA-Z0-9_-]{20,}$/.test(trimmed)) return trimmed;

  return "";
}

export function resolveImageUrl(value, size = 1600) {
  if (!value) return "";
  const fileId = extractDriveFileId(value);
  if (fileId) return driveImageUrl(fileId, size);
  return value;
}

function loadImageSource(file) {
  if ("createImageBitmap" in window) {
    return createImageBitmap(file, { imageOrientation: "from-image" }).catch(
      () => loadImageElement(file)
    );
  }

  return loadImageElement(file);
}

function loadImageElement(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Gagal membaca gambar."));
    };
    image.src = url;
  });
}

export async function compressImage(file, maxDimension = 1600, quality = 0.82) {
  if (
    !file ||
    !file.type.startsWith("image/") ||
    file.type === "image/gif" ||
    file.type === "image/svg+xml"
  ) {
    return file;
  }

  const source = await loadImageSource(file);
  const width = source.width;
  const height = source.height;
  const scale = Math.min(1, maxDimension / Math.max(width, height));

  if (scale === 1 && file.size <= 900 * 1024) {
    if (source.close) source.close();
    return file;
  }

  const targetWidth = Math.max(1, Math.round(width * scale));
  const targetHeight = Math.max(1, Math.round(height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    if (source.close) source.close();
    return file;
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, targetWidth, targetHeight);
  context.drawImage(source, 0, 0, targetWidth, targetHeight);
  if (source.close) source.close();

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality)
  );

  if (!blob) return file;

  const baseName = file.name.replace(/\.[^.]+$/, "") || "foto";
  return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      resolve(result.split(",")[1] || "");
    };
    reader.onerror = () => reject(new Error("Gagal membaca file."));
    reader.readAsDataURL(file);
  });
}

export async function uploadToDrive(file) {
  if (!isDriveUploadConfigured) {
    throw new Error("DRIVE_NOT_CONFIGURED");
  }

  const data = await fileToBase64(file);
  const response = await fetch(driveConfig.uploadUrl, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({
      token: driveConfig.token,
      folderId: driveConfig.folderId,
      filename: file.name || "foto.jpg",
      mimeType: file.type || "image/jpeg",
      data,
    }),
  });

  if (!response.ok) {
    throw new Error(`DRIVE_HTTP_${response.status}`);
  }

  const text = await response.text();
  let payload;

  try {
    payload = JSON.parse(text);
  } catch {
    throw new Error("DRIVE_RESPONSE_INVALID");
  }

  if (payload.error || !payload.id) {
    throw new Error(payload.error || "DRIVE_UPLOAD_FAILED");
  }

  return {
    fileId: payload.id,
    name: payload.name,
    url: driveImageUrl(payload.id),
  };
}

export async function testDriveConnection() {
  if (!isDriveUploadConfigured) {
    throw new Error("DRIVE_NOT_CONFIGURED");
  }

  const response = await fetch(driveConfig.uploadUrl, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({
      token: driveConfig.token,
      folderId: driveConfig.folderId,
      data: "",
    }),
  });

  if (!response.ok) {
    throw new Error(`DRIVE_HTTP_${response.status}`);
  }

  const text = await response.text();
  let payload;

  try {
    payload = JSON.parse(text);
  } catch {
    throw new Error("DRIVE_RESPONSE_INVALID");
  }

  if (payload.error === "Unauthorized") {
    throw new Error("DRIVE_UNAUTHORIZED");
  }

  if (payload.error === "Data gambar kosong") {
    return true;
  }

  if (payload.error) {
    throw new Error(payload.error);
  }

  return true;
}
