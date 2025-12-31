# JPM: Jatrick Project Manager (Phiên bản Tiếng Việt)

**JPM** là một framework phát triển phần mềm dựa trên đặc tả (Spec-Driven Development), được thiết kế tối ưu cho việc phối hợp giữa con người và các AI Agent có ngữ cảnh lớn (như Gemini 1.5 Pro, Claude 3 Opus, GPT-4).

JPM áp dụng quy trình nghiêm ngặt: **Plan (Lập kế hoạch) -> Design (Thiết kế) -> Execute (Thực thi)** để đảm bảo mọi dòng code được viết ra đều đã được suy nghĩ kỹ lưỡng.

## Cài Đặt

### Cách 1: Cài qua NPM (Khuyên dùng)
Bạn có thể cài đặt JPM như một công cụ toàn cục (Global Tool) trên máy tính của mình.

```bash
npm install -g jpm-cli
```

### Cách 2: Cài thủ công
1. Clone repository này về máy: `git clone https://github.com/jatrick/jpm.git ~/.jpm-core`
2. Thêm vào PATH:
   - **Mac/Linux**: Thêm `export PATH="$HOME/.jpm-core/.jpm/scripts:$PATH"` vào `.bashrc` hoặc `.zshrc`.
   - **Windows**: Thêm đường dẫn `C:\Users\YourName\.jpm-core\.jpm\scripts` vào biến môi trường PATH.

## Hướng Dẫn Sử Dụng

### 1. Khởi tạo dự án (Init)
Đi đến thư mục dự án của bạn và chạy lệnh:

```bash
jpm init
```
Lệnh này sẽ tạo thư mục `.jpm/` trong dự án để lưu trữ các tài liệu đặc tả (PRD, Architecture, Tasks).

### 2. Cấu hình AI (Config)
Để sử dụng tính năng tạo nội dung tự động (`jpm gen`), bạn cần cấu hình API Key.

**Ví dụ với Gemini:**
```bash
jpm config JPM_AI_PROVIDER gemini
jpm config JPM_GEMINI_API_KEY "AIzaSy...Của_Bạn"
```

**Các Provider hỗ trợ:** `gemini`, `openai`, `claude`.

### 3. Quy trình làm việc (Workflow)

JPM hỗ trợ quy trình "Human-in-the-loop" (Con người tham gia vào vòng lặp), cho phép bạn chỉnh sửa kết quả của AI ở bất kỳ bước nào.

**Bước 1: Lập kế hoạch (Plan)**
Bạn có thể yêu cầu AI tạo bản nháp PRD ngay từ đầu bằng cách cung cấp mô tả ngắn gọn.
```bash
jpm plan authentication "Người dùng có thể đăng nhập bằng Google và Email/Password"
```
*Kết quả: AI sẽ điền vào template PRD tại `.jpm/storage/prds/prd-authentication.md`.*

> **Lưu ý:** Sau bước này, bạn nên mở file PRD ra để chỉnh sửa, bổ sung các yêu cầu chi tiết mà AI có thể đã bỏ sót.

**Bước 2: Thiết kế (Design)**
Sau khi đã chốt nội dung PRD, hãy yêu cầu AI thiết kế kiến trúc hệ thống.
```bash
jpm design authentication
```
*Kết quả: JPM sẽ tự động tìm file PRD tương ứng và yêu cầu AI tạo tài liệu Architecture tại `.jpm/storage/epics/arch-authentication.md`.*

> **Lưu ý:** Tương tự, hãy review và chỉnh sửa file Architecture trước khi sang bước tiếp theo.

**Bước 3: Chia nhỏ công việc (Split)**
Chuẩn bị chia nhỏ Architecture thành các Task lập trình cụ thể.
```bash
jpm split authentication
```

**Bước 4: Đồng bộ GitHub (Sync)**
Đẩy các Task đã tạo lên GitHub Issues để quản lý tiến độ.
```bash
jpm sync
```

**Bước 5: Thực thi (Run)**
Lấy ngữ cảnh của một Task để đưa cho AI Agent (như Gemini Advanced, ChatGPT) thực hiện code.
```bash
jpm run task-001
```

## Cấu Trúc Thư Mục
- **Global (`JPM_HOME`)**: Nơi cài đặt JPM, chứa các template mẫu và script lõi.
- **Local (`.jpm/`)**: Nằm trong mỗi dự án của bạn.
  - `storage/`: Chứa toàn bộ tài liệu dự án (PRDs, Epics, Tasks).
  - `context/`: Chứa `project-map.json` (bản đồ dự án).

## Triết Lý
- **No Spec, No Code**: Không bao giờ code khi chưa có kế hoạch.
- **Context is King**: AI cần ngữ cảnh đầy đủ để làm việc hiệu quả. JPM giúp bạn quản lý ngữ cảnh đó.
