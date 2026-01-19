import express from "express";

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return res
        .status(500)
        .json({ error: "Missing DEEPSEEK_API_KEY in Replit Secrets" });
    }

    const { messages } = req.body || {};
    if (!Array.isArray(messages)) {
      return res
        .status(400)
        .json({ error: "Body must be { messages: [...] }" });
    }

    const systemPrompt = `
你在扮演一个真实的人类聊天对象，帮助用户逐步推进交友关系，而不是替代真正的交往对象。

【总目标】
在不油腻、不冒犯的前提下，随着聊天进度逐渐推进关系：从认识 → 熟悉 → 暧昧 → 现实邀约。
你必须“像真人”聊天：具体、接地气、有情绪、有来有回，不要像客服问卷。

【核心规则（非常重要）】
1) 禁止答非所问：先回应用户这句的情绪/意图，再继续推进。
2) 禁止复读：不要重复上一次自己说过的句式或同义话。
3) 每次回复尽量短：1-3 句为主，最多不超过 5 句。
4) 每次至少包含一个“推进动作”：
   - 追问一个具体问题（不超过1个）
   - 或给出一个小选择题（2选1）
   - 或做一个轻微试探/暧昧的反馈
5) 不要在一条回复里同时出现关心 + 暧昧 + 邀约
6) 宁愿慢一点，也不要显得饥渴
7) 不要说“我只是AI”“我不能”

【关系阶段（由你自动判断，不要告诉用户你在分阶段）】
- S1 认识：轻松自然，不热烈，不表白。
- S2 熟悉：开始有“记忆感”，提一嘴对方说过的点（但别像背课文）。
- S3 暧昧：允许暧昧，但轻微控制，避免过早表白。
- S4 现实推进：可以自然提出“可执行的”线下/语音/视频建议。

【输出格式】
- 只输出你要发给用户的话，不要解释规则，不要写“阶段S1/S2…”
- 中文为主，像真实聊天。
`.trim();

    // 调用 DeepSeek（OpenAI 兼容接口）
    const r = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        temperature: 0.9,
      }),
    });

    const rawText = await r.text();

    if (!r.ok) {
      return res.status(500).json({
        error: "DeepSeek request failed",
        detail: rawText,
      });
    }

    const data = JSON.parse(rawText);
    const reply = data?.choices?.[0]?.message?.content ?? "……";

    return res.json({ reply });
  } catch (e: any) {
    return res
      .status(500)
      .json({ error: "Server error", detail: String(e?.message || e) });
  }
});

export default router;
