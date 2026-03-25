# Plan 3: Pipeline IA — Qualifying (Chat Haiku + Brief)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the chat-based onboarding flow where users describe their business through a conversation with Claude Haiku, which extracts a structured brief (brief_json) used for site generation.

**Architecture:** Next.js page with streaming chat UI, Server Actions calling Claude Haiku API, messages persisted in PostgreSQL via Prisma, file uploads to Supabase Storage. The qualifying conversation ends by producing a brief_json and enqueuing a "generate" job to BullMQ.

**Tech Stack:** Next.js 14 App Router, Anthropic SDK (@anthropic-ai/sdk), Supabase Storage, Prisma, BullMQ, React (streaming UI)

**Spec:** `docs/superpowers/specs/2026-03-25-masamune-saas-design.md` (sections 5.2, 6.1)
**Prompts:** `AgentDoc/PromptEngineer/prompt-catalog.md` (section A — Haiku Qualifying)
**Design:** `AgentDoc/UIUXDesigner/user-flows.md` (section 4 — Creation site)

**Depends on:** Plan 2 (Auth & Core SaaS) — must be completed first

---

### Task 1: Install dependencies

**Files:**
- Modify: `app/package.json`

- [ ] **Step 1: Install Anthropic SDK and streaming utils**

```bash
cd C:/2-Travail/Masamune/app
npm install @anthropic-ai/sdk ai
```

- [ ] **Step 2: Add env var to .env.example**

Append to `.env.example`:

```env
# Anthropic (used by app for Haiku qualifying)
ANTHROPIC_API_KEY=CHANGE_ME
```

- [ ] **Step 3: Commit**

```bash
cd C:/2-Travail/Masamune
rtk git add app/package.json app/package-lock.json .env.example
rtk git commit -m "feat: add Anthropic SDK dependency"
```

---

### Task 2: Create chat API route with Haiku streaming

**Files:**
- Create: `app/src/app/api/chat/[siteId]/message/route.ts`
- Create: `app/src/app/api/chat/[siteId]/history/route.ts`
- Create: `app/src/lib/ai/haiku.ts`
- Create: `app/src/lib/ai/prompts.ts`

- [ ] **Step 1: Create Haiku qualifying system prompt**

Create `app/src/lib/ai/prompts.ts`:

```typescript
export const HAIKU_QUALIFYING_SYSTEM_PROMPT = `Tu es l'assistant de creation de site web Masamune. Tu aides des entrepreneurs et gerants de petites entreprises a creer leur site professionnel en leur posant quelques questions simples.

## Ton role

Tu dois collecter les informations necessaires pour generer un site web professionnel. Tu poses UNE SEULE question a la fois, de maniere conversationnelle. Tu ne parles JAMAIS de technique (HTML, CSS, hebergement, DNS). Tu parles le langage de ton interlocuteur : son metier, ses clients, ses besoins.

## Ton

- Professionnel mais chaleureux
- Zero jargon technique
- Utilise le vocabulaire du metier du client quand tu l'as identifie
- Phrases courtes, questions claires
- Quand c'est possible, propose des choix concrets plutot que des questions ouvertes

## Deroulement

### Etape 1 — Identification du business (1-2 questions)
Commence par demander quel type d'activite le client exerce. Des que tu identifies le secteur, adapte ton vocabulaire et tes questions.

Premiere question obligatoire :
"Bonjour ! Je vais vous aider a creer votre site web en quelques minutes. Pour commencer, quelle est votre activite ?"

### Etape 2 — Informations essentielles (2-3 questions)
Selon le secteur detecte, collecte :
- Nom de l'entreprise
- Localisation (ville ou zone de chalandise)
- Ce qui distingue le client de ses concurrents

### Etape 3 — Contenu et fonctionnalites (2-3 questions)
Propose des options adaptees au secteur :
- Pages recommandees
- Fonctionnalites cles (reservation, menu, devis, portfolio, galerie...)
- Horaires, moyens de contact

### Etape 4 — Style et identite (1-2 questions)
- Ambiance souhaitee (propose 3-4 adjectifs adaptes au secteur)
- Couleurs preferees

### Etape 5 — Assets (1 question)
Demande si le client a des photos, un logo ou des images a utiliser.

### Etape 6 — Confirmation
Resume le brief de maniere naturelle et demande confirmation. Si le client valide, reponds avec EXACTEMENT ce format en fin de message :

\`\`\`brief_json
{
  "business": {
    "name": "Nom de l'entreprise",
    "type": "secteur",
    "location": "ville",
    "description": "description courte"
  },
  "pages": ["accueil", "services", "contact"],
  "features": ["formulaire_contact", "horaires", "google_maps"],
  "style": {
    "tone": "chaleureux",
    "colors_hint": "naturel"
  },
  "assets": [],
  "seo": {
    "target_keywords": ["mot-cle 1", "mot-cle 2"],
    "locality": "ville"
  }
}
\`\`\`

## Regles absolues
- UNE question par message, jamais deux
- Ne propose jamais d'option technique
- Si le client est confus ou hesite, rassure et simplifie
- Si une reponse est ambigue, demande une clarification
- Maximum 10 messages avant de proposer le resume
`;

export function extractBriefJson(text: string): Record<string, unknown> | null {
  const match = text.match(/```brief_json\n([\s\S]*?)\n```/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: Create Haiku client wrapper**

Create `app/src/lib/ai/haiku.ts`:

```typescript
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function streamHaikuResponse(
  systemPrompt: string,
  messages: { role: "user" | "assistant"; content: string }[]
) {
  const stream = anthropic.messages.stream({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  });

  return stream;
}

export async function getHaikuResponse(
  systemPrompt: string,
  messages: { role: "user" | "assistant"; content: string }[]
): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock?.text || "";
}
```

- [ ] **Step 3: Create chat message API route**

Create `app/src/app/api/chat/[siteId]/message/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth";
import { streamHaikuResponse } from "@/lib/ai/haiku";
import { HAIKU_QUALIFYING_SYSTEM_PROMPT, extractBriefJson } from "@/lib/ai/prompts";
import { addJob } from "@/lib/queue";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return unauthorizedResponse();

  const { siteId } = await params;
  const { message } = await request.json();

  if (!message || typeof message !== "string") {
    return new Response(JSON.stringify({ error: "message is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Verify site belongs to user
  const site = await prisma.site.findFirst({
    where: { id: siteId, userId: user!.id },
  });
  if (!site) {
    return new Response(JSON.stringify({ error: "Site not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Get or create conversation
  let conversation = await prisma.conversation.findFirst({
    where: { siteId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { siteId },
      include: { messages: true },
    });
  }

  // Save user message
  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      role: "user",
      content: message,
    },
  });

  // Build messages for Haiku
  const aiMessages = [
    ...conversation.messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user" as const, content: message },
  ];

  // Stream response from Haiku
  const stream = await streamHaikuResponse(
    HAIKU_QUALIFYING_SYSTEM_PROMPT,
    aiMessages
  );

  // Use TransformStream to collect full response while streaming
  let fullResponse = "";

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          const text = event.delta.text;
          fullResponse += text;
          controller.enqueue(encoder.encode(text));
        }
      }

      // Save assistant message
      await prisma.message.create({
        data: {
          conversationId: conversation!.id,
          role: "assistant",
          content: fullResponse,
        },
      });

      // Check if brief_json was generated
      const briefJson = extractBriefJson(fullResponse);
      if (briefJson) {
        // Update site with brief and trigger generation
        await prisma.site.update({
          where: { id: siteId },
          data: {
            briefJson: briefJson as any,
            status: "generating",
          },
        });

        await prisma.conversation.update({
          where: { id: conversation!.id },
          data: { briefExtracted: true },
        });

        // Enqueue generation job
        await addJob("generate-site", {
          siteId,
          briefJson,
        });
      }

      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
```

- [ ] **Step 4: Create chat history API route**

Create `app/src/app/api/chat/[siteId]/history/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return unauthorizedResponse();

  const { siteId } = await params;

  const site = await prisma.site.findFirst({
    where: { id: siteId, userId: user!.id },
  });
  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  const conversation = await prisma.conversation.findFirst({
    where: { siteId },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  return NextResponse.json({
    messages: conversation?.messages || [],
    briefExtracted: conversation?.briefExtracted || false,
  });
}
```

- [ ] **Step 5: Commit**

```bash
cd C:/2-Travail/Masamune
rtk git add app/src/lib/ai/ app/src/app/api/chat/
rtk git commit -m "feat: add chat API with Haiku streaming and brief extraction"
```

---

### Task 3: Create chat UI component

**Files:**
- Create: `app/src/components/chat/ChatInterface.tsx`
- Create: `app/src/components/chat/ChatMessage.tsx`
- Create: `app/src/components/chat/ChatInput.tsx`

- [ ] **Step 1: Create ChatMessage component**

Create `app/src/components/chat/ChatMessage.tsx`:

```tsx
interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export default function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  return (
    <div className={`flex ${role === "user" ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl ${
          role === "user"
            ? "bg-indigo-600 text-white rounded-br-md"
            : "bg-gray-100 text-gray-900 rounded-bl-md"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{content}</p>
        {isStreaming && (
          <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1" />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create ChatInput component**

Create `app/src/components/chat/ChatInput.tsx`:

```tsx
"use client";

import { useState, useRef } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t bg-white">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          e.target.style.height = "auto";
          e.target.style.height = `${e.target.scrollHeight}px`;
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || "Decrivez votre activite..."}
        disabled={disabled}
        rows={1}
        className="flex-1 resize-none px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 max-h-32"
      />
      <button
        type="submit"
        disabled={disabled || !input.trim()}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Envoyer
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Create ChatInterface component**

Create `app/src/components/chat/ChatInterface.tsx`:

```tsx
"use client";

import { useState, useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  siteId: string;
  initialMessages?: Message[];
  briefExtracted?: boolean;
}

export default function ChatInterface({
  siteId,
  initialMessages = [],
  briefExtracted = false,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isComplete, setIsComplete] = useState(briefExtracted);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send initial greeting if no messages
  useEffect(() => {
    if (messages.length === 0 && !isComplete) {
      sendMessage("Bonjour");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sendMessage(content: string) {
    // Add user message to UI
    const userMessage: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMessage]);
    setIsStreaming(true);

    // Add empty assistant message for streaming
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const response = await fetch(`/api/chat/${siteId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });

      if (!response.ok) throw new Error("Chat request failed");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No reader");

      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;

        // Update the last (assistant) message
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: fullText,
          };
          return updated;
        });
      }

      // Check if brief was extracted (contains brief_json block)
      if (fullText.includes("```brief_json")) {
        setIsComplete(true);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Desolee, une erreur est survenue. Pouvez-vous reessayer ?",
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {messages
          .filter((m) => m.role !== "user" || m.content !== "Bonjour")
          .map((message, index) => (
            <ChatMessage
              key={index}
              role={message.role}
              content={
                message.role === "assistant"
                  ? message.content.replace(/```brief_json[\s\S]*?```/g, "").trim()
                  : message.content
              }
              isStreaming={isStreaming && index === messages.length - 1}
            />
          ))}
        <div ref={messagesEndRef} />
      </div>

      {isComplete ? (
        <div className="p-4 bg-green-50 border-t border-green-200 text-center">
          <p className="text-green-800 font-medium">
            Votre site est en cours de creation !
          </p>
          <p className="text-green-600 text-sm mt-1">
            Vous serez notifie des qu&apos;il sera pret.
          </p>
        </div>
      ) : (
        <ChatInput
          onSend={sendMessage}
          disabled={isStreaming}
          placeholder="Repondez ici..."
        />
      )}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
cd C:/2-Travail/Masamune
rtk git add app/src/components/chat/
rtk git commit -m "feat: add chat UI components with streaming support"
```

---

### Task 4: Create the "new site" page with chat

**Files:**
- Create: `app/src/app/dashboard/new/page.tsx`
- Create: `app/src/app/dashboard/sites/[id]/page.tsx`

- [ ] **Step 1: Create new site page**

Create `app/src/app/dashboard/new/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewSitePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    setLoading(true);
    try {
      const response = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: "Nouveau site",
          businessType: "a-definir",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Erreur lors de la creation");
        return;
      }

      const site = await response.json();
      router.push(`/dashboard/sites/${site.id}`);
    } catch (err) {
      console.error(err);
      alert("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }

  // Auto-create on mount
  useState(() => {
    handleCreate();
  });

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
        <p className="mt-4 text-gray-600">
          {loading ? "Preparation de votre site..." : "Redirection..."}
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create site detail page with chat**

Create `app/src/app/dashboard/sites/[id]/page.tsx`:

```tsx
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

  const site = await prisma.site.findFirst({
    where: { id, userId: user.id },
    include: {
      conversations: {
        include: { messages: { orderBy: { createdAt: "asc" } } },
      },
    },
  });

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
                En cours de generation
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
```

- [ ] **Step 3: Commit**

```bash
cd C:/2-Travail/Masamune
rtk git add app/src/app/dashboard/new/ app/src/app/dashboard/sites/
rtk git commit -m "feat: add new site creation page and chat-based site detail view"
```

---

### Task 5: Add file upload support

**Files:**
- Create: `app/src/app/api/upload/route.ts`
- Modify: `app/src/components/chat/ChatInput.tsx` (add upload button)

- [ ] **Step 1: Create upload API route**

Create `app/src/app/api/upload/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return unauthorizedResponse();

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const siteId = formData.get("siteId") as string;

  if (!file || !siteId) {
    return NextResponse.json(
      { error: "file and siteId are required" },
      { status: 400 }
    );
  }

  // Verify site ownership
  const site = await prisma.site.findFirst({
    where: { id: siteId, userId: user!.id },
  });
  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "video/mp4"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "Type de fichier non supporte. Utilisez JPG, PNG, WebP, SVG ou MP4." },
      { status: 400 }
    );
  }

  // Validate file size (50MB max)
  if (file.size > 50 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Fichier trop volumineux (max 50MB)" },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();
  const fileName = `${siteId}/${Date.now()}-${file.name}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { data, error: uploadError } = await supabase.storage
    .from("site-assets")
    .upload(fileName, buffer, {
      contentType: file.type,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: "Upload failed: " + uploadError.message },
      { status: 500 }
    );
  }

  const { data: urlData } = supabase.storage
    .from("site-assets")
    .getPublicUrl(data.path);

  // Save asset in DB
  const assetType = file.type.startsWith("video/") ? "video" : "image";
  const asset = await prisma.siteAsset.create({
    data: {
      siteId,
      type: assetType,
      originalUrl: urlData.publicUrl,
    },
  });

  return NextResponse.json(asset, { status: 201 });
}
```

- [ ] **Step 2: Update ChatInput to support file upload**

Update `app/src/components/chat/ChatInput.tsx` — add a file upload button next to the textarea that calls the upload endpoint and notifies the chat that a file was uploaded.

- [ ] **Step 3: Commit**

```bash
cd C:/2-Travail/Masamune
rtk git add app/src/app/api/upload/ app/src/components/chat/ChatInput.tsx
rtk git commit -m "feat: add file upload to Supabase Storage with chat integration"
```

---

## Summary

| Task | Description | Est. time |
|------|-------------|-----------|
| 1 | Install Anthropic SDK | 2 min |
| 2 | Chat API with Haiku streaming + brief extraction | 15 min |
| 3 | Chat UI components (streaming) | 10 min |
| 4 | New site page + site detail with chat | 10 min |
| 5 | File upload to Supabase Storage | 10 min |
| **Total** | | **~47 min** |

## Next Plan

After this plan is complete, proceed to **Plan 4: Pipeline IA Generation** which will:
- Implement the Worker job handler for "generate-site"
- Use Claude Sonnet to generate HTML/CSS/Tailwind code
- Build static site files
- Deploy to /var/www/sites-clients/ and configure Nginx
- Send real-time notifications via Supabase Realtime
