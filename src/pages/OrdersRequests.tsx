import { useEffect, useState } from "react";
import { ordersDB, customRequestsDB } from "../shared/mockStore";
import type { Order, OrderStatus, PaymentStatus, CustomRequest } from "../shared/types";
import { Badge, formatINR, toast } from "../shared/ui";
import { pushOrderToSheet } from "../shared/googleSheets";
import { sendOrderStatusUpdateEmail } from "../shared/email";

const ORDER_STATUSES: OrderStatus[] = [
  "Pending", "Confirmed", "In Production", "Shipped", "Delivered", "Cancelled", "Return Requested", "Returned",
];
const PAY_STATUSES: PaymentStatus[] = ["Pending", "Paid", "Refunded", "Failed"];

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<"All" | OrderStatus>("All");
  const [expand, setExpand] = useState<string | null>(null);

  useEffect(() => ordersDB.subscribe(setOrders), []);

  const list = filter === "All" ? orders : orders.filter((o) => o.orderStatus === filter);

  return (
    <div>
      <h1 className="font-serif text-4xl">Orders</h1>
      <p className="mt-1 text-sm text-ink/60">All orders sync to your Google Spreadsheet automatically.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {(["All", ...ORDER_STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={"rounded-full px-4 py-1.5 text-xs uppercase tracking-wider " +
              (filter === s
                ? "bg-ink text-white"
                : "border border-ink/15 text-ink/70 hover:border-rose-gold")}
          >
            {s} ({s === "All" ? orders.length : orders.filter((o) => o.orderStatus === s).length})
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {list.map((o) => (
          <div key={o.id} className="rounded-2xl bg-white ring-1 ring-ink/5">
            <button
              onClick={() => setExpand(expand === o.id ? null : o.id)}
              className="grid w-full grid-cols-2 items-center gap-3 px-5 py-4 text-left md:grid-cols-6"
            >
              <div className="md:col-span-2">
                <div className="font-medium">#{o.id}</div>
                <div className="text-xs text-ink/50">{new Date(o.createdAt).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-ink/50">Customer</div>
                <div className="text-sm font-medium">{o.customerName}</div>
                <div className="text-xs text-ink/60">{o.phone}</div>
              </div>
              <div>
                <div className="text-xs text-ink/50">Total</div>
                <div className="font-serif text-lg">{formatINR(o.total)}</div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={o.orderStatus === "Delivered" || o.orderStatus === "Returned" ? "green" : o.orderStatus === "Cancelled" ? "red" : "amber"}>
                  {o.orderStatus}
                </Badge>
                <Badge tone={o.paymentStatus === "Paid" ? "green" : "amber"}>{o.paymentStatus}</Badge>
              </div>
              <div className="text-right text-xs text-ink/50">
                {expand === o.id ? "Hide ↑" : "Manage ↓"}
              </div>
            </button>
            {expand === o.id && <OrderDetail order={o} />}
          </div>
        ))}
        {list.length === 0 && (
          <div className="rounded-2xl border border-dashed border-ink/15 bg-white/60 p-12 text-center text-ink/50">
            No orders to show.
          </div>
        )}
      </div>
    </div>
  );
}

function OrderDetail({ order }: { order: Order }) {
  async function update(patch: Partial<Order>) {
    if (patch.orderStatus === "Delivered") {
      patch.deliveredAt = Date.now();
    }

    // Build the updated order locally so we can always send the email,
    // even if ordersDB.update() returns undefined (Firestore security rules).
    const updatedOrder: Order = { ...order, ...patch };

    await ordersDB.update(order.id, patch);

    // Always sync sheet
    pushOrderToSheet(updatedOrder).catch(() => void 0);

    // Always send status email when order status changes
    if (patch.orderStatus) {
      try {
        await sendOrderStatusUpdateEmail(updatedOrder);
      } catch (err) {
        console.error("[AdminOrders] Failed to send status email:", err);
      }
    }

    toast("Order updated · customer notified by email");
  }
  return (
    <div className="border-t border-ink/5 px-5 py-5">
      <div className="grid gap-5 md:grid-cols-3">
        <div className="md:col-span-2 space-y-3">
          {order.items.map((it, i) => (
            <div key={i} className="flex gap-3 rounded-lg bg-ink/[0.03] p-3">
              <img src={it.image} className="h-16 w-14 rounded object-cover" />
              <div className="flex-1 text-sm">
                <div className="font-medium">{it.title}</div>
                <div className="text-xs text-ink/60">Size {it.size} · {it.color} · ×{it.quantity}</div>
              </div>
              <div className="text-sm font-medium">{formatINR(it.price * it.quantity)}</div>
            </div>
          ))}
          <div className="rounded-lg bg-ink/[0.03] p-3 text-sm">
            <div className="text-xs uppercase tracking-wider text-ink/60">Shipping Address</div>
            <div className="mt-1">{order.address}</div>
            <div className="mt-2 text-xs text-ink/60">
              Email: {order.email} · Payment: {order.paymentMethod}
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <label className="block">
            <div className="text-xs uppercase tracking-wider text-ink/60">Order Status</div>
            <select value={order.orderStatus} onChange={(e) => update({ orderStatus: e.target.value as OrderStatus })}
              className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm">
              {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label className="block">
            <div className="text-xs uppercase tracking-wider text-ink/60">Payment Status</div>
            <select value={order.paymentStatus} onChange={(e) => update({ paymentStatus: e.target.value as PaymentStatus })}
              className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm">
              {PAY_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <a href={`https://wa.me/${order.phone.replace(/\D/g, "")}?text=Hi%20${encodeURIComponent(order.customerName)}!%20Update%20on%20your%20Tavishalove%20order%20%23${order.id}`}
            target="_blank" rel="noreferrer"
            className="block rounded-lg bg-[#25D366] py-2 text-center text-sm font-medium text-white hover:opacity-90">
            WhatsApp Customer
          </a>
        </div>
      </div>
    </div>
  );
}

export function AdminCustomRequests() {
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  useEffect(() => customRequestsDB.subscribe(setRequests), []);

  function setStatus(id: string, status: CustomRequest["status"]) {
    customRequestsDB.update(id, { status });
    toast("Updated");
  }

  return (
    <div>
      <h1 className="font-serif text-4xl">Custom Requests</h1>
      <p className="mt-1 text-sm text-ink/60">{requests.length} total · respond within 24 hours.</p>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {requests.map((r) => (
          <div key={r.id} className="rounded-2xl bg-white p-5 ring-1 ring-ink/5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-medium">{r.customerName}</div>
                <div className="text-xs text-ink/50">{r.email} · {r.phone}</div>
                <div className="text-xs text-ink/50">{new Date(r.createdAt).toLocaleString()}</div>
              </div>
              <Badge tone={r.status === "New" ? "rose" : "ink"}>{r.status}</Badge>
            </div>
            <div className="mt-3 flex gap-3">
              {r.inspirationImageUrl && (
                <img src={r.inspirationImageUrl} className="h-24 w-20 rounded-lg object-cover ring-1 ring-ink/10" />
              )}
              <div className="flex-1 text-sm">
                <div><b>Occasion:</b> {r.occasion}</div>
                <div><b>Budget:</b> {r.budget}</div>
                <div className="mt-1 line-clamp-3 text-ink/70">{r.description}</div>
              </div>
            </div>
            <div className="mt-3 rounded-lg bg-ink/[0.03] p-3 text-xs text-ink/70">
              <b>Measurements:</b> Bust {r.measurements.bust || "-"} · Waist {r.measurements.waist || "-"} · Hips {r.measurements.hips || "-"} · Height {r.measurements.height || "-"}
              {r.measurements.notes && <div className="mt-1">Notes: {r.measurements.notes}</div>}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {(["New", "In Review", "Quoted", "Accepted", "Closed"] as const).map((s) => (
                <button key={s} onClick={() => setStatus(r.id, s)}
                  className={"rounded-full px-3 py-1 text-[11px] uppercase tracking-wider " +
                    (r.status === s ? "bg-rose-gold text-white" : "border border-ink/15 text-ink/60 hover:border-rose-gold")}>
                  {s}
                </button>
              ))}
              <a href={`https://wa.me/${r.phone.replace(/\D/g, "")}?text=Hi%20${encodeURIComponent(r.customerName)}!%20About%20your%20custom%20dress%20request…`}
                target="_blank" rel="noreferrer"
                className="ml-auto rounded-full bg-[#25D366] px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-white">
                WhatsApp
              </a>
            </div>
          </div>
        ))}
        {requests.length === 0 && (
          <div className="lg:col-span-2 rounded-2xl border border-dashed border-ink/15 bg-white/60 p-12 text-center text-ink/50">
            No custom requests yet.
          </div>
        )}
      </div>
    </div>
  );
}
