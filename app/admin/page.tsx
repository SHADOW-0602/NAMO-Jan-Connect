import { env } from "cloudflare:workers";
import NamoApp from "../NamoApp";
import { requireChatGPTUser } from "../chatgpt-auth";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireChatGPTUser("/admin");
  const runtime = env as unknown as { ADMIN_EMAIL?: string };
  if (!runtime.ADMIN_EMAIL || user.email.toLowerCase() !== runtime.ADMIN_EMAIL.toLowerCase()) {
    return <main className="access-denied"><section><p className="eyebrow">RESTRICTED PORTAL</p><h1>Administrator access required</h1><p>This URL is reserved for the single NAMO Jan Connect administrator.</p><a className="btn btn-primary" href="/">Return to public site</a></section></main>;
  }
  return <NamoApp initialPortal="admin" />;
}
