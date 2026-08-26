-- Seed: today's brief (Jalapeño)
INSERT INTO Post (id, slug, title, tldr, body, tag, sources, runnersUp, takeaway, readingMin, published, featuredUntil, createdAt, updatedAt)
VALUES (
  'seed001jalapeno',
  'openai-jalapeno-beats-blackwell',
  'ชิป Jalapeño ตัวแรกของ OpenAI เอาชนะ Nvidia Blackwell ได้จริง',
  'OpenAI เปิดผล benchmark ตัวจริงของชิป inference "Jalapeño" ที่ร่วมพัฒนากับ Broadcom — ชนะ Blackwell ทั้ง throughput-per-watt (1.5–1.9x) และ latency (1.7–3.6x) โดยมี SemiAnalysis ยืนยันอิสระถึงห้องแล็บ',
  '## เกิดอะไรขึ้น

ที่งาน **Hot Chips** (25 ส.ค.) OpenAI เปิดเผยผลทดสอบชิป Jalapeño ครั้งแรก — ทดสอบกับโมเดล open 3 ตัว: **GPT-OSS 120B**, **DeepSeek R1 670B** และ **Kimi K2.5 1T**

จุดสำคัญ: ชิปนี้ไม่ได้ optimize เฉพาะโมเดลของ OpenAI เอง SemiAnalysis ที่เข้าไปทดสอบด้วยตัวเองเรียกว่า "generalized inference chip" ไม่ใช่ accelerator เฉพาะทาง

## ตัวเลขที่น่าสนใจ

- งานต่อวัตต์ (throughput/watt) สูงกว่าคู่แข่ง **1.5–1.9 เท่า**
- Latency end-to-end ต่ำกว่า **1.7–3.6 เท่า**
- งานแบบ interactive ดีกว่าถึง **2.1–4.1 เท่า**
- DeepSeek R1 ทำได้เกิน **700 tokens/sec/user** ที่ concurrency ต่ำ — ด้วย single-token prediction ธรรมดา ไม่มี speculative decoding

SemiAnalysis CEO Dylan Patel บอกว่า *"Usually first generation chips aren''t competitive, but OpenAI is beating Nvidia Blackwell and even Rubin"*

## ทำไมเรื่องนี้สำคัญ

1. **ตลาด inference chip ที่ Nvidia ผูกขาดมี challenger จริง** — ครั้งแรกที่ชิป gen แรกของใครสักคนชนะของ Nvidia แบบ measurable
2. OpenAI กำลัง own ทั้ง AI stack (โมเดล + ฮาร์ดแวร์) ก่อน IPO
3. Deployment เริ่มปลายปี 2026, scale ปี 2027 → กระทบต้นทุน API ที่เราจ่ายกันจริง

> เกร็ดสนุกๆ: วิศวกร OpenAI พาชิปตัวนี้รันเกม Doom ได้ โดย port ผ่าน Codex prompts ล้วนๆ — เป็นการโชว์ความ flexible ของ software stack',
  'hardware',
  '[{"name":"OpenAI — Jalapeño first results","url":"https://openai.com/index/jalapeno-first-results/"},{"name":"The Decoder","url":"https://the-decoder.com/openais-first-custom-chip-jalapeno-reportedly-beats-nvidias-blackwell-and-rubin-in-inference-benchmarks/"},{"name":"Hacker News (1,009 points)","url":"https://news.ycombinator.com/"}]',
  '[{"title":"Qwen 3.8-Flash-Next (125B a6B)","why":"โมเดล open MoE ตัวใหม่ เปิดตัวพรุ่งนี้","url":""},{"title":"LLMs could control host machines via inference engines","why":"security angle ใหม่ของ LLM","url":""},{"title":"AI is hitting entry-level jobs hardest — Stanford study","why":"impact ตลาดแรงงานจริง มีข้อมูล","url":""}]',
  'ถ้า Jalapeño scale ได้จริง ต้นทุน inference จะถูกลงทั้ง industry → ราคา API โมเดลใหญ่มีแนวโน้มลด และคงมีผู้เล่นรายอื่นทำชิปเองตามมา',
  4,
  1,
  '2026-08-27',
  datetime('now'),
  datetime('now')
);
