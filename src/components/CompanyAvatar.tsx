// Deterministic company avatar — distinctive gradient per company name

const GRADIENTS: [string, string][] = [
  ["#FD8F03", "#F59E0B"], // orange-amber   (Restauration)
  ["#2292A4", "#0EA5E9"], // teal-sky       (Services)
  ["#7C3AED", "#A855F7"], // violet-purple  (Événementiel)
  ["#EC4899", "#F43F5E"], // pink-rose      (Commerce)
  ["#16A34A", "#22C55E"], // green          (Livraison)
  ["#4F46E5", "#6366F1"], // indigo         (Sécurité)
  ["#0891B2", "#06B6D4"], // cyan           (Hôtellerie)
  ["#D97706", "#FBBF24"], // amber-yellow   (Autre)
];

function hashName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return h;
}

const ARTICLES = new Set(["le", "la", "les", "du", "de", "d", "des", "l"]);

export function getCompanyInitials(name: string): string {
  const words = name
    .replace(/[''&]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 0 && !ARTICLES.has(w.toLowerCase()));
  if (words.length === 0) return name.charAt(0).toUpperCase();
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export function getCompanyGradient(name: string): [string, string] {
  return GRADIENTS[hashName(name) % GRADIENTS.length];
}

interface CompanyAvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  /** Shape: "square" (default, logo-like) or "circle" */
  shape?: "square" | "circle";
  className?: string;
}

const SIZE_MAP = {
  sm: { px: 32, text: "11px", radius: "10px" },
  md: { px: 40, text: "13px", radius: "12px" },
  lg: { px: 64, text: "20px", radius: "18px" },
};

export function CompanyAvatar({ name, size = "md", shape = "square", className = "" }: CompanyAvatarProps) {
  const [c1, c2] = getCompanyGradient(name);
  const initials = getCompanyInitials(name);
  const s = SIZE_MAP[size];

  return (
    <div
      className={`flex items-center justify-center flex-shrink-0 ${className}`}
      style={{
        width: s.px,
        height: s.px,
        borderRadius: shape === "circle" ? "50%" : s.radius,
        background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
        boxShadow: `0 2px 8px ${c1}40`,
      }}
    >
      <span
        className="font-heading text-white"
        style={{ fontSize: s.text, fontWeight: 800, letterSpacing: "0.02em" }}
      >
        {initials}
      </span>
    </div>
  );
}
