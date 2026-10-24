import { ZaloIcon } from "@/components/ZaloIcon";

const SDT = "0978076936";

/**
 * Nút Zalo nổi góc dưới bên phải, luôn hiện trên mọi tab.
 * Trên điện thoại đẩy cao lên để không đè thanh điều hướng dưới.
 */
export function NutZalo() {
  return (
    <a
      href={`https://zalo.me/${SDT}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Nhắn Zalo cho Phong"
      className="nut-zalo"
    >
      <span className="nut-zalo__vien">
        <span className="nut-zalo__cham" aria-hidden />
        <span className="nut-zalo__nhan">Nhắn Zalo · Rep ngay 24/7</span>
      </span>
      <ZaloIcon className="nut-zalo__logo" gradient />
    </a>
  );
}
