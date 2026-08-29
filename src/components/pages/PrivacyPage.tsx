import { LegalLayout, Section } from "./LegalLayout";

// ⚠️ ĐỔI email này thành email hỗ trợ thật của bạn trước khi gửi Google duyệt.
const CONTACT_EMAIL = "hotro@kolaisystem.com";

export function PrivacyPage() {
  return (
    <LegalLayout title="Chính sách bảo mật" updatedAt="29/08/2026">
      <p>
        KOL AI SYSTEM (“chúng tôi”) là nền tảng huấn luyện affiliate và KOL trong 30 ngày. Trang này giải thích
        chúng tôi thu thập thông tin gì của bạn, dùng vào việc gì, và bạn có quyền gì đối với thông tin đó.
      </p>

      <Section heading="1. Thông tin chúng tôi thu thập">
        <p>Khi bạn đăng nhập bằng tài khoản Google, chúng tôi nhận từ Google:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Địa chỉ email</strong> — dùng làm định danh tài khoản của bạn.</li>
          <li><strong>Tên hiển thị</strong> — hiển thị trên hồ sơ và bảng xếp hạng.</li>
          <li><strong>Ảnh đại diện</strong> — hiển thị trên hồ sơ.</li>
        </ul>
        <p>Trong quá trình sử dụng, hệ thống lưu thêm dữ liệu do chính bạn tạo ra:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Tiến độ nhiệm vụ hằng ngày, số ngày streak, điểm tích luỹ.</li>
          <li>Các mốc thu nhập bạn tự khai báo.</li>
          <li>Huy hiệu đạt được và video bài học đã xem.</li>
        </ul>
        <p>
          Chúng tôi <strong>không</strong> yêu cầu và <strong>không</strong> lưu mật khẩu của bạn. Việc xác thực do
          Google thực hiện.
        </p>
      </Section>

      <Section heading="2. Mục đích sử dụng">
        <ul className="list-disc pl-5 space-y-1">
          <li>Tạo và duy trì tài khoản của bạn trên hệ thống.</li>
          <li>Ghi nhận tiến độ học tập và hiển thị bảng xếp hạng giữa các học viên.</li>
          <li>Trao huy hiệu, tính điểm và theo dõi hành trình 30 ngày.</li>
          <li>Hỗ trợ bạn khi có sự cố kỹ thuật.</li>
        </ul>
        <p>
          Chúng tôi <strong>không dùng dữ liệu của bạn để quảng cáo</strong> và{" "}
          <strong>không bán, không cho thuê, không trao đổi</strong> dữ liệu đó cho bên thứ ba.
        </p>
      </Section>

      <Section heading="3. Thông tin nào được người khác nhìn thấy">
        <p>
          Bảng xếp hạng là tính năng công khai trong nội bộ hệ thống. Các học viên khác có thể thấy{" "}
          <strong>tên hiển thị, ảnh đại diện, điểm số và huy hiệu</strong> của bạn.
        </p>
        <p>
          Địa chỉ email, các mốc thu nhập bạn khai báo và chi tiết nhiệm vụ hằng ngày của bạn{" "}
          <strong>chỉ mình bạn xem được</strong>. Hệ thống dùng cơ chế phân quyền theo từng dòng dữ liệu
          (Row Level Security) ở tầng cơ sở dữ liệu để bảo đảm điều này.
        </p>
      </Section>

      <Section heading="4. Lưu trữ và bảo mật">
        <p>
          Dữ liệu được lưu trên hạ tầng của <strong>Supabase</strong> (nền tảng cơ sở dữ liệu PostgreSQL được quản
          lý), đặt tại trung tâm dữ liệu khu vực Đông Bắc Á. Mọi kết nối giữa trình duyệt của bạn và máy chủ đều
          được mã hoá bằng HTTPS.
        </p>
        <p>
          Chúng tôi áp dụng phân quyền theo dòng dữ liệu: mỗi truy vấn chỉ trả về dữ liệu thuộc về chính tài khoản
          đang đăng nhập. Không nhân viên nào cần mật khẩu của bạn để hỗ trợ, vì chúng tôi không lưu mật khẩu.
        </p>
      </Section>

      <Section heading="5. Bên thứ ba chúng tôi sử dụng">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Google</strong> — xác thực đăng nhập.</li>
          <li><strong>Supabase</strong> — lưu trữ cơ sở dữ liệu và quản lý phiên đăng nhập.</li>
        </ul>
        <p>
          Chúng tôi không chia sẻ dữ liệu của bạn cho bất kỳ đơn vị nào khác, trừ khi có yêu cầu hợp pháp từ cơ
          quan nhà nước có thẩm quyền.
        </p>
      </Section>

      <Section heading="6. Thời gian lưu trữ">
        <p>
          Dữ liệu của bạn được lưu trong suốt thời gian tài khoản còn hoạt động. Khi bạn yêu cầu xoá tài khoản,
          toàn bộ hồ sơ, tiến độ, mốc thu nhập và huy hiệu sẽ bị xoá vĩnh viễn khỏi cơ sở dữ liệu trong vòng 30 ngày.
        </p>
      </Section>

      <Section heading="7. Quyền của bạn">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Xem</strong> — truy cập trang Hồ sơ để xem dữ liệu hệ thống đang lưu về bạn.</li>
          <li><strong>Sửa</strong> — tự cập nhật tên hiển thị và ảnh đại diện bất cứ lúc nào.</li>
          <li><strong>Xoá</strong> — yêu cầu xoá toàn bộ tài khoản và dữ liệu bằng cách gửi email cho chúng tôi.</li>
          <li>
            <strong>Rút quyền truy cập Google</strong> — bạn có thể thu hồi quyền của ứng dụng bất cứ lúc nào tại{" "}
            <a
              href="https://myaccount.google.com/permissions"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              trang quản lý quyền của tài khoản Google
            </a>.
          </li>
        </ul>
      </Section>

      <Section heading="8. Trẻ em">
        <p>
          Hệ thống dành cho người từ 16 tuổi trở lên. Chúng tôi không cố ý thu thập dữ liệu của trẻ em dưới độ tuổi
          này. Nếu phát hiện, chúng tôi sẽ xoá ngay khi được thông báo.
        </p>
      </Section>

      <Section heading="9. Thay đổi chính sách">
        <p>
          Khi có thay đổi, chúng tôi cập nhật nội dung trên trang này và đổi ngày ở đầu trang. Với những thay đổi
          lớn ảnh hưởng đến quyền của bạn, chúng tôi sẽ thông báo trong ứng dụng.
        </p>
      </Section>

      <Section heading="10. Liên hệ">
        <p>
          Mọi thắc mắc về quyền riêng tư, hoặc yêu cầu xoá dữ liệu, vui lòng gửi email tới:{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
            {CONTACT_EMAIL}
          </a>
        </p>
      </Section>
    </LegalLayout>
  );
}
