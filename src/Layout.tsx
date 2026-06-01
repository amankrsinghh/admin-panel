import { useEffect, useState, type ReactNode } from "react";
import { Link, useHashRoute } from "./shared/router";
import { useAuth, signOut } from "./shared/auth";
import { Button } from "./shared/ui";

export function AdminLayout({ children }: { children: ReactNode }) {
  const { path, navigate } = useHashRoute();
  const user = useAuth();
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [path]);

  const NAV = [
    ["/",          "Dashboard"],
    ["/categories", "Categories"],
    ["/products",   "Manage Products"],
    ["/add",        "Add Product"],
    ["/orders",     "Orders"],
    ["/requests",   "Custom Requests"],
    ["/settings",   "Settings"],
  ];

  const NavItem = ({ to, label }: { to: string; label: string }) => (
    <Link
      to={to}
      className={
        "block rounded-lg px-3 py-2.5 text-sm transition " +
        (path === to
          ? "bg-rose-gold text-white shadow"
          : "text-white/70 hover:bg-white/5 hover:text-white")
      }
    >
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen bg-[#0f0f12] text-white">
      {/* Topbar */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-[#0f0f12]/80 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => setOpen(!open)} className="text-white/80">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
          <div className="font-serif text-xl">
            Tavishalove <span className="text-rosegold-gradient">Admin</span>
          </div>
          <div className="w-6" />
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={
          "fixed inset-y-0 left-0 z-40 w-64 bg-[#0a0a0d] p-5 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 " +
          (open ? "translate-x-0" : "-translate-x-full")
        }>
          <div className="font-serif text-2xl">
            Tavishalove <span className="text-rosegold-gradient">Admin</span>
          </div>
          <div className="mt-1 text-[11px] uppercase tracking-[0.25em] text-white/40">
            Atelier Control
          </div>
          <nav className="mt-8 space-y-1">
            {NAV.map(([to, label]) => <NavItem key={to} to={to} label={label} />)}
          </nav>
          <div className="mt-8 rounded-lg bg-white/5 p-3 text-xs text-white/60">
            <div className="font-medium text-white/80">{user?.name}</div>
            <div className="truncate">{user?.email}</div>
            <button
              onClick={() => { signOut(); navigate("/login"); }}
              className="mt-2 text-rose-gold-light hover:text-white">
              Sign out
            </button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {open && (
          <div onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-black/40 lg:hidden fade-in" />
        )}

        <main className="min-h-screen flex-1 bg-[#f5f3ee] text-ink">
          <div className="mx-auto max-w-6xl px-5 py-8 lg:px-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export function AdminGate({ children }: { children: ReactNode }) {
  const user = useAuth();
  const { navigate } = useHashRoute();
  useEffect(() => {
    if (!user || user.role !== "admin") navigate("/login");
  }, [user]);
  if (!user || user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f0f12] text-white">
        <div className="text-center">
          <div className="font-serif text-2xl">Redirecting to admin login…</div>
          <Button className="mt-4" onClick={() => navigate("/login")}>Go now</Button>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
