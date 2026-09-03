import { describe, it, expect } from "vitest";
import { averagePalette, extractPalette } from "./colorExtract";

// Solid single-color image data: white pixels, no transparency (a=255)
function whiteImage(w, h) {
  const buf = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < buf.length; i += 4) {
    buf[i] = 255;
    buf[i + 1] = 255;
    buf[i + 2] = 255;
    buf[i + 3] = 255;
  }
  return buf;
}

describe("averagePalette", () => {
  it("returns the default palette when there is no opaque pixel", () => {
    const buf = new Uint8ClampedArray(8 * 8 * 4); // all alpha 0
    const pal = averagePalette({ buf, width: 8, height: 8 });
    expect(pal.accent).toBeTypeOf("string");
    expect(pal.base).toBeTypeOf("string");
  });

  it("produces a usable palette from opaque pixels", () => {
    const pal = averagePalette({ buf: whiteImage(16, 16), width: 16, height: 16 });
    expect(pal.accent).toBeTypeOf("string");
    expect(pal.base).toBeTypeOf("string");
    expect(pal.gradient).toHaveLength(2);
  });

  it("computes an average color from the avg field", () => {
    const pal = averagePalette({ buf: whiteImage(8, 8), width: 8, height: 8 });
    expect(pal.avg).toBeDefined();
    expect(pal.avg.css).toMatch(/^rgb\(/);
  });
});

describe("extractPalette", () => {
  it("never rejects and returns a palette on image failure", async () => {
    // Stub global Image so the promise resolves without real network.
    class FakeImage {
      set src(v) {
        this._src = v;
        // simulate load failure -> onerror path
        setTimeout(() => this.onerror?.(), 0);
      }
      get src() {
        return this._src;
      }
    }
    const orig = global.Image;
    global.Image = FakeImage;
    try {
      const pal = await extractPalette("https://example.com/x.jpg");
      expect(pal).toBeDefined();
      expect(typeof pal.accent).toBe("string");
    } finally {
      global.Image = orig;
    }
  });
});
