import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home, Calendar, Users, UserCheck, CreditCard,
  Building, Settings, LogOut, ShieldAlert, Palette,
  BarChart, FileText, ClipboardList, Truck, CheckSquare
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '../ui/sidebar';

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: Calendar, label: 'Calendar', path: '/calendar' },
  { icon: Users, label: 'Leads', path: '/leads', badge: 3 },
  { icon: Building, label: 'Venues', path: '/venues' },
  { icon: CheckSquare, label: 'Bookings', path: '/bookings' },
  { icon: FileText, label: 'Quotations', path: '/quotations' },
  { icon: CreditCard, label: 'Finance', path: '/payments' },
  { icon: ClipboardList, label: 'Operations', path: '/operations' },
  { icon: Truck, label: 'Vendors', path: '/vendors' },
  { icon: UserCheck, label: 'Customers', path: '/customers' },
  { icon: BarChart, label: 'Analytics', path: '/analytics' },
  { icon: Palette, label: 'Design System', path: '/design-system' },
];

export const Sidebar: React.FC = () => {
  const { profile, signOut } = useAuth();
  const location = useLocation();

  return (
    <ShadcnSidebar>
      {/* Header section with brand logo and name */}
      <SidebarHeader className="border-b border-sidebar-border px-5 h-16 flex items-start shrink-0 pt-6">
        <div className="flex flex-row items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-[#dfba74] text-[#0b0f19] flex items-center justify-center shrink-0 shadow-md transition-transform duration-300 hover:scale-105">
            <span className="font-extrabold text-md tracking-tighter">V</span>
          </div>
          <span className="font-bold text-lg text-sidebar-foreground tracking-tight group-data-[collapsible=icon]:hidden">VenueOS</span>
        </div>
      </SidebarHeader>

      {/* Navigation Options */}
      <SidebarContent className="py-4">
        <SidebarMenu className="px-2">
          {[
            ...navItems,
            ...((profile?.role as string) === 'super_admin' ? [{ icon: ShieldAlert, label: 'Super Admin', path: '/super-admin' }] : []),
          ].map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <SidebarMenuItem key={item.path} className="list-none">
                <SidebarMenuButton asChild tooltip={item.label} isActive={isActive}>
                  <NavLink
                    to={item.path}
                    className={cn(
                      "group flex items-center w-full px-4 py-2.5 transition-all duration-300 text-sm font-semibold border-l-2 rounded-r-lg rounded-l-none",
                      isActive
                        ? "!bg-[#dfba74]/10 !text-[#dfba74] border-l-[#dfba74] font-bold pl-4 shadow-sm"
                        : "text-sidebar-foreground/75 hover:bg-sidebar-accent/40 hover:text-[#dfba74] border-l-transparent pl-3.5"
                    )}
                  >
                    <item.icon className="w-4.5 h-4.5 shrink-0 transition-transform duration-300 group-hover:scale-110" />
                    <span className="ml-3 flex-1 flex items-center justify-between group-data-[collapsible=icon]:hidden">
                      {item.label}
                      {item.badge && (
                        <span className="bg-[#b45309] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full transition-transform duration-300 group-hover:scale-105">
                          {item.badge}
                        </span>
                      )}
                    </span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* Footer Settings & signout options */}
      <SidebarFooter className="border-t border-sidebar-border p-4 shrink-0 space-y-1">
        <SidebarMenuItem className="list-none">
          {(() => {
            const isSettingsActive = location.pathname.startsWith('/settings');
            return (
              <SidebarMenuButton asChild tooltip="Settings" isActive={isSettingsActive}>
                <NavLink
                  to="/settings"
                  className={cn(
                    "group flex items-center w-full px-4 py-2 transition-all duration-300 text-sm font-semibold border-l-2 rounded-r-lg rounded-l-none",
                    isSettingsActive
                      ? "!bg-[#dfba74]/10 !text-[#dfba74] border-l-[#dfba74] font-bold pl-4 shadow-sm"
                      : "text-sidebar-foreground/75 hover:bg-sidebar-accent/40 hover:text-[#dfba74] border-l-transparent pl-3.5"
                  )}
                >
                  <Settings className="w-4.5 h-4.5 shrink-0 transition-transform duration-300 group-hover:scale-110" />
                  <span className="ml-3 group-data-[collapsible=icon]:hidden">Settings</span>
                </NavLink>
              </SidebarMenuButton>
            );
          })()}
        </SidebarMenuItem>

        <SidebarMenuItem className="list-none">
          <SidebarMenuButton asChild tooltip="Sign Out">
            <button
              onClick={() => signOut()}
              className="group flex items-center w-full px-4 py-2 text-sidebar-foreground/75 hover:bg-sidebar-accent/40 hover:text-[#dfba74] border-l-2 border-l-transparent pl-3.5 rounded-lg transition-all duration-300 text-sm font-semibold"
            >
              <LogOut className="w-4.5 h-4.5 shrink-0 transition-transform duration-300 group-hover:scale-110" />
              <span className="ml-3 text-left group-data-[collapsible=icon]:hidden">Sign Out</span>
            </button>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarFooter>
    </ShadcnSidebar>
  );
};
export default Sidebar;
