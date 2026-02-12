import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || "https://server1-etech.vercel.app";

export function normalizeMediaUrl(raw?: string | null) {
  if (!raw) return "";
  let url = raw.trim();
  if (!url) return "";
  
  // If it's already a full URL (http:// or https://)
  if (url.startsWith('http://') || url.startsWith('https://')) {
     return url;
  }

  if (import.meta.env.VITE_BACKEND_URL && url.startsWith(import.meta.env.VITE_BACKEND_URL)) {
      url = url.replace(import.meta.env.VITE_BACKEND_URL, "");
  }

  // Handle paths starting with /media, /static, /uploads or just filenames
  const baseUrl = BACKEND_BASE_URL.endsWith('/') ? BACKEND_BASE_URL.slice(0, -1) : BACKEND_BASE_URL;
  
  // Clean up leading slash
  if (url.startsWith('/')) {
    url = url.substring(1);
  }

  // If path doesn't start with known prefixes, assume it needs one (optional, based on backend)
  // But usually backend returns "uploads/..." or "media/..."
  
  return `${baseUrl}/${url}`;
}

export function formatCompactNumber(number: number): string {
  if (number < 1000) {
    return number.toString();
  }
  return Intl.NumberFormat('en-US', {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(number);
}

export function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch (e) {
    // console.warn("JSON Parse Error:", e, value);
    return fallback;
  }
}
