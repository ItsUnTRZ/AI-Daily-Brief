import { cookies } from "next/headers";
import AdminClient from "./admin-client";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // server-side gate: if no valid cookie, show login
  const token = (await cookies()).get("token")?.value;
  let ok = false;
  if (token) {
    try {
      const res = await fetch(new URL("/api/posts", "http://localhost").toString(), {
        headers: { cookie: `token=${token}` },
      });
      ok = res.ok;
    } catch { ok = false; }
  }
  if (!ok) return <AdminClient mode="login" />;
  return <AdminClient mode="editor" />;
}
