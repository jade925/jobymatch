export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl",
  };
  return (
    <span className={`${sizes[size]} font-heading`}>
      <span style={{ color: "#FD8F03" }}>JOBY</span>
      <span style={{ color: "#393E41" }}>MATCH</span>
    </span>
  );
}
