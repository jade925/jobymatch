import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "text" | "full";
}

// Both PNGs are 842×596 px → ratio ≈ 1.413 (w/h)
const RATIO = 842 / 596; // ≈ 1.413

// Full logo (character + JOBYMATCH) — used on vitrine
const fullSizes = {
  sm:  { w: 160, h: Math.round(160 / RATIO) }, // 113
  md:  { w: 220, h: Math.round(220 / RATIO) }, // 156
  lg:  { w: 280, h: Math.round(280 / RATIO) }, // 198
};

// Text-only logo (JOBYMATCH) — used in sidebars / nav
// Keep height small; PNG has generous whitespace so objectFit:contain handles it
const textSizes = {
  sm: { w: 120, h: 48 },
  md: { w: 150, h: 60 },
  lg: { w: 200, h: 80 },
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
    <Image
      src="/logo-joby-text.png"
      alt="JOBYMATCH"
      width={d.w}
      height={d.h}
      priority
      style={{ objectFit: "contain", width: d.w, height: d.h }}
    />
  );
}
