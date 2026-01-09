import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  Mail, 
  Shield, 
  LogOut,
  Home,
  FileText,
  BookOpen,
  AlertTriangle,
  Coins
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, tab: "overview" },
  { label: "Orders", href: "/admin?tab=orders", icon: ShoppingCart, tab: "orders" },
  { label: "Products", href: "/admin?tab=products", icon: Package, tab: "products" },
  { label: "Coin Management", href: "/admin?tab=coins", icon: Coins, tab: "coins" },
  { label: "Payment Alerts", href: "/admin?tab=alerts", icon: AlertTriangle, tab: "alerts" },
  { label: "Blog Posts", href: "/admin?tab=blog", icon: BookOpen, tab: "blog" },
  { label: "Page Content", href: "/admin?tab=content", icon: FileText, tab: "content" },
  { label: "Consultations", href: "/admin?tab=consultations", icon: Users, tab: "consultations" },
  { label: "Subscribers", href: "/admin?tab=subscribers", icon: Mail, tab: "subscribers" },
  { label: "Staff", href: "/admin?tab=staff", icon: Shield, tab: "staff" },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { signOut, profile, isAdmin } = useAuth();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get("tab") || "overview";

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-background border-r flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold">Luminate Admin</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {profile?.full_name || "Staff"}
          </p>
          {isAdmin && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary mt-2">
              Admin
            </span>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.tab || 
              (item.tab === "overview" && !searchParams.get("tab") && location.pathname === "/admin");
            
            return (
              <Link
                key={item.label}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t space-y-2">
          <Link to="/">
            <Button variant="ghost" className="w-full justify-start gap-3">
              <Home className="h-4 w-4" />
              Back to Site
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-destructive hover:text-destructive"
            onClick={() => signOut()}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
