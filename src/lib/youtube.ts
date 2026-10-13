/** YouTube link helpers shared by the Import screen (client) and extractRecipe (server). */

const ID = /^[A-Za-z0-9_-]{11}$/;
const HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com", "youtu.be", "www.youtu.be"]);

/** Video id from a watch / youtu.be / shorts / embed / live link, or null if it isn't a YouTube video link. */
export function parseYouTubeId(input: string): string | null {
  let u: URL;
  try { u = new URL(input.trim()); } catch { return null; }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;
  const host = u.hostname.toLowerCase();
  if (!HOSTS.has(host)) return null;
  const parts = u.pathname.split("/").filter(Boolean);
  let id: string | null | undefined;
  if (host.endsWith("youtu.be")) id = parts[0];
  else if (parts[0] === "watch") id = u.searchParams.get("v");
  else if (parts[0] === "shorts" || parts[0] === "embed" || parts[0] === "live" || parts[0] === "v") id = parts[1];
  return id && ID.test(id) ? id : null;
}

export const youtubeWatchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;
export const youtubeThumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
