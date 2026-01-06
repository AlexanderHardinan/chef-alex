import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const inFile = path.join(process.cwd(), "public", "chefalex.png");
const outDir = path.join(process.cwd(), "public", "pwa");

if (!fs.existsSync(inFile)) {
  console.error("Missing file:", inFile);
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

async function makeSquare(src, size, outPath) {
  await sharp(src)
    .resize(size, size, { fit: "cover" })
    .png()
    .toFile(outPath);
  console.log("Wrote", outPath);
}

// Maskable: add safe padding so Android can crop without cutting the logo.
// This makes the image smaller inside the canvas.
async function makeMaskable(src, size, outPath) {
  const inner = Math.round(size * 0.72); // safe area ~72%
  const pad = Math.floor((size - inner) / 2);

  const buffer = await sharp(src)
    .resize(inner, inner, { fit: "cover" })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: buffer, left: pad, top: pad }])
    .png()
    .toFile(outPath);

  console.log("Wrote", outPath);
}

await makeSquare(inFile, 192, path.join(outDir, "icon-192.png"));
await makeSquare(inFile, 512, path.join(outDir, "icon-512.png"));
await makeMaskable(inFile, 192, path.join(outDir, "maskable-192.png"));
await makeMaskable(inFile, 512, path.join(outDir, "maskable-512.png"));
await makeSquare(inFile, 180, path.join(outDir, "apple-touch-icon.png"));
