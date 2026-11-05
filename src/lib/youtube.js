let ytPromise = null;

function isValidId(value) {
  return typeof value === "string" && /^[a-zA-Z0-9_-]{11}$/.test(value);
}

export function isYouTubeUrl(value) {
  if (!value || typeof value !== "string") return false;
  return /youtube\.com|youtu\.be/i.test(value);
}

export function getYouTubeId(value) {
  if (!value || typeof value !== "string") return "";

  const trimmed = value.trim();
  if (isValidId(trimmed)) return trimmed;

  let url;
  try {
    url = new URL(trimmed);
  } catch {
    return "";
  }

  const host = url.hostname.replace(/^www\./, "").replace(/^m\./, "");

  if (host === "youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return isValidId(id) ? id : "";
  }

  if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
    const queryId = url.searchParams.get("v");
    if (isValidId(queryId)) return queryId;

    const parts = url.pathname.split("/").filter(Boolean);
    if (
      ["embed", "shorts", "live", "v"].includes(parts[0]) &&
      isValidId(parts[1])
    ) {
      return parts[1];
    }
  }

  return "";
}

export function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (ytPromise) return ytPromise;

  ytPromise = new Promise((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      if (typeof previous === "function") previous();
      resolve(window.YT);
    };

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => {
      ytPromise = null;
      reject(new Error("YOUTUBE_API_FAILED"));
    };
    document.head.appendChild(script);
  });

  return ytPromise;
}
