import { BottomNav } from "@/components/BottomNav";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F6F7EB" }}>
      <div className="flex-1 pb-20">{children}</div>
      <BottomNav role="student" />
    </div>
  );
}
