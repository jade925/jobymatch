"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BriefcaseBusiness, MessageCircle, ClipboardList, UserRound, Heart, MapIcon } from "lucide-react";
import { Logo } from "./Logo";

const navItems = [
  { href: "/student/missions", label: "Missions", icon: BriefcaseBusiness },
  { href: "/student/favorites", label: "Favoris", icon: Heart },
  { href: "/student/map", label: "Carte", icon: MapIcon },
  { href: "/student/chat", label: "Messages", icon: MessageCircle },
  { href: "/student/candidatures", label: "Candidatures", icon: ClipboardList },
  { href: "/student/profile", label: "Mon profil", icon: UserRound },
];

export function StudentSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-56 border-r border-gray-200 bg-white h-full flex-shrink-0">
      <div className="px-5 py-6 border-b border-gray-100">
        <Logo size="md" />
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors"
              style={
                isActive
                  ? { backgroundColor: "#fff3e0", color: "#FD8F03" }
                  : { color: "#9ca3af" }
              }
            >
              <Icon size={19} />
              <span className="font-sans text-sm">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
