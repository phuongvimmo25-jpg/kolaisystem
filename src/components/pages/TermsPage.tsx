import { LegalLayout, Section } from "./LegalLayout";

// ⚠️ ĐỔI email này thành email hỗ trợ thật của bạn trước khi gửi Google duyệt.
const CONTACT_EMAIL = "hotro@kolaisystem.com";

export function TermsPage() {
  return (
    <LegalLayout title="Điều khoản sử dụng" updatedAt="29/08/2026">
      <p>
        Khi đăng nhập và sử dụng KOL AI SYSTEM, bạn đồng ý với các điều khoản dưới đây. Nếu không đồng ý, vui lòng
        không sử dụng hệ thống.
      </p>

      <Section heading="1. Về dịch vụ">
        <p>
          KOL AI SYSTEM là nền tảng huấn luyện dành cho KOL và affiliate tại Việt Nam, vận hành theo mô hình thử
          thách 30 ngày với nhiệm vụ hằng ngày, tích điểm, huy hiệu và bảng xếp hạng.
        </p>
      </Section>

      <Section heading="2. Tài khoản">
        <ul className="list-disc pl-5 space-y-1">
          <li>Bạn đăng nhập bằng tài khoản Google. Mỗi người dùng một tài khoản.</li>
          <li>Bạn chịu trách nhiệm giữ an toàn cho tài khoản Google của mình.</li>
          <li>Bạn cam kết cung cấp thông tin trung thực, không mạo danh người khác.</li>
          <li>Bạn phải từ 16 tuổi trở lên.</li>
        </ul>
      </Section>

      <Section heading="3. Quy tắc sử dụng">
        <p>Bạn không được:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Khai báo gian dối số liệu thu nhập hoặc tiến độ nhằm leo bảng xếp hạng.</li>
          <li>Dùng công cụ tự động, mã can thiệp hoặc bất kỳ cách nào để thao túng điểm số.</li>
          <li>Tấn công, dò quét hoặc gây quá tải hệ thống.</li>
          <li>Sao chép, phát tán lại tài liệu huấn luyện khi chưa được cho phép bằng văn bản.</li>
          <li>Đăng nội dung vi phạm pháp luật Việt Nam hoặc xúc phạm người dùng khác.</li>
        </ul>
        <p>Chúng tôi có quyền khoá tài khoản vi phạm mà không cần hoàn lại bất kỳ khoản phí nào.</p>
      </Section>

      <Section heading="4. Nội dung huấn luyện">
        <p>
          Toàn bộ bài giảng, video, tài liệu và phương pháp trong hệ thống thuộc quyền sở hữu trí tuệ của chúng
          tôi. Bạn được sử dụng cho mục đích học tập cá nhân, không được bán lại, chia sẻ tài khoản hoặc dùng để
          đào tạo thương mại khi chưa có sự đồng ý.
        </p>
      </Section>

      <Section heading="5. Miễn trừ trách nhiệm về thu nhập">
        <p>
          Đây là nội dung quan trọng, đề nghị bạn đọc kỹ. KOL AI SYSTEM cung cấp kiến thức, phương pháp và công cụ
          theo dõi tiến độ. Chúng tôi <strong>không cam kết, không bảo đảm</strong> bất kỳ mức thu nhập cụ thể nào.
        </p>
        <p>
          Kết quả của mỗi người phụ thuộc vào năng lực, thời gian đầu tư, thị trường, sản phẩm lựa chọn và nhiều
          yếu tố nằm ngoài tầm kiểm soát của chúng tôi. Các con số xuất hiện trong bài giảng hoặc bảng xếp hạng là
          kết quả của cá nhân cụ thể, <strong>không phải mức thu nhập điển hình</strong> và không nên xem là lời
          hứa hẹn.
        </p>
        <p>Mọi quyết định kinh doanh và tài chính của bạn là do bạn tự chịu trách nhiệm.</p>
      </Section>

      <Section heading="6. Dữ liệu bạn khai báo">
        <p>
          Các mốc thu nhập bạn nhập vào hệ thống là do bạn tự khai. Chúng tôi không kiểm chứng và không chịu trách
          nhiệm về tính chính xác của những con số đó.
        </p>
      </Section>

      <Section heading="7. Tính sẵn sàng của dịch vụ">
        <p>
          Chúng tôi nỗ lực duy trì hệ thống hoạt động liên tục, nhưng không cam kết dịch vụ không bao giờ gián
          đoạn. Có thể xảy ra bảo trì, nâng cấp hoặc sự cố từ nhà cung cấp hạ tầng. Chúng tôi không chịu trách
          nhiệm về thiệt hại phát sinh từ việc gián đoạn dịch vụ.
        </p>
      </Section>

      <Section heading="8. Ngừng sử dụng">
        <p>
          Bạn có thể ngừng sử dụng bất cứ lúc nào và yêu cầu xoá tài khoản qua email. Chúng tôi có thể tạm ngưng
          hoặc chấm dứt quyền truy cập của bạn nếu bạn vi phạm các điều khoản này.
        </p>
      </Section>

      <Section heading="9. Quyền riêng tư">
        <p>
          Việc thu thập và xử lý dữ liệu cá nhân được nêu chi tiết trong{" "}
          <a href="/privacy" className="text-primary hover:underline">Chính sách bảo mật</a>, là một phần không tách
          rời của điều khoản này.
        </p>
      </Section>

      <Section heading="10. Thay đổi điều khoản">
        <p>
          Chúng tôi có thể cập nhật điều khoản và sẽ đổi ngày ở đầu trang. Việc bạn tiếp tục sử dụng sau khi cập
          nhật đồng nghĩa với việc bạn chấp nhận nội dung mới.
        </p>
      </Section>

      <Section heading="11. Luật áp dụng và liên hệ">
        <p>
          Điều khoản này được điều chỉnh theo pháp luật Việt Nam. Mọi thắc mắc xin gửi về:{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
            {CONTACT_EMAIL}
          </a>
        </p>
      </Section>
    </LegalLayout>
  );
}
