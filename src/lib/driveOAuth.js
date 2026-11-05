import { driveConfig, driveImageUrl } from "./drive";

const clientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim();
const scope = "https://www.googleapis.com/auth/drive";

export const isDriveOAuthConfigured = Boolean(clientId);

let tokenState = { accessToken: "", expiresAt: 0 };
let gisPromise = null;

function loadGis() {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (gisPromise) return gisPromise;

  gisPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("GOOGLE_SCRIPT_FAILED"));
    document.head.appendChild(script);
  });

  return gisPromise;
}

export function getDriveToken() {
  if (!tokenState.accessToken) return "";
  if (Date.now() >= tokenState.expiresAt - 60000) return "";
  return tokenState.accessToken;
}

export function isDriveConnected() {
  return Boolean(getDriveToken());
}

async function responseError(response, prefix = "DRIVE_OAUTH_HTTP") {
  let detail = "";

  try {
    const payload = await response.json();
    detail = payload?.error?.message || "";
  } catch {
    detail = "";
  }

  const error = new Error(`${prefix}_${response.status}`);
  error.status = response.status;
  error.detail = detail;
  return error;
}

export async function verifyDriveFolder(folderId) {
  const token = getDriveToken();
  if (!token) throw new Error("DRIVE_OAUTH_REQUIRED");

  const id = folderId || driveConfig.folderId;
  if (!id) throw new Error("DRIVE_FOLDER_NOT_SET");

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
      id
    )}?fields=id,name,capabilities(canAddChildren)&supportsAllDrives=true`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!response.ok) {
    throw await responseError(response);
  }

  const payload = await response.json();

  if (!payload.capabilities || payload.capabilities.canAddChildren !== true) {
    const error = new Error("DRIVE_FOLDER_NO_ACCESS");
    error.status = 403;
    error.detail = payload.name ? `Folder: ${payload.name}` : "";
    throw error;
  }

  return payload;
}

export async function connectDrive() {
  if (!isDriveOAuthConfigured) {
    throw new Error("DRIVE_OAUTH_NOT_CONFIGURED");
  }

  await loadGis();

  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope,
      callback: async (response) => {
        if (response.error || !response.access_token) {
          reject(new Error(response.error || "DRIVE_OAUTH_FAILED"));
          return;
        }

        const expiresIn = Number(response.expires_in || 3600);
        tokenState = {
          accessToken: response.access_token,
          expiresAt: Date.now() + expiresIn * 1000,
        };

        try {
          if (driveConfig.folderId) {
            await verifyDriveFolder(driveConfig.folderId);
          }
          resolve(tokenState.accessToken);
        } catch (error) {
          reject(error);
        }
      },
    });

    client.requestAccessToken({ prompt: "" });
  });
}

export function disconnectDrive() {
  const token = tokenState.accessToken;
  tokenState = { accessToken: "", expiresAt: 0 };

  if (token && window.google?.accounts?.oauth2) {
    window.google.accounts.oauth2.revoke(token, () => {});
  }
}

async function makePublic(fileId, token) {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}/permissions?supportsAllDrives=true&fields=id`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role: "reader", type: "anyone" }),
    }
  );

  if (!response.ok) {
    throw await responseError(response);
  }
}

export async function uploadToDriveOAuth(file, folderId) {
  const token = getDriveToken();

  if (!token) {
    throw new Error("DRIVE_OAUTH_REQUIRED");
  }

  const mimeType = file.type || "image/jpeg";
  const metadata = {
    name: file.name || `foto-${Date.now()}.jpg`,
    mimeType,
    parents: folderId ? [folderId] : undefined,
  };

  const boundary = `-------mansiv${Date.now()}`;
  const body = new Blob([
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(
      metadata
    )}\r\n`,
    `--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`,
    file,
    `\r\n--${boundary}--`,
  ]);

  const response = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true&fields=id,name",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body,
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      tokenState = { accessToken: "", expiresAt: 0 };
      throw new Error("DRIVE_OAUTH_EXPIRED");
    }
    throw await responseError(response);
  }

  const payload = await response.json();

  if (!payload.id) {
    throw new Error("DRIVE_OAUTH_UPLOAD_FAILED");
  }

  let permissionWarning = false;

  try {
    await makePublic(payload.id, token);
  } catch (error) {
    console.error(error);
    permissionWarning = true;
  }

  return {
    fileId: payload.id,
    name: payload.name,
    url: driveImageUrl(payload.id),
    permissionWarning,
  };
}
