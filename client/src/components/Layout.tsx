import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  ShoppingBag,
  LogOut,
  Menu,
  Bell,
  Search
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";

interface SidebarItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick?: () => void;
}

function SidebarItem({ href, icon: Icon, label, active, onClick }: SidebarItemProps) {
  return (
    <Link href={href}>
      <div 
        onClick={onClick}
        data-testid={`nav-${label.toLowerCase().replace(' ', '-')}`}
        className={cn(
          "sidebar-item",
          active && "sidebar-item-active"
        )}
      >
        <Icon className="w-5 h-5" />
        <span>{label}</span>
      </div>
    </Link>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/orders", label: "Orders", icon: ShoppingCart },
    { href: "/customers", label: "Customers", icon: Users },
    { href: "/products", label: "Products", icon: Package },
    { href: "/procurement", label: "To Buy", icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed lg:sticky top-0 h-screen w-72 bg-white border-r border-slate-200/80 z-50 transition-transform duration-300 ease-out flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.04)]",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5C6AC4] to-[#6B7AC8] flex items-center justify-center shadow-[0_4px_12px_rgba(92,106,196,0.3)]">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Toko-Kita</h1>
              <p className="text-xs text-slate-400 font-medium">Order Management</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 mb-3">Menu</p>
          {navItems.map((item) => (
            <SidebarItem
              key={item.href}
              {...item}
              active={location === item.href || (item.href !== "/" && location.startsWith(item.href))}
              onClick={() => setMobileMenuOpen(false)}
            />
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5C6AC4] to-[#00848E] flex items-center justify-center text-white font-bold text-sm shadow-md">
              {user?.firstName?.[0] || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl h-11 font-medium"
            onClick={() => logout()}
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200/80 bg-white flex items-center px-4 lg:px-8 justify-between shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden rounded-xl"
              onClick={() => setMobileMenuOpen(true)}
              data-testid="button-mobile-menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="hidden md:flex relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search..." 
                className="pl-9 w-64 h-10 rounded-xl border-slate-200 bg-slate-50/80 focus:bg-white"
                data-testid="input-global-search"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-xl relative" data-testid="button-notifications">
              <Bell className="w-5 h-5 text-slate-500" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#5C6AC4] to-[#00848E] flex items-center justify-center text-white font-bold text-xs shadow-md lg:hidden">
              {user?.firstName?.[0] || 'A'}
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
