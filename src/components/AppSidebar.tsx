import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/registry/new-york-v4/ui/sidebar";
import {
  Home,
  IdCard,
  ChevronDown,
  WalletCards,
  LogOut,
  ShieldBan,
  Weight,
  ScanLine,
  Users,
  Truck,
  Blocks,
  Gauge,
  Sliders,
} from "lucide-react";
import Link from "next/link";

import { IconInnerShadowTop } from "@tabler/icons-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/registry/new-york-v4/ui/collapsible";
import { getSession } from "@/lib/session";
import LogoutButton from "./LogoutButton";
import SidebarNavLink from "./SidebarNavLink";

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const session = await getSession();
  const user = session.user;
  // const user = await currentUser();
  // const role = user?.publicMetadata.role as string;
  
  const menuItems = [
    {
      title: "Dashboard",
      items: [
        { icon: "home", label: "Admin", href: `/${user?.role}`, visible: ["superadmin", "admin"] },
        { icon: "security", label: "Security", href: "/security", visible: ["superadmin", "security"] },
        { icon: "weighing", label: "Weighing", href: "/weighing", visible: ["superadmin", "weighing"] },
        { icon: "qc", label: "QC", href: "/qc", visible: ["superadmin", "qc"] },
      ],
    },
    {
      title: "Pusat Data",
      items: [
        { icon: "users", label: "Users", href: "/list/user", visible: ["superadmin", "admin"] },
        { icon: "suppliers", label: "Suppliers", href: "/list/suppliers", visible: ["superadmin", "admin"] },
        { icon: "materials", label: "Materials", href: "/list/materials", visible: ["superadmin", "admin"] },
        { icon: "conditions", label: "Conditions", href: "/list/conditions", visible: ["superadmin", "admin"] },
        { icon: "parameters", label: "Parameters", href: "/list/parameters", visible: ["superadmin", "admin"] },
      ],
    },
    {
      title: "Laporan",
      items: [
        { icon: "arrivals", label: "Arrival", href: "/list/arrivals", visible: ["superadmin", "admin", "manager"] },
      ],
    },
    // {
    //   title: "OTHER",
    //   items: [
    //     {
    //       icon: FileStack,
    //       label: "Document",
    //       href: "/list/document",
    //       visible: ["superadmin", "admin", "manager"],
    //     },

    //   ],
    // },
  ] as const;
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link href="/">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">PKP</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {menuItems.map((i) => (
          <Collapsible defaultOpen className="group/collapsible" key={i.title}>
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger>
                  {i.title}
                  <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent className="overflow-hidden transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                <SidebarGroupContent className="pt-1">
                  <SidebarMenu>
                    {i.items.map((item) => {
                      if ((item.visible as readonly string[]).includes(user?.role || "")) {
                        return <SidebarNavLink key={item.label} href={item.href} icon={item.icon} label={item.label} />;
                      }
                      return null;
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <LogoutButton />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarGroup />
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
