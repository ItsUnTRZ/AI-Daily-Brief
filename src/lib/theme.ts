// Deep Sea theme — design tokens
export const colors = {
  bg: "#0B1220",
  surface: "#111A2E",
  border: "#1E2D4D",
  text: "#E8EEF9",
  muted: "#94A3BF",
  accent: "#4A9EFF",
  teal: "#3ECFB2",
  amber: "#F5B04C",
};

export const TAGS: Record<string, { label: string; color: string }> = {
  hardware: { label: "ฮาร์ดแวร์", color: "#F5B04C" },
  model: { label: "โมเดลใหม่", color: "#4A9EFF" },
  technique: { label: "เทคนิค/วิธีใช้", color: "#3ECFB2" },
  industry: { label: "วงการ AI", color: "#B48CFF" },
  general: { label: "ทั่วไป", color: "#94A3BF" },
};

export function formatDate(iso: string): string {
  const d = new Date(iso);
  const months = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
}
