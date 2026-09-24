import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

export const runtime = "nodejs";
export const dynamic = "force-static";

export async function GET() {
  const [photo, serif, sans] = await Promise.all([
    sharp(join(process.cwd(), "public/images/luxe-completed-installation.webp"))
      .resize(670, 630, { fit: "cover", position: "centre" }).png().toBuffer(),
    readFile(join(process.cwd(), "node_modules/@fontsource/playfair-display/files/playfair-display-latin-400-normal.woff")),
    readFile(join(process.cwd(), "node_modules/@fontsource/inter/files/inter-latin-400-normal.woff")),
  ]);

  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", background: "#2c2c2c", color: "#faf7f2" }}>
      <div style={{ display: "flex", flexDirection: "column", width: 530, padding: "54px 44px", borderRight: "4px solid #c7a66a" }}>
        <div style={{ fontFamily: "Inter", fontSize: 22, letterSpacing: 3, color: "#c7a66a" }}>LUXE WINDOW WORKS</div>
        <div style={{ display: "flex", flexDirection: "column", fontFamily: "Playfair", fontSize: 55, lineHeight: 1.15, marginTop: 66 }}>
          <span>Beautiful options.</span>
          <span>Personal service.</span>
          <span>That’s Luxe.</span>
        </div>
        <div style={{ fontFamily: "Inter", fontSize: 20, lineHeight: 1.5, marginTop: 34, color: "#e1d9cc" }}>Custom window treatments for your North Idaho home.</div>
        <div style={{ fontFamily: "Inter", fontSize: 17, marginTop: "auto", color: "#c7a66a" }}>luxewindowworks.com</div>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`data:image/png;base64,${photo.toString("base64")}`} alt="" width={670} height={630} style={{ objectFit: "cover" }} />
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Playfair", data: serif, weight: 400, style: "normal" },
        { name: "Inter", data: sans, weight: 400, style: "normal" },
      ],
    },
  );
}
