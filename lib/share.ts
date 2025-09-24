// Centralized sharing helpers for funerals, brochures, etc.
// Provides consistent UX (Web Share API when available, clipboard fallback + toast).
import { toast } from "@/components/ui/use-toast";

export interface BaseShareOptions {
  url: string;
  title?: string;
  text?: string;
  source?: string; // e.g. "card", "event_page", "pdf_viewer"
  platform?: string; // optional explicit platform label for analytics/ref tagging
  copyLabel?: string; // override toast copy label
}

export function getBaseUrl() {
  if (typeof window !== "undefined" && window.location?.origin) return window.location.origin;
  return process.env.NEXT_PUBLIC_SITE_URL || "https://funeralsghana.com";
}

export function buildFuneralUrl(id: string | number, name?: string, source?: string, platform?: string) {
  const base = getBaseUrl();
  let slugSegment = String(id);
  if (name) {
    const slug = slugify(name);
    if (slug) slugSegment = `${id}-${slug}`;
  }
  const params = new URLSearchParams();
  if (source) params.set("ref", source);
  if (platform) params.set("pf", platform);
  const qs = params.toString();
  return `${base}/funeral/${slugSegment}${qs ? `?${qs}` : ""}`;
}

export async function shareLink(opts: BaseShareOptions) {
  const { url, title = "Share", text = "", platform, source } = opts;
  const fullUrl = appendTrackParams(url, source, platform);
  const shareData: ShareData = { title, text, url: fullUrl };
  try {
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      await (navigator as any).share(shareData);
      toast({ title: "Shared", description: "The share dialog was opened." });
      return { method: "navigator-share", url: fullUrl };
    }
  } catch (err) { /* fall back to clipboard */ }
  const copied = await copyToClipboard(fullUrl);
  toast({ title: copied ? "Link copied" : "Share link", description: copied ? "URL copied to clipboard." : fullUrl });
  return { method: "clipboard", url: fullUrl };
}

export interface PlatformShareOptions {
  funeralId?: string | number;
  name?: string;
  platform: "whatsapp" | "facebook" | "twitter" | "telegram" | "email" | "copy";
  source?: string;
  customUrl?: string;
}

export function platformShare({ funeralId, name, platform, source, customUrl }: PlatformShareOptions) {
  const baseUrl = customUrl || (funeralId ? buildFuneralUrl(funeralId, name, source, platform) : getBaseUrl());
  const text = name ? `Join us in honoring the memory of ${name}` : "Memorial link";
  const encoded = encodeURIComponent(`${text} ${baseUrl}`);
  const map: Record<string, string> = {
    whatsapp: `https://wa.me/?text=${encoded}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(baseUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encoded}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(baseUrl)}&text=${encodeURIComponent(text)}`,
    email: `mailto:?subject=${encodeURIComponent(text)}&body=${encoded}`,
    copy: baseUrl,
  };
  if (platform === "copy") {
    copyToClipboard(baseUrl).then((ok) => {
      toast({ title: ok ? "Link copied" : "Copy link", description: ok ? "URL copied to clipboard." : baseUrl });
    });
    return;
  }
  if (typeof window !== "undefined") {
    window.open(map[platform], "_blank", "noopener,noreferrer");
  }
}

function appendTrackParams(url: string, source?: string, platform?: string) {
  try {
    const u = new URL(url, getBaseUrl());
    if (source && !u.searchParams.has("ref")) u.searchParams.set("ref", source);
    if (platform && !u.searchParams.has("pf")) u.searchParams.set("pf", platform);
    return u.toString();
  } catch {
    return url;
  }
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    if (typeof document !== "undefined") {
      const tmp = document.createElement("textarea");
      tmp.value = text;
      tmp.style.position = "fixed";
      tmp.style.left = "-9999px";
      document.body.appendChild(tmp);
      tmp.select();
      document.execCommand("copy");
      document.body.removeChild(tmp);
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

export async function shareFuneralCard(id: string | number, name: string) {
  const url = buildFuneralUrl(id, name, "card");
  return shareLink({ url, title: `Memorial for ${name}`, text: `Join us in honoring the memory of ${name}`, source: "card" });
}

export async function nativeShareFuneral(id: string | number, name: string, source: string = "event_page") {
  const url = buildFuneralUrl(id, name, source);
  return shareLink({ url, title: `Memorial for ${name}`, text: `Join us in honoring the memory of ${name}`, source });
}

// Slugify helper
function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
