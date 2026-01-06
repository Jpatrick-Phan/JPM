# JPM-CLI: Just Project Manager 🚀

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-green)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

**JPM (Jatrick Project Manager)** là một công cụ dòng lệnh (CLI) phục vụ phát triển phần mềm theo định hướng đặc tả (Spec-Driven Development), được thiết kế để tối ưu hóa quy trình làm việc giữa AI Agents và Lập trình viên. Nó áp dụng quy trình nghiêm ngặt "Lập kế hoạch → Thiết kế → Chia nhỏ → Đồng bộ" để đảm bảo chất lượng mã nguồn và sự nhất quán của dự án.

---

## 🌟 Tại sao nên chọn JPM?

- **🧠 Định hướng Đặc tả**: Không còn cảnh code "đại". Mọi tính năng đều bắt buộc phải có PRD và Tài liệu Kiến trúc.
- **⚡ Sức mạnh AI**: Sử dụng Google Gemini để tạo ra các đặc tả chất lượng cao và chia nhỏ công việc một cách thông minh.
- **🤝 Đồng bộ GitHub**: Tự động chia nhỏ các tính năng lớn thành "Parent Issues" kèm theo danh sách công việc (Tasklists) có thể theo dõi được.
- **🛡️ Tuân thủ Quy tắc Master**: Bắt buộc AI tuân thủ các quy tắc dự án (Tech Stack, Cách đặt tên, Thiết kế) được định nghĩa trong `JPM_MASTER.md`.

---

## 📦 Cài đặt

Cài đặt toàn cục (Global) thông qua NPM:

```bash
npm install -g jpm-cli
```

### Cấu hình (Quan trọng!)

JPM yêu cầu Google Gemini API Key để hoạt động. Bạn có thể thiết lập dễ dàng như sau:

1.  Chạy lệnh cấu hình:
    ```bash
    jpm config
    ```
    *(Lệnh này sẽ mở thư mục cài đặt gốc của jpm-cli)*
2.  Tạo hoặc nhân bản file `.env` trong thư mục đó.
3.  Thêm key của bạn vào:
    ```env
    JPM_API_KEY=your_gemini_api_key_here
    ```

---

## 🚀 Quy trình "Zero to Hero"

### 1. Khởi tạo Dự án
Đi đến thư mục dự án của bạn và đánh thức JPM.

```bash
mkdir my-super-app
cd my-super-app
jpm init
```
*Lệnh này tạo cấu trúc `.jpm/` và file `JPM_MASTER.md`. Hãy sửa `JPM_MASTER.md` để định nghĩa Tech Stack của bạn!*

### 2. Lập kế hoạch (The "What")
Tạo Tài liệu Yêu cầu Sản phẩm (PRD).

```bash
jpm plan "Xác thực người dùng"
```

### 3. Thiết kế Hệ thống (The "How")
Tạo kiến trúc kỹ thuật dựa trên PRD đã có.

```bash
jpm design "Xác thực người dùng"
```

### 4. Chia nhỏ Công việc (The "Steps")
Chia nhỏ kiến trúc thành các task nhỏ, cụ thể, sẵn sàng để code.

```bash
jpm split "Xác thực người dùng"
```

### 5. Đồng bộ lên GitHub (The "Management")
Đẩy các task lên GitHub Issues (yêu cầu đã cài `gh` CLI).

```bash
jpm sync
```

---

## 🧹 Bảo trì

Dọn dẹp cache và các file backup để tiết kiệm dung lượng:

```bash
jpm clean
```

---

## 🛠️ Công nghệ sử dụng

- **Runtime**: Node.js
- **Ngôn ngữ**: TypeScript
- **AI**: Google Gemini (via `@google/generative-ai`)
- **Công cụ CLI**: `inquirer`, `ora`, `boxen`, `commander`

---

Được làm với ❤️ bởi Jatrick
