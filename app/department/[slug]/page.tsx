import { env } from "cloudflare:workers";
import { notFound } from "next/navigation";
import NamoApp from "../../NamoApp";
import { requireChatGPTUser } from "../../chatgpt-auth";

export const dynamic = "force-dynamic";

const categories: Record<string, string> = {
  "civic-infra": "civic_infra",
  "health-education": "health_edu",
  "law-order": "law_order",
  transport: "transport",
  "employment-welfare": "employment_welfare",
};

export default async function DepartmentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = categories[slug];
  if (!category) notFound();
  const user = await requireChatGPTUser(`/department/${slug}`);
  const runtime = env as unknown as { ADMIN_EMAIL?: string };
  const admin = Boolean(runtime.ADMIN_EMAIL && user.email.toLowerCase() === runtime.ADMIN_EMAIL.toLowerCase());
  const access = await env.DB.prepare(`SELECT dp.portal_id AS portalId FROM department_portals dp JOIN departments d ON d.id=dp.department_id WHERE d.category=? AND lower(dp.staff_email)=lower(?)`).bind(category, user.email).first<{ portalId: string }>();
  if (!admin && !access) {
    return <main className="access-denied"><section><p className="eyebrow">DEPARTMENT-ONLY QUEUE</p><h1>Access is not assigned</h1><p>Ask the administrator to assign your signed-in email to this department ID.</p><a className="btn btn-primary" href="/">Return to public site</a></section></main>;
  }
  return <NamoApp initialPortal="department" />;
}
