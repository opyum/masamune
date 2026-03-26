import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import ChatInterface from "@/components/chat/ChatInterface";

export default async function SiteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { id } = await params;

  let site = null;
  try {
    site = await prisma.site.findFirst({
      where: { id, userId: user.id },
      include: {
        conversations: {
          include: { messages: { orderBy: { createdAt: "asc" } } },
        },
      },
    });
  } catch {
    // DB not ready - redirect to dashboard
    redirect("/dashboard");
  }

  if (!site) redirect("/dashboard");

  const conversation = site.conversations[0];
  const messages = conversation?.messages.map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    content: m.content,
  })) || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{site.businessName}</h2>
          <p className="text-sm text-gray-500">
            {site.slug}.masamune.app
            {site.status === "live" && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                En ligne
              </span>
            )}
            {site.status === "generating" && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                En cours de génération
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ height: "calc(100vh - 220px)" }}>
        <ChatInterface
          siteId={site.id}
          initialMessages={messages}
          briefExtracted={conversation?.briefExtracted || false}
        />
      </div>
    </div>
  );
}
