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

// Text-only logo (JOBYMATCH) — used in sidebars / nav
// Keep height small; PNG has generous whitespace so objectFit:contain handles it
const textSizes = {
  sm: { w: 150, h: 60 },
  md: { w: 190, h: 76 },
  lg: { w: 240, h: 96 },
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
