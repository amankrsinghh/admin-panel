import { useEffect, useState } from "react";
import { Button, Input, toast } from "../shared/ui";
import { useAuth, updateAdminPassword } from "../shared/auth";
import { settingsDB } from "../shared/mockStore";

export function Settings() {
  const user = useAuth();
  const envOK = {
    firebase:  !!import.meta.env.VITE_FIREBASE_API_KEY,
    sheets:    !!import.meta.env.VITE_SHEETS_WEBHOOK_URL,
    razorpay:  !!import.meta.env.VITE_RAZORPAY_KEY_ID,
  };

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updating, setUpdating] = useState(false);

  // Homepage Hero settings states
  const [badgeText, setBadgeText] = useState("");
  const [title, setTitle] = useState("");
  const [italicTitle, setItalicTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [imageLink, setImageLink] = useState("");
  const [imageTagline, setImageTagline] = useState("");
  const [imageTitle, setImageTitle] = useState("");
  const [savingHero, setSavingHero] = useState(false);

  // Return policy settings states
  const [returnWindowDays, setReturnWindowDays] = useState("7");
  const [savingReturn, setSavingReturn] = useState(false);

  // Email template states
  const [confirmSubject, setConfirmSubject] = useState("");
  const [confirmGreeting, setConfirmGreeting] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [statusSubject, setStatusSubject] = useState("");
  const [statusGreeting, setStatusGreeting] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);

  useEffect(() => {
    return settingsDB.subscribe((items) => {
      const h = items.find((x) => x.id === "home_hero");
      if (h) {
        setBadgeText(h.badgeText || "");
        setTitle(h.title || "");
        setItalicTitle(h.italicTitle || "");
        setSubtitle(h.subtitle || "");
        setImageLink(h.imageLink || "");
        setImageTagline(h.imageTagline || "");
        setImageTitle(h.imageTitle || "");
      }
      const s = items.find((x) => x.id === "store_settings");
      if (s) {
        setReturnWindowDays(String(s.returnWindowDays ?? 7));
      }
      const em = items.find((x) => x.id === "email_settings");
      if (em) {
        setConfirmSubject(em.confirmSubject || "");
        setConfirmGreeting(em.confirmGreeting || "");
        setConfirmMessage(em.confirmMessage || "");
        setStatusSubject(em.statusSubject || "");
        setStatusGreeting(em.statusGreeting || "");
        setStatusMessage(em.statusMessage || "");
      }
    });
  }, []);

  async function handleHeroUpdate(e: React.FormEvent) {
    e.preventDefault();
    setSavingHero(true);
    try {
      await settingsDB.add({
        id: "home_hero",
        badgeText,
        title,
        italicTitle,
        subtitle,
        imageLink,
        imageTagline,
        imageTitle,
      });
      toast("Homepage content updated successfully!");
    } catch (err) {
      toast((err as Error).message, "err");
    } finally {
      setSavingHero(false);
    }
  }

  async function handleReturnSettingsUpdate(e: React.FormEvent) {
    e.preventDefault();
    setSavingReturn(true);
    try {
      await settingsDB.add({
        id: "store_settings",
        returnWindowDays: Number(returnWindowDays),
      });
      toast("Return window policy updated successfully!");
    } catch (err) {
      toast((err as Error).message, "err");
    } finally {
      setSavingReturn(false);
    }
  }

  async function handleEmailTemplatesUpdate(e: React.FormEvent) {
    e.preventDefault();
    setSavingEmail(true);
    try {
      await settingsDB.add({
        id: "email_settings",
        confirmSubject,
        confirmGreeting,
        confirmMessage,
        statusSubject,
        statusGreeting,
        statusMessage,
      });
      toast("Email templates saved successfully!");
    } catch (err) {
      toast((err as Error).message, "err");
    } finally {
      setSavingEmail(false);
    }
  }

  async function handlePasswordUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast("Passwords do not match", "err");
      return;
    }
    if (newPassword.length < 6) {
      toast("Password must be at least 6 characters long", "err");
      return;
    }
    setUpdating(true);
    try {
      await updateAdminPassword(newPassword);
      toast("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast((err as Error).message, "err");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div>
      <h1 className="font-serif text-4xl">Settings</h1>
      <p className="mt-1 text-sm text-ink/60">Integrations, homepage & account settings.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card title="Firebase" ok={envOK.firebase}
          desc="Authentication & Firestore databases."
          envKey="VITE_FIREBASE_*" />
        <Card title="Google Sheets" ok={envOK.sheets}
          desc="Order rows auto-pushed to Spreadsheet."
          envKey="VITE_SHEETS_WEBHOOK_URL" />
        <Card title="Razorpay" ok={envOK.razorpay}
          desc="Payment gateway mock triggers."
          envKey="VITE_RAZORPAY_KEY_ID" />
        <Card title="WhatsApp FAB" ok={true}
          desc="Customer reach click buttons."
          envKey="(no key required)" />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Homepage Configuration Form */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-ink/5">
            <div className="font-serif text-xl">Homepage Hero Configuration</div>
            <p className="mt-1 text-sm text-ink/60">Dynamically update the text and images displayed on your customer homepage hero section.</p>
            <form onSubmit={handleHeroUpdate} className="mt-6 border-t border-ink/5 pt-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Hero Badge Text" value={badgeText} onChange={(e) => setBadgeText(e.target.value)} required />
                <Input label="Image Tagline / Badge" value={imageTagline} onChange={(e) => setImageTagline(e.target.value)} required />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Main Title Text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                <Input label="Italic Emphasis Text" value={italicTitle} onChange={(e) => setItalicTitle(e.target.value)} required />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-ink/50">Hero Subtitle</label>
                <textarea
                  className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/20"
                  rows={3}
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Hero Image Link (URL)" value={imageLink} onChange={(e) => setImageLink(e.target.value)} required />
                <Input label="Image Title / Label" value={imageTitle} onChange={(e) => setImageTitle(e.target.value)} required />
              </div>
              <Button disabled={savingHero}>
                {savingHero ? "Saving..." : "Save Homepage Content"}
              </Button>
            </form>
          </div>
        </div>

        {/* Admin Account & Danger Zone */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-ink/5">
            <div className="font-serif text-xl">Return Policy Config</div>
            <p className="mt-1 text-xs text-ink/60">
              Set the number of days a customer has to return an order after delivery.
            </p>
            <form onSubmit={handleReturnSettingsUpdate} className="mt-6 border-t border-ink/5 pt-6 space-y-4">
              <Input
                label="Return Window (Days)"
                type="number"
                min="0"
                max="90"
                value={returnWindowDays}
                onChange={(e) => setReturnWindowDays(e.target.value)}
                required
                className="focus:!border-rose-gold"
              />
              <Button disabled={savingReturn} className="w-full">
                {savingReturn ? "Saving..." : "Save Policy"}
              </Button>
            </form>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-ink/5">
            <div className="font-serif text-xl">Admin Account</div>
            <div className="mt-3 text-sm text-ink/70">
              Logged in as <b>{user?.name}</b> ({user?.email})
            </div>
            <form onSubmit={handlePasswordUpdate} className="mt-6 border-t border-ink/5 pt-6 space-y-4">
              <div className="font-serif text-lg text-ink">Change Password</div>
              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="focus:!border-rose-gold"
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="focus:!border-rose-gold"
              />
              <Button disabled={updating} className="w-full">
                {updating ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-ink/5">
            <div className="font-serif text-xl text-rose-700">Danger Zone</div>
            <p className="mt-1 text-sm text-ink/60">
              Wipe all local demo data and re-seed the store. (Local mock only.)
            </p>
            <Button variant="outline" className="mt-4 w-full border-rose-100 text-rose-700 hover:bg-rose-50" onClick={() => {
              if (confirm("Wipe local demo data?")) {
                ["ccd_products","ccd_orders","ccd_custom_requests","ccd_users","ccd_pw","ccd_settings"].forEach((k) => localStorage.removeItem(k));
                location.reload();
              }
            }}>
              Reset Demo Data
            </Button>
          </div>
        </div>
      </div>

      {/* ── Email Template Configuration ── */}
      <div className="mt-8">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-ink/5">
          <div className="flex items-center gap-3">
            <div className="font-serif text-xl">Email Template Configuration</div>
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-amber-700">
              Live
            </span>
          </div>
          <p className="mt-1 text-sm text-ink/60">
            Customize the messages sent to customers on order confirmation and status updates.
            Use placeholders: <code className="rounded bg-ink/5 px-1 py-0.5 text-xs text-rose-700">{"{customerName}"}</code>{" "}
            <code className="rounded bg-ink/5 px-1 py-0.5 text-xs text-rose-700">{"{orderId}"}</code>{" "}
            <code className="rounded bg-ink/5 px-1 py-0.5 text-xs text-rose-700">{"{status}"}</code>
          </p>

          <form onSubmit={handleEmailTemplatesUpdate} className="mt-6 border-t border-ink/5 pt-6 space-y-8">
            {/* ── Confirmation Email ── */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px flex-1 bg-ink/5" />
                <span className="text-[11px] font-semibold uppercase tracking-widest text-ink/40">
                  Order Confirmation Email
                </span>
                <div className="h-px flex-1 bg-ink/5" />
              </div>
              <div className="space-y-4">
                <Input
                  label="Email Subject Line"
                  value={confirmSubject}
                  onChange={(e) => setConfirmSubject(e.target.value)}
                  placeholder="Order Placed Successfully - {orderId} | Tavishalove Store."
                  required
                />
                <Input
                  label="Greeting / Headline"
                  value={confirmGreeting}
                  onChange={(e) => setConfirmGreeting(e.target.value)}
                  placeholder="Thank you for your order, {customerName}!"
                  required
                />
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-ink/50">
                    Message Body
                  </label>
                  <textarea
                    className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/20"
                    rows={4}
                    value={confirmMessage}
                    onChange={(e) => setConfirmMessage(e.target.value)}
                    placeholder="Your custom tailored dress order #{orderId} has been received and is currently being processed..."
                    required
                  />
                </div>
              </div>
            </div>

            {/* ── Status Update Email ── */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px flex-1 bg-ink/5" />
                <span className="text-[11px] font-semibold uppercase tracking-widest text-ink/40">
                  Order Status Update Email
                </span>
                <div className="h-px flex-1 bg-ink/5" />
              </div>
              <div className="space-y-4">
                <Input
                  label="Email Subject Line"
                  value={statusSubject}
                  onChange={(e) => setStatusSubject(e.target.value)}
                  placeholder="Tailoring Progress Update - {orderId} | Tavishalove Store."
                  required
                />
                <Input
                  label="Greeting / Headline"
                  value={statusGreeting}
                  onChange={(e) => setStatusGreeting(e.target.value)}
                  placeholder="Great news, {customerName}!"
                  required
                />
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-ink/50">
                    Message Body
                  </label>
                  <textarea
                    className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/20"
                    rows={4}
                    value={statusMessage}
                    onChange={(e) => setStatusMessage(e.target.value)}
                    placeholder="The progress of your order #{orderId} has been updated to: {status}. Our tailors are detailing..."
                    required
                  />
                </div>
              </div>
            </div>

            <Button disabled={savingEmail}>
              {savingEmail ? "Saving Templates..." : "Save Email Templates"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Card({ title, ok, desc, envKey }: { title: string; ok: boolean; desc: string; envKey: string }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-ink/5">
      <div className="flex items-center justify-between">
        <div className="font-serif text-xl leading-none">{title}</div>
        <span className={"rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider " +
          (ok ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>
          {ok ? "Configured" : "Mock"}
        </span>
      </div>
      <p className="mt-2 text-xs text-ink/70 leading-relaxed">{desc}</p>
      <div className="mt-3 font-mono text-[10px] text-ink/50 truncate">.env → {envKey}</div>
    </div>
  );
}
