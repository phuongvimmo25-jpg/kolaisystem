/** Ngày hôm nay theo giờ Việt Nam (UTC+7), dạng YYYY-MM-DD. */
export function todayVN(): string {
  const d = new Date();
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  const vn = new Date(utc + 7 * 3600000);
  return vn.toISOString().slice(0, 10);
}
