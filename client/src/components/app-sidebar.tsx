import { LayoutDashboard, Car, Settings, BarChart3, StickyNote, CheckSquare, Users, UserPlus, Calendar, DollarSign } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { usePermissions } from "@/hooks/use-permissions";
import { useCompanyTheme } from "./CompanyThemeProvider";
import { useI18n } from "@/lib/i18n";

const menuItems = [
  {
    titleKey: "sidebar.dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    titleKey: "sidebar.vehicles",
    url: "/veiculos",
    icon: Car,
  },
  {
    titleKey: "sidebar.leads",
    url: "/leads",
    icon: UserPlus,
  },
  {
    titleKey: "sidebar.bills",
    url: "/contas",
    icon: DollarSign,
  },
  {
    titleKey: "sidebar.reports",
    url: "/relatorios",
    icon: BarChart3,
  },
  {
    titleKey: "sidebar.notes",
    url: "/anotacoes",
    icon: StickyNote,
  },
  {
    titleKey: "sidebar.checklists",
    url: "/checklists",
    icon: CheckSquare,
  },
  {
    titleKey: "sidebar.users",
    url: "/usuarios",
    icon: Users,
  },
  {
    titleKey: "sidebar.settings",
    url: "/configuracoes",
    icon: Settings,
  },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();
  const { can } = usePermissions();
  const { changeIconColors, primaryColor } = useCompanyTheme();
  const { t } = useI18n();

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const visibleMenuItems = menuItems.filter((item) => {
    if (item.url === "/configuracoes") return can.companySettings;
    if (item.url === "/usuarios") return can.manageUsers;
    if (item.url === "/") return can.viewDashboard || can.viewDriverDashboard;
    if (item.url === "/contas") return can.viewBills;
    if (item.url === "/leads") return can.viewLeads;
    return true;
  });

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-6">
        <div className="flex items-center gap-3">
          <img 
            src="/velostock-logo.svg" 
            alt="VeloStock" 
            className="h-14 w-auto object-contain"
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("sidebar.mainMenu")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMenuItems.map((item) => (
                <SidebarMenuItem key={item.titleKey}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`link-${item.titleKey.replace('sidebar.', '')}`}
                  >
                    <Link href={item.url} onClick={handleLinkClick}>
                      <item.icon 
                        className="h-5 w-5"
                        style={changeIconColors ? { color: primaryColor } : undefined}
                      />
                      <span>{t(item.titleKey)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
