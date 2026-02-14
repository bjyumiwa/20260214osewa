// Google Apps Script (Webアプリ)
// スプレッドシートに「logs」シートを作り、1行ずつ追記します。
// メール通知が不要なら CREATOR_EMAIL を空にしてください。

const SHEET_NAME = 'logs';
const CREATOR_EMAIL = ''; // 例: 'your_mail@example.com'

function doPost(e) {
  const raw = (e && e.postData && e.postData.contents) ? e.postData.contents : '';
  let obj = {};
  try {
    obj = JSON.parse(raw || '{}');
  } catch (err) {
    obj = { parseError: String(err), raw: raw };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

  // ヘッダ（初回だけ）
  if (sh.getLastRow() === 0) {
    sh.appendRow([
      'receivedAt', 'project', 'reason',
      'playerId', 'name', 'lang', 'avatar', 'pet',
      'lifePreset', 'hatchPreset',
      'createdAt', 'foundAt', 'hatchedAt', 'bornAt', 'endAt', 'isEnded',
      'stats', 'items', 'sitter',
      'eventsJson'
    ]);
  }

  const timeline = obj.timeline || {};
  const settings = obj.settings || {};

  sh.appendRow([
    new Date(),
    obj.project || '',
    obj.reason || '',
    obj.playerId || '',
    obj.name || '',
    obj.lang || '',
    obj.avatar || '',
    obj.pet || '',
    settings.lifePreset || '',
    settings.hatchPreset || '',
    timeline.createdAt || '',
    timeline.foundAt || '',
    timeline.hatchedAt || '',
    timeline.bornAt || '',
    timeline.endAt || '',
    timeline.isEnded || '',
    JSON.stringify(obj.stats || {}),
    JSON.stringify(obj.items || {}),
    JSON.stringify(obj.sitter || {}),
    JSON.stringify(obj.events || [])
  ]);

  // 終了時だけメール通知（必要なら）
  if (CREATOR_EMAIL && obj.reason === 'end') {
    const name = obj.name || '(no name)';
    const avatar = obj.avatar || '';
    const pet = obj.pet || '';
    const msg = [
      'A playthrough finished.',
      'name: ' + name,
      'playerId: ' + (obj.playerId || ''),
      'avatar: ' + avatar,
      'pet: ' + pet,
      'endAt: ' + (timeline.endAt || ''),
      'events: ' + ((obj.events || []).length)
    ].join('\n');

    MailApp.sendEmail(CREATOR_EMAIL, 'Care game log (end)', msg);
  }

  return ContentService.createTextOutput('ok');
}

function doGet() {
  return ContentService.createTextOutput('ok');
}
