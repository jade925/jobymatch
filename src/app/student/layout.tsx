import { BottomNav } from "@/components/BottomNav";
import { StudentSidebar } from "@/components/StudentSidebar";
import { StudentCalendarWidget } from "@/components/StudentCalendarWidget";
import { StudentSeeder } from "@/components/StudentSeeder";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-dvh flex flex-col" style={{ backgroundColor: "#F4F4F4" }}>
      <StudentSeeder />
      <div className="flex-1 flex overflow-hidden">
        <StudentSidebar />
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0" style={{ backgroundColor: "#F4F4F4" }}>
          {children}
        </main>
        <StudentCalendarWidget />
      </div>
      <BottomNav role="student" />
    </div>
  );
}
