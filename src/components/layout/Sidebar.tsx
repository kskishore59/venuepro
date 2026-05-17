import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, Calendar, Users, UserCheck, CreditCard, 
  Building, BarChart, Settings, LogOut, ShieldAlert, Palette 
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  collapsed: boolean;
}

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: Calendar, label: 'Calendar & Bookings', path: '/bookings' },
  { icon: Users, label: 'Leads & CRM', path: '/leads', badge: 3 },
  { icon: UserCheck, label: 'Customers', path: '/customers' },
  { icon: CreditCard, label: 'Payments', path: '/payments' },
  { icon: Building, label: 'Venues & Halls', path: '/venues' },
  { icon: BarChart, label: 'Reports', path: '/reports' },
  { icon: Settings, label: 'Settings', path: '/settings' },
  { icon: Palette, label: 'Design System', path: '/design-system' },
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const { organization, profile, signOut } = useAuth();

  return (
    <div className={cn(
      "flex flex-col bg-primary text-primary-foreground transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex items-center p-4 border-b border-primary-foreground/20 h-16">
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
          <span className="font-bold text-sm">{organization?.name?.charAt(0) || 'V'}</span>
        </div>
        {!collapsed && (
          <div className="ml-3 overflow-hidden">
            <p className="font-semibold truncate">{organization?.name || 'VenuePro'}</p>
            <p className="text-xs text-primary-foreground/70 truncate">{profile?.full_name}</p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {[
            ...navItems,
            ...((profile?.role as string) === 'super_admin' ? [{ icon: ShieldAlert, label: 'Super Admin', path: '/super-admin' }] : [])
          ].map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center px-3 py-2.5 rounded-md transition-colors",
                  "hover:bg-primary-foreground/10",
                  isActive ? "bg-primary-foreground/20 text-white font-medium" : "text-primary-foreground/80"
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && (
                  <span className="ml-3 flex-1 flex items-center justify-between">
                    {item.label}
                    {item.badge && (
                      <span className="bg-accent text-white text-xs px-1.5 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-primary-foreground/20">
        <button
          onClick={signOut}
          className={cn(
            "flex items-center w-full px-3 py-2 text-primary-foreground/80 hover:text-white hover:bg-primary-foreground/10 rounded-md transition-colors",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="ml-3">Sign Out</span>}
        </button>
      </div>
    </div>
  );
};
