import { describe, expect, it } from "vitest";
import { parseYouTubeId, youtubeWatchUrl } from "@/lib/youtube";

const ID = "wHonhtAaXos";

describe("parseYouTubeId", () => {
  it.each([
    `https://youtu.be/${ID}`,
    `https://youtu.be/${ID}?si=abc123&t=42`,
    `http://youtu.be/${ID}`,
    `https://www.youtube.com/watch?v=${ID}`,
    `https://youtube.com/watch?v=${ID}&list=PL123&index=2`,
    `https://m.youtube.com/watch?feature=share&v=${ID}`,
    `https://www.youtube.com/shorts/${ID}`,
    `https://youtube.com/shorts/${ID}?feature=share`,
    `https://www.youtube.com/embed/${ID}`,
    `https://www.youtube.com/live/${ID}`,
    `  https://youtu.be/${ID}  `,
  ])("accepts %s", (url) => {
    expect(parseYouTubeId(url)).toBe(ID);
  });

  it.each([
    "",
    "not a url",
    `youtu.be/${ID}`,
    `ftp://youtu.be/${ID}`,
    "https://www.tiktok.com/@chef.noura/video/7391022",
    `https://evil-youtube.com/watch?v=${ID}`,
    `https://youtube.com.evil.io/watch?v=${ID}`,
    "https://www.youtube.com/watch?v=short",
    "https://www.youtube.com/watch",
    "https://www.youtube.com/@somechannel",
    "https://youtu.be/",
    "https://youtu.be/kabsa-najdi-2026",
    `https://www.youtube.com/shorts/${ID}extra`,
  ])("rejects %j", (url) => {
    expect(parseYouTubeId(url)).toBeNull();
  });

  it("normalises to a canonical watch URL", () => {
    expect(youtubeWatchUrl(parseYouTubeId(`https://youtube.com/shorts/${ID}?feature=share`)!)).toBe(`https://www.youtube.com/watch?v=${ID}`);
  });
});
