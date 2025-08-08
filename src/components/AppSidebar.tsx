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


export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const session = await getSession();
  const user = session.user;
  // const user = await currentUser();
  // const role = user?.publicMetadata.role as string;
  const menuItems = [
  {
    title: "DASHBOARD",
    items: [
      {
        icon: Home,
        label: "Admin",
        href: `/${user?.role}`,
        visible: ["superadmin", "admin"],
      },
      {
        icon: Home,
        label: "Security",
        href: `/security`,
        visible: ["superadmin","security"],
      },
      {
        icon: Home,
        label: "Weighing",
        href: `/weighing`,
        visible: ["superadmin","weighing"],
      },
      {
        icon: Home,
        label: "QC",
        href: `/qc`,
        visible: ["superadmin","qc"],
      },
    ],
  },
  {
    title: "MASTER",
    items: [
      {
        icon: WalletCards,
        label: "Users",
        href: "/list/user",
        visible: ["superadmin", "admin"],
      },
      {
        icon: WalletCards,
        label: "Suppliers",
        href: "/list/suppliers",
        visible: ["superadmin", "admin"],
      },
      {
        icon: WalletCards,
        label: "Materials",
        href: "/list/materials",
        visible: ["superadmin", "admin"],
      },
      {
        icon: WalletCards,
        label: "Conditions",
        href: "/list/conditions",
        visible: ["superadmin", "admin"],
      },
      {
        icon: WalletCards,
        label: "Parameters",
        href: "/list/parameters",
        visible: ["superadmin", "admin"],
      },
    ],
  },
  {
    title: "Reports",
    items: [
      {
        icon: IdCard,
        label: "Arrival",
        href: "/list/arrivals",
        visible: ["superadmin", "admin", "manager"],
      },
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
];
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">PKP</span>
              </a>
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
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {i.items.map((item) => {
                      if (item.visible.includes(user?.role || "")) {
                        return (
                          <SidebarMenuItem key={item.label}>
                            <SidebarMenuButton asChild>
                              <Link href={item.href}>
                                <item.icon />
                                <span>{item.label} </span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        )}
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
