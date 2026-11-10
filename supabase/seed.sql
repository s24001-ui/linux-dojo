-- Linuxコマンド道場 初期データ（レッスン・ステップ・問題）
-- schema.sql のあとに実行する。レッスンとステップは何度実行しても上書きされる。
-- 問題（questions）は、テーブルが空のときだけ入る（回答履歴を消さないため）。やり直すときは questions を空にしてから実行する。

insert into lessons (code, title, sort_order, category) values ($s$ls$s$, $s$ファイルを見てみよう（ls）$s$, 1, $s$基本操作$s$)
  on conflict (code) do update set title = excluded.title, sort_order = excluded.sort_order, category = excluded.category;
insert into lessons (code, title, sort_order, category) values ($s$cd$s$, $s$移動してみよう（cd・pwd）$s$, 2, $s$基本操作$s$)
  on conflict (code) do update set title = excluded.title, sort_order = excluded.sort_order, category = excluded.category;
insert into lessons (code, title, sort_order, category) values ($s$mkdir$s$, $s$作ってみよう（mkdir・touch）$s$, 3, $s$ファイル操作$s$)
  on conflict (code) do update set title = excluded.title, sort_order = excluded.sort_order, category = excluded.category;

insert into lesson_steps (lesson_id, step_number, body, hint, clear_condition, setup_data)
  values ((select id from lessons where code=$s$ls$s$), 1, $s$ls を実行して、いまのフォルダの中身を見てみましょう。$s$, $s$ls とだけ入力して Enter を押します。$s$, $j${"commands": ["^ls$"]}$j$::jsonb, $j${"dirs": ["work"], "files": {"memo.txt": "あとで読む", ".secret": "ひみつ", "documents/report.txt": "レポート"}}$j$::jsonb)
  on conflict (lesson_id, step_number) do update set body = excluded.body, hint = excluded.hint, clear_condition = excluded.clear_condition, setup_data = excluded.setup_data;
insert into lesson_steps (lesson_id, step_number, body, hint, clear_condition, setup_data)
  values ((select id from lessons where code=$s$ls$s$), 2, $s$ls -a で、隠しファイルも表示してみましょう。$s$, $s$「-a」は all（すべて）の意味です。ls -a と入力します。$s$, $j${"commands": ["^ls\\s+-\\w*a"]}$j$::jsonb, null)
  on conflict (lesson_id, step_number) do update set body = excluded.body, hint = excluded.hint, clear_condition = excluded.clear_condition, setup_data = excluded.setup_data;
insert into lesson_steps (lesson_id, step_number, body, hint, clear_condition, setup_data)
  values ((select id from lessons where code=$s$ls$s$), 3, $s$ls -l で、詳しい情報つきの一覧を見てみましょう。$s$, $s$ls -l と入力します。$s$, $j${"commands": ["^ls\\s+-\\w*l"]}$j$::jsonb, null)
  on conflict (lesson_id, step_number) do update set body = excluded.body, hint = excluded.hint, clear_condition = excluded.clear_condition, setup_data = excluded.setup_data;
insert into lesson_steps (lesson_id, step_number, body, hint, clear_condition, setup_data)
  values ((select id from lessons where code=$s$ls$s$), 4, $s$ls documents で、documents フォルダの中身を見てみましょう。$s$, $s$ls のあとに半角スペースとフォルダ名を入力します。$s$, $j${"commands": ["^ls\\s+documents/?$"]}$j$::jsonb, null)
  on conflict (lesson_id, step_number) do update set body = excluded.body, hint = excluded.hint, clear_condition = excluded.clear_condition, setup_data = excluded.setup_data;
insert into lesson_steps (lesson_id, step_number, body, hint, clear_condition, setup_data)
  values ((select id from lessons where code=$s$cd$s$), 1, $s$pwd で、いまいる場所を確認しましょう。$s$, $s$pwd は print working directory の略です。$s$, $j${"commands": ["^pwd$"]}$j$::jsonb, $j${"dirs": ["work"], "files": {"memo.txt": "あとで読む", ".secret": "ひみつ", "documents/report.txt": "レポート"}}$j$::jsonb)
  on conflict (lesson_id, step_number) do update set body = excluded.body, hint = excluded.hint, clear_condition = excluded.clear_condition, setup_data = excluded.setup_data;
insert into lesson_steps (lesson_id, step_number, body, hint, clear_condition, setup_data)
  values ((select id from lessons where code=$s$cd$s$), 2, $s$cd documents で、documents フォルダへ移動しましょう。$s$, $s$cd のあとにフォルダ名を入力します。$s$, $j${"cwd": "~/documents"}$j$::jsonb, null)
  on conflict (lesson_id, step_number) do update set body = excluded.body, hint = excluded.hint, clear_condition = excluded.clear_condition, setup_data = excluded.setup_data;
insert into lesson_steps (lesson_id, step_number, body, hint, clear_condition, setup_data)
  values ((select id from lessons where code=$s$cd$s$), 3, $s$cd .. で、ひとつ上のフォルダに戻りましょう。$s$, $s$「..」は、ひとつ上のフォルダを表します。$s$, $j${"cwd": "~", "commands": ["^cd\\s+\\.\\."]}$j$::jsonb, null)
  on conflict (lesson_id, step_number) do update set body = excluded.body, hint = excluded.hint, clear_condition = excluded.clear_condition, setup_data = excluded.setup_data;
insert into lesson_steps (lesson_id, step_number, body, hint, clear_condition, setup_data)
  values ((select id from lessons where code=$s$mkdir$s$), 1, $s$mkdir project で、project フォルダを作りましょう。$s$, $s$mkdir のあとに、作りたいフォルダ名を入力します。$s$, $j${"dirs": ["project"]}$j$::jsonb, $j${"dirs": ["work"], "files": {"memo.txt": "あとで読む", ".secret": "ひみつ", "documents/report.txt": "レポート"}}$j$::jsonb)
  on conflict (lesson_id, step_number) do update set body = excluded.body, hint = excluded.hint, clear_condition = excluded.clear_condition, setup_data = excluded.setup_data;
insert into lesson_steps (lesson_id, step_number, body, hint, clear_condition, setup_data)
  values ((select id from lessons where code=$s$mkdir$s$), 2, $s$touch project/readme.txt で、空のファイルを作りましょう。$s$, $s$touch のあとに、作りたいファイルのパスを入力します。$s$, $j${"files": ["project/readme.txt"]}$j$::jsonb, null)
  on conflict (lesson_id, step_number) do update set body = excluded.body, hint = excluded.hint, clear_condition = excluded.clear_condition, setup_data = excluded.setup_data;
insert into lesson_steps (lesson_id, step_number, body, hint, clear_condition, setup_data)
  values ((select id from lessons where code=$s$mkdir$s$), 3, $s$ls project で、作ったファイルを確かめましょう。$s$, $s$ls project と入力します。$s$, $j${"commands": ["^ls\\s+project/?$"]}$j$::jsonb, null)
  on conflict (lesson_id, step_number) do update set body = excluded.body, hint = excluded.hint, clear_condition = excluded.clear_condition, setup_data = excluded.setup_data;

do $seed$
begin
  if exists (select 1 from questions) then return; end if;

  -- 確認テスト
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$ls$s$), 'quiz', $s$ls$s$, $s$いまいるフォルダの中身を一覧表示するコマンドはどれ？$s$, $j$["ls", "cd", "pwd", "cat"]$j$::jsonb, 0, $s$ls は list の略で、フォルダの中身を表示します。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$ls$s$), 'quiz', $s$ls$s$, $s$隠しファイルも表示したいとき、正しいのはどれ？$s$, $j$["ls -l", "ls -a", "ls -h", "ls -r"]$j$::jsonb, 1, $s$-a（all）をつけると、「.」で始まる隠しファイルも表示されます。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$cd$s$), 'quiz', $s$pwd$s$, $s$いまいる場所（カレントディレクトリ）を表示するコマンドは？$s$, $j$["where", "ls", "pwd", "cd"]$j$::jsonb, 2, $s$pwd は print working directory の略です。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$cd$s$), 'quiz', $s$cd$s$, $s$「..」が表すものはどれ？$s$, $j$["ホームフォルダ", "ひとつ上のフォルダ", "いまのフォルダ", "ルート"]$j$::jsonb, 1, $s$「..」は親（ひとつ上）のフォルダ、「.」はいまのフォルダです。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$cd$s$), 'quiz', $s$cd$s$, $s$ホームフォルダへ一発で戻るコマンドは？$s$, $j$["cd ..", "cd /", "cd ~", "cd -h"]$j$::jsonb, 2, $s$「~」はホームフォルダを表します。cd だけでも戻れます。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$mkdir$s$), 'quiz', $s$mkdir$s$, $s$work という新しいフォルダを作るコマンドは？$s$, $j$["touch work", "mkdir work", "cd work", "new work"]$j$::jsonb, 1, $s$mkdir は make directory の略です。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$mkdir$s$), 'quiz', $s$touch$s$, $s$空のファイル memo.txt を作るコマンドは？$s$, $j$["mkdir memo.txt", "ls memo.txt", "touch memo.txt", "cat memo.txt"]$j$::jsonb, 2, $s$touch は、存在しないファイルを空で作成します。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$mkdir$s$), 'quiz', $s$cat$s$, $s$ファイルの中身を表示するコマンドは？$s$, $j$["cat", "rm", "mv", "cp"]$j$::jsonb, 0, $s$cat は、ファイルの内容をそのまま表示します。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$mkdir$s$), 'quiz', $s$mv$s$, $s$ファイル a.txt を b.txt という名前に変えるコマンドは？$s$, $j$["cp a.txt b.txt", "mv a.txt b.txt", "rm a.txt b.txt", "cd a.txt b.txt"]$j$::jsonb, 1, $s$mv は移動のほか、名前の変更にも使います。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$mkdir$s$), 'quiz', $s$rm$s$, $s$フォルダ dir を中身ごと削除するときの正しい書き方は？$s$, $j$["rm dir", "rmdir -r dir", "rm -r dir", "del dir"]$j$::jsonb, 2, $s$フォルダを消すには rm に -r（再帰）をつけます。$s$);

  -- 実技テスト
  insert into questions (lesson_id, question_type, command_tag, title, body, setup_data)
    values ((select id from lessons where code=$s$ls$s$), 'practical', $s$cp$s$, $s$実技テスト：ls$s$, $s$documents フォルダの中に、memo.txt をコピーしてください（元の memo.txt は残すこと）。$s$, $j${"fs": {"dirs": ["work"], "files": {"memo.txt": "あとで読む", ".secret": "ひみつ", "documents/report.txt": "レポート"}}, "checks": [{"label": "documents に memo.txt がありません", "files": ["documents/memo.txt"]}, {"label": "元の memo.txt が消えています", "files": ["memo.txt"]}]}$j$::jsonb);
  insert into questions (lesson_id, question_type, command_tag, title, body, setup_data)
    values ((select id from lessons where code=$s$cd$s$), 'practical', $s$mkdir$s$, $s$実技テスト：cd$s$, $s$work フォルダの中に src フォルダを作り、その中に main.txt を作ってください。$s$, $j${"fs": {"dirs": ["work"], "files": {"memo.txt": "あとで読む", ".secret": "ひみつ", "documents/report.txt": "レポート"}}, "checks": [{"label": "work/src フォルダがありません", "dirs": ["work/src"]}, {"label": "work/src/main.txt がありません", "files": ["work/src/main.txt"]}]}$j$::jsonb);
  insert into questions (lesson_id, question_type, command_tag, title, body, setup_data)
    values ((select id from lessons where code=$s$mkdir$s$), 'practical', $s$mv$s$, $s$実技テスト：mkdir$s$, $s$project フォルダを作り、memo.txt をその中へ移動してください。$s$, $j${"fs": {"dirs": ["work"], "files": {"memo.txt": "あとで読む", ".secret": "ひみつ", "documents/report.txt": "レポート"}}, "checks": [{"label": "project フォルダがありません", "dirs": ["project"]}, {"label": "project に memo.txt がありません", "files": ["project/memo.txt"]}, {"label": "元の memo.txt が残っています（コピーではなく移動です）", "absent": ["memo.txt"]}]}$j$::jsonb);

  -- エラー修復ミッション
  insert into questions (question_type, command_tag, title, body, setup_data)
    values ('repair', $s$mv$s$, $s$ファイルが見つからない$s$, $s$notes.txt を読もうとしたら、エラーが出ました。$s$, $j${"fs": {"files": {"notes.text": "きょうの学び"}}, "error": {"cmd": "cat notes.txt", "msg": "cat: notes.txt: No such file or directory"}, "hints": ["エラーは「notes.txt というファイルがない」という意味です。", "ls で確認すると、名前が少し違うファイルがあります。", "mv notes.text notes.txt で名前を直してみましょう。"], "checks": [{"files": ["notes.txt"]}]}$j$::jsonb);
  insert into questions (question_type, command_tag, title, body, setup_data)
    values ('repair', $s$mkdir$s$, $s$フォルダが作れない$s$, $s$work/src フォルダを作ろうとしたら、エラーが出ました。$s$, $j${"fs": {}, "error": {"cmd": "mkdir work/src", "msg": "mkdir: cannot create directory ‘work/src’: No such file or directory"}, "hints": ["エラーは「work/src を作れない」という意味です。", "原因は、親の work フォルダがまだないことです。", "mkdir work を先に実行するか、mkdir -p work/src を使います。"], "checks": [{"dirs": ["work/src"]}]}$j$::jsonb);
  insert into questions (question_type, command_tag, title, body, setup_data)
    values ('repair', $s$cd$s$, $s$場所を間違えている$s$, $s$project フォルダに入りたいのに、エラーが出ました。$s$, $j${"fs": {"dirs": ["project"], "files": {"documents/a.txt": "a"}}, "cwd": "~/documents", "error": {"cmd": "cd project", "msg": "bash: cd: project: No such file or directory"}, "hints": ["エラーは「ここに project はない」という意味です。", "pwd で、いまいる場所を確認しましょう。", "project は ひとつ上のフォルダにあります。cd ../project を試しましょう。"], "checks": [{"cwd": "~/project"}]}$j$::jsonb);

  -- シナリオ
  insert into questions (question_type, command_tag, title, body, setup_data)
    values ('scenario', $s$cp$s$, $s$バックアップを作ろう$s$, $s$大事な資料を守るため、backup フォルダにコピーを取ります。作業が終わったら、いらない old.txt も削除しましょう。$s$, $j${"summary": "大事なファイルをコピーして、古いファイルを片づける", "commands": "mkdir / cp / rm", "fs": {"files": {"report.txt": "大事な資料", "old.txt": "古いメモ"}}, "goals": [{"label": "backup フォルダを作る", "hints": ["フォルダを作るコマンドは？", "mkdir backup"], "dirs": ["backup"]}, {"label": "report.txt を backup にコピーする", "hints": ["コピーは cp を使います。", "cp report.txt backup"], "files": ["backup/report.txt"]}, {"label": "old.txt を削除する", "hints": ["削除は rm を使います。", "rm old.txt"], "absent": ["old.txt"]}], "checks": [{"files": ["report.txt", "backup/report.txt"], "absent": ["old.txt"]}]}$j$::jsonb);
  insert into questions (question_type, command_tag, title, body, setup_data)
    values ('scenario', $s$mv$s$, $s$写真を整理しよう$s$, $s$ホームに写真が散らかっています。photos フォルダを作って、すべての写真を移動しましょう。$s$, $j${"summary": "ばらばらの写真を、フォルダにまとめる", "commands": "mkdir / mv / ls", "fs": {"files": {"a.jpg": "", "b.jpg": "", "c.jpg": ""}}, "goals": [{"label": "photos フォルダを作る", "hints": ["mkdir を使います。", "mkdir photos"], "dirs": ["photos"]}, {"label": "a.jpg を photos に移動する", "hints": ["移動は mv を使います。", "mv a.jpg photos"], "files": ["photos/a.jpg"], "absent": ["a.jpg"]}, {"label": "b.jpg と c.jpg も photos に移動する", "hints": ["ひとつずつ mv を実行します。", "mv b.jpg photos / mv c.jpg photos"], "files": ["photos/b.jpg", "photos/c.jpg"]}], "checks": [{"files": ["photos/a.jpg", "photos/b.jpg", "photos/c.jpg"], "absent": ["a.jpg", "b.jpg", "c.jpg"]}]}$j$::jsonb);
end
$seed$;
