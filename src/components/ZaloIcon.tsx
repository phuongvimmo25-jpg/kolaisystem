/**
 * Logo Zalo — bộ biểu tượng của app không có sẵn nên vẽ lại:
 * hình tròn, bên trong là bong bóng chat trắng có chữ Zalo.
 *
 * Khung vẽ 96×96 (thay vì 48×48) để các đường cong có gấp đôi độ phân giải,
 * nhìn mượt hơn hẳn khi phóng to. Đuôi bong bóng bo liền mạch, không gãy góc.
 *
 * `gradient` đổi nền tròn sang chuyển màu xanh–tím, dùng cho nút nổi.
 */
export function ZaloIcon({ className, gradient }: { className?: string; gradient?: boolean }) {
  const nen = gradient ? "url(#zalo-grad)" : "#0068FF";
  const mauChu = gradient ? "#4b3bd8" : "#0068FF";

  return (
    <svg
      viewBox="0 0 96 96"
      className={className}
      aria-hidden
      focusable="false"
      shapeRendering="geometricPrecision"
    >
      {gradient && (
        <defs>
          <linearGradient id="zalo-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0a84ff" />
            <stop offset="55%" stopColor="#5b5bff" />
            <stop offset="100%" stopColor="#b02ce0" />
          </linearGradient>
        </defs>
      )}

      <circle cx="48" cy="48" r="48" fill={nen} />

      {/* Bong bóng chat — đuôi bo cong liền mạch với thân, không gãy góc */}
      <path
        d="M33 23h30a16 16 0 0 1 16 16v15a16 16 0 0 1-16 16H46.6c-2.7 5.6-7.6 9.4-14.6 11.5-1.9.6-3.4-1.4-2.3-3 2.4-3.5 3.7-6.4 4-8.8a16 16 0 0 1-16.7-16V39a16 16 0 0 1 16-16Z"
        fill="#fff"
      />

      <text
        x="48"
        y="47.5"
        textAnchor="middle"
        dominantBaseline="central"
        fill={mauChu}
        fontFamily="'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
        fontSize="27"
        fontWeight="700"
        letterSpacing="-1"
        textRendering="geometricPrecision"
      >
        Zalo
      </text>
    </svg>
  );
}
