# Japanese localization style guide for AI translation agents

# 1. Core principles

- Use natural Japanese product UI wording.
- Do NOT translate literally from English or Vietnamese.
- Translate based on UI context and user intent.
- Prioritize readability, clarity, and native Japanese UX tone.
- Japanese UI wording should feel compact, polite, and predictable.
- Avoid machine-translation tone.
- Keep terminology consistent within the same module.

---

# 2. Context-first translation rule

## Rule

- Always identify UI context before translating.

Possible contexts:
- Button / CTA
- Tab
- Badge
- Status chip
- Toast
- Error message
- Modal
- Placeholder
- Empty state
- Tooltip
- Menu
- Audit log

- The same English word may require different Japanese translations depending on context.

Examples:

| English | Context | Japanese |
|---|---|---|
| Confirm | info popup | 確認 |
| Confirm | delete action | 削除 |
| Confirm | save action | 保存 |
| Confirm | approval action | 承認 |
| Close | modal | 閉じる |
| Close | ticket | クローズ |
| Apply | filter | 適用 |
| Apply | job application | 応募 |

---

# 3. General tone

## Rule

- Use polite standard Japanese UI tone.
- Prefer concise and professional wording.
- Avoid overly casual Japanese unless the app intentionally targets casual users.
- Avoid overly formal/legalistic Japanese.

Preferred tone:
- `〜してください`
- `〜しました`
- `〜されました`
- `〜できません`

Avoid:
- slang
- conversational casual forms
- overly verbose keigo

---

# 4. Buttons / CTA

## Core rule

- Japanese UX strongly prefers action-specific CTA labels.
- Avoid generic wording when the action is explicit.

Examples:

| English | Japanese |
|---|---|
| Save | 保存 |
| Delete | 削除 |
| Edit | 編集 |
| Submit | 提出 |
| Approve | 承認 |
| Reject | 却下 |
| Upload | アップロード |
| Download | ダウンロード |
| Reset | リセット |
| Logout | ログアウト |

---

## Do not blindly translate "Confirm"

- Do NOT always translate `Confirm` as `確認`.

Use the actual business action whenever possible.

Examples:

| Context | Preferred Japanese |
|---|---|
| Generic info popup | 確認 |
| Delete confirm | 削除 |
| Save confirm | 保存 |
| Approval confirm | 承認 |
| Reject confirm | 却下 |

Good:
- `キャンセル | 削除`
- `キャンセル | 保存`
- `キャンセル | 承認`

Avoid:
- `キャンセル | 確認`
when the action is actually delete/save/approve/etc.

---

## Destructive actions

- Destructive actions must clearly indicate destructive intent.

Good:
- `削除`
- `完全削除`
- `初期化`

Bad:
- `確認`

---

# 5. Short labels / tabs / badges / chips

## Rule

- Keep labels short and compact.
- Avoid unnecessarily long grammatical phrases.

Good:
- `承認`
- `却下`
- `保留`
- `進行中`
- `完了`
- `下書き`

Avoid:
- overly explanatory wording in compact UI

Bad:
- `承認されました`
- `却下されました`

for tabs/badges/chips.

---

## Important exception

Do NOT shorten:
- toast messages
- helper text
- audit logs
- explanations
- descriptions

Use natural full Japanese sentences instead.

Good:
- `リクエストが送信されました。`

Bad:
- `送信済み`

as a toast message.

---

# 6. Toasts / alerts / notifications

## Rule

- Use complete natural Japanese sentences.
- Clearly communicate system result/state.

Examples:

| English | Japanese |
|---|---|
| Saved successfully | 保存しました。 |
| Upload failed | アップロードに失敗しました。 |
| Request submitted | リクエストを送信しました。 |
| Deleted successfully | 削除しました。 |
| No data found | データがありません。 |

---

## User instructions

Prefer:
- `〜してください`

Examples:
- `ファイルを選択してください。`
- `名前を入力してください。`

---

# 7. Error messages

## Rule

- Explain:
  1. what happened
  2. what the user can do next

Avoid:
- blaming tone
- technical internal wording unless required

Examples:

| English | Japanese |
|---|---|
| Invalid file format | サポートされていないファイル形式です。別のファイルを選択してください。 |
| Network error | ネットワーク接続が不安定です。しばらくしてから再度お試しください。 |
| Required field | 必須項目です。 |

---

# 8. Confirmation dialogs

## Rule

- Title should be short and direct.
- Body should explain consequence.
- CTA must match actual action.

Good example:

Title:
- `削除しますか？`

Body:
- `削除したデータは復元できません。`

Buttons:
- `キャンセル | 削除`

Bad:
- `キャンセル | 確認`

---

# 9. Placeholder text

## Rule

- Use short hint-style wording.
- Avoid long explanatory placeholders.

Examples:

| English | Japanese |
|---|---|
| Search by name | 名前で検索 |
| Enter email | メールアドレスを入力 |
| Select department | 部署を選択 |

---

# 10. Menu / navigation labels

## Rule

- Use nouns or short noun phrases.
- Keep wording stable across the app.

Examples:

| English | Japanese |
|---|---|
| Dashboard | ダッシュボード |
| User Management | ユーザー管理 |
| Attendance | 勤怠 |
| Settings | 設定 |
| Reports | レポート |
| OCR Result | OCR結果 |

---

# 11. Empty states

## Rule

- Clearly explain empty state.
- Suggest next action when helpful.

Examples:

- `登録されたデータがありません。`
- `まだリクエストが作成されていません。`
- `新しいリクエストを作成してください。`

---

# 12. Consistency rules

## Terminology consistency

- Use one Japanese term per concept.

Avoid mixing:
- `ユーザー`
- `利用者`
- `会員`

for the same concept.

Avoid mixing:
- `削除`
- `除去`
- `消去`

without semantic reason.

---

## Create module glossary

Each module should maintain fixed terminology.

Example modules:
- OCR
- Attendance
- Approval
- Admin
- Dashboard

---

# 13. Recommended terminology

| English | Japanese |
|---|---|
| User | ユーザー |
| Admin | 管理者 |
| Role | 役割 |
| Permission | 権限 |
| Department | 部署 |
| Status | ステータス |
| Request | リクエスト |
| Approval | 承認 |
| Rejection | 却下 |
| Submit | 提出 |
| Save | 保存 |
| Edit | 編集 |
| Delete | 削除 |
| Search | 検索 |
| Filter | フィルター |
| Reset | リセット |
| Upload | アップロード |
| Download | ダウンロード |

---

# 14. Avoid literal translation

## Rule

- Rewrite naturally for Japanese UX flow.
- Do not preserve English grammar structure.

Bad:
- literal English ordering

Good:
- natural Japanese sentence flow

---

# 15. Japanese compact UI preference

## Rule

Japanese enterprise/product UI often prefers:
- compact wording
- minimal particles
- noun-based labels
- concise action verbs

Examples:
- `保存`
- `削除`
- `承認`
- `設定`
- `検索`

instead of long explanatory phrases.

---

# 16. Japanese spacing rules

## Rule

- Japanese UI generally does NOT use spaces between Japanese words.
- Avoid unnecessary spaces.

Good:
- `ファイルを選択してください`

Bad:
- `ファイル を 選択してください`

---

# 17. Date / number / currency formatting

## Dates

Compact:
- `2026/05/07`

Full:
- `2026年5月7日`

---

## Currency

Prefer:
- `¥2,200`

Avoid:
- `JPY 2200.00`

unless required by business/legal formatting.

---

# 18. Layout safety

## Rule

- Japanese text can become very long.
- Avoid fixed-width buttons.
- Test:
  - tabs
  - tables
  - modal buttons
  - mobile layout

Do not aggressively reduce font size.

---

# 19. Namespace / i18n key rules

## Rule

- Keep keys concise.
- Group by module/page.
- Prefer module namespaces.

Good:
- `OCR.lineEditor.save`
- `OCR.result.empty`
- `Attendance.report.download`

Avoid:
- `Common.text1`
- `Button.label`
- `Common.saveText`

---

# 20. AI translation review checklist

After AI translation, verify:

- Does it sound like native Japanese software UI?
- Does the wording match UI component type?
- Is terminology consistent?
- Is wording too literal?
- Is CTA action-specific?
- Is destructive intent explicit?
- Does the text fit UI layout?
- Would a Japanese product designer accept this wording?

---

# 21. Japanese enterprise UX patterns

## Japanese enterprise UX commonly prefers:

- concise wording
- explicit actions
- compact labels
- predictable terminology
- low ambiguity

Preferred:
- `承認`
- `却下`
- `削除`
- `保存`

Avoid vague wording:
- `確認`
- `処理`
- `実行`

when a more explicit action exists.

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
- mixing casual and formal Japanese

---

## Avoid English grammar order

Bad:
- preserving English sentence structure

---

## Avoid over-translation

Bad:
- making compact labels too verbose

---

## Avoid under-translation

Bad:
- shortening full messages unnaturally

---

# 23. Golden rule

- Translate for how Japanese users actually use software.
- Natural Japanese UX is more important than literal translation accuracy.
- UI context matters more than dictionary meaning.