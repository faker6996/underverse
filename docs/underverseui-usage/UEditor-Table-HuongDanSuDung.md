# Hướng dẫn sử dụng toàn bộ tính năng bảng trong UEditor

Tài liệu này hướng dẫn thao tác bảng theo giao diện UEditor hiện tại. Nội dung dành cho người trực tiếp soạn thảo, đồng thời có một phần lưu ý cấu hình ở cuối dành cho người tích hợp component.

## Mục lục

1. [Nhận biết các vùng điều khiển bảng](#1-nhận-biết-các-vùng-điều-khiển-bảng)
2. [Tạo bảng mới](#2-tạo-bảng-mới)
3. [Nhập nội dung và di chuyển giữa các ô](#3-nhập-nội-dung-và-di-chuyển-giữa-các-ô)
4. [Chọn văn bản, một ô hoặc nhiều ô](#4-chọn-văn-bản-một-ô-hoặc-nhiều-ô)
5. [Dùng menu điều khiển toàn bảng](#5-dùng-menu-điều-khiển-toàn-bảng)
6. [Thêm, nhân đôi, làm trống và xóa hàng hoặc cột](#6-thêm-nhân-đôi-làm-trống-và-xóa-hàng-hoặc-cột)
7. [Thêm nhanh một hoặc nhiều hàng, cột bằng rail](#7-thêm-nhanh-một-hoặc-nhiều-hàng-cột-bằng-rail)
8. [Kéo để sắp xếp lại hàng hoặc cột](#8-kéo-để-sắp-xếp-lại-hàng-hoặc-cột)
9. [Gộp ô và tách ô](#9-gộp-ô-và-tách-ô)
10. [Bật hoặc tắt hàng, cột tiêu đề](#10-bật-hoặc-tắt-hàng-cột-tiêu-đề)
11. [Căn vị trí của toàn bộ bảng](#11-căn-vị-trí-của-toàn-bộ-bảng)
12. [Định dạng nền, viền, căn dọc và hướng chữ của ô](#12-định-dạng-nền-viền-căn-dọc-và-hướng-chữ-của-ô)
13. [Định dạng văn bản bên trong ô](#13-định-dạng-văn-bản-bên-trong-ô)
14. [Đổi độ rộng cột, chiều cao hàng và kích thước toàn bảng](#14-đổi-độ-rộng-cột-chiều-cao-hàng-và-kích-thước-toàn-bảng)
15. [Sử dụng công thức](#15-sử-dụng-công-thức)
16. [Dán dữ liệu từ Excel hoặc Google Sheets](#16-dán-dữ-liệu-từ-excel-hoặc-google-sheets)
17. [Xóa bảng và khôi phục khi thao tác nhầm](#17-xóa-bảng-và-khôi-phục-khi-thao-tác-nhầm)
18. [Các quy trình thao tác nhanh](#18-các-quy-trình-thao-tác-nhanh)
19. [Bảng tra cứu hành vi chuột và bàn phím](#19-bảng-tra-cứu-hành-vi-chuột-và-bàn-phím)
20. [Lưu ý và giới hạn hiện tại](#20-lưu-ý-và-giới-hạn-hiện-tại)

## 1. Nhận biết các vùng điều khiển bảng

UEditor có nhiều vùng điều khiển khác nhau. Mỗi vùng phục vụ một nhóm thao tác riêng:

| Vùng điều khiển | Khi nào xuất hiện | Mục đích |
| --- | --- | --- |
| Nút **Chèn bảng** trên toolbar | Khi toolbar đang hiển thị | Chỉ dùng để tạo bảng mới bằng lưới kích thước |
| Menu **Thêm → Bảng** | Khi bật menu bar | Tạo bảng mới bằng lưới kích thước |
| Menu **Bảng** trên menu bar | Khi bật menu bar | Tạo hoặc xóa bảng, xóa hàng/cột, gộp/tách ô |
| Nút ba chấm phía trên bảng | Khi con trỏ hoặc chuột đang ở trong bảng | Điều khiển cấu trúc và vị trí của bảng hiện tại |
| Tay nắm bên trái mỗi hàng | Khi rê chuột vào vùng hàng | Mở menu hàng hoặc kéo đổi thứ tự hàng |
| Tay nắm phía trên mỗi cột | Khi rê chuột vào vùng cột | Mở menu cột hoặc kéo đổi thứ tự cột |
| Rail dấu cộng ở cạnh phải và cạnh dưới | Khi rê chuột sát cạnh bảng | Thêm nhanh một hoặc nhiều cột/hàng |
| Thanh kiểm tra ô nổi | Khi chọn nguyên một hay nhiều ô | Màu nền, viền, công thức, gộp/tách, căn dọc và hướng chữ |
| Bubble menu văn bản | Khi bôi đen chữ bên trong ô | Định dạng phần chữ đang chọn |
| Tay nắm chéo ngoài góc dưới bên phải | Khi bảng đang được kích hoạt | Đổi kích thước toàn bộ bảng |

Điểm quan trọng: nút **Chèn bảng** trên toolbar là hành động tạo mới. Các thao tác sửa bảng hiện có nằm trong menu ba chấm, tay nắm hàng/cột và thanh kiểm tra ô.

## 2. Tạo bảng mới

### 2.1. Tạo bằng toolbar

1. Đặt con trỏ tại vị trí muốn chèn bảng.
2. Nhấn biểu tượng **Chèn bảng** trên toolbar.
3. Rê chuột trên lưới để chọn số hàng và số cột. Lưới hỗ trợ tối đa `8 × 8` trong một lần tạo.
4. Quan sát dòng xem trước, ví dụ **Chèn bảng 4×6**.
5. Nhấn vào ô cuối của vùng đang tô sáng để tạo bảng.

Bảng mới có hàng đầu tiên là hàng tiêu đề.

### 2.2. Tạo bằng menu bar

Cách thứ nhất:

1. Rê chuột hoặc nhấn **Thêm**.
2. Rê chuột vào **Bảng** để mở menu con.
3. Chọn kích thước trên lưới.
4. Nhấn để chèn bảng.

Cách thứ hai:

1. Rê chuột hoặc nhấn menu **Bảng** trên menu bar.
2. Mở mục **Bảng** dùng để chèn mới.
3. Chọn kích thước trên lưới rồi nhấn để chèn.

### 2.3. Tạo nhanh bằng lệnh gạch chéo

1. Tạo một dòng trống trong trình soạn thảo.
2. Gõ `/`.
3. Tìm và chọn **Bảng**.
4. UEditor chèn một bảng `3 × 3` có hàng tiêu đề.

### 2.4. Tạo từ dữ liệu Excel hoặc Google Sheets

Bạn có thể sao chép một vùng dữ liệu từ bảng tính rồi dán trực tiếp vào UEditor. Xem hướng dẫn chi tiết tại [mục 16](#16-dán-dữ-liệu-từ-excel-hoặc-google-sheets).

## 3. Nhập nội dung và di chuyển giữa các ô

### 3.1. Nhập nội dung vào ô có sẵn

1. Nhấn một lần vào ô.
2. Con trỏ nhập liệu xuất hiện tại vị trí vừa nhấn.
3. Gõ nội dung như một đoạn văn bình thường.

### 3.2. Nhập nội dung vào ô trống

1. Nhấn **một lần** vào ô trống.
2. UEditor chỉ đặt con trỏ vào ô; thanh định dạng nguyên ô không tự mở.
3. Gõ nội dung.

Đây là hành vi chủ đích để việc nhập dữ liệu vào bảng không bị cản bởi menu định dạng.

### 3.3. Di chuyển bằng bàn phím

- Nhấn `Tab` để chuyển đến ô kế tiếp.
- Nhấn `Shift+Tab` để quay lại ô trước.
- Khi đang ở ô cuối cùng, `Tab` tạo thêm một hàng và chuyển con trỏ sang hàng mới.
- Các phím mũi tên di chuyển con trỏ trong nội dung; khi con trỏ ở biên ô, chúng có thể chuyển sang ô liền kề theo hướng tương ứng.

## 4. Chọn văn bản, một ô hoặc nhiều ô

UEditor phân biệt **chọn chữ** và **chọn nguyên ô**. Hai kiểu chọn này mở hai nhóm công cụ khác nhau.

### 4.1. Chọn văn bản bên trong ô

1. Đặt chuột trong nội dung ô.
2. Kéo qua phần chữ cần chọn.
3. Bubble menu văn bản xuất hiện.
4. Dùng các nút tô đậm, in nghiêng, gạch dưới, màu chữ, màu đánh dấu hoặc kiểu chữ.

Thao tác này không mở công cụ màu nền và viền của ô.

### 4.2. Chọn nguyên một ô

1. Nhấp đúp chuột trái vào ô không chứa công thức.
2. Toàn bộ ô được chọn bằng khung nổi bật.
3. Thanh kiểm tra ô xuất hiện.

Với ô trống, hành vi vẫn giống nhau: một lần nhấn để nhập chữ, nhấp đúp để chọn nguyên ô và định dạng.

### 4.3. Chọn nhiều ô liền nhau

Cách kéo chuột:

1. Nhấn giữ chuột trái bên trong ô đầu tiên.
2. Kéo qua ranh giới sang ô cuối cùng cần chọn.
3. Thả chuột khi vùng hình chữ nhật mong muốn đã được tô nổi bật.

Cách dùng `Shift`:

1. Đặt con trỏ hoặc chọn ô bắt đầu.
2. Giữ `Shift`.
3. Nhấn vào ô kết thúc.
4. UEditor chọn vùng hình chữ nhật nằm giữa hai ô.

Sau khi chọn nhiều ô, thanh kiểm tra ô cho phép áp dụng màu nền, viền, căn dọc, hướng chữ hoặc gộp ô cho toàn vùng phù hợp.

### 4.4. Ô có công thức

- Nhấp đúp vào ô công thức sẽ đưa tiêu điểm lên **Thanh công thức** để sửa công thức.
- Ô công thức không dùng hành vi nhấp đúp mở thanh định dạng nguyên ô như ô thường.
- Muốn định dạng ô công thức, mở menu ba chấm của bảng và chọn **Định dạng ô**, hoặc tạo vùng chọn nguyên ô bằng thao tác chọn ô.

## 5. Dùng menu điều khiển toàn bảng

Menu điều khiển chính là nút ba chấm nằm phía trên bảng.

### 5.1. Mở menu

1. Nhấn vào một ô bất kỳ trong bảng.
2. Rê chuột lên vùng phía trên, gần mép trái của bảng.
3. Nhấn nút ba chấm.

### 5.2. Các hành động trong menu

| Hành động | Kết quả |
| --- | --- |
| **Định dạng ô** | Chọn nguyên ô hiện tại và mở thanh kiểm tra ô |
| **Căn bảng trái** | Đưa toàn bộ bảng về bên trái vùng soạn thảo |
| **Căn bảng giữa** | Căn giữa toàn bộ bảng |
| **Căn bảng phải** | Đưa toàn bộ bảng về bên phải |
| **Thêm cột trước** | Thêm một cột bên trái cột hiện tại |
| **Thêm cột sau** | Thêm một cột bên phải cột hiện tại |
| **Thêm hàng trước** | Thêm một hàng phía trên hàng hiện tại |
| **Thêm hàng sau** | Thêm một hàng phía dưới hàng hiện tại |
| **Bật/tắt hàng tiêu đề** | Chuyển hàng đầu tiên giữa ô tiêu đề và ô thường |
| **Bật/tắt cột tiêu đề** | Chuyển cột đầu tiên giữa ô tiêu đề và ô thường |
| **Xóa cột** | Xóa cột chứa ô hiện tại |
| **Xóa hàng** | Xóa hàng chứa ô hiện tại |
| **Xóa bảng** | Xóa toàn bộ bảng |

Các hành động xóa được thực hiện ngay. Nếu thao tác nhầm, dùng **Hoàn tác** hoặc `Ctrl+Z`.

## 6. Thêm, nhân đôi, làm trống và xóa hàng hoặc cột

### 6.1. Mở menu của một hàng

1. Rê chuột sang bên trái hàng cần thao tác.
2. Tay nắm hàng xuất hiện.
3. Nhấn tay nắm nhưng không kéo sang hàng khác.
4. Chọn một trong các hành động:
   - **Thêm hàng trước**.
   - **Thêm hàng sau**.
   - **Nhân đôi hàng**.
   - **Xóa nội dung hàng**.
   - **Xóa hàng**.

**Xóa nội dung hàng** giữ nguyên cấu trúc và định dạng của hàng nhưng làm trống nội dung các ô. **Xóa hàng** loại bỏ cả hàng khỏi bảng.

### 6.2. Mở menu của một cột

1. Rê chuột lên phía trên cột cần thao tác.
2. Tay nắm cột xuất hiện.
3. Nhấn tay nắm nhưng không kéo sang cột khác.
4. Chọn một trong các hành động:
   - **Thêm cột trước**.
   - **Thêm cột sau**.
   - **Nhân đôi cột**.
   - **Xóa nội dung cột**.
   - **Xóa cột**.

Các thao tác cột sử dụng vị trí cột logic, vì vậy vẫn xử lý đúng khi bảng có ô `rowspan` hoặc `colspan` do gộp ô.

### 6.3. Dùng các nút nhanh trên toolbar

Khi con trỏ đang ở trong bảng, toolbar có thể hiển thị thêm các nút:

- Thêm cột trước.
- Thêm cột sau.
- Thêm hàng trước.
- Thêm hàng sau.
- Gộp ô hoặc tách ô tùy vùng chọn hiện tại.

Các nút này là lối tắt. Chúng không thay thế menu hàng, cột và menu ba chấm.

## 7. Thêm nhanh một hoặc nhiều hàng, cột bằng rail

### 7.1. Thêm một cột ở cuối bảng

1. Rê chuột sát cạnh phải của bảng.
2. Rail dọc có dấu cộng xuất hiện.
3. Nhấn rồi thả tại chỗ.
4. Một cột mới được thêm vào cuối bảng.

### 7.2. Thêm nhiều cột cùng lúc

1. Nhấn giữ rail dọc ở cạnh phải.
2. Kéo chuột sang phải.
3. Quan sát vùng xem trước và số cột sẽ được thêm.
4. Thả chuột để xác nhận.

Số cột được thêm phụ thuộc quãng kéo so với độ rộng cột trung bình hiện tại.

### 7.3. Thêm một hàng ở cuối bảng

1. Rê chuột sát cạnh dưới của bảng.
2. Rail ngang có dấu cộng xuất hiện.
3. Nhấn rồi thả tại chỗ.
4. Một hàng mới được thêm vào cuối bảng.

### 7.4. Thêm nhiều hàng cùng lúc

1. Nhấn giữ rail ngang ở cạnh dưới.
2. Kéo chuột xuống dưới.
3. Quan sát vùng xem trước và số hàng sẽ được thêm.
4. Thả chuột để xác nhận.

## 8. Kéo để sắp xếp lại hàng hoặc cột

### 8.1. Đổi vị trí hàng

1. Rê chuột sang bên trái hàng cần di chuyển.
2. Nhấn giữ tay nắm hàng.
3. Kéo lên hoặc xuống vị trí mới.
4. Theo dõi vùng đích và nhãn trạng thái trong lúc kéo.
5. Thả chuột để đặt hàng vào vị trí mới.

### 8.2. Đổi vị trí cột

1. Rê chuột lên phía trên cột cần di chuyển.
2. Nhấn giữ tay nắm cột.
3. Kéo sang trái hoặc phải.
4. Theo dõi vùng đích đang được tô nổi bật.
5. Thả chuột để đặt cột vào vị trí mới.

Nếu nhấn rồi thả mà không di chuyển sang vị trí khác, dữ liệu không bị đổi thứ tự và menu của tay nắm có thể được mở.

## 9. Gộp ô và tách ô

### 9.1. Gộp nhiều ô

1. Chọn một vùng gồm ít nhất hai ô liền nhau theo hình chữ nhật.
2. Trên thanh kiểm tra ô, nhấn biểu tượng **Gộp ô**.
3. UEditor gộp vùng đã chọn thành một ô.

Bạn cũng có thể dùng nút gộp trên toolbar hoặc menu **Bảng → Ô → Gộp ô** khi menu bar đang bật.

Khi gộp, UEditor giữ lại tỷ lệ độ rộng các cột để hạn chế thay đổi bố cục ngoài ý muốn.

### 9.2. Tách ô đã gộp

1. Chọn ô đang có `colspan` hoặc `rowspan`.
2. Nút gộp trên thanh kiểm tra ô chuyển sang hành động **Tách ô**.
3. Nhấn nút để khôi phục các ô thành phần.

Bạn cũng có thể dùng menu **Bảng → Ô → Tách ô**.

### 9.3. Khi nút gộp bị vô hiệu hóa

Nút gộp không hoạt động nếu:

- Chỉ có một ô thường được chọn.
- Vùng chọn không tạo được một hình chữ nhật hợp lệ.
- Cấu trúc ô gộp hiện tại không cho phép lệnh gộp an toàn.

## 10. Bật hoặc tắt hàng, cột tiêu đề

### 10.1. Hàng tiêu đề

1. Đặt con trỏ trong bảng.
2. Mở menu ba chấm.
3. Chọn **Bật/tắt hàng tiêu đề**.

Hàng đầu tiên được chuyển giữa kiểu ô tiêu đề và ô dữ liệu thường.

### 10.2. Cột tiêu đề

1. Đặt con trỏ trong bảng.
2. Mở menu ba chấm.
3. Chọn **Bật/tắt cột tiêu đề**.

Cột đầu tiên được chuyển giữa kiểu ô tiêu đề và ô dữ liệu thường.

Lặp lại cùng thao tác để tắt chế độ tiêu đề.

## 11. Căn vị trí của toàn bộ bảng

1. Nhấn vào một ô trong bảng.
2. Mở menu ba chấm.
3. Chọn một trong ba hành động:
   - **Căn bảng trái**.
   - **Căn bảng giữa**.
   - **Căn bảng phải**.

Thao tác này thay đổi vị trí của **toàn bộ bảng**, không phải căn lề chữ trong ô. Vị trí được lưu cùng HTML của nội dung.

## 12. Định dạng nền, viền, căn dọc và hướng chữ của ô

### 12.1. Mở thanh kiểm tra ô

Có ba cách chính:

1. Nhấp đúp vào một ô thường.
2. Chọn nhiều ô bằng kéo chuột hoặc `Shift`.
3. Mở menu ba chấm và chọn **Định dạng ô**.

Nếu tích hợp UEditor với `showBubbleMenu={false}`, thanh kiểm tra ô sẽ không hiển thị.

### 12.2. Đổi màu nền một ô trống

1. Nhấp đúp vào ô trống. Không cần nhập ký tự giả vào ô.
2. Nhấn nút **Màu nền ô** trên thanh kiểm tra ô.
3. Chọn màu.
4. Màu được áp dụng cho toàn ô đang chọn.

Muốn tô nhiều ô, chọn vùng ô trước rồi thực hiện cùng thao tác.

### 12.3. Định dạng viền

1. Chọn một hoặc nhiều ô.
2. Nhấn nút **Viền ô**.
3. Chọn **Vị trí viền**:
   - Tất cả viền.
   - Viền ngoài.
   - Viền trong.
   - Viền ngang bên trong.
   - Viền dọc bên trong.
   - Viền trên.
   - Viền phải.
   - Viền dưới.
   - Viền trái.
4. Chọn **Chế độ viền**:
   - Vẽ viền.
   - Ẩn cạnh.
5. Chọn kiểu đường:
   - Liền (`solid`).
   - Gạch (`dashed`).
   - Chấm (`dotted`).
   - Đôi (`double`).
6. Chọn độ dày `1px`, `2px`, `3px` hoặc `4px`.
7. Chọn màu viền.

Muốn xóa toàn bộ viền của vùng chọn, nhấn **Xóa viền**. Khi chỉnh một cạnh chung giữa hai ô, UEditor đồng bộ cạnh đối diện của ô kế bên để tránh hai đường viền xung đột.

### 12.4. Căn nội dung theo chiều dọc

1. Chọn một hoặc nhiều ô.
2. Mở nút **Căn lề dọc**.
3. Chọn:
   - **Căn trên**.
   - **Căn giữa**.
   - **Căn dưới**.

### 12.5. Đổi hướng chữ

1. Chọn một hoặc nhiều ô.
2. Mở nút **Hướng chữ**.
3. Chọn **Chữ ngang** hoặc **Chữ dọc**.

Hướng chữ là thuộc tính của ô. Nó khác với căn trái, giữa hoặc phải của đoạn văn bên trong ô.

### 12.6. Tự xuống dòng trong ô

UEditor bật **Tự xuống dòng** mặc định. Khi nội dung dài hơn độ rộng cột, hàng tự tăng chiều cao và độ rộng cột được giữ nguyên. URL, mã hoặc chuỗi viết liền cũng được ngắt an toàn để không làm bảng nở ngoài ý muốn.

Để thay đổi cho một hoặc nhiều ô:

1. Chọn nguyên một ô hoặc một vùng nhiều ô.
2. Trên thanh kiểm tra ô hoặc toolbar, nhấn nút **Tự xuống dòng**.
3. Khi nút đang bật, nội dung xuống dòng theo độ rộng cột.
4. Nhấn lại để chuyển sang **Không xuống dòng**.

Trạng thái không xuống dòng được lưu trong HTML bằng `data-text-wrap="nowrap"`. Trạng thái mặc định không cần thuộc tính riêng nhưng vẫn xuất CSS cần thiết để nội dung hiển thị đúng bên ngoài editor.

## 13. Định dạng văn bản bên trong ô

1. Bôi đen phần chữ cần định dạng trong một ô.
2. Dùng bubble menu văn bản để áp dụng:
   - Tô đậm.
   - In nghiêng.
   - Gạch dưới.
   - Gạch ngang.
   - Mã nội dòng.
   - Liên kết.
   - Màu chữ.
   - Màu đánh dấu.
   - Cỡ chữ, chiều cao dòng, chỉ số trên hoặc chỉ số dưới.
3. Dùng toolbar chính nếu cần thêm các kiểu đoạn văn hoặc căn chữ.

Nếu chỉ đặt con trỏ mà không bôi đen chữ, thanh định dạng nguyên ô không tự mở. Nhấp đúp ô khi mục tiêu là màu nền, viền hoặc thuộc tính của toàn ô.

## 14. Đổi độ rộng cột, chiều cao hàng và kích thước toàn bảng

Ba kiểu resize hoạt động độc lập. Chọn đúng vùng kéo để tránh thay đổi sai phạm vi.

### 14.1. Đổi độ rộng một cột

1. Rê chuột gần cạnh phải của một ô thuộc cột cần đổi.
2. Khi đường chỉ dẫn dọc và con trỏ resize xuất hiện, nhấn giữ chuột trái.
3. Kéo sang trái để thu hẹp hoặc sang phải để mở rộng.
4. Thả chuột để lưu độ rộng mới.

Chỉ cột tương ứng thay đổi; đây là cơ chế resize cột riêng. Nội dung trong ô không tự làm cột rộng ra. Kể cả khi ô chứa URL hoặc một chuỗi viết liền rất dài, bạn vẫn có thể kéo cột về giới hạn tối thiểu.

### 14.2. Đổi chiều cao một hàng

1. Rê chuột gần cạnh dưới của một ô thuộc hàng cần đổi.
2. Khi đường chỉ dẫn ngang đậm hơn xuất hiện, nhấn giữ chuột trái.
3. Kéo lên để giảm hoặc kéo xuống để tăng chiều cao.
4. Thả chuột để lưu chiều cao mới.

Chỉ hàng tương ứng thay đổi. Chiều cao hàng được lưu trong HTML.

### 14.3. Đổi kích thước toàn bộ bảng

1. Kích hoạt bảng bằng cách nhấn vào một ô.
2. Tìm tay nắm có biểu tượng hai mũi tên chéo ngoài góc dưới bên phải.
3. Nhấn giữ và kéo.
4. Quan sát nhãn kích thước `rộng × cao` trong lúc kéo.
5. Thả chuột để áp dụng.

Các chế độ kéo:

| Cách kéo | Kết quả |
| --- | --- |
| Kéo bình thường | Thay đổi tự do chiều rộng và chiều cao |
| Giữ `Ctrl` | Khóa vào trục có quãng kéo lớn hơn; chỉ đổi rộng hoặc chỉ đổi cao |
| Giữ `Ctrl+Shift` | Giữ nguyên tỷ lệ hiện tại của toàn bảng |

Resize toàn bảng phân bổ thay đổi theo tỷ lệ cho mọi cột và mọi hàng. Nó không thay thế hay làm mất cơ chế resize riêng từng cột hoặc từng hàng.

## 15. Sử dụng công thức

### 15.1. Cách UEditor đặt tên ô

- Cột dùng chữ cái: `A`, `B`, `C`, `D`.
- Hàng dùng số bắt đầu từ `1`.
- Ô đầu tiên là `A1`; ô ở cột C, hàng 4 là `C4`.
- Một vùng ô được viết dạng `A1:C4`.

Khi đang nhập công thức, UEditor hiển thị tạm tọa độ trên bảng để chọn tham chiếu dễ hơn.

### 15.2. Tạo công thức bằng thanh kiểm tra ô

1. Nhấp đúp ô đích để chọn nguyên ô.
2. Nhấn nút Sigma **Công thức**.
3. Nhập công thức, ví dụ `=SUM(B2:B6)`.
4. Chọn định dạng hiển thị số nếu cần.
5. Nhấn **Áp dụng** hoặc nhấn `Enter`.

Trong bảng công thức còn có:

- **Xóa**: xóa công thức khỏi ô.
- **Tính lại**: tính lại toàn bộ công thức của bảng đang chọn.

### 15.3. Nhập công thức trực tiếp trong ô

1. Nhấn một lần vào ô đích.
2. Gõ dấu `=`.
3. Tiếp tục gõ tên hàm hoặc biểu thức.
4. Nhấn `Enter` khi công thức hoàn chỉnh.

Trong lúc công thức còn dang dở, UEditor giữ nguyên nội dung để bạn tiếp tục chỉnh. Nhấn `Escape` để hủy phiên nhập công thức trực tiếp và làm trống nội dung nháp của ô.

### 15.4. Dùng gợi ý hàm

1. Gõ `=` trong ô.
2. Danh sách hàm hỗ trợ xuất hiện.
3. Dùng `↑` và `↓` để đổi lựa chọn.
4. Nhấn `Tab` để chèn hàm đang chọn, hoặc nhấn trực tiếp vào tên hàm.
5. Con trỏ được đặt giữa hai dấu ngoặc để nhập tham số.

`Enter` dùng để đánh giá công thức, không dùng để nhận gợi ý hàm đang dang dở.

### 15.5. Chọn ô hoặc vùng tham chiếu bằng chuột

Khi đang nhập công thức trực tiếp trong một ô:

1. Nhấn một ô khác trong **cùng bảng** để chèn địa chỉ của ô đó, ví dụ `B3`.
2. Nhấn các ô liên tiếp bên trong lời gọi hàm để UEditor tự thêm dấu phẩy giữa các tham chiếu.
3. Nhấn giữ tại ô đầu rồi kéo đến ô cuối để chèn một vùng, ví dụ `B2:B8`.
4. Thả chuột để giữ vùng tham chiếu vừa chọn.

Nếu tham chiếu sẽ tạo vòng lặp công thức, vùng chọn được đánh dấu cảnh báo và tham chiếu bị chặn.

### 15.6. Toán tử và hàm được hỗ trợ

Các toán tử:

- Cộng: `+`.
- Trừ: `-`.
- Nhân: `*`.
- Chia: `/`.
- Dấu ngoặc để điều khiển thứ tự tính: `(` và `)`.
- Dấu cộng hoặc trừ một ngôi, ví dụ `-A1`.

Các hàm:

| Hàm | Ý nghĩa | Ví dụ |
| --- | --- | --- |
| `SUM` | Tổng các giá trị số | `=SUM(B2:B8)` |
| `AVG` | Trung bình các giá trị số | `=AVG(B2:B8)` |
| `MIN` | Giá trị nhỏ nhất | `=MIN(B2:B8)` |
| `MAX` | Giá trị lớn nhất | `=MAX(B2:B8)` |
| `COUNT` | Đếm các ô có giá trị số | `=COUNT(B2:B8)` |

Ví dụ biểu thức hợp lệ:

```text
=A1+B1
=(A1+B1)*2
=SUM(B2:B8)
=SUM(B2:B8,C2:C8,10)
=MAX(A1,A2,A3)-MIN(A1:A3)
```

Các hàm tổng hợp bỏ qua ô trống và nội dung không phải số trong vùng. Tham chiếu trực tiếp như `=A1` yêu cầu ô được tham chiếu có giá trị số hợp lệ.

### 15.7. Định dạng kết quả

Trong panel công thức, chọn một trong các định dạng:

| Định dạng | Cách hiển thị hiện tại |
| --- | --- |
| **Chữ** | Giữ chuỗi kết quả gốc |
| **123** | Số theo định dạng `en-US`, tối đa 6 chữ số thập phân |
| **$** | Tiền tệ USD, tối đa 2 chữ số thập phân |
| **%** | Phần trăm, tối đa 2 chữ số thập phân |
| **Ngày** | Ngày theo lịch số kiểu Excel, hiển thị theo `en-US` |

Định dạng chỉ thay đổi cách hiển thị. Giá trị thô dùng để tính toán không bị thay đổi.

### 15.8. Sửa một công thức đã có

1. Nhấn vào ô công thức để chọn ô.
2. **Thanh công thức** xuất hiện phía trên vùng soạn thảo, kèm địa chỉ ô.
3. Sửa biểu thức trong ô nhập.
4. Nhấn `Enter` hoặc nút dấu kiểm để áp dụng.
5. Nhấn `Escape` để hủy phần chỉnh sửa chưa áp dụng.

Nhấp đúp trực tiếp vào ô công thức cũng đưa tiêu điểm lên ô nhập của Thanh công thức.

### 15.9. Chuyển công thức thành giá trị hoặc xóa ô

Trên Thanh công thức:

- Nhấn nút có biểu tượng `#` để **Chuyển thành giá trị**. Kết quả đang hiển thị được giữ lại, còn quan hệ công thức bị loại bỏ.
- Nhấn nút thùng rác để **Xóa nội dung ô** và công thức.
- Khi một ô công thức đang được chọn, `Backspace` hoặc `Delete` cũng xóa công thức và nội dung ô, sau đó tính lại các ô phụ thuộc.

### 15.10. Tính lại tự động và lỗi công thức

- Khi giá trị nguồn thay đổi và bạn rời ô nhập, UEditor tự tính lại các công thức phụ thuộc trong bảng đó.
- Công thức phụ thuộc được tính theo đúng thứ tự quan hệ.
- Có thể dùng nút **Tính lại** để yêu cầu tính lại thủ công.

Các lỗi có thể hiển thị:

| Lỗi | Nguyên nhân thường gặp |
| --- | --- |
| `#EMPTY` | Công thức rỗng |
| `#INVALID-REFERENCE` | Tham chiếu không tồn tại hoặc giá trị trực tiếp không phải số |
| `#INVALID-FORMULA` | Sai cú pháp hoặc dùng hàm chưa được hỗ trợ |
| `#DIVISION-BY-ZERO` | Chia cho 0 hoặc tính trung bình một vùng không có giá trị số |
| `#CIRCULAR-REFERENCE` | Các công thức tham chiếu vòng lẫn nhau |

## 16. Dán dữ liệu từ Excel hoặc Google Sheets

### 16.1. Dán một vùng bảng tính

1. Trong Excel hoặc Google Sheets, chọn vùng dữ liệu cần sao chép.
2. Nhấn `Ctrl+C` hoặc `Command+C`.
3. Đặt con trỏ tại vị trí muốn chèn trong UEditor.
4. Nhấn `Ctrl+V` hoặc `Command+V`.
5. UEditor ưu tiên dữ liệu bảng và tạo một bảng thay vì chèn ảnh xem trước của clipboard.

### 16.2. Dữ liệu được xử lý như thế nào

- HTML bảng từ ứng dụng bảng tính được chuyển thành bảng UEditor.
- Dữ liệu dạng tab và xuống dòng (`TSV`) cũng được chuyển thành bảng.
- Nội dung nhiều dòng có dấu ngoặc kép được giữ trong cùng một ô.
- Hàng thiếu cột được bổ sung ô trống đến bằng hàng rộng nhất.
- Ô trống được chuẩn hóa để vẫn có thể đặt con trỏ và nhập nội dung.
- Dữ liệu thưa với nhiều cột vẫn giữ đúng vị trí tương đối.

Sau khi dán, bạn có thể dùng toàn bộ công cụ hàng, cột, định dạng, resize và công thức như với bảng tạo trực tiếp.

## 17. Xóa bảng và khôi phục khi thao tác nhầm

### 17.1. Xóa toàn bộ bảng

Cách chính:

1. Nhấn vào một ô trong bảng.
2. Mở menu ba chấm.
3. Chọn **Xóa bảng**.

Cách qua menu bar:

1. Nhấn vào một ô trong bảng.
2. Mở menu **Bảng**.
3. Chọn **Xóa bảng**.

### 17.2. Xóa bằng bàn phím khi đã chọn toàn bảng

Nếu toàn bộ các ô của bảng đang được chọn, `Backspace`, `Delete`, `Ctrl+Backspace` hoặc `Ctrl+Delete` có thể xóa bảng.

### 17.3. Khôi phục

Ngay sau khi xóa nhầm:

1. Nhấn `Ctrl+Z`, hoặc `Command+Z` trên macOS.
2. Hoặc nhấn nút **Hoàn tác** trên toolbar.

## 18. Các quy trình thao tác nhanh

### 18.1. Tô màu một ô chưa có chữ

1. Nhấp đúp ô trống.
2. Nhấn **Màu nền ô**.
3. Chọn màu.

Không cần gõ dấu cách hoặc ký tự tạm.

### 18.2. Gộp một tiêu đề ngang qua nhiều cột

1. Chọn các ô tiêu đề trên cùng bằng cách kéo từ ô đầu đến ô cuối.
2. Nhấn **Gộp ô**.
3. Nhập nội dung tiêu đề.
4. Dùng **Căn lề dọc** và công cụ căn chữ nếu cần.

### 18.3. Thêm nhanh năm hàng ở cuối

1. Rê chuột xuống rail dấu cộng bên dưới bảng.
2. Nhấn giữ và kéo xuống.
3. Dừng khi vùng xem trước báo thêm 5 hàng.
4. Thả chuột.

### 18.4. Đưa một cột sang vị trí khác

1. Rê chuột lên tay nắm của cột.
2. Nhấn giữ và kéo sang vị trí mới.
3. Kiểm tra vùng đích.
4. Thả chuột.

### 18.5. Phóng to bảng theo cả hai chiều nhưng giữ tỷ lệ

1. Nhấn giữ tay nắm chéo ngoài góc dưới bên phải.
2. Giữ đồng thời `Ctrl+Shift`.
3. Kéo ra ngoài.
4. Thả chuột khi đạt kích thước mong muốn.

### 18.6. Chỉ tăng chiều cao toàn bảng

1. Nhấn giữ tay nắm chéo.
2. Giữ `Ctrl`.
3. Kéo chủ yếu theo chiều dọc.
4. Thả chuột. Chiều rộng được giữ nguyên.

### 18.7. Tạo ô tổng cho một cột

1. Thêm một hàng cuối nếu chưa có.
2. Nhấn vào ô tổng.
3. Gõ `=SUM(`.
4. Kéo từ ô dữ liệu đầu tiên đến ô dữ liệu cuối cùng của cột.
5. Gõ `)` nếu chưa có sẵn.
6. Nhấn `Enter`.

### 18.8. Giữ kết quả nhưng loại bỏ công thức

1. Chọn ô công thức.
2. Trên Thanh công thức, nhấn biểu tượng `#`.
3. Kiểm tra kết quả vẫn còn trong ô và Thanh công thức đã biến mất.

## 19. Bảng tra cứu hành vi chuột và bàn phím

| Thao tác | Hành vi |
| --- | --- |
| Nhấn một lần vào ô trống | Đặt con trỏ để nhập nội dung |
| Nhấp đúp ô thường | Chọn nguyên ô và mở thanh kiểm tra ô |
| Nhấp đúp ô công thức | Đưa tiêu điểm lên Thanh công thức |
| Kéo qua chữ trong một ô | Chọn văn bản và mở bubble menu chữ |
| Kéo từ một ô sang ô khác | Chọn vùng nhiều ô hình chữ nhật |
| `Shift` + nhấn ô khác | Mở rộng vùng chọn ô |
| `Tab` | Sang ô kế tiếp; ở ô cuối sẽ thêm hàng |
| `Shift+Tab` | Về ô trước |
| `Enter` khi nhập công thức | Áp dụng công thức hoàn chỉnh |
| `Escape` khi nhập công thức trực tiếp | Hủy nội dung công thức nháp |
| `Escape` trên Thanh công thức | Bỏ thay đổi chưa áp dụng |
| `Backspace`/`Delete` trên ô công thức đang chọn | Xóa công thức, nội dung và tính lại ô phụ thuộc |
| Nhấn **Tự xuống dòng** khi chọn ô | Bật hoặc tắt xuống dòng cho toàn bộ vùng ô đang chọn |
| Kéo cạnh phải ô | Resize một cột |
| Kéo cạnh dưới ô | Resize một hàng |
| Kéo tay nắm chéo | Resize tự do toàn bảng |
| `Ctrl` + kéo tay nắm chéo | Khóa resize toàn bảng vào một trục |
| `Ctrl+Shift` + kéo tay nắm chéo | Resize toàn bảng và giữ tỷ lệ |
| Kéo tay nắm hàng/cột | Đổi thứ tự hàng/cột |
| Nhấn rail dấu cộng | Thêm một hàng/cột cuối bảng |
| Kéo rail dấu cộng | Thêm nhiều hàng/cột cuối bảng |

## 20. Lưu ý và giới hạn hiện tại

- Lưới tạo bảng mới hỗ trợ tối đa `8 × 8` trong một lần. Sau khi tạo, dùng rail hoặc menu cấu trúc để mở rộng thêm.
- Nút **Chèn bảng** trên toolbar chỉ tạo bảng mới; không chứa thuộc tính sửa bảng hiện có.
- Mục **Thuộc tính bảng** trên menu bar hiện bị vô hiệu hóa. Dùng menu ba chấm và thanh kiểm tra ô để chỉnh bảng.
- Công thức chỉ tham chiếu các ô trong cùng bảng.
- Bộ máy công thức là tập tính năng bảng tính có chủ đích, không phải toàn bộ Excel. Các hàm hiện được hỗ trợ là `SUM`, `AVG`, `MIN`, `MAX` và `COUNT`.
- Định dạng tiền tệ hiện dùng USD; định dạng ngày và số hiện dùng locale `en-US`.
- Chỉ có một tay nắm resize toàn bảng ở góc dưới bên phải. Không có tay nắm riêng ở hai cạnh cho resize toàn bảng.
- Resize toàn bảng, resize một cột và resize một hàng là ba hành vi riêng biệt.
- Các lệnh xóa thực hiện ngay và không có hộp xác nhận; dùng Hoàn tác khi cần.
- Điều khiển kéo, định dạng và công thức chỉ xuất hiện khi `editable={true}`.
- Thanh kiểm tra ô phụ thuộc `showBubbleMenu={true}`. Toolbar phụ thuộc `showToolbar={true}`; menu bar phụ thuộc `showMenuBar={true}`.
- Khi lưu HTML, UEditor giữ các thông tin độ rộng cột, chiều cao hàng, căn bảng, màu nền, viền, căn dọc, hướng chữ, trạng thái xuống dòng và metadata công thức.
