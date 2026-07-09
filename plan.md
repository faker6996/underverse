# Kế hoạch triển khai các bộ Sticker Dragon Ball còn lại

Tài liệu này lưu trữ danh sách các nhân vật và sticker chưa được sinh ảnh để tiện theo dõi và tiếp tục thực hiện khi hạn ngạch (quota) tạo ảnh được khôi phục.

---

## 1. Trạng thái hiện tại (Status Tracker)

| Nhân vật | ID Gói | Số lượng nhãn dán | Trạng thái |
| :--- | :--- | :--- | :--- |
| **Goku** | `db_goku` | 10/10 | **Hoàn thành** ✅ |
| **Vegeta** | `db_vegeta` | 10/10 | **Hoàn thành** ✅ |
| **Beerus** | `db_beerus` | 10/10 | **Hoàn thành** ✅ |
| **Goku Black** | `db_goku_black` | 10/10 | **Hoàn thành** ✅ |
| **Hit** | `db_hit` | 10/10 | **Hoàn thành** ✅ |
| **Jiren** | `db_jiren` | 10/10 | **Hoàn thành** ✅ |
| **Frieza** | `db_frieza` | 10/10 | **Hoàn thành** ✅ |
| **Gohan** | `db_gohan` | 10/10 | **Hoàn thành** ✅ |
| **Piccolo** | `db_piccolo` | 10/10 | **Hoàn thành** ✅ |
| **Bulma** | `db_bulma` | 10/10 | **Hoàn thành** ✅ |
| **Future Trunks** | `db_trunks` | 10/10 | **Hoàn thành** ✅ |
| **Android 17** | `db_android17` | 10/10 | **Hoàn thành** ✅ |
| **Android 18** | `db_android18` | 10/10 | **Hoàn thành** ✅ |
| **Krillin** | `db_krillin` | 10/10 | **Hoàn thành** ✅ |
| **Master Roshi** | `db_roshi` | 10/10 | **Hoàn thành** ✅ |
| **Zamasu** | `db_zamasu` | 10/10 | **Hoàn thành** ✅ |
| **Whis** | `db_whis` | 11/10 | **Hoàn thành** ✅ |
| **Shin** | `db_shin` | 10/10 | **Hoàn thành** ✅ |

---

## 2. Kịch bản Prompt Sinh Ảnh Chi Tiết Cho 14 Nhân Vật Còn Lại

Mỗi nhãn dán khi sinh ảnh cần sử dụng prompt dạng:
`"Epic anime style [Tên nhân vật] [Mô tả hành động/cảm xúc], detailed shonen anime key visual, isolated on a solid black background, bold outline sticker"` để đảm bảo script xóa nền chạy chính xác nhất.

### 5. Hit (`db_hit`)
1. `calm`: Hit standing with hands in coat pockets.
2. `time_skip`: Hit moving fast with blurry trails (Time Skip).
3. `glare`: Hit looking sideways with a cold stare.
4. `fight_stance`: Hit in his unique martial arts stance.
5. `adjusting_coat`: Hit pulling down the collar of his coat.
6. `serious`: Hit looking directly forward, expressionless.
7. `assassin`: Hit pointing a finger with a small shockwave (Flash Fist Crush).
8. `injured`: Hit panting, wiping blood from his lip.
9. `closed_eyes`: Hit meditating or standing with eyes closed.
10. `smirk`: Hit giving a very subtle, rare smirk.

### 6. Jiren (`db_jiren`)
1. `crossed_arms`: Jiren standing with arms crossed, calm.
2. `glare`: Jiren glaring intensely, eyes glowing red.
3. `fireball`: Jiren holding a small orange heat dome energy blast.
4. `power_up`: Jiren surrounded by massive fiery red aura.
5. `punching`: Jiren throwing a high-speed punch.
6. `screaming`: Jiren screaming at his limit.
7. `calm_meditation`: Jiren floating cross-legged in meditation.
8. `shield`: Jiren blocking an attack with his bare hand.
9. `stoic`: Jiren looking directly forward, immovable.
10. `unfazed`: Jiren standing tall while dust blows around him.

### 7. Frieza (`db_frieza`)
1. `evil_laugh`: Frieza (Final Form) laughing with head back.
2. `golden_pose`: Golden Frieza pointing finger with a death beam.
3. `smirk`: Frieza sitting in his hover chair smirking.
4. `death_ball`: Frieza charging a massive red supernova ball.
5. `furious`: Frieza screaming in absolute rage, veins popping.
6. `mocking`: Frieza bowing politely but mockingly.
7. `shocked`: Frieza looking terrified/sweatdropping.
8. `kicked`: Frieza looking pained after being struck.
9. `telekinesis`: Frieza lifting rocks with a swipe of his hand.
10. `sinister_glare`: Frieza staring through his eyes with a dark smile.

### 8. Gohan (`db_gohan`)
1. `study`: Gohan wearing glasses, looking at a book.
2. `beast_scream`: Gohan Beast screaming, white spiky hair, red eyes.
3. `masenko`: Teen Gohan charging Masenko over his head.
4. `happy`: Adult Gohan smiling and waving.
5. `mystic_glare`: Ultimate Gohan looking serious, white aura.
6. `fight_stance`: Gohan in his turtle school gi stance.
7. `shocked`: Gohan adjusting his glasses in shock.
8. `crying`: Young Gohan crying with tears streaming.
9. `thumbs_up`: Gohan giving a friendly thumbs up.
10. `protective`: Gohan standing protectively with a serious look.

### 9. Piccolo (`db_piccolo`)
1. `meditate`: Piccolo floating and meditating.
2. `special_beam`: Piccolo charging Special Beam Cannon at his forehead.
3. `orange_power`: Orange Piccolo charging forward.
4. `crossed_arms`: Piccolo standing with arms crossed, cape blowing.
5. `cape_throw`: Piccolo throwing off his heavy shoulder pads and cape.
6. `angry`: Piccolo yelling, teeth bared.
7. `smirk`: Piccolo giving a confident Namekian smirk.
8. `regeneration`: Piccolo regenerating his arm with green light.
9. `surprised`: Piccolo sweatdropping in shock.
10. `paternal`: Piccolo looking crossed-armed and proud.

### 10. Bulma (`db_bulma`)
1. `radar`: Bulma holding the Dragon Radar and winking.
2. `angry`: Bulma yelling furiously, fist raised.
3. `happy`: Bulma waving with a bright smile.
4. `thinking`: Bulma tapping her chin with a wrench.
5. `shocked`: Bulma screaming in shock, hands on cheeks.
6. `smirk`: Bulma smiling confidently.
7. `sigh`: Bulma facepalming or sighing.
8. `scared`: Bulma hiding behind a corner, looking frightened.
9. `drinking`: Bulma drinking coffee or iced tea.
10. `waving`: Bulma sitting in a high-tech vehicle and waving.

### 11. Future Trunks (`db_trunks`)
1. `sword_ready`: Trunks unsheathing his sword.
2. `rage_scream`: Super Saiyan Rage Trunks screaming.
3. `burning_attack`: Trunks doing hand signs for Burning Attack.
4. `sad`: Trunks looking down, remembering his future.
5. `happy`: Trunks smiling warmly.
6. `fight_stance`: Trunks with hands raised in a fight stance.
7. `sword_slash`: Trunks slashing his sword downward.
8. `shocked`: Trunks looking back in surprise.
9. `determined`: Trunks tightening his headband or jacket.
10. `salute`: Trunks giving a two-finger salute.

### 12. Android 17 (`db_android17`)
1. `ranger`: Android 17 standing in his park ranger uniform.
2. `barrier`: Android 17 inside a green energy barrier shield.
3. `calm`: Android 17 adjusting his sleeve, looking peaceful.
4. `fight`: Android 17 charging an energy blast.
5. `smirk`: Android 17 smiling confidently.
6. `glare`: Android 17 looking back over his shoulder.
7. `exhausted`: Android 17 standing in smoke, damaged clothes.
8. `salute`: Android 17 waving or gesturing casually.
9. `serious`: Android 17 looking directly forward, focused.
10. `thumbs_up`: Android 17 giving a quiet thumbs up.

### 13. Android 18 (`db_android18`)
1. `hair_tuck`: Android 18 tucking hair behind her ear, cool look.
2. `soft_smile`: Android 18 smiling warmly (soft expression).
3. `fight_ready`: Android 18 raising hands to fight.
4. `destructo_disc`: Android 18 charging Destructo Disc.
5. `annoyed`: Android 18 crossing her arms, looking annoyed.
6. `smirk`: Android 18 smiling knowingly.
7. `shopping`: Android 18 holding shopping bags.
8. `shocked`: Android 18 looking surprised.
9. `wave`: Android 18 waving lazily.
10. `confident`: Android 18 looking down with a cool glare.

### 14. Krillin (`db_krillin`)
1. `sweatdrop`: Krillin laughing nervously with a giant sweatdrop.
2. `destructo`: Krillin throwing a spinning Destructo Disc.
3. `happy`: Krillin waving with a big bald-headed smile.
4. `scared`: Krillin screaming in terror, eyes popping.
5. `solar_flare`: Krillin putting hands to temples for Solar Flare.
6. `thumbs_up`: Krillin smiling and giving a thumbs up.
7. `crying`: Krillin crying comically.
8. `police`: Krillin in his police officer uniform.
9. `determined`: Krillin ready to fight.
10. `exhausted`: Krillin dizzy with stars spinning.

### 15. Master Roshi (`db_roshi`)
1. `peace`: Master Roshi flashing a peace sign and winking.
2. `max_power`: Buff Master Roshi charging Kamehameha.
3. `nosebleed`: Master Roshi with sunglasses down and a comical nosebleed.
4. `happy`: Master Roshi leaning on his staff, smiling.
5. `scared`: Roshi running away comically.
6. `sleeping`: Roshi sleeping under a magazine.
7. `angry`: Roshi waving his wooden staff angrily.
8. `thumbs_up`: Roshi giving a cool thumbs up.
9. `peaceful`: Roshi meditating in peace.
10. `cool`: Roshi wearing a tropical shirt and flashing a cool pose.

### 16. Zamasu (`db_zamasu`)
1. `justice`: Zamasu posing with one hand raised.
2. `fused_halo`: Fused Zamasu with his giant white light halo glowing.
3. `smirk`: Zamasu smiling purely but sinisterly.
4. `rage`: Corrupted Zamasu (purple arm) screaming in fury.
5. `crying`: Zamasu crying tears of joy for his "ideal world".
6. `divine_blade`: Zamasu with red ki blade extending from his hand.
7. `glare`: Zamasu looking down coldly on mortals.
8. `meditate`: Zamasu floating calmly with legs crossed.
9. `pointing`: Zamasu pointing dramatically forward.
10. `disgusted`: Zamasu looking away with a sneer.

### 17. Whis (`db_whis`)
1. `eating`: Whis holding a spoon and eating cake happily.
2. `staff_gaze`: Whis looking into his staff's crystal ball.
3. `giggle`: Whis covering his mouth and giggling.
4. `polite_bow`: Whis bowing politely.
5. `shocked`: Whis looking dramatically gasped/surprised.
6. `flying`: Whis traveling inside a light tunnel.
7. `bored`: Whis resting his chin on his staff.
8. `wink`: Whis giving a warm, knowing wink.
9. `yawn`: Whis yawning politely with hand over mouth.
10. `teaching`: Whis pointing a finger, lecturing calmly.

### 18. Shin (Supreme Kai) (`db_shin`)
1. `shocked`: Shin sweating profusely, eyes wide in shock.
2. `calm`: Shin smiling politely with hands clasped.
3. `scared`: Shin trembling, looking terrified.
4. `telepathy`: Shin holding his hand to his ear, listening.
5. `worried`: Shin looking sideways with a nervous sweat.
6. `flying`: Shin floating with his purple robes blowing.
7. `serious`: Shin looking forward with a determined Kai glance.
8. `greeting`: Shin bowing respectfully.
9. `relieved`: Shin wiping sweat from his forehead.
10. `puzzled`: Shin scratching his head, looking confused.

---

## 3. Quy trình thực hiện khi tiếp tục (Pipeline Guide)

1. **Sinh ảnh**: Gọi `generate_image` với prompt tương ứng.
2. **Cấu hình script xóa nền**: Thêm đường dẫn file ảnh gốc và file xuất ra vào `packages/underverse/scripts/remove-background.mjs`.
3. **Chạy xóa nền**: 
   ```bash
   cd packages/underverse
   node scripts/remove-background.mjs
   ```
4. **Tối ưu WebP và phân phối**:
   ```bash
   npm run prepare:stickers && node ./scripts/copy-stickers.mjs
   ```
5. **Đăng ký Pack**: Cập nhật bộ sticker mới trong `packages/underverse/src/components/sticker-data.ts`.
6. **Kiểm thử**:
   ```bash
   npm run build && npm run test:sticker-ui
   ```
