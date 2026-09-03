import { describe, it, expect } from "vitest";
import { imageSrc, handleImageError } from "./imageFallback";
import { DEFAULT_ARTWORK } from "./constants";

describe("imageSrc", () => {
  it("returns the trimmed image when present", () => {
    expect(imageSrc("  https://x/y.jpg  ")).toBe("https://x/y.jpg");
  });

  it("returns the placeholder for blank/whitespace values", () => {
    expect(imageSrc("")).toBe(DEFAULT_ARTWORK);
    expect(imageSrc("   ")).toBe(DEFAULT_ARTWORK);
    expect(imageSrc(undefined)).toBe(DEFAULT_ARTWORK);
    expect(imageSrc(null)).toBe(DEFAULT_ARTWORK);
  });
});

describe("handleImageError", () => {
  it("swaps a failed image to the placeholder", () => {
    const el = { src: "https://broken.jpg" };
    handleImageError({ currentTarget: el });
    expect(el.src).toBe(DEFAULT_ARTWORK);
  });

  it("does nothing when already on the placeholder", () => {
    const el = { src: DEFAULT_ARTWORK };
    handleImageError({ currentTarget: el });
    expect(el.src).toBe(DEFAULT_ARTWORK);
  });
});
