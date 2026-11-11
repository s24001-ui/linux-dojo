-- Linuxコマンド道場 初期データ（レッスン・ステップ・問題）
-- schema.sql のあとに実行する。レッスンとステップは何度実行しても上書きされる。
-- 問題（questions）は、テーブルが空のときだけ入る（回答履歴を消さないため）。やり直すときは questions を空にしてから実行する。

insert into lessons (code, title, sort_order, category) values ($s$ls$s$, $s$ファイルを見てみよう（ls）$s$, 1, $s$基本操作$s$)
  on conflict (code) do update set title = excluded.title, sort_order = excluded.sort_order, category = excluded.category;
insert into lessons (code, title, sort_order, category) values ($s$cd$s$, $s$移動してみよう（cd・pwd）$s$, 2, $s$基本操作$s$)
  on conflict (code) do update set title = excluded.title, sort_order = excluded.sort_order, category = excluded.category;
insert into lessons (code, title, sort_order, category) values ($s$mkdir$s$, $s$作ってみよう（mkdir・touch）$s$, 3, $s$ファイル操作$s$)
  on conflict (code) do update set title = excluded.title, sort_order = excluded.sort_order, category = excluded.category;
insert into lessons (code, title, sort_order, category) values ($s$cat$s$, $s$中身を読んでみよう（cat）$s$, 4, $s$ファイル操作$s$)
  on conflict (code) do update set title = excluded.title, sort_order = excluded.sort_order, category = excluded.category;
insert into lessons (code, title, sort_order, category) values ($s$echo$s$, $s$文字を書いてみよう（echo）$s$, 5, $s$ファイル操作$s$)
  on conflict (code) do update set title = excluded.title, sort_order = excluded.sort_order, category = excluded.category;
insert into lessons (code, title, sort_order, category) values ($s$cp$s$, $s$コピーしてみよう（cp）$s$, 6, $s$ファイル操作$s$)
  on conflict (code) do update set title = excluded.title, sort_order = excluded.sort_order, category = excluded.category;
insert into lessons (code, title, sort_order, category) values ($s$mv$s$, $s$移動・名前変更をしてみよう（mv）$s$, 7, $s$ファイル操作$s$)
  on conflict (code) do update set title = excluded.title, sort_order = excluded.sort_order, category = excluded.category;
insert into lessons (code, title, sort_order, category) values ($s$rm$s$, $s$削除してみよう（rm）$s$, 8, $s$ファイル操作$s$)
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
-- ========== cat ==========
insert into lesson_steps (lesson_id, step_number, body, hint, clear_condition, setup_data)
  values ((select id from lessons where code=$s$cat$s$), 1, $s$cat memo.txt で、memo.txt の中身を表示してみましょう。$s$, $s$cat のあとに、読みたいファイル名を入力します。$s$, $j${"commands": ["^cat\\s+memo\\.txt$"]}$j$::jsonb, $j${"dirs": ["work"], "files": {"memo.txt": "あとで読む", ".secret": "ひみつ", "documents/report.txt": "レポート"}}$j$::jsonb)
  on conflict (lesson_id, step_number) do update set body = excluded.body, hint = excluded.hint, clear_condition = excluded.clear_condition, setup_data = excluded.setup_data;
insert into lesson_steps (lesson_id, step_number, body, hint, clear_condition, setup_data)
  values ((select id from lessons where code=$s$cat$s$), 2, $s$cat documents/report.txt で、documents フォルダの中のファイルを表示しましょう。$s$, $s$フォルダの中のファイルは「フォルダ名/ファイル名」と書きます。$s$, $j${"commands": ["^cat\\s+documents/report\\.txt$"]}$j$::jsonb, null)
  on conflict (lesson_id, step_number) do update set body = excluded.body, hint = excluded.hint, clear_condition = excluded.clear_condition, setup_data = excluded.setup_data;
insert into lesson_steps (lesson_id, step_number, body, hint, clear_condition, setup_data)
  values ((select id from lessons where code=$s$cat$s$), 3, $s$cat memo.txt documents/report.txt で、2つのファイルを続けて表示しましょう。$s$, $s$cat のあとに、ファイル名を半角スペースで区切って2つ並べます。$s$, $j${"commands": ["^cat\\s+memo\\.txt\\s+documents/report\\.txt$"]}$j$::jsonb, null)
  on conflict (lesson_id, step_number) do update set body = excluded.body, hint = excluded.hint, clear_condition = excluded.clear_condition, setup_data = excluded.setup_data;
 
-- ========== echo ==========
insert into lesson_steps (lesson_id, step_number, body, hint, clear_condition, setup_data)
  values ((select id from lessons where code=$s$echo$s$), 1, $s$echo hello で、画面に hello と表示してみましょう。$s$, $s$echo のあとに、表示したい文字を入力します。$s$, $j${"commands": ["^echo\\s+\\S+"]}$j$::jsonb, $j${"dirs": ["work"], "files": {"memo.txt": "あとで読む", ".secret": "ひみつ", "documents/report.txt": "レポート"}}$j$::jsonb)
  on conflict (lesson_id, step_number) do update set body = excluded.body, hint = excluded.hint, clear_condition = excluded.clear_condition, setup_data = excluded.setup_data;
insert into lesson_steps (lesson_id, step_number, body, hint, clear_condition, setup_data)
  values ((select id from lessons where code=$s$echo$s$), 2, $s$echo hello > hello.txt で、文字をファイルに書き込みましょう。$s$, $s$「>」は、画面に出す代わりにファイルへ書き込む記号です。ファイルがなければ新しく作られます。$s$, $j${"commands": ["^echo\\s+.+\\s*>\\s*hello\\.txt$"], "files": ["hello.txt"]}$j$::jsonb, null)
  on conflict (lesson_id, step_number) do update set body = excluded.body, hint = excluded.hint, clear_condition = excluded.clear_condition, setup_data = excluded.setup_data;
insert into lesson_steps (lesson_id, step_number, body, hint, clear_condition, setup_data)
  values ((select id from lessons where code=$s$echo$s$), 3, $s$echo world >> hello.txt で、hello.txt の最後に文字を書き足しましょう。$s$, $s$「>>」は追記です。「>」だと中身が上書きされるので注意しましょう。$s$, $j${"commands": ["^echo\\s+.+\\s*>>\\s*hello\\.txt$"]}$j$::jsonb, null)
  on conflict (lesson_id, step_number) do update set body = excluded.body, hint = excluded.hint, clear_condition = excluded.clear_condition, setup_data = excluded.setup_data;
insert into lesson_steps (lesson_id, step_number, body, hint, clear_condition, setup_data)
  values ((select id from lessons where code=$s$echo$s$), 4, $s$cat hello.txt で、書き込んだ内容を確かめましょう。$s$, $s$cat のあとにファイル名を入力します。2行表示されれば成功です。$s$, $j${"commands": ["^cat\\s+hello\\.txt$"]}$j$::jsonb, null)
  on conflict (lesson_id, step_number) do update set body = excluded.body, hint = excluded.hint, clear_condition = excluded.clear_condition, setup_data = excluded.setup_data;
 
-- ========== cp ==========
insert into lesson_steps (lesson_id, step_number, body, hint, clear_condition, setup_data)
  values ((select id from lessons where code=$s$cp$s$), 1, $s$cp memo.txt memo2.txt で、memo.txt のコピー memo2.txt を作りましょう。$s$, $s$cp のあとに「コピー元」「コピー先」の順で入力します。$s$, $j${"files": ["memo.txt", "memo2.txt"]}$j$::jsonb, $j${"dirs": ["work"], "files": {"memo.txt": "あとで読む", ".secret": "ひみつ", "documents/report.txt": "レポート"}}$j$::jsonb)
  on conflict (lesson_id, step_number) do update set body = excluded.body, hint = excluded.hint, clear_condition = excluded.clear_condition, setup_data = excluded.setup_data;
insert into lesson_steps (lesson_id, step_number, body, hint, clear_condition, setup_data)
  values ((select id from lessons where code=$s$cp$s$), 2, $s$cp memo.txt documents で、memo.txt を documents フォルダの中にコピーしましょう。$s$, $s$コピー先にフォルダ名を書くと、そのフォルダの中にコピーされます。$s$, $j${"files": ["memo.txt", "documents/memo.txt"]}$j$::jsonb, null)
  on conflict (lesson_id, step_number) do update set body = excluded.body, hint = excluded.hint, clear_condition = excluded.clear_condition, setup_data = excluded.setup_data;
insert into lesson_steps (lesson_id, step_number, body, hint, clear_condition, setup_data)
  values ((select id from lessons where code=$s$cp$s$), 3, $s$cp -r documents backup で、documents フォルダを中身ごとコピーしましょう。$s$, $s$フォルダをコピーするには、-r（recursive：中身ごと）をつけます。$s$, $j${"commands": ["^cp\\s+-\\w*r\\w*\\s+documents\\s+backup/?$"], "dirs": ["backup"], "files": ["backup/report.txt", "documents/report.txt"]}$j$::jsonb, null)
  on conflict (lesson_id, step_number) do update set body = excluded.body, hint = excluded.hint, clear_condition = excluded.clear_condition, setup_data = excluded.setup_data;
 
-- ========== mv ==========
insert into lesson_steps (lesson_id, step_number, body, hint, clear_condition, setup_data)
  values ((select id from lessons where code=$s$mv$s$), 1, $s$mv memo.txt note.txt で、memo.txt を note.txt に名前変更しましょう。$s$, $s$mv は同じ場所で名前だけ変えることもできます。「元の名前」「新しい名前」の順です。$s$, $j${"files": ["note.txt"], "absent": ["memo.txt"]}$j$::jsonb, $j${"dirs": ["work"], "files": {"memo.txt": "あとで読む", ".secret": "ひみつ", "documents/report.txt": "レポート"}}$j$::jsonb)
  on conflict (lesson_id, step_number) do update set body = excluded.body, hint = excluded.hint, clear_condition = excluded.clear_condition, setup_data = excluded.setup_data;
insert into lesson_steps (lesson_id, step_number, body, hint, clear_condition, setup_data)
  values ((select id from lessons where code=$s$mv$s$), 2, $s$mv note.txt documents で、note.txt を documents フォルダへ移動しましょう。$s$, $s$移動先にフォルダ名を書くと、そのフォルダの中へ移動します。cp と違い、元の場所からはなくなります。$s$, $j${"files": ["documents/note.txt"], "absent": ["note.txt"]}$j$::jsonb, null)
  on conflict (lesson_id, step_number) do update set body = excluded.body, hint = excluded.hint, clear_condition = excluded.clear_condition, setup_data = excluded.setup_data;
insert into lesson_steps (lesson_id, step_number, body, hint, clear_condition, setup_data)
  values ((select id from lessons where code=$s$mv$s$), 3, $s$ls documents で、移動したファイルを確かめましょう。$s$, $s$ls documents と入力します。$s$, $j${"commands": ["^ls\\s+documents/?$"]}$j$::jsonb, null)
  on conflict (lesson_id, step_number) do update set body = excluded.body, hint = excluded.hint, clear_condition = excluded.clear_condition, setup_data = excluded.setup_data;
 
-- ========== rm ==========
insert into lesson_steps (lesson_id, step_number, body, hint, clear_condition, setup_data)
  values ((select id from lessons where code=$s$rm$s$), 1, $s$rm memo.txt で、memo.txt を削除しましょう。$s$, $s$rm のあとに、消したいファイル名を入力します。消したファイルは元に戻せないので注意しましょう。$s$, $j${"absent": ["memo.txt"]}$j$::jsonb, $j${"dirs": ["work"], "files": {"memo.txt": "いらないメモ", "documents/report.txt": "レポート", "temp/a.txt": "一時ファイル"}}$j$::jsonb)
  on conflict (lesson_id, step_number) do update set body = excluded.body, hint = excluded.hint, clear_condition = excluded.clear_condition, setup_data = excluded.setup_data;
insert into lesson_steps (lesson_id, step_number, body, hint, clear_condition, setup_data)
  values ((select id from lessons where code=$s$rm$s$), 2, $s$rm -r temp で、temp フォルダを中身ごと削除しましょう。$s$, $s$フォルダを消すには -r（recursive：中身ごと）をつけます。$s$, $j${"commands": ["^rm\\s+-\\w*r\\w*\\s+temp/?$"], "absent": ["temp", "temp/a.txt"]}$j$::jsonb, null)
  on conflict (lesson_id, step_number) do update set body = excluded.body, hint = excluded.hint, clear_condition = excluded.clear_condition, setup_data = excluded.setup_data;

do $seed$
begin
  if exists (select 1 from questions) then return; end if;

  -- Linuxコマンド道場 確認テスト（ls / cd・pwd / mkdir・touch 各5問＝15問）
-- INSERT文だけのファイル。使い方は2通り（delete は含まれていない）。
--  ・seed.sql：do $seed$ ブロックの「-- 確認テスト」にある、ls・cd・mkdir の古い10問と置き換える
--  ・すでに実行済みのDB：古い確認テストを delete してから、このINSERTを実行する（一度だけ）
 
  -- ========== ls ==========
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$ls$s$), 'quiz', $s$ls$s$, $s$いまいるフォルダの中身を一覧で表示するコマンドはどれ？$s$, $j$["dir", "list", "ls", "show"]$j$::jsonb, 2, $s$ls は list の略で、フォルダの中身を表示します。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$ls$s$), 'quiz', $s$ls$s$, $s$隠しファイルも表示したいとき、正しいのはどれ？$s$, $j$["ls -l", "ls -a", "ls -h", "ls -r"]$j$::jsonb, 1, $s$-a（all）をつけると、「.」で始まる隠しファイルも表示されます。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$ls$s$), 'quiz', $s$ls$s$, $s$ls -l で表示されるものとして、正しいのはどれ？$s$, $j$["ファイルの名前だけ", "隠しファイルだけ", "種類やサイズなどの詳しい情報つきの一覧", "フォルダの削除結果"]$j$::jsonb, 2, $s$-l（long）をつけると、種類（ファイルかフォルダか）やサイズなどが1行ずつ表示されます。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$ls$s$), 'quiz', $s$ls$s$, $s$documents フォルダへ移動せずに、その中身だけを見るコマンドはどれ？$s$, $j$["cd documents", "cat documents", "pwd documents", "ls documents"]$j$::jsonb, 3, $s$ls のあとにフォルダ名を書くと、移動せずにそのフォルダの中身を表示できます。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$ls$s$), 'quiz', $s$ls$s$, $s$名前が「.」で始まるファイル（例：.secret）は、ls だけで実行するとどうなる？$s$, $j$["表示されない（隠しファイルとして扱われる）", "そのまま表示される", "エラーになる", "削除される"]$j$::jsonb, 0, $s$「.」で始まるファイルは隠しファイルです。ls -a をつけると表示されます。$s$);
 
  -- ========== cd・pwd ==========
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$cd$s$), 'quiz', $s$pwd$s$, $s$いまいる場所（カレントディレクトリ）を表示するコマンドはどれ？$s$, $j$["whereami", "pwd", "cd", "ls"]$j$::jsonb, 1, $s$pwd は print working directory の略です。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$cd$s$), 'quiz', $s$cd$s$, $s$「..」が表すものはどれ？$s$, $j$["ひとつ上のフォルダ", "ホームフォルダ", "いまのフォルダ", "いちばん上のフォルダ（ルート）"]$j$::jsonb, 0, $s$「..」は親（ひとつ上）のフォルダ、「.」はいまのフォルダです。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$cd$s$), 'quiz', $s$cd$s$, $s$どこにいても、ホームフォルダへ一発で戻るコマンドはどれ？$s$, $j$["cd ..", "cd /", "cd -h", "cd ~"]$j$::jsonb, 3, $s$「~」はホームフォルダを表します。cd だけでも戻れます。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$cd$s$), 'quiz', $s$cd$s$, $s$documents フォルダの中にいるとき、ひとつ上のフォルダへ戻るコマンドはどれ？$s$, $j$["cd up", "cd documents", "cd ..", "cd /"]$j$::jsonb, 2, $s$cd .. で、ひとつ上のフォルダへ戻れます。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$cd$s$), 'quiz', $s$pwd$s$, $s$ホームフォルダ（/home/student）にいるときに cd documents を実行し、そのあと pwd を実行すると、何が表示される？$s$, $j$["/home/student", "/home/student/documents", "/documents", "documents"]$j$::jsonb, 1, $s$pwd は、いまいる場所を「/」から始まるフルパスで表示します。$s$);
 
  -- ========== mkdir・touch ==========
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$mkdir$s$), 'quiz', $s$mkdir$s$, $s$project という新しいフォルダを作るコマンドはどれ？$s$, $j$["touch project", "cd project", "mkdir project", "new project"]$j$::jsonb, 2, $s$mkdir は make directory の略です。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$mkdir$s$), 'quiz', $s$touch$s$, $s$空のファイル memo.txt を作るコマンドはどれ？$s$, $j$["mkdir memo.txt", "touch memo.txt", "ls memo.txt", "cat memo.txt"]$j$::jsonb, 1, $s$touch は、存在しないファイルを空で作成します。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$mkdir$s$), 'quiz', $s$mkdir$s$, $s$work フォルダがまだないとき、work/src を親のフォルダごとまとめて作るコマンドはどれ？$s$, $j$["mkdir work/src", "mkdir -p work/src", "touch work/src", "mkdir -r work/src"]$j$::jsonb, 1, $s$-p をつけると、途中の親フォルダもまとめて作ります。つけないと「No such file or directory」になります。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$mkdir$s$), 'quiz', $s$touch$s$, $s$すでに中身のある memo.txt があるとき、touch memo.txt を実行すると、どうなる？$s$, $j$["中身が空になる", "エラーになる", "中身は変わらない", "別の名前のファイルが作られる"]$j$::jsonb, 2, $s$touch は、すでにあるファイルの中身は消しません。ないときだけ空のファイルを作ります。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$mkdir$s$), 'quiz', $s$mkdir$s$, $s$すでにある project フォルダと同じ名前で mkdir project を実行すると、どうなる？$s$, $j$["File exists というエラーが出る", "中身が消える", "上書きされる", "project2 という名前で作られる"]$j$::jsonb, 0, $s$同じ名前がすでにあると「File exists」というエラーになります。ls で確認しましょう。$s$);
 
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

do $seed2$
begin
  if exists (
    select 1 from questions
    where question_type = 'quiz'
      and lesson_id in (select id from lessons where code in ($s$cat$s$, $s$echo$s$, $s$cp$s$, $s$mv$s$, $s$rm$s$))
  ) then return; end if;
 
  -- ========== cat ==========
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$cat$s$), 'quiz', $s$cat$s$, $s$documents フォルダの中の report.txt を表示する正しい書き方はどれ？$s$, $j$["cat report.txt documents", "cat documents/report.txt", "cat documents report.txt", "ls documents/report.txt"]$j$::jsonb, 1, $s$フォルダの中のファイルは「フォルダ名/ファイル名」と書きます。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$cat$s$), 'quiz', $s$cat$s$, $s$a.txt と b.txt を続けて表示するコマンドはどれ？$s$, $j$["cat a.txt b.txt", "cat a.txt + b.txt", "cat a.txt, b.txt", "cat -2 a.txt b.txt"]$j$::jsonb, 0, $s$cat のあとに、ファイル名を半角スペースで区切って並べると、順番に表示されます。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$cat$s$), 'quiz', $s$cat$s$, $s$存在しない hoge.txt を cat で表示しようとすると、どうなる？$s$, $j$["空のファイルが表示される", "hoge.txt が自動で作られる", "何も起きずに終わる", "No such file or directory というエラーが出る"]$j$::jsonb, 3, $s$ファイルがないと「No such file or directory」というエラーになります。ls で名前を確認しましょう。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$cat$s$), 'quiz', $s$cat$s$, $s$フォルダ documents を cat で表示しようとすると、どうなる？$s$, $j$["フォルダの中のファイル一覧が表示される", "Is a directory というエラーが出る", "フォルダの中身がすべて連結されて表示される", "フォルダが削除される"]$j$::jsonb, 1, $s$cat はファイルの中身を表示するコマンドです。フォルダには使えません。フォルダの中身は ls で見ます。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$cat$s$), 'quiz', $s$cat$s$, $s$cat は、何という英単語に由来する名前？$s$, $j$["catalog（目録）", "concatenate（連結する）", "category（分類）", "capture（捕まえる）"]$j$::jsonb, 1, $s$cat は concatenate（連結する）の略です。複数のファイルをつなげて表示できることから名づけられました。$s$);
 
  -- ========== echo ==========
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$echo$s$), 'quiz', $s$echo$s$, $s$画面に hello と表示するコマンドはどれ？$s$, $j$["print hello", "echo hello", "say hello", "show hello"]$j$::jsonb, 1, $s$echo は、あとに書いた文字をそのまま画面に表示します。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$echo$s$), 'quiz', $s$echo$s$, $s$echo hi > a.txt を実行すると、何が起きる？$s$, $j$["画面に hi と表示される", "a.txt に hi が書き込まれる", "a.txt が削除される", "a.txt の中身が表示される"]$j$::jsonb, 1, $s$「>」をつけると、画面に出す代わりに、ファイルへ書き込まれます。ファイルがなければ新しく作られます。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$echo$s$), 'quiz', $s$echo$s$, $s$すでに中身があるファイルに echo ... > file.txt で書き込むと、どうなる？$s$, $j$["末尾に書き足される", "エラーになる", "元の中身が上書きされる", "別の名前のファイルが作られる"]$j$::jsonb, 2, $s$「>」は上書きです。元の中身は消えるので注意しましょう。書き足したいときは「>>」を使います。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$echo$s$), 'quiz', $s$echo$s$, $s$ファイルの末尾に文字を書き足す（追記する）ときに使う記号はどれ？$s$, $j$["|", ">", "<<", ">>"]$j$::jsonb, 3, $s$「>>」は追記です。元の中身を残したまま、末尾に書き足します。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$echo$s$), 'quiz', $s$cat$s$, $s$echo hi > a.txt のあと、書き込まれた内容を確かめるコマンドはどれ？$s$, $j$["ls a.txt", "cat a.txt", "pwd", "echo a.txt"]$j$::jsonb, 1, $s$cat でファイルの中身を表示して確かめます。ls a.txt はファイルの名前が出るだけです。$s$);
 
  -- ========== cp ==========
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$cp$s$), 'quiz', $s$cp$s$, $s$a.txt を b.txt という名前でコピーするコマンドはどれ？$s$, $j$["cp a.txt b.txt", "cp b.txt a.txt", "copy a.txt b.txt", "mv a.txt b.txt"]$j$::jsonb, 0, $s$cp は copy の略です。「cp コピー元 コピー先」の順で書きます。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$cp$s$), 'quiz', $s$cp$s$, $s$cp a.txt b.txt で、コピー元になるのはどれ？$s$, $j$["b.txt", "a.txt", "どちらも元になる", "順番は関係ない"]$j$::jsonb, 1, $s$最初に書いたファイル（a.txt）がコピー元、あとに書いたもの（b.txt）がコピー先です。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$cp$s$), 'quiz', $s$cp$s$, $s$documents フォルダがあるとき、cp a.txt documents を実行すると、どうなる？$s$, $j$["a.txt が documents という名前に変わる", "documents フォルダが削除される", "documents フォルダの中に a.txt のコピーができる", "エラーになる"]$j$::jsonb, 2, $s$コピー先がフォルダのときは、そのフォルダの中に同じ名前でコピーされます。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$cp$s$), 'quiz', $s$cp$s$, $s$フォルダを中身ごとコピーするときに、つけるオプションはどれ？$s$, $j$["-a", "-f", "-d", "-r"]$j$::jsonb, 3, $s$-r は recursive（中身ごと繰り返す）の意味です。つけないと「-r not specified」というエラーになります。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$cp$s$), 'quiz', $s$cp$s$, $s$cp でコピーしたあと、元のファイルはどうなる？$s$, $j$["元のファイルは消える", "元のファイルは残る", "元のファイルは空になる", "元のファイルは読み取り専用になる"]$j$::jsonb, 1, $s$cp は複製を作るだけなので、元のファイルは残ります。元がなくなるのは mv です。$s$);
 
  -- ========== mv ==========
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$mv$s$), 'quiz', $s$mv$s$, $s$a.txt を documents フォルダの中へ移動するコマンドはどれ？$s$, $j$["mv documents a.txt", "cp a.txt documents", "mv a.txt documents", "move a.txt documents"]$j$::jsonb, 2, $s$「mv 移動するもの 移動先」の順で書きます。cp だとコピーになります。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$mv$s$), 'quiz', $s$mv$s$, $s$mv で移動したあと、元の場所のファイルはどうなる？$s$, $j$["そのまま残る", "なくなる", "空になる", "名前が old に変わる"]$j$::jsonb, 1, $s$mv は「移動」なので、元の場所からはなくなります。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$mv$s$), 'quiz', $s$mv$s$, $s$cp と mv の違いとして、正しいのはどれ？$s$, $j$["cp は元が残り、mv は元がなくなる", "cp は元がなくなり、mv は元が残る", "cp はフォルダ用、mv はファイル用", "違いはない"]$j$::jsonb, 0, $s$cp は複製（元が残る）、mv は移動（元がなくなる）です。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$mv$s$), 'quiz', $s$mv$s$, $s$mv x.txt documents を実行すると「cannot stat 'x.txt': No such file or directory」と出た。原因はどれ？$s$, $j$["documents フォルダの中身が空", "mv にオプションが足りない", "x.txt というファイルが存在しない", "ホームフォルダにいない"]$j$::jsonb, 2, $s$「cannot stat」は、移動するファイルが見つからないという意味です。ls で名前や場所を確認しましょう。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$mv$s$), 'quiz', $s$mv$s$, $s$mv a.txt documents/b.txt を実行すると、どうなる？$s$, $j$["documents に a.txt をコピーする", "documents に移動して、b.txt に名前も変わる", "documents の中の b.txt が a.txt に変わる", "エラーになる"]$j$::jsonb, 1, $s$移動先にファイル名まで書くと、移動と同時に名前も変わります。$s$);
 
  -- ========== rm ==========
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$rm$s$), 'quiz', $s$rm$s$, $s$ファイル old.txt を削除するコマンドはどれ？$s$, $j$["del old.txt", "rm old.txt", "rmdir old.txt", "remove old.txt"]$j$::jsonb, 1, $s$rm は remove の略で、ファイルを削除します。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$rm$s$), 'quiz', $s$rm$s$, $s$rm -r の「-r」は、何を表している？$s$, $j$["read（読む）", "remove（消す）", "rename（名前を変える）", "recursive（中身ごと繰り返す）"]$j$::jsonb, 3, $s$-r は recursive の略で、フォルダの中身までまとめて処理します。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$rm$s$), 'quiz', $s$rm$s$, $s$rm で削除したファイルについて、正しいのはどれ？$s$, $j$["ゴミ箱に入り、あとで戻せる", "1日たつと自動で復活する", "元に戻せないので注意が必要", "コピーが自動で作られる"]$j$::jsonb, 2, $s$rm には、ゴミ箱のような取り消しの仕組みはありません。消す前に、名前をよく確認しましょう。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$rm$s$), 'quiz', $s$rm$s$, $s$フォルダ dir を、-r をつけずに rm dir で削除しようとすると、どうなる？$s$, $j$["フォルダが削除される", "Is a directory というエラーが出る", "中身だけが削除される", "フォルダが空になる"]$j$::jsonb, 1, $s$フォルダを削除するときは、rm -r のように -r が必要です。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$rm$s$), 'quiz', $s$rm$s$, $s$a.txt と b.txt を、1つのコマンドでまとめて削除するにはどう書く？$s$, $j$["rm a.txt b.txt", "rm a.txt,b.txt", "rm a.txt && b.txt", "rm -2 a.txt b.txt"]$j$::jsonb, 0, $s$rm のあとに、ファイル名を半角スペースで区切って並べると、まとめて削除できます。$s$);
end
$seed2$;
-- ========== エラー修復ミッション ==========
insert into questions (question_type, command_tag, title, body, setup_data)
select 'repair', $s$cp$s$, $s$フォルダがコピーできない$s$, $s$documents フォルダを backup にコピーしようとしたら、エラーが出ました。$s$, $j${"fs": {"files": {"documents/report.txt": "レポート", "documents/memo.txt": "メモ"}}, "error": {"cmd": "cp documents backup", "msg": "cp: -r not specified; omitting directory 'documents'"}, "hints": ["エラーは「フォルダは、そのままではコピーできない」という意味です。", "フォルダを中身ごとコピーするには、オプションを1つ足します。", "cp -r documents backup を実行しましょう。（-r は recursive：中身ごと）"], "checks": [{"files": ["backup/report.txt", "backup/memo.txt", "documents/report.txt"]}]}$j$::jsonb
where not exists (select 1 from questions where question_type = 'repair' and title = $s$フォルダがコピーできない$s$);
 
insert into questions (question_type, command_tag, title, body, setup_data)
select 'repair', $s$rm$s$, $s$フォルダが消せない$s$, $s$temp フォルダを削除しようとしたら、エラーが出ました。$s$, $j${"fs": {"files": {"temp/a.txt": "一時ファイル", "temp/b.txt": "一時ファイル", "memo.txt": "残すメモ"}}, "error": {"cmd": "rm temp", "msg": "rm: cannot remove 'temp': Is a directory"}, "hints": ["エラーは「temp はフォルダなので、そのままでは消せない」という意味です。", "フォルダは、中身ごと消す指定が必要です。", "rm -r temp を実行しましょう。（消したものは戻せません。memo.txt は消さないこと）"], "checks": [{"absent": ["temp", "temp/a.txt", "temp/b.txt"], "files": ["memo.txt"]}]}$j$::jsonb
where not exists (select 1 from questions where question_type = 'repair' and title = $s$フォルダが消せない$s$);
 
insert into questions (question_type, command_tag, title, body, setup_data)
select 'repair', $s$touch$s$, $s$ファイルが作れない$s$, $s$work/notes.txt を作ろうとしたら、エラーが出ました。$s$, $j${"fs": {}, "error": {"cmd": "touch work/notes.txt", "msg": "touch: cannot touch 'work/notes.txt': No such file or directory"}, "hints": ["エラーは「work/notes.txt を作れない」という意味です。", "touch はファイルを作るコマンドで、フォルダは作れません。work フォルダがまだありません。", "mkdir work でフォルダを作ってから、もう一度 touch work/notes.txt を実行しましょう。"], "checks": [{"dirs": ["work"], "files": ["work/notes.txt"]}]}$j$::jsonb
where not exists (select 1 from questions where question_type = 'repair' and title = $s$ファイルが作れない$s$);
 
insert into questions (question_type, command_tag, title, body, setup_data)
select 'repair', $s$cd$s$, $s$フォルダ名の綴りが違う$s$, $s$documents フォルダへ移動しようとしたら、エラーが出ました。$s$, $j${"fs": {"dirs": ["work"], "files": {"documents/report.txt": "レポート"}}, "error": {"cmd": "cd documnts", "msg": "bash: cd: documnts: No such file or directory"}, "hints": ["エラーは「documnts というフォルダがない」という意味です。", "入力した名前をよく見てください。綴りが違います。ls で、正しい名前を確認できます。", "cd documents を実行しましょう。"], "checks": [{"cwd": "~/documents"}]}$j$::jsonb
where not exists (select 1 from questions where question_type = 'repair' and title = $s$フォルダ名の綴りが違う$s$);
 
insert into questions (question_type, command_tag, title, body, setup_data)
select 'repair', $s$mkdir$s$, $s$同じ名前がもうある$s$, $s$project フォルダを作ろうとしたら、エラーが出ました。$s$, $j${"fs": {"files": {"project/readme.txt": "はじめに"}}, "error": {"cmd": "mkdir project", "msg": "mkdir: cannot create directory ‘project’: File exists"}, "hints": ["エラーは「project はすでにある」という意味です。", "作り直す必要はありません。すでにある project フォルダの中に入りましょう。", "cd project を実行しましょう。"], "checks": [{"cwd": "~/project"}]}$j$::jsonb
where not exists (select 1 from questions where question_type = 'repair' and title = $s$同じ名前がもうある$s$);
 
insert into questions (question_type, command_tag, title, body, setup_data)
select 'repair', $s$mv$s$, $s$移動先が足りない$s$, $s$a.txt を documents フォルダへ移動しようとしたら、エラーが出ました。$s$, $j${"fs": {"dirs": ["documents"], "files": {"a.txt": "a"}}, "error": {"cmd": "mv a.txt", "msg": "mv: missing destination file operand after 'a.txt'"}, "hints": ["エラーは「移動先が書かれていない」という意味です。", "mv は「mv 移動するもの 移動先」のように、2つ指定する必要があります。", "mv a.txt documents を実行しましょう。"], "checks": [{"files": ["documents/a.txt"], "absent": ["a.txt"]}]}$j$::jsonb
where not exists (select 1 from questions where question_type = 'repair' and title = $s$移動先が足りない$s$);
 
-- ========== シナリオ ==========
insert into questions (question_type, command_tag, title, body, setup_data)
select 'scenario', $s$mkdir$s$, $s$プロジェクトの土台を作ろう$s$, $s$新しいアプリ myapp の作業を始めます。フォルダとファイルで、プロジェクトの骨組みを作りましょう。$s$, $j${"summary": "フォルダとファイルで、プロジェクトの骨組みを作る", "commands": "mkdir -p / touch", "fs": {}, "goals": [{"label": "myapp/src と myapp/docs フォルダを作る", "hints": ["フォルダを作るコマンドは？ 親の myapp も、まだありません。", "mkdir -p を使うと、親のフォルダもまとめて作れます。", "mkdir -p myapp/src / mkdir -p myapp/docs"], "dirs": ["myapp/src", "myapp/docs"]}, {"label": "myapp/README.txt を作る", "hints": ["空のファイルを作るコマンドは？", "touch のあとに、ファイルのパスを書きます。", "touch myapp/README.txt"], "files": ["myapp/README.txt"]}, {"label": "myapp/src/main.txt を作る", "hints": ["さっきと同じコマンドを使います。", "touch のあとに、フォルダ名から続けて書きます。", "touch myapp/src/main.txt"], "files": ["myapp/src/main.txt"]}], "checks": [{"dirs": ["myapp/src", "myapp/docs"], "files": ["myapp/README.txt", "myapp/src/main.txt"]}]}$j$::jsonb
where not exists (select 1 from questions where question_type = 'scenario' and title = $s$プロジェクトの土台を作ろう$s$);
 
insert into questions (question_type, command_tag, title, body, setup_data)
select 'scenario', $s$mv$s$, $s$ログを整理しよう$s$, $s$logs フォルダが散らかってきました。使うログは archive フォルダへ移し、古い old.log は削除しましょう。$s$, $j${"summary": "ログを保管用フォルダに移し、古いものを消す", "commands": "mkdir / mv / rm", "fs": {"files": {"logs/app.log": "起動しました", "logs/error.log": "エラーなし", "logs/old.log": "古いログ"}}, "goals": [{"label": "logs/archive フォルダを作る", "hints": ["フォルダを作るコマンドは？", "mkdir のあとに、フォルダのパスを書きます。", "mkdir logs/archive"], "dirs": ["logs/archive"]}, {"label": "app.log と error.log を logs/archive に移動する", "hints": ["移動は mv を使います。1つずつ実行します。", "mv は「mv 移動するもの 移動先」の順です。", "mv logs/app.log logs/archive / mv logs/error.log logs/archive"], "files": ["logs/archive/app.log", "logs/archive/error.log"], "absent": ["logs/app.log", "logs/error.log"]}, {"label": "old.log を削除する", "hints": ["削除は rm を使います。", "rm のあとに、消したいファイルのパスを書きます。", "rm logs/old.log"], "absent": ["logs/old.log"]}], "checks": [{"files": ["logs/archive/app.log", "logs/archive/error.log"], "absent": ["logs/app.log", "logs/error.log", "logs/old.log", "logs/archive/old.log"]}]}$j$::jsonb
where not exists (select 1 from questions where question_type = 'scenario' and title = $s$ログを整理しよう$s$);
 
insert into questions (question_type, command_tag, title, body, setup_data)
select 'scenario', $s$mv$s$, $s$名前をそろえて整理しよう$s$, $s$ファイル名が揃っていません。notes フォルダにまとめ、移すときに名前も直しましょう（Memo.txt → memo.txt、todo.text → todo.txt）。$s$, $j${"summary": "移動しながら、ファイル名も正しく直す", "commands": "mkdir / mv", "fs": {"files": {"Memo.txt": "メモ", "todo.text": "やること"}}, "goals": [{"label": "notes フォルダを作る", "hints": ["フォルダを作るコマンドは？", "mkdir のあとに、フォルダ名を書きます。", "mkdir notes"], "dirs": ["notes"]}, {"label": "Memo.txt を notes/memo.txt として移動する", "hints": ["移動は mv を使います。名前を変えながら移動もできます。", "移動先にファイル名まで書くと、移動と同時に名前が変わります。", "mv Memo.txt notes/memo.txt"], "files": ["notes/memo.txt"], "absent": ["Memo.txt"]}, {"label": "todo.text を notes/todo.txt として移動する", "hints": ["さっきと同じ要領です。", "移動先に、新しい名前（todo.txt）まで書きます。", "mv todo.text notes/todo.txt"], "files": ["notes/todo.txt"], "absent": ["todo.text"]}], "checks": [{"files": ["notes/memo.txt", "notes/todo.txt"], "absent": ["Memo.txt", "todo.text", "notes/Memo.txt", "notes/todo.text"]}]}$j$::jsonb
where not exists (select 1 from questions where question_type = 'scenario' and title = $s$名前をそろえて整理しよう$s$);
-- 新しいレッスンの追加：head・tail・wc／grep・find／パイプ、と、レッスンの並び順の変更
-- seed.sql の末尾（$seed2$; の下）に貼り付けるか、SQL Editor で単独で実行する。何度実行しても壊れない。
-- ※先に lib/terminal.ts（head・tail・wc・grep・find・パイプ対応版）を反映しておくこと。
--
-- 並び順（sort_order は10刻み。あとから間に挿入できる）
--   10 ls / 20 cd / 30 mkdir / 40 cat / 50 head（新）/ 60 echo / 70 cp / 80 mv / 90 rm / 100 grep（新）/ 110 pipe（新）
 
-- ========== 既存レッスンの並び順 ==========
update lessons set sort_order = v.n
from (values ('ls',10),('cd',20),('mkdir',30),('cat',40),('echo',60),('cp',70),('mv',80),('rm',90)) as v(code, n)
where lessons.code = v.code;
 
-- ========== head ==========
insert into lessons (code, title, sort_order, category) values ($s$head$s$, $s$中身の一部を見よう（head・tail・wc）$s$, 50, $s$テキスト操作$s$)
  on conflict (code) do update set title = excluded.title, sort_order = excluded.sort_order, category = excluded.category;
insert into lesson_steps (lesson_id, step_number, body, hint, clear_condition, setup_data)
  values ((select id from lessons where code=$s$head$s$), 1, $s$head log.txt で、log.txt の先頭の部分を表示してみましょう。$s$, $s$head は、ファイルの先頭から表示します。行数を指定しないと、10行まで表示されます。$s$, $j${"commands": ["^head\\s+log\\.txt$"]}$j$::jsonb, $j${"files": {"log.txt": "起動しました\nログインしました\nファイルを開きました\nファイルを保存しました\nエラーが発生しました\n終了しました", "todo.txt": "牛乳を買う\n宿題をする\n部屋を掃除する"}}$j$::jsonb)
  on conflict (lesson_id, step_number) do update set body = excluded.body, hint = excluded.hint, clear_condition = excluded.clear_condition, setup_data = excluded.setup_data;
insert into lesson_steps (lesson_id, step_number, body, hint, clear_condition, setup_data)
  values ((select id from lessons where code=$s$head$s$), 2, $s$head -n 2 log.txt で、先頭の2行だけを表示しましょう。$s$, $s$「-n 数字」で、表示する行数を指定できます。$s$, $j${"commands": ["^head\\s+(-n\\s*2|-2)\\s+log\\.txt$"]}$j$::jsonb, null)
  on conflict (lesson_id, step_number) do update set body = excluded.body, hint = excluded.hint, clear_condition = excluded.clear_condition, setup_data = excluded.setup_data;
insert into lesson_steps (lesson_id, step_number, body, hint, clear_condition, setup_data)
  values ((select id from lessons where code=$s$head$s$), 3, $s$tail -n 2 log.txt で、末尾の2行だけを表示しましょう。$s$, $s$tail は、ファイルの末尾から表示します。ログの「最新の様子」を見るときによく使います。$s$, $j${"commands": ["^tail\\s+(-n\\s*2|-2)\\s+log\\.txt$"]}$j$::jsonb, null)
  on conflict (lesson_id, step_number) do update set body = excluded.body, hint = excluded.hint, clear_condition = excluded.clear_condition, setup_data = excluded.setup_data;
insert into lesson_steps (lesson_id, step_number, body, hint, clear_condition, setup_data)
  values ((select id from lessons where code=$s$head$s$), 4, $s$wc -l todo.txt で、todo.txt の行数を数えましょう。$s$, $s$wc は word count の略です。-l（lines）をつけると、行数だけを数えます。$s$, $j${"commands": ["^wc\\s+-l\\s+todo\\.txt$"]}$j$::jsonb, null)
  on conflict (lesson_id, step_number) do update set body = excluded.body, hint = excluded.hint, clear_condition = excluded.clear_condition, setup_data = excluded.setup_data;
 
-- ========== grep ==========
insert into lessons (code, title, sort_order, category) values ($s$grep$s$, $s$探してみよう（grep・find）$s$, 100, $s$テキスト操作$s$)
  on conflict (code) do update set title = excluded.title, sort_order = excluded.sort_order, category = excluded.category;
insert into lesson_steps (lesson_id, step_number, body, hint, clear_condition, setup_data)
  values ((select id from lessons where code=$s$grep$s$), 1, $s$grep banana fruits.txt で、banana を含む行だけを表示しましょう。$s$, $s$grep のあとに「探す文字」「ファイル名」の順で書きます。$s$, $j${"commands": ["^grep\\s+banana\\s+fruits\\.txt$"]}$j$::jsonb, $j${"files": {"fruits.txt": "apple\nbanana\nApple pie\ncherry\nbanana split", "app.log": "start\nerror: disk full\nok\nerror: timeout\nend", "documents/report.txt": "売上報告", "documents/notes.txt": "買い物メモ", "photos/a.jpg": "", "photos/b.png": ""}}$j$::jsonb)
  on conflict (lesson_id, step_number) do update set body = excluded.body, hint = excluded.hint, clear_condition = excluded.clear_condition, setup_data = excluded.setup_data;
insert into lesson_steps (lesson_id, step_number, body, hint, clear_condition, setup_data)
  values ((select id from lessons where code=$s$grep$s$), 2, $s$grep -i apple fruits.txt で、大文字と小文字を区別せずに探しましょう。$s$, $s$-i は ignore case の略です。apple も Apple も見つかります。$s$, $j${"commands": ["^grep\\s+-\\w*i\\w*\\s+apple\\s+fruits\\.txt$"]}$j$::jsonb, null)
  on conflict (lesson_id, step_number) do update set body = excluded.body, hint = excluded.hint, clear_condition = excluded.clear_condition, setup_data = excluded.setup_data;
insert into lesson_steps (lesson_id, step_number, body, hint, clear_condition, setup_data)
  values ((select id from lessons where code=$s$grep$s$), 3, $s$grep -n error app.log で、行番号つきで error を探しましょう。$s$, $s$-n をつけると、見つかった行の番号も表示されます。$s$, $j${"commands": ["^grep\\s+-\\w*n\\w*\\s+error\\s+app\\.log$"]}$j$::jsonb, null)
  on conflict (lesson_id, step_number) do update set body = excluded.body, hint = excluded.hint, clear_condition = excluded.clear_condition, setup_data = excluded.setup_data;
insert into lesson_steps (lesson_id, step_number, body, hint, clear_condition, setup_data)
  values ((select id from lessons where code=$s$grep$s$), 4, $s$find . -name "*.txt" で、名前が .txt で終わるファイルを探しましょう。$s$, $s$find のあとに「どこから探すか」を書き、-name で名前を指定します。「.」はいまのフォルダ、「*」はどんな文字にもあてはまります。$s$, $j${"commands": ["^find\\s+\\.\\s+-name\\s+[\"']?\\*\\.txt[\"']?$"]}$j$::jsonb, null)
  on conflict (lesson_id, step_number) do update set body = excluded.body, hint = excluded.hint, clear_condition = excluded.clear_condition, setup_data = excluded.setup_data;
insert into lesson_steps (lesson_id, step_number, body, hint, clear_condition, setup_data)
  values ((select id from lessons where code=$s$grep$s$), 5, $s$find documents -name "*.txt" で、documents フォルダの中だけを探しましょう。$s$, $s$「どこから探すか」に、フォルダ名を書くと、そのフォルダの中だけを探します。$s$, $j${"commands": ["^find\\s+documents/?\\s+-name\\s+[\"']?\\*\\.txt[\"']?$"]}$j$::jsonb, null)
  on conflict (lesson_id, step_number) do update set body = excluded.body, hint = excluded.hint, clear_condition = excluded.clear_condition, setup_data = excluded.setup_data;
 
-- ========== pipe ==========
insert into lessons (code, title, sort_order, category) values ($s$pipe$s$, $s$つなげてみよう（パイプ）$s$, 110, $s$テキスト操作$s$)
  on conflict (code) do update set title = excluded.title, sort_order = excluded.sort_order, category = excluded.category;
insert into lesson_steps (lesson_id, step_number, body, hint, clear_condition, setup_data)
  values ((select id from lessons where code=$s$pipe$s$), 1, $s$ls | wc -l で、フォルダの中にあるファイルとフォルダの数を数えましょう。$s$, $s$「|」（パイプ）は、左のコマンドの出力を、右のコマンドに渡します。ls の結果を、wc -l が数えます。$s$, $j${"commands": ["^ls\\s*\\|\\s*wc\\s+-l$"]}$j$::jsonb, $j${"files": {"app.log": "start\nerror: disk full\nok\nerror: timeout\nend", "memo.txt": "あとで読む", "documents/report.txt": "売上報告", "documents/notes.txt": "買い物メモ", "photos/a.jpg": "", "photos/b.png": ""}}$j$::jsonb)
  on conflict (lesson_id, step_number) do update set body = excluded.body, hint = excluded.hint, clear_condition = excluded.clear_condition, setup_data = excluded.setup_data;
insert into lesson_steps (lesson_id, step_number, body, hint, clear_condition, setup_data)
  values ((select id from lessons where code=$s$pipe$s$), 2, $s$cat app.log | grep error で、app.log の中から error の行だけを取り出しましょう。$s$, $s$cat が表示した中身を、grep に渡して、error を含む行だけに絞ります。$s$, $j${"commands": ["^cat\\s+app\\.log\\s*\\|\\s*grep\\s+error$"]}$j$::jsonb, null)
  on conflict (lesson_id, step_number) do update set body = excluded.body, hint = excluded.hint, clear_condition = excluded.clear_condition, setup_data = excluded.setup_data;
insert into lesson_steps (lesson_id, step_number, body, hint, clear_condition, setup_data)
  values ((select id from lessons where code=$s$pipe$s$), 3, $s$grep error app.log | wc -l で、error の行が何行あるか数えましょう。$s$, $s$grep で絞った結果を、wc -l に渡すと、行数を数えられます。$s$, $j${"commands": ["^grep\\s+error\\s+app\\.log\\s*\\|\\s*wc\\s+-l$"]}$j$::jsonb, null)
  on conflict (lesson_id, step_number) do update set body = excluded.body, hint = excluded.hint, clear_condition = excluded.clear_condition, setup_data = excluded.setup_data;
insert into lesson_steps (lesson_id, step_number, body, hint, clear_condition, setup_data)
  values ((select id from lessons where code=$s$pipe$s$), 4, $s$find . -name "*.txt" | wc -l で、.txt のファイルが全部で何個あるか数えましょう。$s$, $s$find で見つけたファイルの一覧を、wc -l に渡すと、個数を数えられます。$s$, $j${"commands": ["^find\\s+\\.\\s+-name\\s+[\"']?\\*\\.txt[\"']?\\s*\\|\\s*wc\\s+-l$"]}$j$::jsonb, null)
  on conflict (lesson_id, step_number) do update set body = excluded.body, hint = excluded.hint, clear_condition = excluded.clear_condition, setup_data = excluded.setup_data;
 
-- ========== 確認テスト（各5問）==========
-- 3つのレッスンのどれかに確認テストがすでにあれば、何もしない（二重に入らない）
do $seed3$
begin
  if exists (select 1 from questions where question_type = 'quiz' and lesson_id in (select id from lessons where code in ($s$head$s$, $s$grep$s$, $s$pipe$s$))) then return; end if;
 
  -- head
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$head$s$), 'quiz', $s$head$s$, $s$ファイルの先頭の数行だけを表示するコマンドはどれ？$s$, $j$["head", "tail", "top", "first"]$j$::jsonb, 0, $s$head は、ファイルの先頭から表示します。行数を指定しないと、10行まで表示されます。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$head$s$), 'quiz', $s$tail$s$, $s$ファイル log.txt の末尾の2行だけを表示するコマンドはどれ？$s$, $j$["head -n 2 log.txt", "tail -n 2 log.txt", "tail 2 log.txt", "cat -2 log.txt"]$j$::jsonb, 1, $s$tail は末尾から表示します。「-n 2」で、表示する行数を2行に指定します。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$head$s$), 'quiz', $s$head$s$, $s$head -n 3 log.txt を実行すると、何が表示される？$s$, $j$["末尾の3行", "先頭の3行", "3文字だけ", "3番目の行だけ"]$j$::jsonb, 1, $s$head は先頭から表示します。「-n 3」で、先頭の3行までを表示します。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$head$s$), 'quiz', $s$wc$s$, $s$ファイルの行数を数えるコマンドはどれ？$s$, $j$["wc -l", "wc -w", "count log.txt", "ls -l"]$j$::jsonb, 0, $s$wc は word count の略で、-l（lines）をつけると行数を数えます。-w は単語数です。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$head$s$), 'quiz', $s$tail$s$, $s$ログファイルの「最新の数行」を見たいとき、よく使うのはどれ？$s$, $j$["head", "tail", "wc", "cat -h"]$j$::jsonb, 1, $s$ログは新しい出来事が末尾に追加されるので、末尾を見る tail がよく使われます。$s$);
 
  -- grep
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$grep$s$), 'quiz', $s$grep$s$, $s$ファイルの中から、特定の文字を含む行だけを表示するコマンドはどれ？$s$, $j$["find", "grep", "cat", "ls"]$j$::jsonb, 1, $s$grep は、ファイルの中身から文字を探して、その行を表示します。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$grep$s$), 'quiz', $s$grep$s$, $s$grep -i の「-i」は、何を表す？$s$, $j$["大文字と小文字を区別しない", "行番号を表示する", "逆順に表示する", "隠しファイルも探す"]$j$::jsonb, 0, $s$-i は ignore case の略です。Apple も apple も同じものとして探します。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$grep$s$), 'quiz', $s$grep$s$, $s$grep -n error app.log を実行すると、通常の表示に加えて何が出る？$s$, $j$["ファイルの更新日時", "見つかった行の行番号", "見つかった行の数だけ", "ファイルの大きさ"]$j$::jsonb, 1, $s$-n（number）をつけると、見つかった行の行番号が先頭に表示されます。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$grep$s$), 'quiz', $s$find$s$, $s$いまのフォルダの中から、名前が .txt で終わるファイルを探すコマンドはどれ？$s$, $j$["grep .txt", "find . -name \"*.txt\"", "ls *.txt -r", "cat *.txt"]$j$::jsonb, 1, $s$find は、ファイルを名前で探します。「.」はいまのフォルダ、「*」はどんな文字にもあてはまります。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$grep$s$), 'quiz', $s$find$s$, $s$find documents -name "*.txt" の「documents」は、何を表す？$s$, $j$["探す場所（ここから探す）", "探す文字", "探すファイルの名前", "結果の保存先"]$j$::jsonb, 0, $s$find のあとの最初の指定は「どこから探すか」です。この場合は documents フォルダの中を探します。$s$);
 
  -- pipe
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$pipe$s$), 'quiz', $s$pipe$s$, $s$「|」（パイプ）の役割はどれ？$s$, $j$["左のコマンドの出力を、右のコマンドに渡す", "ファイルに書き込む", "コマンドを2回実行する", "直前のコマンドを取り消す"]$j$::jsonb, 0, $s$パイプは、左のコマンドの出力を、右のコマンドの入力として渡します。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$pipe$s$), 'quiz', $s$pipe$s$, $s$フォルダの中にあるファイルの数を数える、正しい書き方はどれ？$s$, $j$["ls | wc -l", "wc -l | ls", "ls > wc -l", "ls & wc -l"]$j$::jsonb, 0, $s$ls の出力（一覧）を、パイプで wc -l に渡すと、行数（＝個数）を数えられます。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$pipe$s$), 'quiz', $s$pipe$s$, $s$cat app.log | grep error は、何をする？$s$, $j$["app.log を削除する", "app.log の中の error を含む行だけを表示する", "app.log に error と書き込む", "error という名前のファイルを探す"]$j$::jsonb, 1, $s$cat が出した中身を、grep が error を含む行だけに絞って表示します。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$pipe$s$), 'quiz', $s$pipe$s$, $s$grep error app.log | wc -l は、何を数える？$s$, $j$["app.log の全部の行数", "error を含む行の数", "error という文字の数", "ファイルの数"]$j$::jsonb, 1, $s$grep で error を含む行だけに絞ってから、wc -l で、その行数を数えます。$s$);
  insert into questions (lesson_id, question_type, command_tag, body, choices, correct_index, explanation)
    values ((select id from lessons where code=$s$pipe$s$), 'quiz', $s$pipe$s$, $s$「>」と「|」の違いとして、正しいのはどれ？$s$, $j$["「>」は出力をファイルへ、「|」は出力を次のコマンドへ渡す", "どちらもファイルに書き込む", "「>」は追記、「|」は上書き", "違いはない"]$j$::jsonb, 0, $s$「>」は出力をファイルに書き込み、「|」は出力を次のコマンドに渡します。$s$);
 
end
$seed3$;
 