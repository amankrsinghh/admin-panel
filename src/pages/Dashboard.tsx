import { useEffect, useState } from "react";
import { ordersDB, productsDB, customRequestsDB } from "../shared/mockStore";
import type { Order, Product, CustomRequest } from "../shared/types";
import { Badge, formatINR } from "../shared/ui";
import { Link } from "../shared/router";

export function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [requests, setRequests] = useState<CustomRequest[]>([]);

  useEffect(() => {
    const u1 = ordersDB.subscribe(setOrders);
    const u2 = productsDB.subscribe(setProducts);
    const u3 = customRequestsDB.subscribe(setRequests);
    return () => { u1(); u2(); u3(); };
  }, []);

  const revenue = orders
    .filter((o) => o.orderStatus !== "Cancelled")
    .reduce((s, o) => s + o.total, 0);
  const pending = orders.filter((o) => o.orderStatus === "Pending").length;
  const newReq  = requests.filter((r) => r.status === "New").length;

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-4xl text-ink">Atelier Overview</h1>
          <p className="mt-1 text-sm text-ink/60">Insight into your creative commerce.</p>
        </div>
        <div className="hidden sm:block">
          <div className="text-right text-xs uppercase tracking-widest text-ink/40">Real-time Data</div>
          <div className="mt-1 flex items-center justify-end gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
            <span className="font-medium text-ink/80">System Active</span>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
        <Stat label="Total Revenue" value={formatINR(revenue)} tone="rose" sub="+12% from last month" />
        <Stat label="Total Orders" value={String(orders.length)} sub={`${pending} awaiting action`} />
        <Stat label="Products" value={String(products.length)} sub="Active across 7 categories" />
        <Stat label="Custom Requests" value={String(requests.length)} sub={`${newReq} new inquiries`} tone="amber" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Sales Chart Section */}
        <div className="lg:col-span-2">
          <Card title="Revenue Trend" subTitle="Daily sales performance">
            <div className="mt-6 overflow-x-auto pb-2 scrollbar-thin">
              <div className="flex h-64 items-end gap-2 px-2 min-w-[500px] lg:min-w-0">
                {[40, 70, 45, 90, 65, 85, 55, 30, 80, 95, 60, 75, 50, 85].map((h, i) => (
                  <div key={i} className="group relative flex-1">
                    <div 
                      className="w-full rounded-t-lg bg-rose-gold/20 transition-all group-hover:bg-rose-gold/50" 
                      style={{ height: `${h}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-ink px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                        ₹{h}k
                      </div>
                    </div>
                    <div className="mt-2 text-center text-[9px] text-ink/30">M{i+1}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Categories Distribution */}
        <div className="lg:col-span-1">
          <Card title="Category Mix" subTitle="Inventory split">
            <div className="mt-6 space-y-4">
              <CategoryBar label="Bridal" percent={35} color="bg-rose-gold" />
              <CategoryBar label="Lehenga" percent={25} color="bg-ink" />
              <CategoryBar label="Saree" percent={20} color="bg-amber-600" />
              <CategoryBar label="Others" percent={20} color="bg-ink/20" />
            </div>
            <div className="mt-8 rounded-xl bg-ink/[0.03] p-4 text-center">
              <div className="text-xs text-ink/50 uppercase tracking-wider">Top Selling</div>
              <div className="mt-1 font-serif text-lg text-rose-gold-dark">Ivory Bridal Set</div>
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card 
          title="Recent Orders" 
          link={{ to: "/orders", label: "Manage Orders →" }}
        >
          {orders.slice(0, 5).length === 0 && <Empty t="No orders yet" />}
          <ul className="mt-4 divide-y divide-ink/5">
            {orders.slice(0, 5).map((o) => (
              <li key={o.id} className="flex items-center justify-between py-4 text-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink/5 text-ink/40">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium truncate max-w-[120px] sm:max-w-none">{o.customerName}</div>
                    <div className="text-xs text-ink/40">#{o.id} · {new Date(o.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatINR(o.total)}</div>
                  <Badge tone={o.orderStatus === "Delivered" ? "green" : o.orderStatus === "Cancelled" ? "red" : "amber"}>
                    {o.orderStatus}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card 
          title="Latest Custom Requests" 
          link={{ to: "/requests", label: "View All →" }}
        >
          {requests.slice(0, 5).length === 0 && <Empty t="No requests yet" />}
          <ul className="mt-4 divide-y divide-ink/5">
            {requests.slice(0, 5).map((r) => (
              <li key={r.id} className="flex items-center justify-between py-4 text-sm">
                <div>
                  <div className="font-medium">{r.customerName}</div>
                  <div className="text-xs text-ink/50">{r.occasion} · {r.budget}</div>
                </div>
                <Badge tone={r.status === "New" ? "rose" : "ink"}>{r.status}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value, sub, tone = "ink" }: { label: string; value: string; sub?: string; tone?: "rose" | "ink" | "amber" }) {
  const grad = tone === "rose"
    ? "from-rose-gold to-rose-gold-light text-white"
    : tone === "amber"
    ? "from-amber-100 to-amber-50 text-amber-900"
    : "from-ink to-[#222] text-white";
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${grad} p-4 sm:p-6 shadow-sm ring-1 ring-white/5`}>
      <div className="text-[10px] uppercase tracking-[0.25em] opacity-80">{label}</div>
      <div className="mt-2 sm:mt-3 font-serif text-2xl sm:text-3xl">{value}</div>
      {sub && <div className="mt-2 text-[9px] sm:text-[10px] opacity-70 border-t border-white/10 pt-2">{sub}</div>}
    </div>
  );
}

function Card({ title, subTitle, link, children }: { title: string; subTitle?: string; link?: { to: string; label: string }; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-ink/5 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-serif text-2xl text-ink">{title}</div>
          {subTitle && <div className="text-xs text-ink/40 mt-0.5">{subTitle}</div>}
        </div>
        {link && <Link to={link.to} className="text-xs font-medium text-rose-gold-dark hover:underline underline-offset-4">{link.label}</Link>}
      </div>
      <div className="mt-4 flex-1">{children}</div>
    </div>
  );
}

function CategoryBar({ label, percent, color }: { label: string; percent: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="font-medium text-ink/70">{label}</span>
        <span className="text-ink/40">{percent}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-ink/5 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
}

function Empty({ t }: { t: string }) {
  return <div className="rounded-xl bg-ink/[0.02] py-12 text-center text-sm text-ink/30 border border-dashed border-ink/10">{t}</div>;
}
