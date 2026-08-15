const DEFAULT_PALETTE = {
  base: "#1c2a38",
  top: "rgba(20, 24, 34, 0.9)",
  bottom: "#0b0e14",
  accent: "#87CEEB",
  gradient: ["#122030", "#0e1622"],
};

const cache = new Map();

function parseColor(c) {
  return {
    r: c[0],
    g: c[1],
    b: c[2],
    css: `rgb(${c[0]}, ${c[1]}, ${c[2]})`,
  };
}

export function averagePalette(data) {
  let r = 0,
    g = 0,
    b = 0,
    n = 0;
  const cornerCounts = [];
  for (let y = 0; y < data.height; y += 8) {
    for (let x = 0; x < data.width; x += 8) {
      const i = (y * data.width + x) * 4;
      const cr = data.buf[i];
      const cg = data.buf[i + 1];
      const cb = data.buf[i + 2];
      const a = data.buf[i + 3];
      if (a < 200) continue;
      r += cr;
      g += cg;
      b += cb;
      n++;
      cornerCounts.push([cr, cg, cb, x / data.width, y / data.height]);
    }
  }
  if (!n) return DEFAULT_PALETTE;

  r = Math.round(r / n);
  g = Math.round(g / n);
  b = Math.round(b / n);

  const sortByDarkness = (arr) =>
    arr.sort((A, B) => 0.299 * B[0] + 0.587 * B[1] + 0.114 * B[2] - (0.299 * A[0] + 0.587 * A[1] + 0.114 * A[2]));

  const darkest = sortByDarkness([...cornerCounts]).slice(0, Math.min(6, cornerCounts.length));
  const dominant = darkest[0];

  const tint = (c, f) => `rgb(${Math.round(c[0] * f)}, ${Math.round(c[1] * f)}, ${Math.round(c[2] * f)})`;

  return {
    base: tint(dominant, 0.5),
    top: tint(dominant, 0.42),
    bottom: "#0b0e14",
    accent: tint([Math.min(255, dominant[0] * 0.85 + 110), Math.min(255, dominant[1] * 0.85 + 110), Math.min(255, dominant[2] * 0.85 + 110)], 1),
    gradient: [tint(dominant, 0.3), "#0e1116"],
    avg: parseColor([r, g, b]),
  };
}

export function extractPalette(imageUrl) {
  if (cache.has(imageUrl)) return Promise.resolve(cache.get(imageUrl));

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const W = 48;
        const H = 48;
        const canvas = document.createElement("canvas");
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, W, H);
        const buf = ctx.getImageData(0, 0, W, H).data;
        const palette = averagePalette({ buf, width: W, height: H });
        cache.set(imageUrl, palette);
        resolve(palette);
      } catch {
        resolve(DEFAULT_PALETTE);
      }
    };
    img.onerror = () => resolve(DEFAULT_PALETTE);
    img.src = imageUrl;
  });
}
