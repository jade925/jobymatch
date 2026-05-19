"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BriefcaseBusiness,
  MessageCircle,
  ClipboardList,
  UserRound,
  ListChecks,
  Building2,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
};

const studentNav: NavItem[] = [
  { href: "/student/missions", label: "Missions", icon: BriefcaseBusiness },
  { href: "/student/chat", label: "Chat", icon: MessageCircle },
  { href: "/student/candidatures", label: "Suivi", icon: ClipboardList },
  { href: "/student/profile", label: "Profil", icon: UserRound },
];

const companyNav: NavItem[] = [
  { href: "/company/offers", label: "Mes offres", icon: ListChecks },
  { href: "/company/chat", label: "Chat", icon: MessageCircle },
  { href: "/company/profile", label: "Profil", icon: Building2 },
];

export function BottomNav({ role }: { role: "student" | "company" }) {
  const pathname = usePathname();
  const items = role === "student" ? studentNav : companyNav;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex items-center justify-around h-16 px-2"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      {items.map(({ href, label, icon: Icon }) => {
        const isActive = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-0.5 py-1 px-3 min-w-0"
          >
            <Icon
              size={22}
              style={{ color: isActive ? "#FD8F03" : "#9ca3af" }}
            />
            <span
              className="text-[10px] font-sans font-normal leading-none"
              style={{ color: isActive ? "#FD8F03" : "#9ca3af" }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
