import { Router } from "express";
import OpenAI from "openai";
import { db } from "@workspace/db";
import { requestsTable } from "@workspace/db";
import { eq, desc, sql, count } from "drizzle-orm";
import {
  CreateRequestBody,
  ListRequestsQueryParams,
  GetRequestParams,
  UpdateRequestStatusBody,
  UpdateRequestStatusParams,
} from "@workspace/api-zod";

const router = Router();


if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY must be set");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const DEPARTMENTS: Record<string, string> = {
  hr: "Kadrlar bo'limi (HR)",
  it: "Axborot texnologiyalari bo'limi (IT)",
  finance: "Moliya bo'limi",
  legal: "Yuridik bo'lim",
  complaints: "Shikoyatlar bo'limi",
  general: "Umumiy bo'lim",
};

function fallbackClassify(text: string): {
  department: string;
  departmentLabel: string;
  confidence: number;
  reasoning: string;
  priority: string;
} {
  const t = text.toLowerCase();

  const rules: { dept: string; keywords: string[] }[] = [
    { dept: "hr", keywords: ["ish", "ishchi", "xodim", "kadr", "maosh", "oylik", "mehnat", "ta'til", "ishdan", "qabul", "shartnoma", "bonus", "lavozim", "resume", "cv"] },
    { dept: "it", keywords: ["kompyuter", "dastur", "internet", "parol", "tizim", "xatolik", "error", "printer", "server", "wifi", "pochta", "email", "texnik", "it", "software", "hardware", "login", "kirish", "bloklandi"] },
    { dept: "finance", keywords: ["to'lov", "pul", "hisob", "moliya", "byudjet", "xarajat", "soliq", "invoice", "faktura", "bank", "transfer", "kredit", "qarz", "balans"] },
    { dept: "legal", keywords: ["shartnoma", "huquq", "yuridik", "nizo", "da'vo", "litsenziya", "kelishuv", "qonun", "sud", "patent", "nizom", "muofiq"] },
    { dept: "complaints", keywords: ["shikoyat", "norozilik", "muammo", "sifat", "yomon", "ariza", "talab", "norozi", "qoniqmadim", "xizmat yomon"] },
  ];

  let best = { dept: "general", score: 0 };
  for (const rule of rules) {
    const score = rule.keywords.filter(k => t.includes(k)).length;
    if (score > best.score) best = { dept: rule.dept, score };
  }

  const urgentWords = ["shoshilinch", "tezkor", "darhol", "jiddiy", "ishlamayapti", "avaria", "to'xtatildi", "bloklandi"];
  const priority = urgentWords.some(w => t.includes(w)) ? "high" : best.score >= 2 ? "medium" : "low";

  return {
    department: best.dept,
    departmentLabel: DEPARTMENTS[best.dept],
    confidence: best.score > 0 ? Math.min(0.4 + best.score * 0.1, 0.75) : 0.3,
    reasoning: "AI mavjud emas — kalit so'zlar asosida turkumlandi.",
    priority,
  };
}

async function classifyRequest(text: string): Promise<{
  department: string;
  departmentLabel: string;
  confidence: number;
  reasoning: string;
  priority: string;
}> {
  const systemPrompt = `Siz korporativ murojaat turkumlash tizimisiz. Foydalanuvchi murojaatlarini quyidagi bo'limlarga yo'naltiring:

- hr: Kadrlar bo'limi - ish qabul qilish, ishdan bo'shatish, maosh, mehnat shartnomalari, ta'til, ijtimoiy imtiyozlar, xodimlar muammolari
- it: IT bo'limi - kompyuter muammolari, dasturiy ta'minot, parol tiklash, internet, texnik yordam, tizim xatolari
- finance: Moliya bo'limi - to'lovlar, hisob-fakturalar, byudjet, xarajatlar, pullik savollar, moliyaviy hisobotlar
- legal: Yuridik bo'lim - shartnomalar, huquqiy maslahat, nizolar, litsenziyalar, muvofiqlik
- complaints: Shikoyatlar bo'limi - shikoyatlar, norozilik, xizmat sifati muammolari, arizalar
- general: Umumiy bo'lim - yuqoridagilarga kirmaydigan barcha boshqa murojaatlar

Javobni faqat JSON formatda bering:
{
  "department": "<bo'lim kodi>",
  "confidence": <0.0 dan 1.0 gacha son>,
  "reasoning": "<qisqacha izoh (1-2 jumla)>",
  "priority": "<low|medium|high>"
}

Priority qoidalari:
- high: shoshilinch, jiddiy muammo, tizim ishlamayapti, hуquqiy tahdid
- medium: muhim lekin shoshilinch emas
- low: umumiy savol, ma'lumot so'rash`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 300,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Murojaat matni:\n${text}` },
    ],
    response_format: { type: "json_object" },
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw);

  const department = parsed.department in DEPARTMENTS ? parsed.department : "general";

  return {
    department,
    departmentLabel: DEPARTMENTS[department],
    confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.5,
    reasoning: parsed.reasoning ?? "",
    priority: ["low", "medium", "high"].includes(parsed.priority) ? parsed.priority : "medium",
  };
}

// GET /api/requests
router.get("/requests", async (req, res) => {
  const parseResult = ListRequestsQueryParams.safeParse(req.query);
  if (!parseResult.success) {
    res.status(400).json({ error: "Noto'g'ri so'rov parametrlari" });
    return;
  }
  const { department, status, limit = 50 } = parseResult.data;

  let query = db.select().from(requestsTable).$dynamic();

  const conditions = [];
  if (department) conditions.push(eq(requestsTable.department, department));
  if (status) conditions.push(eq(requestsTable.status, status));

  const results = await db
    .select()
    .from(requestsTable)
    .where(conditions.length > 0 ? sql`${conditions.reduce((a, b) => sql`${a} AND ${b}`)}` : undefined)
    .orderBy(desc(requestsTable.createdAt))
    .limit(limit);

  res.json(results);
});

// POST /api/requests
router.post("/requests", async (req, res) => {
  const parseResult = CreateRequestBody.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Noto'g'ri ma'lumotlar", details: parseResult.error.flatten() });
    return;
  }

  const { fullName, contactInfo, text } = parseResult.data;

  let classification;
  let usedFallback = false;
  try {
    classification = await classifyRequest(text);
  } catch (err: any) {
    classification = fallbackClassify(text);
    usedFallback = true;
  }

  const [created] = await db
    .insert(requestsTable)
    .values({
      fullName,
      contactInfo: contactInfo ?? null,
      text,
      department: classification.department,
      departmentLabel: classification.departmentLabel,
      confidence: classification.confidence,
      reasoning: classification.reasoning,
      priority: classification.priority,
      status: "new",
    })
    .returning();

  res.status(201).json({ ...created, usedFallback });
});

// GET /api/requests/stats
router.get("/requests/stats", async (req, res) => {
  const [totalResult] = await db.select({ total: count() }).from(requestsTable);
  const total = totalResult?.total ?? 0;

  const byDepartment = await db
    .select({
      department: requestsTable.department,
      departmentLabel: requestsTable.departmentLabel,
      count: count(),
    })
    .from(requestsTable)
    .groupBy(requestsTable.department, requestsTable.departmentLabel)
    .orderBy(desc(count()));

  const byStatus = await db
    .select({ status: requestsTable.status, count: count() })
    .from(requestsTable)
    .groupBy(requestsTable.status);

  const byPriority = await db
    .select({ priority: requestsTable.priority, count: count() })
    .from(requestsTable)
    .groupBy(requestsTable.priority);

  const recentActivity = await db
    .select()
    .from(requestsTable)
    .orderBy(desc(requestsTable.createdAt))
    .limit(5);

  res.json({ total, byDepartment, byStatus, byPriority, recentActivity });
});

// GET /api/requests/:id
router.get("/requests/:id", async (req, res) => {
  const parseResult = GetRequestParams.safeParse({ id: Number(req.params.id) });
  if (!parseResult.success) {
    res.status(400).json({ error: "Noto'g'ri ID" });
    return;
  }

  const [found] = await db
    .select()
    .from(requestsTable)
    .where(eq(requestsTable.id, parseResult.data.id));

  if (!found) {
    res.status(404).json({ error: "Murojaat topilmadi" });
    return;
  }

  res.json(found);
});

// PATCH /api/requests/:id
router.patch("/requests/:id", async (req, res) => {
  const paramsResult = UpdateRequestStatusParams.safeParse({ id: Number(req.params.id) });
  const bodyResult = UpdateRequestStatusBody.safeParse(req.body);

  if (!paramsResult.success || !bodyResult.success) {
    res.status(400).json({ error: "Noto'g'ri ma'lumotlar" });
    return;
  }

  const [updated] = await db
    .update(requestsTable)
    .set({ status: bodyResult.data.status })
    .where(eq(requestsTable.id, paramsResult.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Murojaat topilmadi" });
    return;
  }

  res.json(updated);
});

export default router;
