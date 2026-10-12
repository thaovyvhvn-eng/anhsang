/* =====================================================
   LIGHTWEAVE – Lớp vẽ Ánh Sáng
   Vanilla JavaScript dùng chung cho mọi trang:
   Dark/Light, Menu mobile, Smooth scroll, Scrollspy, Lọc & Tìm kiếm tranh,
   Modal, Khóa học, Thành tích, Form liên hệ.
   Mỗi đoạn chỉ chạy khi trang hiện tại có phần tử tương ứng.
   ===================================================== */
(function () {
  'use strict';

  /* ---------------------------------------------------
     0. DỮ LIỆU – CHỈ CẦN SỬA Ở ĐÂY
     --------------------------------------------------- */

  // Thông tin liên hệ (đổi ở đây là cập nhật cho form)
  var CONTACT = { email: 'nthaozy126@gmail.com', phone: '0773 076 302' };

  // TRỢ LÝ AI (Google Gemini). Khóa đặt trong mã nguồn nên ai mở trang cũng đọc được.
  // Hãy vào Google AI Studio / Google Cloud và giới hạn khóa này cho đúng tên miền của bạn.
  var AI_CONFIG = {
    apiKey: 'YOUR_GEMINI_API_KEY',
    model: 'gemini-2.5-flash',
    historyLimit: 10 // số lượt hội thoại gần nhất gửi kèm mỗi câu hỏi
  };

  // FIREBASE (SDK modular v10). Dán cấu hình Web App từ Firebase Console → Project settings.
  // Khi còn để YOUR_... thì trợ lý vẫn trả lời nhưng KHÔNG lưu lịch sử.
  var FIREBASE_VERSION = '10.12.2';
  var FIREBASE_CONFIG = {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_PROJECT_ID.appspot.com',
    messagingSenderId: 'YOUR_SENDER_ID',
    appId: 'YOUR_APP_ID'
  };

  // Thể loại để lọc tranh
  var CATEGORIES = {
    'nhan-vat': 'Nhân vật',
    'phong-canh': 'Phong cảnh',
    'hoa': 'Hoa & thiên nhiên',
    'de-thuong': 'Dễ thương'
  };

  /* TRANH CỦA CÔ LILY
     file: tên ảnh trong thư mục images/ (không có đuôi). Cần 2 bản: <file>.jpg và <file>-s.jpg (ảnh nhỏ).
     w, h: kích thước ảnh lớn (để trang không bị giật khi tải ảnh).
     date: ngày vẽ (để trống nếu không nhớ). medium: chất liệu (để trống thì không hiển thị). */
  var WORKS = [
    { id: 1, file: 'work-01', w: 1280, h: 959, title: 'Chào mừng ngày Nhà giáo Việt Nam', cat: 'nhan-vat', date: '', medium: '',
      desc: 'Lớp học rộn ràng ngày 20/11: cô giáo trong tà áo dài vàng thêu sen, các bạn học sinh mang hoa, giỏ quà và tấm thiệp chúc mừng.',
      tags: ['20/11', 'nhà giáo', 'áo dài', 'hướng dương', 'học sinh'] },
    { id: 2, file: 'work-02', w: 960, h: 1280, title: 'Thiếu nữ sừng xanh', cat: 'nhan-vat', date: '3/8/2026', medium: '',
      desc: 'Chân dung nhân vật với mái tóc đỏ – vàng chuyển sắc, đôi sừng xanh ánh kim và chiếc nơ lớn trên trang phục.',
      tags: ['nhân vật', 'chân dung', 'tóc', 'sừng'] },
    { id: 3, file: 'work-03', w: 1280, h: 959, title: 'Sài Gòn rộn ràng', cat: 'phong-canh', date: '', medium: '',
      desc: 'Sài Gòn trong một bức tranh: chợ Bến Thành, nhà thờ Đức Bà, thuyền rồng giữa hoa sen và các bạn nhỏ vẫy cờ chào đón.',
      tags: ['sài gòn', 'bến thành', 'đức bà', 'thuyền rồng', 'sen'] },
    { id: 4, file: 'work-04', w: 1280, h: 960, title: 'Hoa sen hoàng hôn', cat: 'hoa', date: '', medium: '',
      desc: 'Những đóa sen hồng nổi bật trên nền trời cam rực và mặt nước xanh thẫm.',
      tags: ['sen', 'hoàng hôn', 'hồ nước', 'hoa'] },
    { id: 5, file: 'work-05', w: 960, h: 1280, title: 'Chú thỏ trong vườn hoa', cat: 'de-thuong', date: '', medium: '',
      desc: 'Chú thỏ trắng đội mũ xanh ôm bó hoa tulip giữa thảo nguyên, trên trời có sao băng lấp lánh.',
      tags: ['thỏ', 'tulip', 'đáng yêu', 'sao băng', 'hoa'] },
    { id: 6, file: 'work-06', w: 960, h: 1280, title: 'Chú ếch và hồ sen đêm', cat: 'de-thuong', date: '', medium: '',
      desc: 'Chú ếch tròn trịa ngồi trên chiếc lá giữa đêm xanh, quanh có những chú nòng nọc và bong bóng.',
      tags: ['ếch', 'nòng nọc', 'hồ sen', 'đêm', 'đáng yêu'] },
    { id: 7, file: 'work-07', w: 1280, h: 959, title: 'Chợ Bến Thành hoàng hôn', cat: 'phong-canh', date: '', medium: '',
      desc: 'Chợ Bến Thành dưới bầu trời cam rực, tháp đồng hồ vàng nổi bật giữa những áng mây.',
      tags: ['bến thành', 'sài gòn', 'hoàng hôn', 'phong cảnh'] },
    { id: 8, file: 'work-08', w: 960, h: 1280, title: 'Thiếu nữ và hoa sen', cat: 'nhan-vat', date: '11/7/2026', medium: '',
      desc: 'Cô gái trong trang phục truyền thống rực rỡ, xung quanh là những đóa sen hồng và cành liễu.',
      tags: ['sen', 'trang phục truyền thống', 'nhân vật', 'liễu'] },
    { id: 9, file: 'work-09', w: 960, h: 1280, title: 'Ba bông hướng dương', cat: 'hoa', date: '', medium: '',
      desc: 'Ba bông hướng dương cam – vàng rực rỡ, nét viền rõ ràng và lá xanh đậm.',
      tags: ['hướng dương', 'hoa'] },
    { id: 10, file: 'work-10', w: 660, h: 680, title: 'Santorini bên bờ biển', cat: 'phong-canh', date: '', medium: '',
      desc: 'Những mái vòm xanh trắng và con đường nhỏ dẫn ra vịnh biển, lấy cảm hứng từ ngôi làng Santorini.',
      tags: ['santorini', 'biển', 'hy lạp', 'phong cảnh'] },
    { id: 11, file: 'work-11', w: 1100, h: 824, title: 'Rồng và thuyền ngày hội', cat: 'phong-canh', date: '', medium: '',
      desc: 'Bức tranh phong cảnh với con rồng vàng đỏ bay trên bầu trời, công trình cổ phía sau và những chiếc thuyền rộn ràng trên mặt nước.',
      tags: ['rồng', 'thuyền', 'phong cảnh', 'lễ hội'] },
    { id: 12, file: 'work-12', w: 1100, h: 824, title: 'Gia đình dưới đèn lồng', cat: 'nhan-vat', date: '', medium: '',
      desc: 'Bốn người trong nhà đứng quây quần giữa rèm vàng và những chiếc đèn lồng đỏ, khung cảnh ấm áp và vui tươi.',
      tags: ['gia đình', 'đèn lồng', 'nhân vật'] },
    { id: 13, file: 'work-13', w: 825, h: 1100, title: 'Cô gái và vầng mặt trời', cat: 'nhan-vat', date: '', medium: '',
      desc: 'Chân dung cô gái đội vòng đầu vàng tỏa như mặt trời, tóc đen tết dài và xung quanh là những bông hoa hồng đỏ.',
      tags: ['chân dung', 'hoa hồng', 'trang phục', 'mặt trời'] },
    { id: 14, file: 'work-14', w: 825, h: 1100, title: 'Sứa tím dưới đại dương', cat: 'de-thuong', date: '', medium: '',
      desc: 'Chú sứa tím hồng với những xúc tu uốn lượn mềm mại, quanh có các bong bóng nhỏ nổi lên.',
      tags: ['sứa', 'đại dương', 'bong bóng', 'dưới nước'] },
    { id: 15, file: 'work-15', w: 1100, h: 825, title: 'Cờ đỏ sao vàng rộn ràng', cat: 'nhan-vat', date: '', medium: '',
      desc: 'Chú bộ đội, bạn nhỏ quàng khăn đỏ và cô gái áo dài hồng đứng dưới hàng cờ đỏ sao vàng, nền hoa xanh đỏ.',
      tags: ['cờ đỏ sao vàng', 'áo dài', 'bộ đội', 'lễ hội'] },
    { id: 16, file: 'work-16', w: 825, h: 1100, title: 'Chú chó corgi', cat: 'de-thuong', date: '', medium: '',
      desc: 'Chú chó corgi vàng trắng ngồi giữa đám cỏ xanh, lưỡi hơi thè ra, trông rất vui vẻ.',
      tags: ['chó', 'corgi', 'thú cưng', 'đáng yêu'] },
    { id: 17, file: 'work-17', w: 1100, h: 825, title: 'Bạn nhỏ bên hồ sen', cat: 'hoa', date: '', medium: '',
      desc: 'Nhóm bạn nhỏ chơi đùa giữa hồ sen xanh và hoa hồng, có chú ếch nhỏ và vầng mặt trời vàng phía sau.',
      tags: ['hồ sen', 'ếch', 'bạn nhỏ', 'hoa sen'] },
    { id: 18, file: 'work-18', w: 1100, h: 825, title: 'Đêm Trung thu với chị Hằng', cat: 'nhan-vat', date: '', medium: '',
      desc: 'Chị Hằng trong tà áo dài xanh tím đứng dưới trăng vàng, bên các bạn nhỏ cầm đèn lồng trước mái nhà cổ.',
      tags: ['trung thu', 'chị Hằng', 'đèn lồng', 'trăng'] }
  ];

  /* TÁC PHẨM HỌC VIÊN
     file: tên ảnh trong images/ (không có đuôi), cần <file>.jpg và <file>-s.jpg.
     course: 'c1' (Khóa 1) hoặc 'c2' (Khóa 2) để xếp đúng mục.
     author: dòng ghi dưới tranh (không ghi tên học viên nhỏ tuổi).
     Thêm tranh mới: đưa ảnh vào images/ rồi thêm một dòng vào danh sách. */
  var STUDENT_WORKS = [
    { id: 101, file: 'hv-01', w: 1100, h: 741, title: 'Làm diều bên bãi biển', author: 'Học viên lớp Ánh Sáng', course: 'c2', cat: 'nhan-vat', date: '', medium: '',
      desc: 'Các bạn nhỏ làm diều và treo đèn lồng dưới nắng vàng, bên hàng cờ tam giác và cây dừa ven biển.',
      tags: ['diều', 'biển', 'đèn lồng', 'cây dừa', 'bạn bè'] },
    { id: 102, file: 'hv-02', w: 1100, h: 634, title: 'Vui đùa bên hồ sen', author: 'Học viên lớp Ánh Sáng', course: 'c2', cat: 'hoa', date: '', medium: '',
      desc: 'Nhóm bạn nhỏ vui đùa bên hồ sen nhìn từ trên cao, có chú ếch xanh và những chiếc lá sen tròn.',
      tags: ['hồ sen', 'bạn bè', 'ếch', 'hoa sen'] },
    { id: 103, file: 'hv-03', w: 720, h: 995, title: 'Nằm nghỉ bên hồ sen', author: 'Học viên lớp Ánh Sáng', course: 'c2', cat: 'hoa', date: '', medium: '',
      desc: 'Các bạn nhỏ nằm thành vòng tròn trên thảm lá sen, giữa là vầng mặt trời vàng, bên cạnh có chú ếch và chuồn chuồn.',
      tags: ['hồ sen', 'mặt trời', 'chuồn chuồn', 'ếch'] },
    { id: 104, file: 'hv-04', w: 819, h: 1100, title: 'Thiếu nữ áo dài ôm hoa sen', author: 'Học viên lớp Ánh Sáng', course: 'c2', cat: 'nhan-vat', date: '', medium: '',
      desc: 'Cô gái mặc áo dài xanh, đội nón lá và ôm bó sen hồng giữa những đường vàng uốn lượn.',
      tags: ['áo dài', 'nón lá', 'sen', 'nhân vật'] },
    { id: 105, file: 'hv-05', w: 720, h: 1015, title: 'Capybara mũ thỏ trên mây', author: 'Học viên lớp Ánh Sáng', course: 'c2', cat: 'de-thuong', date: '', medium: '',
      desc: 'Chú capybara đội mũ tai thỏ ngồi trên mây, quanh có kẹo mút, bánh kem và những ngôi sao treo.',
      tags: ['capybara', 'mây', 'kẹo', 'đáng yêu'] },
    { id: 106, file: 'hv-06', w: 844, h: 1100, title: 'Chú heo hồng fashion', author: 'Học viên lớp Ánh Sáng', course: 'c2', cat: 'de-thuong', date: '', medium: '',
      desc: 'Chú heo hồng đứng trước họa tiết vằn, bên kẹo ngọt và dòng chữ “fashion” viền đen nổi bật.',
      tags: ['heo hồng', 'kẹo', 'fashion', 'đáng yêu'] },
    { id: 107, file: 'hv-07', w: 825, h: 1100, title: 'Capybara giữa mây kẹo', author: 'Học viên lớp Ánh Sáng', course: 'c2', cat: 'de-thuong', date: '', medium: '',
      desc: 'Chú capybara nâu ngồi giữa mây hồng, quanh có cupcake, kem ốc quế, kẹo mút và sô-cô-la.',
      tags: ['capybara', 'kẹo', 'mây', 'đáng yêu'] },
    { id: 108, file: 'hv-08', w: 796, h: 1100, title: 'Thỏ hồng ôm bó hoa tim', author: 'Học viên lớp Ánh Sáng', course: 'c2', cat: 'de-thuong', date: '', medium: '',
      desc: 'Chú thỏ hồng ôm bó hoa tim trên thảm cỏ đầy hoa, dưới bầu trời có sao băng.',
      tags: ['thỏ', 'hoa tim', 'sao băng', 'đáng yêu'] },
    { id: 109, file: 'hv-09', w: 825, h: 1100, title: 'Ếch xanh nổi giữa hồ sen', author: 'Học viên lớp Ánh Sáng', course: 'c2', cat: 'de-thuong', date: '', medium: '',
      desc: 'Chú ếch xanh nổi trên mặt nước với những lá sen, đàn cá nhỏ và bong bóng lấp lánh.',
      tags: ['ếch', 'hồ sen', 'cá', 'bong bóng'] },
    { id: 110, file: 'hv-10', w: 836, h: 1100, title: 'Ếch ngồi bên hồ sen', author: 'Học viên lớp Ánh Sáng', course: 'c2', cat: 'de-thuong', date: '', medium: '',
      desc: 'Chú ếch ngồi giữa làn nước xanh, bên cạnh là đàn cá nhỏ, lá sen và bong bóng.',
      tags: ['ếch', 'cá', 'lá sen', 'bong bóng'] },
    { id: 201, file: 'k2-01', w: 743, h: 1100, title: 'Gấu trúc ôm tre', author: 'Học viên lớp Ánh Sáng', course: 'c1', cat: 'de-thuong', date: '', medium: '',
      desc: 'Chú gấu trúc đen trắng ngồi trên bãi cỏ vàng, bên cạnh là những cành tre xanh.',
      tags: ['gấu trúc', 'tre', 'đáng yêu'] },
    { id: 202, file: 'k2-02', w: 619, h: 1100, title: 'Chú thỏ đội mũ xanh', author: 'Học viên lớp Ánh Sáng', course: 'c1', cat: 'de-thuong', date: '', medium: '',
      desc: 'Chú thỏ trắng đội mũ xanh giữa thảm cỏ, bên cạnh là hoa tím, hoa hồng và bầu trời sao lấp lánh.',
      tags: ['thỏ', 'hoa', 'sao', 'đáng yêu'] },
    { id: 203, file: 'k2-03', w: 1100, h: 619, title: 'Chú ếch xanh giữa hồ nước', author: 'Học viên lớp Ánh Sáng', course: 'c1', cat: 'de-thuong', date: '', medium: '',
      desc: 'Chú ếch xanh tròn trịa nổi giữa nền nước xanh đậm, quanh có cá, lá sen và hoa sen hồng.',
      tags: ['ếch', 'hồ sen', 'cá', 'đáng yêu'] },
    { id: 204, file: 'k2-04', w: 1100, h: 617, title: 'Chú chó nháy mắt', author: 'Học viên lớp Ánh Sáng', course: 'c1', cat: 'de-thuong', date: '', medium: '',
      desc: 'Chú chó màu cam nháy mắt, đứng trên bãi cỏ vàng dưới bầu trời xanh, có mây trắng và mặt trời.',
      tags: ['chó', 'mây', 'mặt trời', 'đáng yêu'] },
    { id: 205, file: 'k2-05', w: 825, h: 1100, title: 'Thỏ trắng giữa đồng cỏ xanh', author: 'Học viên lớp Ánh Sáng', course: 'c1', cat: 'de-thuong', date: '', medium: '',
      desc: 'Chú thỏ trắng cầm bó hoa giữa đồng cỏ xanh, quanh có hoa tím, hoa vàng và những ngôi sao trên trời.',
      tags: ['thỏ', 'hoa', 'sao', 'đáng yêu'] },
    { id: 206, file: 'k2-06', w: 1100, h: 810, title: 'Sen hồng trên hồ chiều tà', author: 'Học viên lớp Ánh Sáng', course: 'c1', cat: 'hoa', date: '', medium: '',
      desc: 'Những đóa sen hồng vươn cao trên mặt hồ xanh, nền trời cam và đàn chim bay xa.',
      tags: ['sen', 'hoàng hôn', 'hồ nước', 'chim'] },
    { id: 207, file: 'k2-07', w: 1100, h: 830, title: 'Cô gái trên mây và các bạn nhỏ', author: 'Học viên lớp Ánh Sáng', course: 'c1', cat: 'nhan-vat', date: '', medium: '',
      desc: 'Cô gái mặc trang phục xanh đứng trên đám mây, bên cạnh là ba bạn nhỏ, phía sau có núi xanh và ngôi nhà cổ.',
      tags: ['nhân vật', 'mây', 'núi', 'bạn bè'] },
    { id: 208, file: 'k2-08', w: 1100, h: 829, title: 'Gia đình giữa đồng hoa', author: 'Học viên lớp Ánh Sáng', course: 'c1', cat: 'nhan-vat', date: '', medium: '',
      desc: 'Cả nhà đứng giữa đồi cỏ xanh, phía sau là những bông hoa tulip nhiều màu dưới bầu trời xanh.',
      tags: ['gia đình', 'hoa tulip', 'phong cảnh'] },
    { id: 209, file: 'k2-09', w: 819, h: 1100, title: 'Cô gái nón lá và hướng dương', author: 'Học viên lớp Ánh Sáng', course: 'c1', cat: 'nhan-vat', date: '', medium: '',
      desc: 'Cô gái đội nón lá, mặc áo dài vàng và cầm bó sen sau lưng, xung quanh là những bông hướng dương.',
      tags: ['áo dài', 'nón lá', 'sen', 'hướng dương'] },
    { id: 210, file: 'k2-10', w: 1100, h: 856, title: 'Lớp học ngày 20-11', author: 'Học viên lớp Ánh Sáng', course: 'c1', cat: 'nhan-vat', date: '', medium: '',
      desc: 'Lớp học rực rỡ cờ hoa ngày 20-11: cô giáo áo dài vàng đứng giữa, các bạn học sinh tặng hoa và thiệp.',
      tags: ['20/11', 'nhà giáo', 'áo dài', 'học sinh'] },
    { id: 211, file: 'k2-11', w: 1100, h: 505, title: 'Ngày lễ bên hàng cờ', author: 'Học viên lớp Ánh Sáng', course: 'c1', cat: 'nhan-vat', date: '', medium: '',
      desc: 'Ba nhân vật đứng bên hàng cờ đỏ sao vàng, phía sau là cây xanh và những bụi quả.',
      tags: ['cờ đỏ sao vàng', 'nhân vật', 'cây xanh'] },
    { id: 212, file: 'k2-12', w: 1100, h: 786, title: 'Ba bạn nhỏ dưới cờ', author: 'Học viên lớp Ánh Sáng', course: 'c1', cat: 'nhan-vat', date: '', medium: '',
      desc: 'Ba bạn nhỏ giơ tay dưới hàng cờ đỏ sao vàng, bên cạnh là bạn gái cầm bông hoa sen.',
      tags: ['cờ đỏ sao vàng', 'bạn bè', 'sen'] }
  ];

  /* KHÓA HỌC */
  var COURSES = [
    { id: 'c1', no: 'Khóa 1', flag: 'Cơ bản', title: 'Phát triển kỹ năng', image: 'work-05',
      desc: 'Làm quen và nắm chắc nền tảng: bố cục, phối màu, ý tưởng và cách kể chuyện bằng tranh.',
      facts: [['fa-child', 'Dành cho bé từ 6 – 12 tuổi'], ['fa-calendar-days', 'Thứ 3, Thứ 6 · 19h30 – 21h'], ['fa-clock', '90 phút/buổi'], ['fa-users', 'Học online · tối đa 5 học viên/lớp']],
      price: 600000, unit: '/ tháng' },
    { id: 'c2', no: 'Khóa 2', flag: 'Luyện thi', title: 'Thi phong trào', image: 'work-03',
      desc: 'Dành cho các bé muốn tham gia cuộc thi phong trào như Nét vẽ xanh, Áo dài và Hoa hay các cuộc thi cấp trường, xã, thành phố.',
      facts: [['fa-trophy', 'Luyện thi mỹ thuật thiếu nhi'], ['fa-calendar-days', 'Thứ 4, Thứ 5 · 18h30 – 20h'], ['fa-clock', '90 phút/buổi'], ['fa-users', 'Học online · tối đa 5 học viên/lớp']],
      price: 800000, unit: '/ tháng' },
    { id: 'c3', no: 'Khóa 3', flag: '1 kèm 1', title: 'Gia sư tại nhà', image: 'work-04',
      desc: 'Kèm sát từng bạn ngay tại nhà, tiến độ và nội dung được điều chỉnh theo khả năng của mỗi học viên.',
      facts: [['fa-user-group', '1 kèm 1 hoặc tối đa 1 kèm 5'], ['fa-house', 'Gia sư tại nhà'], ['fa-calendar-days', '2 – 3 buổi mỗi tuần'], ['fa-clock', '90 phút/buổi']],
      price: null, unit: '' }
  ];

  /* ---------------------------------------------------
     1. TIỆN ÍCH
     --------------------------------------------------- */
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Bỏ dấu tiếng Việt để gõ "huong duong" vẫn tìm ra "hướng dương"
  function normalize(str) {
    return String(str).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
  }
  function formatPrice(n) { return n.toLocaleString('vi-VN') + 'đ'; }
  function esc(str) {
    return String(str).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function findById(list, id) { return list.filter(function (x) { return String(x.id) === String(id); })[0]; }

  var toastTimer;
  function showToast(message) {
    var el = $('#toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('is-show'); }, 3600);
  }

  /* ---------------------------------------------------
     2. MINH HỌA SVG (logo, hero, banner trang con)
     --------------------------------------------------- */
  function sunflower(x, y, r, rot) {
    var petals = '', i, n = 14;
    for (i = 0; i < n; i++) {
      petals += '<ellipse cx="0" cy="' + (-r * 0.66) + '" rx="' + (r * 0.17) + '" ry="' + (r * 0.36) + '" transform="rotate(' + (i * 360 / n) + ')" fill="#FFD43B"/>';
    }
    for (i = 0; i < n; i++) {
      petals += '<ellipse cx="0" cy="' + (-r * 0.6) + '" rx="' + (r * 0.14) + '" ry="' + (r * 0.3) + '" transform="rotate(' + (i * 360 / n + 180 / n) + ')" fill="#FFE770"/>';
    }
    var seeds = '';
    for (i = 0; i < 9; i++) {
      var a = i * 2.4, d = r * 0.09 * Math.sqrt(i + 1) * 1.3;
      seeds += '<circle cx="' + (Math.cos(a) * d).toFixed(1) + '" cy="' + (Math.sin(a) * d).toFixed(1) + '" r="' + (r * 0.025) + '" fill="#A55A1B"/>';
    }
    return '<g transform="translate(' + x + ' ' + y + ') rotate(' + (rot || 0) + ')">' + petals +
      '<circle r="' + (r * 0.42) + '" fill="#E0913A"/><circle r="' + (r * 0.33) + '" fill="#C9792A"/>' + seeds + '</g>';
  }
  // Vị trí đặt ở thẻ <g>; nhấp nháy đặt ở <path> bên trong để CSS animation không ghi đè vị trí
  function sparkle(x, y, s, fill, cls) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><path class="twinkle ' + (cls || '') + '" fill="' + fill +
      '" d="M0-20C2-6 6-2 20 0C6 2 2 6 0 20C-2 6-6 2-20 0C-6-2-2-6 0-20Z"/></g>';
  }
  function cloud(x, y, s, main, shade) {
    var shapes = [[0, 0, 40], [45, -22, 50], [98, 0, 42], [50, 10, 46], [-32, 16, 30], [132, 16, 28]];
    function draw(dy, fill) {
      return '<g fill="' + fill + '" transform="translate(0 ' + dy + ')">' + shapes.map(function (c) {
        return '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '"/>';
      }).join('') + '<rect x="-38" y="12" width="195" height="40" rx="20"/></g>';
    }
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' + draw(8, shade || '#CDEBF7') + draw(0, main || '#FFFBEA') + '</g>';
  }
  function stem(x1, y1, x2, y2, bend) {
    return '<path d="M' + x1 + ' ' + y1 + ' C ' + (x1 + bend) + ' ' + (y1 + (y2 - y1) * 0.4) + ' ' + (x2 - bend) + ' ' + (y1 + (y2 - y1) * 0.7) + ' ' + x2 + ' ' + y2 +
      '" fill="none" stroke="#6BA83A" stroke-width="9" stroke-linecap="round"/>';
  }
  function leaf(x, y, rot, s) {
    return '<ellipse cx="0" cy="0" rx="' + (30 * s) + '" ry="' + (14 * s) + '" transform="translate(' + x + ' ' + y + ') rotate(' + rot + ')" fill="#86C443"/>';
  }
  function heroSVG() {
    return '<svg viewBox="0 0 640 600" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<circle cx="330" cy="220" r="190" fill="#FFFBEA" opacity=".1"/><circle cx="330" cy="220" r="130" fill="#FFFBEA" opacity=".1"/>' +
      sparkle(90, 90, 1.4, '#FFFBEA') + sparkle(130, 60, 0.6, '#FFFBEA', 'd2') + sparkle(540, 70, 2, '#FFF3A0', 'd2') + sparkle(585, 40, 0.7, '#FFFBEA') +
      cloud(150, 430, 2.3, '#FFFBEA', '#CDEBF7') + cloud(300, 480, 2, '#FFFBEA', '#CDEBF7') + cloud(420, 260, 0.9, 'rgba(255,251,234,.85)', 'rgba(205,235,247,.8)') +
      '<g class="sway">' + stem(150, 320, 130, 600, -20) + leaf(118, 470, -30, 1.8) + sunflower(150, 320, 118, -14) + '</g>' +
      '<g class="sway d2">' + stem(330, 200, 350, 600, 24) + leaf(374, 450, 25, 2.1) + leaf(306, 520, -35, 1.7) + sunflower(330, 200, 150, 8) + '</g>' +
      '<g class="sway d3">' + stem(520, 350, 528, 600, -14) + leaf(494, 500, -28, 1.5) + sunflower(520, 350, 96, 18) + '</g>' +
      '</svg>';
  }
  function miniSVG() {
    return '<svg viewBox="0 0 420 300" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      sparkle(60, 60, 1.2, '#FFFBEA') + sparkle(360, 50, 1.6, '#FFF3A0', 'd2') +
      cloud(10, 230, 1.7, '#FFFBEA', '#CDEBF7') + cloud(250, 250, 1.4, '#FFFBEA', '#CDEBF7') +
      '<g class="sway">' + stem(130, 160, 120, 300, -14) + leaf(100, 250, -30, 1.2) + sunflower(132, 140, 66, -10) + '</g>' +
      '<g class="sway d2">' + stem(270, 130, 280, 300, 14) + leaf(300, 230, 25, 1.4) + sunflower(268, 100, 84, 8) + '</g>' +
      '</svg>';
  }
  function logoSVG() {
    return '<svg viewBox="-50 -50 100 100" xmlns="http://www.w3.org/2000/svg">' + sunflower(0, 0, 46, 0) + '</svg>';
  }

  /* ---------------------------------------------------
     3. DARK / LIGHT MODE (lưu vào localStorage)
     --------------------------------------------------- */
  var root = document.documentElement;
  var themeBtn = $('#themeToggle');

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    var dark = theme === 'dark';
    if (themeBtn) {
      themeBtn.setAttribute('aria-pressed', String(dark));
      themeBtn.setAttribute('aria-label', dark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối');
      themeBtn.innerHTML = '<i class="fa-solid ' + (dark ? 'fa-sun' : 'fa-moon') + '" aria-hidden="true"></i>';
    }
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#0E1A3A' : '#6C9CF0');
  }
  applyTheme(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem('lightweave-theme', next); } catch (e) { /* bỏ qua nếu trình duyệt chặn lưu trữ */ }
    });
  }

  /* ---------------------------------------------------
     4. VẼ MINH HỌA + NĂM TRONG FOOTER
     --------------------------------------------------- */
  $$('.js-logo').forEach(function (el) { el.innerHTML = logoSVG(); });
  if ($('#heroArt')) $('#heroArt').innerHTML = heroSVG();
  if ($('#miniArt')) $('#miniArt').innerHTML = miniSVG();
  if ($('#year')) $('#year').textContent = new Date().getFullYear();

  /* ---------------------------------------------------
     5. MENU MOBILE + HEADER KHI CUỘN
     --------------------------------------------------- */
  var header = $('#header');
  var nav = $('#mainNav');
  var menuBtn = $('#menuToggle');

  function setMenu(open) {
    if (!nav || !menuBtn) return;
    nav.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
    menuBtn.innerHTML = '<i class="fa-solid ' + (open ? 'fa-xmark' : 'fa-bars') + '" aria-hidden="true"></i>';
  }
  if (menuBtn) menuBtn.addEventListener('click', function () { setMenu(!nav.classList.contains('is-open')); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  window.addEventListener('scroll', function () {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
  }, { passive: true });

  /* ---------------------------------------------------
     6. SMOOTH SCROLL cho link nội trang (#...)
     --------------------------------------------------- */
  function scrollToHash(hash) {
    var target = hash.length > 1 ? $(hash) : null;
    if (!target) return;
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', hash);
  }
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var hash = link.getAttribute('href');
    if (hash.length < 2) return;
    e.preventDefault();
    setMenu(false);
    scrollToHash(hash);
  });

  /* ---------------------------------------------------
     7. SCROLLSPY: thanh phụ trong trang (ví dụ Phòng tranh)
     Mục nào đang ở giữa màn hình thì nút tương ứng sáng lên.
     --------------------------------------------------- */
  // Thanh menu chính (trang chủ) và thanh phụ (Phòng tranh) cùng được theo dõi vị trí cuộn
  var subLinks = $$('.subnav a[href^="#"], .main-nav a[href^="#"]');
  if (subLinks.length && 'IntersectionObserver' in window) {
    var spySections = subLinks.map(function (l) { return $(l.getAttribute('href')); }).filter(Boolean);
    var setActive = function (id) {
      subLinks.forEach(function (l) {
        var on = l.getAttribute('href') === '#' + id;
        l.classList.toggle('is-active', on);
        if (on) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current');
      });
    };
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) setActive(en.target.id); });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
    spySections.forEach(function (s) { spy.observe(s); });
    // Không tô sáng mục nào khi vừa mở trang; mục chỉ sáng khi người đọc cuộn tới phần tương ứng
  }

  /* ---------------------------------------------------
     8. MODAL (thẻ <dialog> có sẵn focus trap và phím Esc)
     --------------------------------------------------- */
  var modal = $('#modal');
  var modalBody = $('#modalBody');
  var lastTrigger = null;

  function openModal(html, trigger) {
    if (!modal) return;
    lastTrigger = trigger || null;
    modalBody.innerHTML = html;
    if (typeof modal.showModal === 'function') modal.showModal(); else modal.setAttribute('open', '');
    document.body.classList.add('modal-open');
    modal.scrollTop = 0;
  }
  function closeModal() {
    if (!modal) return;
    if (typeof modal.close === 'function') modal.close(); else modal.removeAttribute('open');
  }
  if (modal) {
    modal.addEventListener('close', function () {
      document.body.classList.remove('modal-open');
      if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus();
    });
    $('#modalClose').addEventListener('click', closeModal);
    // Bấm ra vùng nền tối để đóng
    modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
  }

  function workModal(w) {
    var isStudent = !!w.author;
    var rows = '<dt>Tác giả</dt><dd>' + esc(w.author || 'Lily Nguyễn') + '</dd><dt>Thể loại</dt><dd>' + esc(CATEGORIES[w.cat] || '') + '</dd>';
    if (w.date) rows += '<dt>Ngày vẽ</dt><dd>' + esc(w.date) + '</dd>';
    if (w.medium) rows += '<dt>Chất liệu</dt><dd>' + esc(w.medium) + '</dd>';
    return '<div class="modal-art"><div class="modal-visual"><img src="images/' + w.file + '.jpg" width="' + w.w + '" height="' + w.h + '" alt="' + esc(w.title) + '"></div>' +
      '<div class="modal-text"><span class="badge ' + (isStudent ? 'is-student' : '') + '">' + (isStudent ? 'Tác phẩm học viên' : 'Tranh của cô Lily') + '</span>' +
      '<h3 id="modalTitle">' + esc(w.title) + '</h3><p>' + esc(w.desc) + '</p><dl class="spec">' + rows + '</dl>' +
      '<div class="modal-actions"><a class="btn btn-primary btn-sm" href="contact.html?work=' + encodeURIComponent(w.title) + '#form">Hỏi về tác phẩm</a>' +
      '<button class="btn btn-ghost btn-sm" type="button" data-action="close">Đóng</button></div></div></div>';
  }

  function courseModal(c) {
    var price = c.price ? formatPrice(c.price) + ' ' + c.unit : 'Liên hệ để được báo giá';
    return '<div class="modal-art"><div class="modal-visual"><img src="images/' + c.image + '.jpg" alt="Tranh minh họa khóa ' + esc(c.title) + '"></div>' +
      '<div class="modal-text"><span class="badge">' + esc(c.flag) + '</span><h3 id="modalTitle">' + esc(c.no) + ': ' + esc(c.title) + '</h3><p>' + esc(c.desc) + '</p>' +
      '<ul class="course-facts">' + c.facts.map(function (f) { return '<li><i class="fa-solid ' + f[0] + '" aria-hidden="true"></i><span>' + esc(f[1]) + '</span></li>'; }).join('') + '</ul>' +
      '<dl class="spec"><dt>Học phí</dt><dd>' + esc(price) + '</dd></dl>' +
      '<div class="modal-actions"><a class="btn btn-primary btn-sm" href="contact.html?course=' + c.id + '#form">Đăng ký tư vấn</a>' +
      '<button class="btn btn-ghost btn-sm" type="button" data-action="close">Để sau</button></div></div></div>';
  }

  function posterModal() {
    return '<div class="modal-poster"><h3 id="modalTitle" class="visually-hidden">Poster giới thiệu lớp học</h3>' +
      '<img src="images/poster.jpg" alt="Poster giới thiệu Lớp vẽ Ánh Sáng: thông tin lớp học, mục tiêu, thành tích và các khóa học"></div>';
  }

  // Một listener chung cho mọi thẻ có thể mở modal
  document.addEventListener('click', function (e) {
    var workBtn = e.target.closest('[data-work]');
    if (workBtn) {
      var w = findById(WORKS, workBtn.dataset.work) || findById(STUDENT_WORKS, workBtn.dataset.work);
      if (w) openModal(workModal(w), workBtn);
      return;
    }
    var courseBtn = e.target.closest('[data-course]');
    if (courseBtn) {
      var c = findById(COURSES, courseBtn.dataset.course);
      if (c) openModal(courseModal(c), courseBtn);
      return;
    }
    var posterBtn = e.target.closest('[data-poster]');
    if (posterBtn) { openModal(posterModal(), posterBtn); return; }

    var action = e.target.closest('[data-action="close"]');
    if (action) closeModal();
  });

  /* ---------------------------------------------------
     9. PHÒNG TRANH: LỌC THEO THỂ LOẠI + TÌM KIẾM TRỰC TIẾP
     --------------------------------------------------- */
  var teacherGrid = $('#teacherGrid');
  var state = { cat: 'all', query: '' };

  function workCard(w, i) {
    return '<button class="art-card" type="button" data-work="' + w.id + '" style="animation-delay:' + (i * 40) + 'ms">' +
      '<span class="art-thumb"><img src="images/' + w.file + '-s.jpg" width="' + Math.round(w.w * 640 / Math.max(w.w, w.h)) + '" height="' + Math.round(w.h * 640 / Math.max(w.w, w.h)) + '" alt="' + esc(w.title) + '" loading="lazy"></span>' +
      '<span class="art-info"><h3>' + esc(w.title) + '</h3><p>' + esc((w.author || 'Lily Nguyễn') + ' · ' + (CATEGORIES[w.cat] || '')) + '</p></span></button>';
  }
  function matches(w) {
    var q = normalize(state.query.trim());
    var okCat = state.cat === 'all' || w.cat === state.cat;
    var hay = normalize([w.title, w.author || '', CATEGORIES[w.cat] || '', w.medium || '', w.desc, w.tags.join(' ')].join(' '));
    return okCat && (!q || hay.indexOf(q) !== -1);
  }

  function renderGallery() {
    if (!teacherGrid) return;

    var teacher = WORKS.filter(matches);
    teacherGrid.innerHTML = teacher.map(workCard).join('');
    $('#teacherCount').textContent = 'Hiển thị ' + teacher.length + ' / ' + WORKS.length + ' tác phẩm';
    $('#teacherEmpty').hidden = teacher.length > 0;

    // Mục học viên: mỗi khóa một mục riêng (data-course-grid / data-course-count / data-course-empty trong HTML)
    ['c1', 'c2'].forEach(function (cid) {
      var grid = $('[data-course-grid="' + cid + '"]');
      if (!grid) return;
      var list = STUDENT_WORKS.filter(function (w) { return w.course === cid; });
      var shown = list.filter(matches);
      grid.innerHTML = shown.map(workCard).join('');
      $('[data-course-count="' + cid + '"]').textContent = 'Hiển thị ' + shown.length + ' / ' + list.length + ' tác phẩm';
      $('[data-course-empty="' + cid + '"]').hidden = shown.length > 0;
    });
  }

  function setCat(value) {
    state.cat = value;
    $$('#galleryFilters .chip').forEach(function (c) {
      var on = c.dataset.filter === value;
      c.classList.toggle('is-active', on);
      c.setAttribute('aria-pressed', String(on));
    });
    renderGallery();
  }

  if (teacherGrid) {
    // Tạo các nút lọc thể loại
    var chipHTML = '<button class="chip is-active" type="button" data-filter="all" aria-pressed="true">Tất cả</button>';
    Object.keys(CATEGORIES).forEach(function (k) {
      chipHTML += '<button class="chip" type="button" data-filter="' + k + '" aria-pressed="false">' + esc(CATEGORIES[k]) + '</button>';
    });
    $('#galleryFilters').innerHTML = chipHTML;

    $('#galleryFilters').addEventListener('click', function (e) {
      var chip = e.target.closest('.chip');
      if (chip) setCat(chip.dataset.filter);
    });
    $('#gallerySearch').addEventListener('input', function (e) { state.query = e.target.value; renderGallery(); });
    $$('.js-reset').forEach(function (b) {
      b.addEventListener('click', function () { state.query = ''; $('#gallerySearch').value = ''; setCat('all'); });
    });
    renderGallery();
  }

  /* ---------------------------------------------------
     10. KHÓA HỌC (trang Khóa học và phần giới thiệu ở Trang chủ)
     --------------------------------------------------- */
  function courseCard(c) {
    var price = c.price
      ? '<span class="price">' + formatPrice(c.price) + ' <small>' + esc(c.unit) + '</small></span>'
      : '<span class="price is-quote">Liên hệ báo giá</span>';
    return '<article class="course-card">' +
      '<div class="course-thumb"><img src="images/' + c.image + '-s.jpg" alt="Tranh minh họa khóa ' + esc(c.title) + '" loading="lazy"><span class="course-flag">' + esc(c.flag) + '</span></div>' +
      '<div class="course-body"><span class="course-no">' + esc(c.no) + '</span><h3>' + esc(c.title) + '</h3><p>' + esc(c.desc) + '</p>' +
      '<ul class="course-facts">' + c.facts.map(function (f) {
        return '<li><i class="fa-solid ' + f[0] + '" aria-hidden="true"></i><span>' + esc(f[1]) + '</span></li>';
      }).join('') + '</ul>' +
      '<div class="course-foot">' + price + '<div class="course-actions">' +
      '<button class="btn btn-ghost btn-sm" type="button" data-course="' + c.id + '">Chi tiết</button>' +
      '<a class="btn btn-primary btn-sm" href="contact.html?course=' + c.id + '#form">Đăng ký tư vấn</a></div></div></div></article>';
  }
  ['#courseGrid', '#courseTeaser'].forEach(function (sel) {
    var box = $(sel);
    if (box) box.innerHTML = COURSES.map(courseCard).join('');
  });

  /* ---------------------------------------------------
     11. THÀNH TÍCH: LỌC THEO NĂM
     --------------------------------------------------- */
  var awardFilters = $('#awardFilters');
  if (awardFilters) {
    awardFilters.addEventListener('click', function (e) {
      var chip = e.target.closest('.chip');
      if (!chip) return;
      var year = chip.dataset.year;
      $$('.chip', awardFilters).forEach(function (c) {
        var on = c === chip;
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-pressed', String(on));
      });
      $$('.award').forEach(function (a) { a.hidden = !(year === 'all' || a.dataset.year === year); });
    });
  }

  /* ---------------------------------------------------
     12. ĐẾM SỐ + HIỆN DẦN KHI CUỘN
     --------------------------------------------------- */
  function animateCount(el) {
    var end = parseFloat(el.dataset.count);
    var suffix = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = end + suffix; return; }
    var start = null, duration = 1200;
    function step(ts) {
      if (!start) start = ts;
      var t = Math.min((ts - start) / duration, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - t, 3))) + suffix;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  $$('.info-card, .section-head, .stats, .strip-card, .cta-banner, .contact-card').forEach(function (el) { el.classList.add('reveal'); });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-visible');
        $$('[data-count]', en.target).forEach(animateCount);
        io.unobserve(en.target);
      });
    }, { threshold: 0.15 });
    $$('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    $$('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
    $$('[data-count]').forEach(animateCount);
  }

  /* ---------------------------------------------------
     13. FORM LIÊN HỆ → mở ứng dụng email của khách (mailto)
     Trang tĩnh không có máy chủ nên form soạn sẵn một email gửi tới địa chỉ của cô.
     --------------------------------------------------- */
  var form = $('#contactForm');
  if (form) {
    // Điền sẵn khi bấm "Đăng ký tư vấn" hoặc "Hỏi về tác phẩm" từ trang khác
    var params = new URLSearchParams(window.location.search);
    if (params.get('course') && form.course.querySelector('option[value="' + params.get('course') + '"]')) {
      form.course.value = params.get('course');
    }
    if (params.get('work')) {
      form.course.value = 'work';
      form.message.value = 'Mình muốn hỏi về tác phẩm “' + params.get('work') + '”.';
    }

    var setError = function (field, msg) {
      var wrap = field.closest('.field');
      wrap.classList.toggle('has-error', !!msg);
      $('.err', wrap).textContent = msg || '';
      field.setAttribute('aria-invalid', msg ? 'true' : 'false');
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var phone = form.phone.value.replace(/[\s.\-]/g, '');
      var ok = true;
      setError(form.name, name ? '' : 'Vui lòng nhập họ tên.');
      var phoneOk = /^(0|\+84)\d{9}$/.test(phone);
      setError(form.phone, phoneOk ? '' : 'Số điện thoại chưa đúng (ví dụ 0901 234 567).');
      if (!name || !phoneOk) { ok = false; (name ? form.phone : form.name).focus(); }
      if (!ok) return;

      var data = {
        name: name.slice(0, 100),
        phone: phone,
        course: form.course.value,
        mode: form.mode.value,
        message: form.message.value.trim().slice(0, 1000)
      };
      var courseLabel = form.course.options[form.course.selectedIndex].text;
      var openEmail = function () {
        var body = 'Họ tên: ' + data.name + '\nSố điện thoại: ' + form.phone.value.trim() +
          '\nQuan tâm: ' + courseLabel + '\nHình thức: ' + data.mode +
          '\n\n' + (data.message || '(không có lời nhắn)');
        window.location.href = 'mailto:' + CONTACT.email + '?subject=' + encodeURIComponent('Đăng ký tư vấn – Lớp vẽ Ánh Sáng') + '&body=' + encodeURIComponent(body);
        showToast('Đang mở ứng dụng email của bạn. Bấm Gửi để hoàn tất nhé!');
      };

      // Lưu vào Firestore (CREATE). Chưa cấu hình hoặc lỗi thì mở email như trước để không mất yêu cầu.
      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      sendRegistration(data).then(function (saved) {
        btn.disabled = false;
        if (saved) {
          form.reset();
          showToast('Cảm ơn bạn! Cô đã nhận được thông tin và sẽ liên hệ sớm.');
        } else {
          openEmail();
        }
      }).catch(function (err) {
        btn.disabled = false;
        console.warn('Chưa lưu được đăng ký, mở email thay thế:', err);
        openEmail();
      });
    });
  }

  /* ---------------------------------------------------
     14. ĐĂNG KÝ NHẬN TIN (footer) → cũng soạn email gửi cô
     --------------------------------------------------- */
  var news = $('#newsletterForm');
  if (news) {
    news.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = $('#newsletterEmail');
      var msg = $('#newsletterMsg');
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
      msg.className = 'form-msg ' + (ok ? 'is-ok' : 'is-error');
      if (!ok) { msg.textContent = 'Vui lòng nhập một địa chỉ email hợp lệ.'; input.focus(); return; }
      msg.textContent = 'Đang mở email của bạn, bấm Gửi để hoàn tất.';
      window.location.href = 'mailto:' + CONTACT.email + '?subject=' + encodeURIComponent('Đăng ký nhận tin từ Lớp vẽ Ánh Sáng') +
        '&body=' + encodeURIComponent('Mình muốn nhận thông tin lớp học và tranh mới. Email của mình: ' + input.value.trim());
      input.value = '';
    });
  }

  /* ---------------------------------------------------
     15. FORM FEEDBACK → mở email gửi cô (giống form liên hệ)
     --------------------------------------------------- */
  var fb = $('#feedbackForm');
  if (fb) {
    var fbError = function (field, msg) {
      var wrap = field.closest('.field');
      wrap.classList.toggle('has-error', !!msg);
      $('.err', wrap).textContent = msg || '';
      field.setAttribute('aria-invalid', msg ? 'true' : 'false');
    };

    fb.addEventListener('submit', function (e) {
      e.preventDefault();
      var nameEl = $('#fbName');
      var msgEl = $('#fbMessage');
      var name = nameEl.value.trim();
      var message = msgEl.value.trim();
      fbError(nameEl, name ? '' : 'Vui lòng nhập họ tên.');
      fbError(msgEl, message ? '' : 'Vui lòng nhập nội dung góp ý.');
      if (!name || !message) { (name ? msgEl : nameEl).focus(); return; }

      var course = $('#fbCourse');
      var body = 'Họ tên: ' + name +
        '\nBạn là: ' + $('#fbRole').value +
        '\nKhóa đã học: ' + course.options[course.selectedIndex].text +
        '\nMức độ hài lòng: ' + $('#fbRating').value +
        '\nCho phép dùng nhận xét trên trang: ' + ($('#fbPublish').checked ? 'Có (có thể ẩn tên)' : 'Không') +
        '\n\nGóp ý:\n' + message;
      window.location.href = 'mailto:' + CONTACT.email + '?subject=' + encodeURIComponent('Feedback – Lớp vẽ Ánh Sáng') + '&body=' + encodeURIComponent(body);
      showToast('Đang mở ứng dụng email của bạn. Bấm Gửi để hoàn tất nhé!');
    });
  }
  /* ---------------------------------------------------
     16. TRỢ LÝ AI: khung chat (nút mở, khung tin nhắn, ô nhập, nút gửi, trạng thái Loading...)
     --------------------------------------------------- */
  var CHAT_SESSION_KEY = 'lightweave-chat-session';
  var WELCOME = 'Chào bạn! Mình là trợ lý của Lớp vẽ Ánh Sáng. Bạn muốn hỏi về khóa học, lịch học hay học phí?';
  var chatState = { busy: false, started: false, history: [], sessionId: '', db: null, ready: null, els: null };

  function buildChat() {
    var fab = document.createElement('button');
    fab.className = 'chat-fab';
    fab.type = 'button';
    fab.setAttribute('aria-expanded', 'false');
    fab.setAttribute('aria-controls', 'chatPanel');
    fab.setAttribute('aria-label', 'Mở trợ lý AI');
    fab.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles" aria-hidden="true"></i><span>Hỏi trợ lý</span>';

    var panel = document.createElement('section');
    panel.className = 'chat-panel';
    panel.id = 'chatPanel';
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Trợ lý Lightweave');
    panel.innerHTML =
      '<header class="chat-head"><div><strong>Trợ lý Lightweave</strong><small>Hỏi về khóa học, lịch học, học phí</small></div>' +
      '<button class="icon-btn chat-close" type="button" aria-label="Đóng trợ lý"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button></header>' +
      '<div class="chat-tools"><label for="chatName">Tên của bạn</label>' +
      '<input id="chatName" type="text" maxlength="40" placeholder="Tùy chọn" autocomplete="given-name" />' +
      '<button class="chat-clear" type="button">Xóa lịch sử</button></div>' +
      '<div class="chat-log" id="chatLog" role="log" aria-live="polite"></div>' +
      '<form class="chat-form" id="chatForm" autocomplete="off">' +
      '<label for="chatInput" class="visually-hidden">Nhập câu hỏi</label>' +
      '<input id="chatInput" type="text" maxlength="500" placeholder="Nhập câu hỏi của bạn…" />' +
      '<button class="btn btn-primary btn-sm" type="submit" id="chatSend">Gửi <i class="fa-solid fa-paper-plane" aria-hidden="true"></i></button></form>';

    document.body.appendChild(panel);
    document.body.appendChild(fab);
    chatState.els = {
      fab: fab,
      panel: panel,
      log: $('#chatLog', panel),
      form: $('#chatForm', panel),
      input: $('#chatInput', panel),
      send: $('#chatSend', panel),
      name: $('#chatName', panel)
    };
  }

  function addBubble(role, text) {
    var log = chatState.els.log;
    var div = document.createElement('div');
    div.className = 'chat-msg ' + (role === 'user' ? 'is-user' : 'is-bot');
    div.textContent = text;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
    return div;
  }

  function showLoading() {
    var log = chatState.els.log;
    var div = document.createElement('div');
    div.className = 'chat-msg is-bot is-loading';
    div.setAttribute('role', 'status');
    div.innerHTML = '<span class="dots" aria-hidden="true"><i></i><i></i><i></i></span><span>Loading...</span>';
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
    return div;
  }

  function showWelcome() { addBubble('bot', WELCOME); }

  function setBusy(on) {
    chatState.busy = on;
    chatState.els.send.disabled = on;
    chatState.els.form.setAttribute('aria-busy', String(on));
  }

  // Mã phiên trò chuyện giữ trên trình duyệt này (chỉ là tiện ích, không chứa thông tin cá nhân)
  function getSessionId() {
    try {
      var id = localStorage.getItem(CHAT_SESSION_KEY);
      if (!id) {
        id = 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        localStorage.setItem(CHAT_SESSION_KEY, id);
      }
      return id;
    } catch (e) {
      return 's' + Date.now().toString(36);
    }
  }

  function setOpen(open) {
    var els = chatState.els;
    els.panel.hidden = !open;
    els.fab.setAttribute('aria-expanded', String(open));
    if (!open) { els.fab.focus(); return; }
    if (!chatState.started) startChat();
    setTimeout(function () { els.input.focus(); }, 50);
  }

  // Lần đầu mở khung chat: tải hồ sơ và lịch sử từ Firestore (nếu đã cấu hình Firebase)
  function startChat() {
    chatState.started = true;
    chatState.sessionId = getSessionId();
    setBusy(true);
    var loading = showLoading();

    loadFirebase()
      .then(function (fb) {
        if (!fb) return;
        chatState.db = fb;
        chatState.ready = store.ensureProfile(fb); // CREATE: tạo hồ sơ lần đầu
        return chatState.ready
          .then(function () {
            return Promise.all([store.getProfile(fb), store.getHistory(fb, chatState.sessionId)]); // READ
          })
          .then(function (r) {
            if (r[0] && r[0].name) chatState.els.name.value = r[0].name;
            r[1].forEach(function (m) {
              chatState.history.push({ role: m.role, text: m.text });
              addBubble(m.role === 'user' ? 'user' : 'bot', m.text);
            });
          });
      })
      .catch(function (err) { console.warn('Không tải được dữ liệu Firebase:', err); })
      .then(function () {
        loading.remove();
        if (!chatState.history.length) showWelcome();
        setBusy(false);
      });
  }

  function persist(role, text) {
    if (!chatState.db) return;
    store.addMessage(chatState.db, chatState.sessionId, role, text).catch(function (err) {
      console.warn('Không lưu được tin nhắn:', err);
    });
  }

  function sendMessage(raw) {
    var text = raw.trim();
    if (!text || chatState.busy) return;
    var els = chatState.els;
    els.input.value = '';
    addBubble('user', text);
    chatState.history.push({ role: 'user', text: text });
    persist('user', text);
    setBusy(true);
    var loading = showLoading(); // trạng thái Loading... trong khi chờ AI

    askGemini(chatState.history.slice(-AI_CONFIG.historyLimit))
      .then(function (reply) {
        loading.remove();
        addBubble('bot', reply);
        chatState.history.push({ role: 'model', text: reply });
        persist('model', reply);
      }, function (err) {
        loading.remove();
        chatState.history.pop(); // bỏ câu hỏi lỗi khỏi ngữ cảnh để lần sau hỏi lại tự nhiên
        addBubble('bot', 'Xin lỗi, trợ lý chưa trả lời được lúc này. Bạn thử lại sau nhé, hoặc gọi cô qua số ' + CONTACT.phone + '.');
        console.warn('Lỗi gọi Gemini:', err);
      })
      .then(function () {
        setBusy(false);
        els.input.focus();
      });
  }

  function clearHistory() {
    if (chatState.busy || !window.confirm('Xóa toàn bộ lịch sử trò chuyện này?')) return;
    chatState.history = [];
    chatState.els.log.innerHTML = '';
    var done = chatState.db ? store.clearSession(chatState.db, chatState.sessionId) : Promise.resolve();
    done.catch(function (err) { console.warn('Không xóa được lịch sử:', err); }).then(showWelcome);
  }

  function saveName() {
    var name = chatState.els.name.value.trim().slice(0, 40);
    if (!chatState.db || !chatState.ready) return;
    chatState.ready
      .then(function () { return store.updateName(chatState.db, name); }) // UPDATE
      .catch(function (err) { console.warn('Không lưu được tên:', err); });
  }

  function initChat() {
    buildChat();
    var els = chatState.els;
    els.fab.addEventListener('click', function () { setOpen(els.panel.hidden); });
    $('.chat-close', els.panel).addEventListener('click', function () { setOpen(false); });
    $('.chat-clear', els.panel).addEventListener('click', clearHistory);
    els.name.addEventListener('change', saveName);
    els.form.addEventListener('submit', function (e) { e.preventDefault(); sendMessage(els.input.value); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !els.panel.hidden) setOpen(false);
    });
  }
  initChat();

  /* ---------------------------------------------------
     17. GỌI GEMINI (Google AI) – endpoint generateContent
     --------------------------------------------------- */
  function buildSystemPrompt() {
    var courseLines = COURSES.map(function (c) {
      var price = c.price ? formatPrice(c.price) + ' ' + c.unit : 'liên hệ báo giá';
      return '- ' + c.no + ' · ' + c.flag + ' (' + c.title + '): ' + price + '. ' +
        c.facts.map(function (f) { return f[1]; }).join('; ') + '.';
    }).join('\n');
    var who = chatState.els ? chatState.els.name.value.trim() : '';
    return 'Bạn là trợ lý AI của Lightweave – Lớp vẽ Ánh Sáng, lớp vẽ của Lily Nguyễn (Nguyễn Hoàng Thảo Vy) ' +
      'dành cho học sinh 6–15 tuổi tại TP. Hồ Chí Minh.\n' +
      'Trả lời bằng tiếng Việt, ngắn gọn, thân thiện, viết thành câu văn thường, không dùng bảng hay markdown phức tạp.\n' +
      'Chỉ dùng thông tin dưới đây. Nếu không có thông tin, nói rõ là chưa có và mời người hỏi liên hệ cô qua điện thoại ' +
      CONTACT.phone + ' hoặc email ' + CONTACT.email + '. Không tự hứa giảm giá, học thử hay kết quả thi.\n' +
      'Các khóa học:\n' + courseLines + '\n' +
      (who ? 'Người đang trò chuyện tên là ' + who + '. Có thể gọi tên bạn ấy một cách lịch sự.\n' : '');
  }

  function askGemini(turns) {
    if (!AI_CONFIG.apiKey) return Promise.reject(new Error('Chưa có khóa API'));
    var url = 'https://generativelanguage.googleapis.com/v1beta/models/' +
      encodeURIComponent(AI_CONFIG.model) + ':generateContent';
    var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, 30000) : null;

    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': AI_CONFIG.apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: buildSystemPrompt() }] },
        contents: turns.map(function (t) { return { role: t.role, parts: [{ text: t.text }] }; }),
        generationConfig: { temperature: 0.5, maxOutputTokens: 700 }
      }),
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (!res.ok) throw new Error((data.error && data.error.message) || ('HTTP ' + res.status));
        var parts = data.candidates && data.candidates[0] && data.candidates[0].content &&
          data.candidates[0].content.parts;
        var text = parts ? parts.map(function (p) { return p.text || ''; }).join('').trim() : '';
        if (!text) throw new Error('Phản hồi trống' + (data.promptFeedback ? ' (bị chặn)' : ''));
        return text;
      });
    }).finally(function () { clearTimeout(timer); });
  }

  /* ---------------------------------------------------
     18. FIREBASE (SDK modular v10): đăng nhập ẩn danh + CRUD lịch sử chat và hồ sơ trong Firestore
     SDK được tải khi cần (import động) nên trang vẫn chạy khi chưa cấu hình Firebase.
     Cấu trúc dữ liệu:
       users/{uid}                          → hồ sơ: name, createdAt, updatedAt
       users/{uid}/chats/{sid}/messages/{id} → tin nhắn: role ('user' | 'model'), text, createdAt
     --------------------------------------------------- */
  var FB_BASE = 'https://www.gstatic.com/firebasejs/' + FIREBASE_VERSION + '/';
  var fbPromise = null;

  function firebaseConfigured() {
    return !!FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.apiKey.indexOf('YOUR_') !== 0 &&
      !!FIREBASE_CONFIG.projectId && FIREBASE_CONFIG.projectId.indexOf('YOUR_') !== 0;
  }

  // Trả về { db, fs, uid } khi sẵn sàng, hoặc null nếu chưa cấu hình / không kết nối được
  function loadFirebase() {
    if (!firebaseConfigured()) return Promise.resolve(null);
    if (!fbPromise) {
      fbPromise = Promise.all([
        import(FB_BASE + 'firebase-app.js'),
        import(FB_BASE + 'firebase-auth.js'),
        import(FB_BASE + 'firebase-firestore.js')
      ]).then(function (m) {
        var app = m[0].initializeApp(FIREBASE_CONFIG);
        var auth = m[1].getAuth(app);
        var db = m[2].getFirestore(app);
        return m[1].signInAnonymously(auth).then(function (cred) {
          return { db: db, fs: m[2], uid: cred.user.uid };
        });
      }).catch(function (err) {
        console.warn('Firebase chưa sẵn sàng, trợ lý sẽ không lưu lịch sử:', err);
        return null;
      });
    }
    return fbPromise;
  }

  var store = {
    // CREATE: tạo hồ sơ người dùng nếu chưa có (không ghi đè dữ liệu cũ)
    ensureProfile: function (fb) {
      var fs = fb.fs;
      var ref = fs.doc(fb.db, 'users', fb.uid);
      return fs.getDoc(ref).then(function (snap) {
        if (snap.exists()) return null;
        return fs.setDoc(ref, { createdAt: fs.serverTimestamp(), updatedAt: fs.serverTimestamp() });
      });
    },

    // READ: đọc hồ sơ người dùng
    getProfile: function (fb) {
      var fs = fb.fs;
      return fs.getDoc(fs.doc(fb.db, 'users', fb.uid)).then(function (snap) {
        return snap.exists() ? snap.data() : null;
      });
    },

    // UPDATE: đổi tên hiển thị
    updateName: function (fb, name) {
      var fs = fb.fs;
      return fs.updateDoc(fs.doc(fb.db, 'users', fb.uid), { name: name, updatedAt: fs.serverTimestamp() });
    },

    // CREATE: lưu một tin nhắn vào lịch sử của phiên
    addMessage: function (fb, sessionId, role, text) {
      var fs = fb.fs;
      return fs.addDoc(fs.collection(fb.db, 'users', fb.uid, 'chats', sessionId, 'messages'), {
        role: role,
        text: text,
        createdAt: fs.serverTimestamp()
      }).then(function (ref) { return ref.id; });
    },

    // CREATE: lưu một đăng ký tư vấn từ form Liên hệ (collection 'registrations')
    addRegistration: function (fb, data) {
      var fs = fb.fs;
      return fs.addDoc(fs.collection(fb.db, 'registrations'), {
        name: data.name,
        phone: data.phone,
        course: data.course || '',
        mode: data.mode || '',
        message: data.message || '',
        source: 'contact-form',
        status: 'new',
        createdAt: fs.serverTimestamp()
      }).then(function (ref) { return ref.id; });
    },

    // READ: đọc lịch sử của một phiên (tối đa 100 tin, cũ đến mới)
    getHistory: function (fb, sessionId) {
      var fs = fb.fs;
      var q = fs.query(
        fs.collection(fb.db, 'users', fb.uid, 'chats', sessionId, 'messages'),
        fs.orderBy('createdAt', 'asc'),
        fs.limit(100)
      );
      return fs.getDocs(q).then(function (snap) {
        return snap.docs.map(function (d) {
          return { id: d.id, role: d.data().role, text: d.data().text };
        });
      });
    },

    // UPDATE: sửa nội dung một tin nhắn
    updateMessage: function (fb, sessionId, messageId, text) {
      var fs = fb.fs;
      return fs.updateDoc(fs.doc(fb.db, 'users', fb.uid, 'chats', sessionId, 'messages', messageId), {
        text: text,
        editedAt: fs.serverTimestamp()
      });
    },

    // DELETE: xóa một tin nhắn
    deleteMessage: function (fb, sessionId, messageId) {
      var fs = fb.fs;
      return fs.deleteDoc(fs.doc(fb.db, 'users', fb.uid, 'chats', sessionId, 'messages', messageId));
    },

    // DELETE: xóa toàn bộ lịch sử của một phiên (ghi theo lô, mỗi lô tối đa 450 lệnh)
    clearSession: function (fb, sessionId) {
      var fs = fb.fs;
      return fs.getDocs(fs.collection(fb.db, 'users', fb.uid, 'chats', sessionId, 'messages')).then(function (snap) {
        var commits = [];
        for (var i = 0; i < snap.docs.length; i += 450) {
          var batch = fs.writeBatch(fb.db);
          snap.docs.slice(i, i + 450).forEach(function (d) { batch.delete(d.ref); });
          commits.push(batch.commit());
        }
        return Promise.all(commits);
      });
    }
  };

  // Trả về true nếu đã lưu được vào Firestore; false nếu Firebase chưa cấu hình (khi đó form sẽ mở email)
  function sendRegistration(data) {
    return loadFirebase().then(function (fb) {
      if (!fb) return false;
      return store.addRegistration(fb, data).then(function () { return true; });
    });
  }

  // Gọi các hàm CRUD từ console hoặc mã khác, ví dụ: LightweaveDB.store.getHistory(fb, sid)
  window.LightweaveDB = { load: loadFirebase, store: store };

})();
