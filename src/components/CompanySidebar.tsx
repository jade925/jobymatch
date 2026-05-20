"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ListChecks, MessageCircle, Building2 } from "lucide-react";
import { Logo } from "./Logo";

const navItems = [
  { href: "/company/offers", label: "Mes offres", icon: ListChecks },
  { href: "/company/chat", label: "Candidatures", icon: MessageCircle },
  { href: "/company/profile", label: "Mon profil", icon: Building2 },
];

export function CompanySidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-56 border-r border-gray-200 bg-white h-full flex-shrink-0">
      <div className="px-5 py-6 border-b border-gray-100 flex justify-center">
        <Logo size="sm" />
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
                  ? { backgroundColor: "rgba(34,146,164,0.1)", color: "#2292A4" }
                  : { color: "#9ca3af" }
              }
            >
              <Icon size={19} />
              <span className="font-sans text-sm">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom brand accent */}
      <div className="px-5 py-4 border-t border-gray-100">
        <p className="font-sans text-xs font-light" style={{ color: "#9ca3af" }}>
          Interface entreprise
        </p>
      </div>
    </aside>
  );
}
