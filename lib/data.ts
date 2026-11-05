// 画面確認用のサンプルデータ。DB（Supabase）につなぐときは、この中身を取得処理に置き換える。
import { Fs, HOME, exists, isDir, isFile, makeFs } from './terminal'

export type Ctx = { fs: Fs; cwd: string; log: string[] } // log = 判定の対象にするコマンド履歴
export type Check = (c: Ctx) => boolean

const ran = (log: string[], re: RegExp) => log.some((l) => re.test(l.trim()))
const at = (p: string) => `${HOME}/${p}`

/* ---------- レッスン（S-02, S-03） ---------- */
export type Lesson = { id: string; title: string; fs: Fs; steps: { task: string; hint: string; check: Check }[] }

const lsFs = () => makeFs({ dirs: ['work'], files: { 'memo.txt': 'あとで読む', '.secret': 'ひみつ', 'documents/report.txt': 'レポート' } })

export const lessons: Lesson[] = [
  {
    id: 'ls', title: 'ファイルを見てみよう（ls）', fs: lsFs(),
    steps: [
      { task: 'ls を実行して、いまのフォルダの中身を見てみましょう。', hint: 'ls とだけ入力して Enter を押します。', check: (c) => ran(c.log, /^ls$/) },
      { task: 'ls -a で、隠しファイルも表示してみましょう。', hint: '「-a」は all（すべて）の意味です。ls -a と入力します。', check: (c) => ran(c.log, /^ls\s+-\w*a/) },
      { task: 'ls -l で、詳しい情報つきの一覧を見てみましょう。', hint: 'ls -l と入力します。', check: (c) => ran(c.log, /^ls\s+-\w*l/) },
      { task: 'ls documents で、documents フォルダの中身を見てみましょう。', hint: 'ls のあとに半角スペースとフォルダ名を入力します。', check: (c) => ran(c.log, /^ls\s+documents\/?$/) },
    ],
  },
  {
    id: 'cd', title: '移動してみよう（cd・pwd）', fs: lsFs(),
    steps: [
      { task: 'pwd で、いまいる場所を確認しましょう。', hint: 'pwd は print working directory の略です。', check: (c) => ran(c.log, /^pwd$/) },
      { task: 'cd documents で、documents フォルダへ移動しましょう。', hint: 'cd のあとにフォルダ名を入力します。', check: (c) => c.cwd === at('documents') },
      { task: 'cd .. で、ひとつ上のフォルダに戻りましょう。', hint: '「..」は、ひとつ上のフォルダを表します。', check: (c) => c.cwd === HOME && ran(c.log, /^cd\s+\.\./) },
    ],
  },
  {
    id: 'mkdir', title: '作ってみよう（mkdir・touch）', fs: lsFs(),
    steps: [
      { task: 'mkdir project で、project フォルダを作りましょう。', hint: 'mkdir のあとに、作りたいフォルダ名を入力します。', check: (c) => isDir(c.fs, at('project')) },
      { task: 'touch project/readme.txt で、空のファイルを作りましょう。', hint: 'touch のあとに、作りたいファイルのパスを入力します。', check: (c) => isFile(c.fs, at('project/readme.txt')) },
      { task: 'ls project で、作ったファイルを確かめましょう。', hint: 'ls project と入力します。', check: (c) => ran(c.log, /^ls\s+project\/?$/) },
    ],
  },
]

// トップページの表示用（クリア状況・確認テストの最高点）。null は未受験
export const progress: Record<string, { cleared: boolean; best: number | null }> = {
  ls: { cleared: true, best: 9 },
  cd: { cleared: false, best: null },
  mkdir: { cleared: false, best: null },
}

/* ---------- 確認テスト（S-04, S-05） ---------- */
export type Quiz = { q: string; choices: string[]; answer: number; explain: string }
export const quizPool: Quiz[] = [
  { q: 'いまいるフォルダの中身を一覧表示するコマンドはどれ？', choices: ['ls', 'cd', 'pwd', 'cat'], answer: 0, explain: 'ls は list の略で、フォルダの中身を表示します。' },
  { q: '隠しファイルも表示したいとき、正しいのはどれ？', choices: ['ls -l', 'ls -a', 'ls -h', 'ls -r'], answer: 1, explain: '-a（all）をつけると、「.」で始まる隠しファイルも表示されます。' },
  { q: 'いまいる場所（カレントディレクトリ）を表示するコマンドは？', choices: ['where', 'ls', 'pwd', 'cd'], answer: 2, explain: 'pwd は print working directory の略です。' },
  { q: '「..」が表すものはどれ？', choices: ['ホームフォルダ', 'ひとつ上のフォルダ', 'いまのフォルダ', 'ルート'], answer: 1, explain: '「..」は親（ひとつ上）のフォルダ、「.」はいまのフォルダです。' },
  { q: 'ホームフォルダへ一発で戻るコマンドは？', choices: ['cd ..', 'cd /', 'cd ~', 'cd -h'], answer: 2, explain: '「~」はホームフォルダを表します。cd だけでも戻れます。' },
  { q: 'work という新しいフォルダを作るコマンドは？', choices: ['touch work', 'mkdir work', 'cd work', 'new work'], answer: 1, explain: 'mkdir は make directory の略です。' },
  { q: '空のファイル memo.txt を作るコマンドは？', choices: ['mkdir memo.txt', 'ls memo.txt', 'touch memo.txt', 'cat memo.txt'], answer: 2, explain: 'touch は、存在しないファイルを空で作成します。' },
  { q: 'ファイルの中身を表示するコマンドは？', choices: ['cat', 'rm', 'mv', 'cp'], answer: 0, explain: 'cat は、ファイルの内容をそのまま表示します。' },
  { q: 'ファイル a.txt を b.txt という名前に変えるコマンドは？', choices: ['cp a.txt b.txt', 'mv a.txt b.txt', 'rm a.txt b.txt', 'cd a.txt b.txt'], answer: 1, explain: 'mv は移動のほか、名前の変更にも使います。' },
  { q: 'フォルダ dir を中身ごと削除するときの正しい書き方は？', choices: ['rm dir', 'rmdir -r dir', 'rm -r dir', 'del dir'], answer: 2, explain: 'フォルダを消すには rm に -r（再帰）をつけます。' },
]

/* ---------- 実技テスト（S-08） ---------- */
export type Practical = { id: string; title: string; task: string; fs: Fs; judge: (fs: Fs) => string[] } // 戻り値は不足点（空なら合格）
const need = (ok: boolean, msg: string) => (ok ? [] : [msg])
export const practicals: Practical[] = [
  { id: 'ls', title: '実技テスト：ls', fs: lsFs(), task: 'documents フォルダの中に、memo.txt をコピーしてください（元の memo.txt は残すこと）。',
    judge: (fs) => [...need(isFile(fs, at('documents/memo.txt')), 'documents に memo.txt がありません'), ...need(isFile(fs, at('memo.txt')), '元の memo.txt が消えています')] },
  { id: 'cd', title: '実技テスト：cd', fs: lsFs(), task: 'work フォルダの中に src フォルダを作り、その中に main.txt を作ってください。',
    judge: (fs) => [...need(isDir(fs, at('work/src')), 'work/src フォルダがありません'), ...need(isFile(fs, at('work/src/main.txt')), 'work/src/main.txt がありません')] },
  { id: 'mkdir', title: '実技テスト：mkdir', fs: lsFs(), task: 'project フォルダを作り、memo.txt をその中へ移動してください。',
    judge: (fs) => [...need(isDir(fs, at('project')), 'project フォルダがありません'), ...need(isFile(fs, at('project/memo.txt')), 'project に memo.txt がありません'), ...need(!exists(fs, at('memo.txt')), '元の memo.txt が残っています（コピーではなく移動です）')] },
]

/* ---------- エラー修復ミッション（S-06, S-07） ---------- */
export type Mission = { id: string; title: string; command: string; status: string; fs: Fs; cwd?: string; error: { cmd: string; msg: string }; hints: string[]; done: (fs: Fs, cwd: string) => boolean; cleared: boolean }
export const missions: Mission[] = [
  { id: 'typo-file', title: 'ファイルが見つからない', command: 'cat・mv', cleared: true,
    status: 'notes.txt を読もうとしたら、エラーが出ました。', fs: makeFs({ files: { 'notes.text': 'きょうの学び' } }),
    error: { cmd: 'cat notes.txt', msg: 'cat: notes.txt: No such file or directory' },
    hints: ['エラーは「notes.txt というファイルがない」という意味です。', 'ls で確認すると、名前が少し違うファイルがあります。', 'mv notes.text notes.txt で名前を直してみましょう。'], done: (fs) => isFile(fs, at('notes.txt')) },
  { id: 'no-parent', title: 'フォルダが作れない', command: 'mkdir', cleared: false,
    status: 'work/src フォルダを作ろうとしたら、エラーが出ました。', fs: makeFs({}),
    error: { cmd: 'mkdir work/src', msg: "mkdir: cannot create directory ‘work/src’: No such file or directory" },
    hints: ['エラーは「work/src を作れない」という意味です。', '原因は、親の work フォルダがまだないことです。', 'mkdir work を先に実行するか、mkdir -p work/src を使います。'], done: (fs) => isDir(fs, at('work/src')) },
  { id: 'wrong-dir', title: '場所を間違えている', command: 'cd・ls', cleared: false,
    status: 'project フォルダに入りたいのに、エラーが出ました。', fs: makeFs({ dirs: ['project'], files: { 'documents/a.txt': 'a' } }), cwd: at('documents'),
    error: { cmd: 'cd project', msg: 'bash: cd: project: No such file or directory' },
    hints: ['エラーは「ここに project はない」という意味です。', 'pwd で、いまいる場所を確認しましょう。', 'project は ひとつ上のフォルダにあります。cd ../project を試しましょう。'], done: (_f, cwd) => cwd === at('project') },
]

/* ---------- シナリオ（S-14, S-15） ---------- */
export type Scenario = { id: string; title: string; summary: string; commands: string; cleared: boolean; story: string; fs: Fs; goals: { label: string; hints: string[]; check: Check }[]; judge: (fs: Fs) => boolean }
export const scenarios: Scenario[] = [
  { id: 'backup', title: 'バックアップを作ろう', summary: '大事なファイルをコピーして、古いファイルを片づける', commands: 'mkdir / cp / rm', cleared: false,
    story: '大事な資料を守るため、backup フォルダにコピーを取ります。作業が終わったら、いらない old.txt も削除しましょう。',
    fs: makeFs({ files: { 'report.txt': '大事な資料', 'old.txt': '古いメモ' } }),
    goals: [
      { label: 'backup フォルダを作る', hints: ['フォルダを作るコマンドは？', 'mkdir backup'], check: (c) => isDir(c.fs, at('backup')) },
      { label: 'report.txt を backup にコピーする', hints: ['コピーは cp を使います。', 'cp report.txt backup'], check: (c) => isFile(c.fs, at('backup/report.txt')) },
      { label: 'old.txt を削除する', hints: ['削除は rm を使います。', 'rm old.txt'], check: (c) => !exists(c.fs, at('old.txt')) },
    ],
    judge: (fs) => isFile(fs, at('backup/report.txt')) && isFile(fs, at('report.txt')) && !exists(fs, at('old.txt')) },
  { id: 'organize', title: '写真を整理しよう', summary: 'ばらばらの写真を、フォルダにまとめる', commands: 'mkdir / mv / ls', cleared: false,
    story: 'ホームに写真が散らかっています。photos フォルダを作って、すべての写真を移動しましょう。',
    fs: makeFs({ files: { 'a.jpg': '', 'b.jpg': '', 'c.jpg': '' } }),
    goals: [
      { label: 'photos フォルダを作る', hints: ['mkdir を使います。', 'mkdir photos'], check: (c) => isDir(c.fs, at('photos')) },
      { label: 'a.jpg を photos に移動する', hints: ['移動は mv を使います。', 'mv a.jpg photos'], check: (c) => isFile(c.fs, at('photos/a.jpg')) && !exists(c.fs, at('a.jpg')) },
      { label: 'b.jpg と c.jpg も photos に移動する', hints: ['ひとつずつ mv を実行します。', 'mv b.jpg photos / mv c.jpg photos'], check: (c) => isFile(c.fs, at('photos/b.jpg')) && isFile(c.fs, at('photos/c.jpg')) },
    ],
    judge: (fs) => ['a', 'b', 'c'].every((n) => isFile(fs, at(`photos/${n}.jpg`)) && !exists(fs, at(`${n}.jpg`))) },
]

export const scenarioDone = (s: Scenario, c: Ctx) => s.goals.every((g) => g.check(c)) && s.judge(c.fs)

