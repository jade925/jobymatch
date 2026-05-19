import { BottomNav } from "@/components/BottomNav";
import { CompanySidebar } from "@/components/CompanySidebar";
import { CompanyCalendarWidget } from "@/components/CompanyCalendarWidget";
import { CompanySeeder } from "@/components/CompanySeeder";

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-dvh flex flex-col" style={{ backgroundColor: "#F4F4F4" }}>
      <CompanySeeder />
      <div className="flex-1 flex overflow-hidden">
        <CompanySidebar />
        <main className="flex-1 overflow-y-auto pb-16 lg:pb-0" style={{ backgroundColor: "#F4F4F4" }}>
          {children}
        </main>
        <CompanyCalendarWidget />
      </div>
      <BottomNav role="company" />
    </div>
  );
}
