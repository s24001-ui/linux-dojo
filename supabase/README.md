# データベースの用意（Supabase）

1. Supabase ダッシュボード → **SQL Editor** で、次の順に実行する
   1. `schema.sql` … テーブル・索引・アクセス制限（RLS）を作る
   2. `seed.sql` … レッスン3つ・ステップ・問題（確認テスト／実技／エラー修復／シナリオ）を入れる
2. すでに `users` テーブルがある場合、`schema.sql` はそのテーブルを作り直さない。
   `auth_user_id`（uuid, UNIQUE）・`google_id`・`email`・`name`・`xp`・`created_at`・`updated_at` の列がそろっているか確認すること。
3. どちらも、2回実行しても壊れない（`seed.sql` の問題は、`questions` が空のときだけ入る）。

## クリア条件・設定データ（JSON）の形式

`lesson_steps.clear_condition` と、`questions.setup_data` の `checks` / `goals` で使う。書いた条件は **すべて満たす** と成功。
パスはホーム（`/home/student`）からの相対パス（`~/docs` や `/絶対パス` も可）。

| キー | 意味 | 例 |
|---|---|---|
| `cwd` | 現在地がここ | `"~/documents"` |
| `dirs` | これらのフォルダがある | `["project"]` |
| `files` | これらのファイルがある | `["project/readme.txt"]` |
| `absent` | これらが存在しない | `["old.txt"]` |
| `commands` | そのステップで入力したコマンドに、この正規表現に合うものがある | `["^ls\\s+-\\w*a"]` |
| `label` | 不合格のとき表示する「不足している点」 | `"work/src フォルダがありません"` |

初期のファイル構成（`fs`）：`{"dirs": ["work"], "files": {"memo.txt": "中身", "documents/a.txt": "親フォルダは自動で作られる"}}`

| 種類 | `setup_data` の中身 |
|---|---|
| 実技 `practical` | `{"fs": …, "checks": [ {label, …条件} ]}` |
| 修復 `repair` | `{"fs": …, "cwd"?, "error": {"cmd", "msg"}, "hints": [3つ], "checks": […]}` |
| シナリオ `scenario` | `{"summary", "commands", "fs": …, "goals": [ {label, hints, …条件} ], "checks": […]}` |
| レッスンの1ステップ目 | ファイル構成そのもの（`{"dirs": …, "files": …}`）。2ステップ目以降は NULL |
