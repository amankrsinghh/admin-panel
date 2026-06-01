import { useEffect, useState } from "react";
import { signIn, useAuth } from "../shared/auth";
import { useHashRoute } from "../shared/router";
import { Button, Input, toast } from "../shared/ui";

export function AdminLogin() {
  const { navigate } = useHashRoute();
  const user = useAuth();
  const [email, setEmail] = useState("tavisha@storelove.com");
  const [password, setPassword] = useState("admin123");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user?.role === "admin") navigate("/");
  }, [user]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const u = await signIn(email, password);
      if (u.role !== "admin") throw new Error("This account is not an admin");
      toast("Welcome, " + u.name);
      navigate("/");
    } catch (err) {
      toast((err as Error).message, "err");
    } finally { setBusy(false); }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f0f12] p-6">
      <div className="w-full max-w-md rounded-2xl bg-[#16161a] p-8 ring-1 ring-white/10">
        <div className="text-center">
          <div className="font-serif text-3xl text-white">
            Tavishalove <span className="text-rosegold-gradient">Admin</span>
          </div>
          <p className="mt-2 text-sm text-white/50">Secure designer / admin login</p>
        </div>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            className="!bg-[#0a0a0d] !text-white !border-white/10 focus:!border-rose-gold" />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
            className="!bg-[#0a0a0d] !text-white !border-white/10 focus:!border-rose-gold" />
          <Button className="w-full" disabled={busy}>
            {busy ? "Signing in…" : "Sign in to Admin"}
          </Button>
        </form>
        <div className="mt-6 rounded-lg bg-white/5 p-3 text-[11px] text-white/60">
          Demo: <b className="text-white/90">tavisha@storelove.com</b> / <b className="text-white/90">admin123</b>
        </div>
      </div>
    </div>
  );
}
