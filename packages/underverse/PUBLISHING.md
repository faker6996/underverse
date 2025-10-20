# Hướng dẫn build & publish `underverse` lên npm

Tài liệu này mô tả chi tiết cách đóng gói và xuất bản gói UI `underverse`.

## 1) Yêu cầu môi trường
- Node.js >= 18
- Tài khoản npm có quyền publish
- Thiết lập 2FA (khuyến nghị) cho npm

## 2) Cấu trúc & tooling
- Bundler: `tsup` (ESM + CJS + d.ts)
- Entry: `src/index.ts`
- Output: `dist/`
- `prepublishOnly` tự build trước khi publish

## 3) Chuẩn bị một lần
```bash
cd packages/underverse
npm i
npm login   # đăng nhập tài khoản npm
```

Kiểm tra tên gói đã bị chiếm chưa (nếu cần):
```bash
npm view @underverse-ui/underverse version   # nếu trả kết quả nghĩa là tên đã có trên npm
```
- Nếu tên đã có, đổi `name` trong `packages/underverse/package.json`, ví dụ đổi sang `@your-scope/underverse` và publish theo scope của bạn (cần tạo scope và cấp quyền).

## 4) Build local để kiểm tra
```bash
cd packages/underverse
npm run clean
npm run build
ls dist   # xác nhận có file .js, .cjs, .d.ts
```
Tạo gói thử để cài đặt nội bộ:
```bash
npm pack
```
Lệnh này tạo file `underverse-ui-underverse-x.y.z.tgz`. Bạn có thể thử cài đặt vào một dự án khác:
```bash
npm i ../path/to/underverse-ui-underverse-x.y.z.tgz
```

## 5) Tăng version (SemVer)
```bash
# Chọn một trong các mức: patch | minor | major
npm version patch
# hoặc: npm version minor
# hoặc: npm version major
```
Lệnh trên cập nhật `version` trong package.json và tạo Git tag (nếu repo đã init Git). Bạn có thể commit/push tag theo quy trình của mình.

## 6) Publish
```bash
# Public package (không scoped) hoặc scoped-public
npm publish --access public
```
Publish với dist-tag (ví dụ beta):
```bash
npm publish --access public --tag beta
```
Cập nhật dist-tag `latest` sang một version cụ thể:
```bash
npm dist-tag add @underverse-ui/underverse@1.2.3 latest
```

## 7) Xử lý lỗi thường gặp
- 403/Forbidden: tài khoản không có quyền publish hoặc tên gói đã bị chiếm.
- Thiếu file trong `dist/`: kiểm tra `files` trong `package.json` (đã bao gồm `dist`) và đảm bảo build thành công.
- Lỗi ESM/CJS khi dùng: đảm bảo app tiêu thụ theo export chuẩn; gói này cung cấp cả `module` (ESM) và `main` (CJS) + `types`.
- Thiếu peer deps: cài `react`, `react-dom`, `next`, `next-intl` trong app sử dụng.
- Tailwind màu thiếu: cấu hình theme/tokens (primary, secondary, destructive, …) trong dự án sử dụng.

## 8) Quy trình đề xuất
1. Hoàn tất thay đổi -> cập nhật `CHANGELOG` (nếu có)
2. `npm version patch`
3. `npm publish --access public`
4. Tạo PR/Tag/Releases trong Git (tùy quy trình)

## 9) Gỡ/hủy (không khuyến khích)
- `npm unpublish` có giới hạn thời gian và ràng buộc. Thay vào đó, nên `npm deprecate` nếu cần ngừng hỗ trợ:
```bash
npm deprecate @underverse-ui/underverse@<version> "Deprecated message"
```

## 10) Ghi chú khác
- `prepublishOnly` đã cấu hình để tự chạy `clean` và `build` mỗi khi bạn `npm publish`.
- Nếu publish theo scope: cần `npm publish --access public` cho scoped package public.
- Kiểm tra Node version: `node -v` (>=18) để đồng bộ với `engines`.
