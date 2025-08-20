"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/registry/new-york-v4/ui/sidebar";
import {
  Home,
  ShieldBan,
  Weight,
  ScanLine,
  Users,
  Truck,
  Blocks,
  Gauge,
  Sliders,
  IdCard,
} from "lucide-react";

const iconMap = {
  home: Home,
  security: ShieldBan,
  weighing: Weight,
  qc: ScanLine,
  users: Users,
  suppliers: Truck,
  materials: Blocks,
  conditions: Gauge,
  parameters: Sliders,
  arrivals: IdCard,
} as const;

type IconKey = keyof typeof iconMap;

type Props = {
  href: string;
  icon: IconKey;
  label: string;
};

export default function SidebarNavLink({ href, icon, label }: Props) {
  const pathname = usePathname();
  const isRoot = href === "/";
  const isActive = isRoot
    ? pathname === "/"
    : pathname === href || pathname.startsWith(href + "/");

  const Icon = iconMap[icon] ?? Home;
  const activeClass =
    "bg-blue-500 hover:bg-blue-500 hover:text-white dark:bg-gray-800 text-white font-semibold transition-all duration-300 px-6";

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        className={isActive ? activeClass : "hover:bg-blue-500 dark:hover:bg-gray-700 hover:text-white transition-all duration-300 px-6"}
      >
        <Link href={href} aria-current={isActive ? "page" : undefined}>
          <Icon className="size-4" />
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}