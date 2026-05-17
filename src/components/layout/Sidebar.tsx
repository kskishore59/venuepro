import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, Calendar, Users, UserCheck, CreditCard, 
  Building, BarChart, Settings, LogOut, ShieldAlert, Palette, X
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  collapsed?: boolean;
  onClose?: () => void;
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

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { organization, profile, signOut } = useAuth();

  return (
    <div className={cn(
      "flex flex-col bg-primary text-primary-foreground transition-all duration-300 h-full shadow-2xl md:shadow-none w-64 border-r border-primary-foreground/10"
    )}>
      {/* Header section with brand and Close action button for mobile viewports */}
      <div className="flex items-center justify-between p-4 border-b border-primary-foreground/20 h-16 shrink-0">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
            <span className="font-bold text-sm">{organization?.name?.charAt(0) || 'V'}</span>
          </div>
          <div className="ml-3 overflow-hidden text-left">
            <p className="font-bold truncate text-sm">{organization?.name || 'VenuePro'}</p>
            <p className="text-[10px] text-primary-foreground/75 truncate">{profile?.full_name}</p>
          </div>
        </div>

        {/* Close Button on Mobile Drawer */}
        {onClose && (
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-primary-foreground/10 text-primary-foreground/80 md:hidden transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        )}
      </div>

      {/* Navigation Options */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {[
            ...navItems,
            ...((profile?.role as string) === 'super_admin' ? [{ icon: ShieldAlert, label: 'Super Admin', path: '/super-admin' }] : [])
          ].map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => cn(
                  "flex items-center px-3 py-2.5 rounded-md transition-colors text-sm",
                  "hover:bg-primary-foreground/10",
                  isActive ? "bg-primary-foreground/20 text-white font-semibold" : "text-primary-foreground/80"
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span className="ml-3 flex-1 flex items-center justify-between font-medium">
                  {item.label}
                  {item.badge && (
                    <span className="bg-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer signout options */}
      <div className="p-4 border-t border-primary-foreground/20 shrink-0">
        <button
          onClick={() => {
            if (onClose) onClose();
            signOut();
          }}
          className="flex items-center w-full px-3 py-2 text-primary-foreground/85 hover:text-white hover:bg-primary-foreground/10 rounded-md transition-colors text-sm font-semibold"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span className="ml-3 text-left">Sign Out</span>
        </button>
      </div>
    </div>
  );
};
export default Sidebar;
