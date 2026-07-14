import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, FileText, Send, Building, ShieldCheck } from "lucide-react";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Boshqaruv paneli", icon: LayoutDashboard },
    { href: "/submit", label: "Yangi murojaat", icon: Send },
    { href: "/requests", label: "Murojaatlar", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-card border-r border-border shrink-0 flex flex-col sticky top-0 md:h-screen">
        <div className="p-6 border-b border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight text-foreground tracking-tight">Murojaat<br/>Turkumlash</h1>
          </div>
        </div>
        <nav className="p-4 flex-1 flex flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  data-testid={`nav-link-${item.href.replace("/", "") || "home"}`}
                >
                  <Icon size={18} className={isActive ? "text-primary" : "text-muted-foreground"} />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border mt-auto">
          <div className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground">
            <Building size={16} />
            <span>Markaziy Apparat</span>
          </div>
        </div>
      </aside>
      <main className="flex-1 w-full flex flex-col overflow-x-hidden relative">
        <div className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
