# G-PM: Gemini Project Manager (Phiên bản Tiếng Việt)

**G-PM** là một framework phát triển dựa trên đặc tả (Spec-Driven Development), được thiết kế đặc biệt cho các AI Agent (như Gemini/Antigravity) và các đội nhóm phát triển. Nó áp dụng quy trình nghiêm ngặt: Lập kế hoạch -> Thiết kế -> Thực thi để giảm thiểu lỗi và tối đa hóa khả năng mở rộng.

## Cài Đặt (Installation)

1.  Copy thư mục `.gpm` vào thư mục gốc của dự án.
2.  Cấp quyền thực thi cho script:
    ```bash
    chmod +x .gpm/scripts/*.sh
    ```
3.  Đảm bảo bạn đã cài đặt GitHub CLI (`gh`) và đăng nhập.

## Bắt Đầu Nhanh (Quick Start)

### 1. Khởi tạo (Initialize)
```bash
./.gpm/scripts/gpm.sh init
```
Lệnh này sẽ tạo cấu trúc thư mục và các nhãn (label) cần thiết trên GitHub.

### 2. Lập kế hoạch (Plan)
```bash
./.gpm/scripts/gpm.sh plan authentication
```
Tạo bản nháp PRD tại `.gpm/storage/prds/`. Hãy yêu cầu AI điền nội dung vào file này.

### 3. Thiết kế (Design)
```bash
./.gpm/scripts/gpm.sh design authentication
```
Tạo bản nháp Kiến trúc (Architecture) dựa trên PRD.

### 4. Chia nhỏ Task (Split)
```bash
./.gpm/scripts/gpm.sh split authentication
```
Yêu cầu AI phân rã kiến trúc thành các file task nhỏ trong `.gpm/storage/tasks/`.

### 5. Đồng bộ GitHub (Sync)
```bash
./.gpm/scripts/gpm.sh sync
```
Đẩy toàn bộ các task cục bộ lên GitHub Issues để theo dõi.

### 6. Thực thi (Run)
```bash
./.gpm/scripts/gpm.sh run [task_id]
```
Lấy nội dung task để Antigravity thực hiện.

## Cấu trúc Thư mục

- `core/`: Các quy tắc hệ thống.
- `templates/`: Các mẫu chuẩn cho PRD, Architecture.
- `storage/`: "Bộ nhớ" của dự án (Lưu PRD, Tasks).
- `scripts/`: Công cụ dòng lệnh (CLI).
- `context/`: Ngữ cảnh cho AI (JSON).

## Cấu hình Ignore (Khuyên dùng)

Để đảm bảo G-PM không ảnh hưởng đến bản dựng Production (Docker, Node build), hãy thêm `.gpm` vào các file ignore của bạn:

**1. .dockerignore**
```text
.gpm
.gpm/*
```

**2. .eslintignore**
```text
.gpm
```

**3. tsconfig.json (exclude)**
```json
{
  "exclude": [".gpm"]
}
```

**4. .gitignore**
Bạn **NÊN** commit `.gpm` lên git để làm việc nhóm, NHƯNG có thể ignore các file tạm:
```text
.gpm/temp/
```

## Triết lý

- **Không Spec, Không Code**: Đừng bao giờ đoán mò. Hãy viết kế hoạch trước.
- **Ngữ cảnh là Vua**: AI cần ngữ cảnh đầy đủ để làm việc hiệu quả.
- **Đồng bộ**: Giữ cho file local và GitHub Issues luôn đồng nhất.
