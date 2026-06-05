# Korean localization style guide for AI translation agents

## 1. General principles

- Use natural Korean UI wording, not literal translation from English or Vietnamese.
- Prioritize readability, clarity, and native UX tone.
- Translate by UI context and user intent, not by dictionary meaning.
- Prefer concise Korean for compact UI components.
- Use complete natural sentences for messages and notifications.
- Keep terminology consistent across the same module.
- Avoid machine-translation tone.

---

# 2. Translation mindset

## Context-first translation

- Always identify UI context before translating.

Possible contexts:
- Button / CTA
- Tab
- Badge
- Status chip
- Modal title
- Toast message
- Error message
- Empty state
- Tooltip
- Audit log
- Placeholder
- Menu label

- The same English word may require different Korean translations depending on context.

Examples:

| English | Context | Korean |
|---|---|---|
| Confirm | info popup | 확인 |
| Confirm | delete action | 삭제 |
| Confirm | save action | 저장 |
| Confirm | approval action | 승인 |
| Close | modal | 닫기 |
| Close | ticket | 종료 |
| Apply | filter | 적용 |
| Apply | job application | 지원 |

---

# 3. General tone

- Use polite but compact Korean.
- Prefer standard product UI tone.
- Avoid overly casual Korean.
- Avoid overly stiff/legalistic Korean unless required.

Preferred endings:
- `~합니다`
- `~되었습니다`
- `~해 주세요`

Avoid:
- `~해요`
- `~했어요`
- `~하시기 바랍니다` (too formal in normal product UI)

---

# 4. Buttons / CTA

## Core rule

- Korean UX prefers action-specific labels.
- Avoid generic CTA wording when the action is explicit.

## Good examples

| English | Korean |
|---|---|
| Save | 저장 |
| Delete | 삭제 |
| Edit | 수정 |
| Submit | 제출 |
| Approve | 승인 |
| Reject | 거부 |
| Upload | 업로드 |
| Download | 다운로드 |
| Reset | 초기화 |
| Logout | 로그아웃 |

---

## Do not blindly translate "Confirm"

- Do not always translate `Confirm` as `확인`.

Use actual business action when possible.

Examples:

| Context | Preferred Korean |
|---|---|
| Generic popup | 확인 |
| Delete confirm | 삭제 |
| Save confirm | 저장 |
| Approval confirm | 승인 |
| Reject confirm | 거부 |

Good:
- `취소 | 삭제`
- `취소 | 저장`
- `취소 | 승인`

Avoid:
- `취소 | 확인`
when the action is actually delete/save/approve/etc.

---

## Destructive actions

- Destructive actions must clearly indicate destructive intent.

Good:
- `삭제`
- `영구 삭제`
- `초기화`

Bad:
- `확인`

---

# 5. Short labels / tabs / badges / chips

## Rule

- Keep labels concise.
- Avoid heavy passive endings.

Good:
- `제출`
- `승인`
- `거부`
- `취소`
- `완료`
- `대기`
- `처리 중`

Avoid:
- `제출됨`
- `승인됨`
- `거부됨`
- `취소됨`
- `생성함`

---

## Important exception

Do NOT apply chip-style shortening to:
- full sentences
- toast messages
- audit logs
- helper text
- descriptions

Rewrite naturally instead.

Good:
- `요청이 제출되었습니다.`

Bad:
- `제출`

---

# 6. Toasts / alerts / notifications

## Rule

- Use complete natural Korean sentences.
- Clearly communicate result/state.

Examples:

| English | Korean |
|---|---|
| Saved successfully | 저장되었습니다. |
| Upload failed | 업로드에 실패했습니다. |
| Request submitted | 요청이 제출되었습니다. |
| Deleted successfully | 삭제되었습니다. |
| No data found | 데이터가 없습니다. |

---

## Instruction wording

Prefer:
- `~해 주세요`

Examples:
- `파일을 선택해 주세요.`
- `이름을 입력해 주세요.`

---

# 7. Error messages

## Rule

- Explain:
  1. what happened
  2. what the user can do next

Avoid:
- blaming wording
- technical internal jargon unless necessary

Examples:

| English | Korean |
|---|---|
| Invalid file format | 지원하지 않는 파일 형식입니다. 다른 파일을 선택해 주세요. |
| Network error | 네트워크 연결이 불안정합니다. 잠시 후 다시 시도해 주세요. |
| Required field | 필수 입력 항목입니다. |

---

# 8. Confirmation dialogs

## Rule

- Title should be short and direct.
- Body should explain consequence.
- CTA should match actual action.

Good example:

Title:
- `삭제하시겠습니까?`

Body:
- `삭제한 데이터는 복구할 수 없습니다.`

Buttons:
- `취소 | 삭제`

Bad example:

Buttons:
- `취소 | 확인`

---

# 9. Placeholder text

## Rule

- Use short hint-style wording.
- Do not use long instructional sentences.

Examples:

| English | Korean |
|---|---|
| Search by name | 이름으로 검색 |
| Enter email | 이메일 입력 |
| Select department | 부서 선택 |

---

# 10. Menu / navigation labels

## Rule

- Use nouns or short noun phrases.
- Keep terminology stable.

Examples:

| English | Korean |
|---|---|
| Dashboard | 대시보드 |
| User Management | 사용자 관리 |
| Attendance | 근태 |
| Settings | 설정 |
| Reports | 보고서 |
| OCR Result | OCR 결과 |

---

# 11. Empty states

## Rule

- Explain clearly why the screen is empty.
- Suggest next action when useful.

Examples:

- `등록된 데이터가 없습니다.`
- `아직 생성된 요청이 없습니다.`
- `새 요청을 작성해 보세요.`

---

# 12. Consistency rules

## Terminology consistency

- Use one Korean term per concept.

Avoid mixing:
- `요청`
- `신청`
- `의뢰`

for the same concept.

Avoid mixing:
- `사용자`
- `유저`
- `회원`

for the same concept.

---

## Create module glossary

Each module should maintain fixed terminology.

Example:
- OCR
- Attendance
- Approval
- Admin
- Dashboard

---

# 13. Recommended terminology

| English | Korean |
|---|---|
| User | 사용자 |
| Admin | 관리자 |
| Role | 역할 |
| Permission | 권한 |
| Department | 부서 |
| Status | 상태 |
| Request | 요청 |
| Approval | 승인 |
| Rejection | 거부 |
| Submit | 제출 |
| Save | 저장 |
| Edit | 수정 |
| Delete | 삭제 |
| Search | 검색 |
| Filter | 필터 |
| Reset | 초기화 |
| Upload | 업로드 |
| Download | 다운로드 |

---

# 14. Avoid literal translation

## Rule

- Rewrite naturally for Korean grammar and UX flow.
- Do not preserve English sentence structure.
- Follow the company glossary when it conflicts with generic Korean UI wording.

Bad:
- `새 요청`
- `새로 작성`

Better:
- `새로 생성`
- `요청서 생성`

Bad:
- direct English ordering

Better:
- Korean-native word order

---

# 15. Company glossary for INF NFFICE browser UI

## Rule

- These terms were reviewed by company interpreters and must override generic Korean UI wording.
- Apply them consistently in browser/admin/approval screens.
- Keep CTA context in mind: action buttons can stay action-specific, but status/list/export wording should follow this glossary.

| Avoid / Old | Preferred |
|---|---|
| 새로 작성 | 새로 생성 |
| 내보내기 | 엑셀 추출 |
| 요청 수정 | 기안서 수정 |
| 요청 검색 | 요청서 검색 |
| 요청 유형 | 요청서 유형 |
| 승인 | 승인 완료 |
| 고급 | 고급 필터 |
| 임시 저장 | 초안 |
| 진행 중 | 처리 중 |
| 조달 | 구매 |
| 연장근무 신청 | 야/특근 신청 |
| 워크플로우 | 결재 프로세스 |
| 주말 근무 결재 워크플로우 | 주말 근무 결재 프로세스 |
| 조정 요청 결재 워크플로우 | 근태 조정 요청 결재 프로세스 |
| 휴가 결재 워크플로우 | 휴가 결재 프로세스 |
| 결재 요청 내보내기 | 결재 요청서 리스트 추출 |
| 내보내기 (대기열) | 추출(대기) |
| 바로 내보내기 | 바로 추출 |
| 요청 상세 | 상세 요청 |
| 질병급여 휴가(본인 또는 자녀 질병) | 병가 휴가 (본인 또는 자녀) |
| 파일 첨부하려면 클릭 | 클릭해서 파일 첨부하기 |
| 등록 범위 | 신청 시간 |
| 주말 근무 날짜 추가 | 날짜 추가 |
| 주말 근무 행 추가 | 행 추가 |
| 연장근무 대상자 | 대상자 |
| 연장근무 시작 시간 | 시작 시간 |
| 연장근무 종료 시간 | 종료 시간 |
| 연장근무 날짜 추가 | 날짜 추가 |
| 조정 요청 | 근태 조정 요청 |
| 근태 소명 | 근태 설명 |
| 총금액 / 총 금액 | 총액 |
| 비용 카테고리 | 비용 항목 |

## Export wording

- Use `추출` for Excel/list export workflows instead of generic `내보내기`.
- Use `엑셀 추출` for compact buttons when the export format is Excel.
- Use `추출(대기)` for queued export and `바로 추출` for immediate export.

Preferred:
- `결재 요청서 리스트 추출`
- `추출 파일은 Excel 형식으로 제공되며 현재 적용된 필터 기준이 반영됨`
- `처리 대기열로 추출하기 또는 즉시 파일 다운로드를 위한 바로 추출하기`

## Approval wording

- Use `요청서` for approval request/document labels.
- Use `기안서 수정` for editing an approval draft/request.
- Use `승인 완료` for status/history labels.
- Keep action buttons as `승인` when the user is actively approving something.

## Overtime and weekend work wording

- Use `야/특근 신청` for overtime request type.
- In entry forms, prefer shorter labels: `대상자`, `시작 시간`, `종료 시간`, `날짜 추가`, `행 추가`.
- For helper text in weekend/overtime entry sections, prefer `상세 내용을 입력해 주세요`.

---

# 16. Korean spacing and particles

## Rule

- Use proper Korean spacing.
- Use particles naturally.

Examples:
- `이/가`
- `을/를`
- `은/는`

Compact labels may omit particles.

Full sentences should not.

---

# 17. Date / number / currency formatting

## Dates

Compact:
- `2026.05.07`

Full:
- `2026년 5월 7일`

---

## Currency

Prefer:
- `₩2,200`
- `2,200원`

Avoid:
- `KRW 2200.00`

---

# 18. Layout safety

## Rule

- Korean text length differs from English/Vietnamese.
- Do not shrink font excessively.
- Allow responsive width/wrapping.

Always test:
- modal width
- button width
- table columns
- tabs
- mobile layout

---

# 19. Namespace / i18n key rules

## Rule

- Keep keys concise.
- Group keys by page/module.
- Prefer module-specific namespaces.

Good:
- `OCR.lineEditor.save`
- `OCR.ocrDisplay.noResult`
- `Attendance.report.download`

Avoid:
- `Common.text1`
- `Button.label`
- `Common.saveText`

---

# 20. AI translation review checklist

After AI translation, verify:

- Is the translation natural Korean UI language?
- Does it match the UI component type?
- Is terminology consistent?
- Is the wording concise enough?
- Is the wording too literal?
- Is the CTA action-specific?
- Is destructive intent explicit?
- Does the text fit UI layout?
- Would a native Korean product designer accept this wording?

---

# 21. Enterprise Korean UX patterns

## Korean enterprise UX commonly prefers:

- concise status labels
- explicit action buttons
- clear hierarchy
- practical wording over marketing tone

Preferred:
- `승인`
- `거부`
- `삭제`

Avoid overly soft/generic wording:
- `확인`
- `처리`
- `실행`

when a more specific action exists.

---

# 22. Translation anti-patterns

## Avoid dictionary translation

Bad:
- translating word-by-word

Good:
- translating by user intent

---

## Avoid inconsistent tone

Bad:
- mixing formal and casual Korean

---

## Avoid English grammar structure

Bad:
- preserving English sentence order

---

## Avoid over-translation

Bad:
- making compact UI labels too long

---

## Avoid under-translation

Bad:
- shortening full messages unnaturally

---

# 22. Golden rule

- Translate for how Korean users actually use software.
- Prioritize natural Korean UX over literal linguistic accuracy.
- UI context is more important than dictionary meaning.
