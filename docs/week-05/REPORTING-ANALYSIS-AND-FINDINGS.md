# Week 5 – Reporting, Analysis & Findings

**Tác giả:** Nguyen Ngoc Lan  
**Ngày:** 26/02/2026  
**Dữ liệu nguồn:** Odoo Helpdesk – file `sample.xlsx` 
**Tổng ticket phân tích:** 121 ticket hợp lệ (đã loại 8 ticket test)

---

## 1. Báo Cáo Odoo (Odoo Reports)

### 1.1 Báo cáo theo Trạng thái (Stage)

Toàn bộ 121 ticket trong tập dữ liệu đang ở trạng thái **In Progress** — đây là snapshot tại thời điểm export, chưa bao gồm ticket đã đóng.

| Trạng thái | Số ticket | Tỷ lệ |
|---|---|---|
| In Progress | 121 | 100% |

> **Ghi chú:** Cần export thêm ticket ở stages khác như New, Waiting, Resolved, Closed để phân tích đầy đủ hơn.

---

### 1.2 Báo cáo theo Danh mục (Tags)

| Tag | Số ticket | Tỷ lệ | Ghi chú |
|---|---|---|---|
| CRM | 22 | 18% | Hệ thống quản lý Lead/Sales |
| LMS | 14 | 12% | Hệ thống học tập |
| TMS | 9 | 7% | Hệ thống chấm công |
| Các vấn đề về mail | 4 | 3% | Email nội bộ |
| Bug | 4 | 3% | Lỗi phần mềm không rõ nguồn |
| Denise / E-learning | 4 | 3% | Nền tảng E-learning |
| Xspace, E-contract, khác | 5 | 4% | Rải rác |
| **Chưa được tag** | **57** | **47%** | Cần cải thiện |

**47% ticket không có tag** — đây là vấn đề cần xử lý để phân tích pattern chính xác hơn. Đề xuất bổ sung trường tag bắt buộc khi tạo ticket trong Odoo.

---

### 1.3 Báo cáo theo Mức độ ưu tiên (Priority)

| Priority | Số ticket | Tỷ lệ |
|---|---|---|
| Urgent | 40 | 33% |
| High | 42 | 35% |
| Medium | 8 | 7% |
| Low | 31 | 26% |

**68% ticket ở mức Urgent/High**, cho thấy phần lớn vấn đề có tác động trực tiếp đến vận hành.

---

### 1.4 Báo cáo theo Người phụ trách (Assigned To)

Toàn bộ ticket đều thuộc team **Technical Support**. Ở cấp độ cá nhân, phần lớn ticket chưa được gán agent cụ thể — chỉ có 2 ticket assign cho Pham Thi Thuy.

Đề xuất: bổ sung quy trình assign ticket cho agent cụ thể khi tiếp nhận, để đo được workload và hiệu suất từng người.

---

## 2. Phân Tích Pattern – Top 5 Tính Năng Nhiều Ticket Nhất

Từ 121 ticket, phân loại theo tính năng cụ thể (không phải theo hệ thống). Kết quả:

| # | Tính năng | Hệ thống | Ticket | % | Priority nổi bật |
|---|---|---|---|---|---|
| 1 | Enroll học viên vào lớp | LMS / CRM | 14 | 12% | 6 Urgent, 4 High |
| 2 | TMS – Không hiển thị / mất dữ liệu chấm công | TMS | 13 | 11% | 7 Urgent, 4 High |
| 3 | CRM – Payment / Giao dịch | CRM | 8 | 7% | 2 Urgent, 4 High |
| 4 | CRM – Lead / Chuyển trạng thái | CRM | 7 | 6% | 2 Urgent, 4 High |
| 5 | Mail – Cấp / Reset tài khoản email | Mail / IT | 4 | 3% | 4 Urgent |

> Top 5 tính năng = **46 ticket = 38% tổng volume**.

---

### 2.1 Enroll học viên vào lớp (14 ticket – 12%)

**Ticket mẫu:**
- `LỖI ENROLL` (LMS, High) × 3
- `KHÔNG THỂ ENROLL HỌC VIÊN` (LMS, Urgent) × 2
- `NHỜ TEAM TECH SỬA LẠI TÊN ĐÚNG TRONG PHẦN ENROLLMENT CỦA HỌC VIÊN` (CRM, Urgent) × 2
- `BU SONG HÀNH NHỜ TEAM TECH CHECK VÀ MỞ GIÚP BU SLOT ENROLL HỌC VIÊN` (LMS, Urgent)
- `REQUEST FIX ENROLLMENT – HỌC VIÊN BỊ ENROLL TRÙNG LỚP LBB-C4K-SI19` (Low)

**Nguyên nhân gốc rễ:**  
Nghiệp vụ Enroll phân tán giữa CRM và LMS — BU thao tác không nhất quán dẫn đến enroll trùng lớp, sai tên, thiếu slot. Không có validation tự động trước khi xác nhận enroll.

**Tác động:**  
14 ticket, 6/14 Urgent. BU mất 20–30 phút/ticket để phối hợp với Tech xử lý. Học viên bị chậm vào lớp.

---

### 2.2 TMS – Không hiển thị / mất dữ liệu chấm công (13 ticket – 11%)

**Ticket mẫu:**
- `TMS BỊ LỖI KHÔNG HIỆN THÔNG TIN` (Urgent)
- `TMS mất dữ liệu` (Urgent)
- `Hệ thống TMS không hiển thị công` (Urgent)
- `TMS không hiển thị công cần duyệt để duyệt công trước khi hết tháng` (Urgent)
- `[Tỉnh Nam 2] – LỖI TMS TỪ NGÀY 31. KHÔNG HIỆN THÔNG TIN VÀ THAO TÁC` (Urgent)

**Nguyên nhân gốc rễ:**  
TMS không ổn định vào cuối tháng — thời điểm nhiều BU chốt công đồng thời. Không có monitoring chủ động, lỗi chỉ phát hiện khi nhân sự báo ticket.

**Tác động:**  
7/13 ticket ở mức Urgent — tỷ lệ Urgent cao nhất trong tất cả các nhóm. Ảnh hưởng nhiều BU cùng lúc, rủi ro trễ lương nếu không xử lý kịp trước khi chốt công.

---

### 2.3 CRM – Payment / Giao dịch (8 ticket – 7%)

**Ticket mẫu:**
- `KHÔNG TẠO MÃ QR THANH TOÁN ĐƯỢC` (High)
- `Lead kế toán báo không Confirmed được` (Urgent)
- `Lỗi Add payment` (Urgent)
- `LEAD CRM ĐÃ ADD PAYMENT VẪN NẰM Ở L5A` (Urgent)
- `NHỜ KẾ TOÁN HỦY CF GIAO DỊCH 1TR TRÊN LEAD DO ADD 2 LẦN` (Low)

**Nguyên nhân gốc rễ:**  
Kế toán và BU không có quy trình rõ ràng cho các trường hợp payment đặc biệt (hủy confirm, add trùng, QR lỗi). Hệ thống không hiển thị lý do lỗi cụ thể, khiến người dùng không tự xử lý được.

**Tác động:**  
Ảnh hưởng trực tiếp doanh thu và quy trình kế toán. Mỗi ticket cần phối hợp ít nhất 2 bên (Tech + Kế toán/BU).

---

### 2.4 CRM – Lead / Chuyển trạng thái (7 ticket – 6%)

**Ticket mẫu:**
- `Hỗ trợ vấn đề import lead trên CRM` (Urgent)
- `LEAD CRM ĐÃ ADD PAYMENT VẪN NẰM Ở L5A` (Urgent)
- `chuyển đổi trạng thái Lead` (High) × 2
- `Nhờ ticket hỗ trợ chuyển trạng thái lead` (High)

**Nguyên nhân gốc rễ:**  
BU chưa nắm quy trình chuyển trạng thái lead. Một số lead bị kẹt trạng thái do payment chưa xác nhận hoặc thiếu bước trung gian. Import lead từ file ngoài gây lỗi dữ liệu.

**Tác động:**  
7 ticket làm chậm pipeline sales. Agent phải kiểm tra và thao tác thủ công ~15–20 phút/ticket.

---

### 2.5 Mail – Cấp / Reset tài khoản email (4 ticket – 3%)

**Ticket mẫu:**
- `HỖ TRỢ CẤP LẠI MAIL CONTACT CỦA BU HẢI PHÒNG` (Urgent)
- `CẤP MAIL OUTLOOK ĐỂ LÀM VIỆC NỘI BỘ` (Urgent) × 2
- `CẤP LẠI MẬT KHẨU MAIL` (Urgent)

**Nguyên nhân gốc rễ:**  
Không có quy trình tự phục vụ cho cấp/reset mail nội bộ. Onboarding nhân viên mới và đổi cơ sở chưa có checklist chuẩn, dẫn đến BU gửi ticket mỗi lần phát sinh. Cả 4/4 ticket đều Urgent.

**Tác động:**  
Nhỏ về số lượng nhưng 100% Urgent — mail là công cụ thiết yếu, mất quyền truy cập ảnh hưởng công việc ngay lập tức. Có thể automation hoàn toàn.

---

## 3. Phát Hiện Chính (Key Findings)

1. **CRM là hệ thống phát sinh nhiều ticket nhất** — tập trung ở 3 tính năng: Enroll, Payment, Lead/Trạng thái. Cần SOP riêng cho từng nhóm.
2. **TMS có tỷ lệ Urgent cao nhất** (7/13 = 54%) — rủi ro vận hành lớn nhất, đặc biệt vào cuối tháng khi nhiều BU chốt công đồng thời.
3. **47% ticket không có tag** — điểm mù lớn, cần xử lý để các kỳ sau phân tích được chính xác hơn.
4. **Phần lớn ticket có thể giảm bằng SOP + canned response**, không cần code fix — phù hợp với hướng Operating Engineer.
5. **Top 5 tính năng chiếm 38% tổng volume** — tập trung vào 5 nhóm này trước để giảm tải nhanh nhất cho đội Support.

---

## 4. Action Plan
> **Lưu ý:** Data phân tích thuộc toàn đội Technical Support. 
> Deadline dưới đây là timeline mô phỏng/ đề xuất — thời gian thực tế 
> phụ thuộc vào xác nhận của các team liên quan.

### 4.1 Enroll học viên vào lớp

**Bước thực hiện:**
1. Viết SOP 1 trang cho BU tự kiểm tra trước khi gửi ticket: slot lớp còn không, HV đã enroll trùng chưa, trạng thái lead có đúng chưa.
2. Tạo canned response trong Odoo cho 3 lỗi enroll phổ biến nhất.
3. Đề xuất Dev thêm cảnh báo validation khi enroll trùng lớp hoặc slot = 0.

**Metric:** Giảm từ 14 xuống ≤ 5 ticket/tháng. Thời gian xử lý từ ~25 phút xuống < 10 phút/ticket.  
**Cách đo:** Đếm ticket có keyword "ENROLL" sau 4 tuần triển khai SOP.

| Loại | Việc cụ thể | Deadline |
|---|---|---|
| OE tự làm | Viết SOP + tạo canned response trong Odoo | 09/03/2026 |
| Cần Dev | Thêm validation khi enroll trùng / hết slot | Đề xuất tuần 6 – timeline do Dev xác nhận |

---

### 4.2 TMS – Không hiển thị / mất dữ liệu chấm công

**Bước thực hiện:**
1. Viết runbook mô tả triệu chứng, các bước kiểm tra ban đầu và escalation path để Dev/Infra có thể follow khi sự cố xảy ra.
2. Theo dõi và báo cáo số ticket TMS hàng tuần cho Dev để có bằng chứng ưu tiên xử lý.
3. Đề xuất Dev setup monitoring uptime và lên lịch maintenance trước ngày 27 hàng tháng.

**Metric:** Giảm từ 13 xuống ≤ 4 ticket/tháng. Thời gian phát hiện sự cố: từ "phát hiện qua ticket" → phát hiện qua monitoring trong < 15 phút.  
**Cách đo:** Đếm ticket có keyword "TMS", "chấm công", "hiển thị công" trước và sau khi có monitoring – đo lại sau 1 tháng.

| Loại | Việc cụ thể | Deadline |
|---|---|---|
| OE tự làm | Viết runbook + báo cáo ticket TMS hàng tuần cho Dev | 14/03/2026 |
| Cần Dev/Infra | Setup monitoring uptime + lên lịch maintenance cuối tháng | Đề xuất tuần 6 – timeline do Dev/Infra xác nhận |

---

### 4.3 CRM – Payment / Giao dịch

**Bước thực hiện:**
1. Viết FAQ 1 trang cho kế toán/BU về các trường hợp thường gặp: hủy confirm, xử lý trùng payment, QR không tạo được.
2. Tạo nhóm Zalo/Slack nội bộ Tech–Kế toán để xử lý nhanh các case đơn giản không cần mở ticket.
3. Đề xuất Dev cải thiện thông báo lỗi trên màn hình payment (hiển thị lý do cụ thể thay vì generic error).

**Metric:** Giảm từ 8 xuống ≤ 3 ticket/tháng.  
**Cách đo:** Đếm ticket có keyword "payment", "QR", "confirm", "giao dịch" sau 4 tuần triển khai FAQ.

| Loại | Việc cụ thể | Deadline |
|---|---|---|
| OE tự làm | Viết FAQ + lập nhóm Tech–Kế toán | 10/03/2026 |
| Cần Dev | Cải thiện thông báo lỗi màn hình payment | Đề xuất tuần 6 – timeline do Dev xác nhận |

---

### 4.4 CRM – Lead / Chuyển trạng thái

**Bước thực hiện:**
1. Vẽ flowchart quy trình chuyển trạng thái lead, share cho toàn bộ BU/Sale qua kênh nội bộ.
2. Tạo canned response trong Odoo hướng dẫn BU tự kiểm tra trạng thái trước khi gửi ticket.
3. Đề xuất Dev thêm audit log cho thao tác đổi trạng thái để dễ debug.

**Metric:** Giảm từ 7 xuống ≤ 3 ticket/tháng.  
**Cách đo:** Đếm ticket có keyword "lead", "trạng thái" sau 4 tuần triển khai flowchart.

| Loại | Việc cụ thể | Deadline |
|---|---|---|
| OE tự làm | Vẽ flowchart + tạo canned response trong Odoo | 14/03/2026 |
| Cần Dev | Thêm audit log cho thao tác đổi trạng thái lead | Đề xuất tuần 7 – timeline do Dev xác nhận |

---

### 4.5 Mail – Cấp / Reset tài khoản email

**Bước thực hiện:**
1. Tạo checklist onboarding email chuẩn cho nhân viên mới/đổi cơ sở — do HR thực hiện, không qua ticket Tech.
2. Tạo form yêu cầu cấp mail chuẩn hóa để giảm ticket thiếu thông tin.
3. Đề xuất IT bật self-service password reset cho Outlook (Microsoft SSPR nếu có Azure AD).

**Metric:** Giảm từ 4 xuống ≤ 1 ticket/tháng.  
**Cách đo:** Đếm ticket có keyword "mail", "outlook", "mật khẩu mail" sau 4 tuần; xác nhận với HR đã đưa checklist vào quy trình onboarding chưa.

| Loại | Việc cụ thể | Deadline |
|---|---|---|
| OE tự làm | Tạo checklist onboarding + form yêu cầu cấp mail | 10/03/2026 |
| Cần IT/HR | Bật SSPR cho Outlook + đưa checklist vào quy trình HR | Đề xuất tuần 6 – timeline do IT/HR xác nhận |

---

## 5. Tổng Hợp Ưu Tiên

| # | Tính năng | Mức ưu tiên | OE tự làm xong trước | Ticket giảm dự kiến |
|---|---|---|---|---|
| 1 | Enroll học viên vào lớp | Cao | 07/03/2026 | 14 → ≤5 |
| 2 | TMS – Không hiển thị công | Cao | 14/03/2026 | 13 → ≤4 |
| 3 | CRM – Payment / Giao dịch | Cao | 10/03/2026 | 8 → ≤3 |
| 4 | CRM – Lead / Trạng thái | Trung bình | 14/03/2026 | 7 → ≤3 |
| 5 | Mail – Cấp/Reset email | Trung bình | 10/03/2026 | 4 → ≤1 |

**Tổng ước tính:** Nếu thực hiện đủ 5 action plan → giảm ~46 ticket = 38% tổng volume từ top 5 nhóm này.

---

## 6. Ghi Chú – Chất Lượng Dữ Liệu Cần Cải Thiện

- **Bổ sung tag bắt buộc** khi tạo ticket trong Odoo — hiện 47% ticket không có tag, làm khó phân tích.
- **Bật SLA tracking** để đo thời gian xử lý thực tế từng ticket.
- **Export thêm ticket Closed/Done** trong kỳ tới để phân tích resolution rate.
- **Chuẩn hóa tiêu đề ticket** — một số ticket mô tả quá ngắn (VD: `SALE`, `TK-ROB-SEMII03`) không đủ thông tin để phân loại.