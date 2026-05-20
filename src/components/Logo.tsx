import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "text" | "full";
}

// Both PNGs are 842×596 px → ratio ≈ 1.413 (w/h)
const RATIO = 842 / 596; // ≈ 1.413

// Full logo (character + JOBYMATCH) — used on vitrine
const fullSizes = {
  sm:  { w: 200, h: Math.round(200 / RATIO) }, // 141
  md:  { w: 260, h: Math.round(260 / RATIO) }, // 184
  lg:  { w: 340, h: Math.round(340 / RATIO) }, // 241
};

// Text-only logo SVG — viewBox 320×72, pas de whitespace → taille exacte
// ratio = 320/72 ≈ 4.44
const textSizes = {
  sm: { w: 156, h: 35 },
  md: { w: 182, h: 41 },
  lg: { w: 222, h: 50 },
};

export function Logo({ size = "md", variant = "text" }: LogoProps) {
  if (variant === "full") {
    const d = fullSizes[size];
    return (
      <Image
        src="/logo-joby-full.png"
        alt="JOBYMATCH"
        width={d.w}
        height={d.h}
        priority
        style={{ objectFit: "contain", width: d.w, height: d.h }}
      />
    );
  }

  const d = textSizes[size];
  return (
    // SVG : pas d'optimisation Next.js (pas de rasterisation nécessaire)
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-joby-text.svg"
      alt="JOBYMATCH"
      width={d.w}
      height={d.h}
      style={{ width: d.w, height: d.h, maxWidth: "100%" }}
    />
  );
}
