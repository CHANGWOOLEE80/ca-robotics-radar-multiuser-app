/*
  Construction Automation & Robotics Radar - Multi-user Server
  Node.js built-in modules only. No npm install required.
  Run: node server.js
*/

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');

const PORT = Number(process.env.PORT || 8080);
const HOST = process.env.HOST || '0.0.0.0';
const BASE_DIR = __dirname;
const PUBLIC_DIR = path.join(BASE_DIR, 'public');
const DATA_DIR = path.join(BASE_DIR, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const NEWS_SOURCES_FILE = path.join(DATA_DIR, 'news_sources.json');
const NEWS_CACHE_FILE = path.join(DATA_DIR, 'news_cache.json');
const CHAT_FILE = path.join(DATA_DIR, 'chat.json');
const UPLOAD_DIR = path.join(BASE_DIR, 'uploads');
const MAX_BODY_BYTES = 50 * 1024 * 1024;
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
const MAX_CHAT_ATTACHMENTS = 3;

const collections = new Set(['techs', 'painPoints', 'ideas', 'pocs', 'vendors', 'actionItems', 'meetingNotes', 'decisionLogs']);
const writeRoles = new Set(['admin', 'editor']);
const adminRoles = new Set(['admin']);

const options = {
  categories: ['Robotics', 'Autonomous Equipment', 'Drone', 'AI / Vision', 'Digital Twin', 'Modular / Yard', 'Temporary Facility', 'Controlled Environment', 'Fabrication Automation', 'Inspection Facility', 'Worker Assist', 'Physical AI', 'AI Agent', 'Safety Tech', 'Productivity Tool'],
  trades: ['Civil', 'UG/Piping', 'Mechanical', 'Steel', 'Painting', 'Insulation', 'Module', 'Logistics', 'HSE', 'Quality', 'Planning', 'Common'],
  radarStatuses: ['Adopt', 'Trial', 'Assess', 'Watch', 'Hold'],
  difficulties: ['Low', 'Medium', 'High'],
  pocStages: ['Candidate', 'Pre-Review', 'Test Plan', 'Field Test', 'Analysis', 'Scale-up Decision', 'Standardization'],
  vendorStatus: ['Contact Needed', 'Data Requested', 'Meeting Scheduled', 'Clarification', 'Quote Received', 'Demo Planned', 'On Hold', 'Closed'],
  ideaStatus: ['New', 'Discussing', 'Selected', 'In PoC', 'Closed', 'On Hold'],
  potential: ['High', 'Medium', 'Low', 'Need Review'],
  recurrence: ['One-off', 'Repeated', 'Common Across Projects'],
  priorities: ['High', 'Medium', 'Low'],
  newsCategories: ['Robotics', 'Automation', 'Physical AI', 'Drone', 'Autonomous Equipment', 'Construction Tech', 'Safety', 'Productivity', 'General'],
  languages: ['Korean', 'English', 'Other'],
  chatChannels: ['General', 'Idea Discussion', 'Technology Review', 'Vendor Follow-up', 'PoC Planning', 'News Radar']
};

function nowIso() { return new Date().toISOString(); }
function today() { return new Date().toISOString().slice(0, 10); }
function uid() { return crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex'); }
function hashPin(pin, salt) { return crypto.createHash('sha256').update(`${salt}:${pin}`).digest('hex'); }
function jsonResponse(res, status, body, headers = {}) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', ...headers });
  res.end(JSON.stringify(body));
}
function textResponse(res, status, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'content-type': type });
  res.end(body);
}
function safeJoin(base, target) {
  const targetPath = path.normalize(path.join(base, target));
  if (!targetPath.startsWith(base)) return null;
  return targetPath;
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (Buffer.byteLength(body) > MAX_BODY_BYTES) {
        req.destroy();
        reject(new Error('Request body is too large.'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try { resolve(JSON.parse(body)); }
      catch { reject(new Error('Invalid JSON body.')); }
    });
    req.on('error', reject);
  });
}
function ensureDataFiles() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) saveDb(seedDb());
  if (!fs.existsSync(NEWS_SOURCES_FILE)) atomicWriteJson(NEWS_SOURCES_FILE, defaultNewsSources());
  if (!fs.existsSync(NEWS_CACHE_FILE)) atomicWriteJson(NEWS_CACHE_FILE, defaultNewsCache());
  if (!fs.existsSync(CHAT_FILE)) atomicWriteJson(CHAT_FILE, defaultChat());
  if (!fs.existsSync(USERS_FILE)) {
    const salt = crypto.randomBytes(16).toString('hex');
    const defaultPin = process.env.DEFAULT_USER_PIN || '2026';
    const users = {
      salt,
      users: [
        { id: uid(), name: 'Carlos Lee', loginId: 'carlos.lee', role: 'admin', disabled: false, pinHash: hashPin(defaultPin, salt), createdAt: nowIso(), updatedAt: nowIso() },
        { id: uid(), name: 'js1978.kim', loginId: 'js1978.kim', role: 'editor', disabled: false, pinHash: hashPin(defaultPin, salt), createdAt: nowIso(), updatedAt: nowIso() },
        { id: uid(), name: 'shb.bae', loginId: 'shb.bae', role: 'editor', disabled: false, pinHash: hashPin(defaultPin, salt), createdAt: nowIso(), updatedAt: nowIso() },
        { id: uid(), name: 'ab.sharafat', loginId: 'ab.sharafat', role: 'editor', disabled: false, pinHash: hashPin(defaultPin, salt), createdAt: nowIso(), updatedAt: nowIso() },
        { id: uid(), name: 'ygiz.lee', loginId: 'ygiz.lee', role: 'editor', disabled: false, pinHash: hashPin(defaultPin, salt), createdAt: nowIso(), updatedAt: nowIso() },
        { id: uid(), name: 'hs98.choi', loginId: 'hs98.choi', role: 'editor', disabled: false, pinHash: hashPin(defaultPin, salt), createdAt: nowIso(), updatedAt: nowIso() },
        { id: uid(), name: 'Legacy Admin (Disabled)', loginId: 'admin', role: 'admin', disabled: true, pinHash: hashPin(process.env.ADMIN_PIN || 'change-me-now', salt), createdAt: nowIso(), updatedAt: nowIso() },
        { id: uid(), name: 'Legacy Member (Disabled)', loginId: 'member', role: 'editor', disabled: true, pinHash: hashPin(process.env.MEMBER_PIN || '1111', salt), createdAt: nowIso(), updatedAt: nowIso() },
        { id: uid(), name: 'Legacy Viewer (Disabled)', loginId: 'viewer', role: 'viewer', disabled: true, pinHash: hashPin(process.env.VIEWER_PIN || '2222', salt), createdAt: nowIso(), updatedAt: nowIso() }
      ]
    };
    atomicWriteJson(USERS_FILE, users);
  }
}
function atomicWriteJson(file, obj) {
  const temp = `${file}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(obj, null, 2), 'utf8');
  fs.renameSync(temp, file);
}
function loadDb() {
  ensureDataFiles();
  return normalizeDb(JSON.parse(fs.readFileSync(DB_FILE, 'utf8')));
}
function saveDb(db) {
  normalizeDb(db);
  db.meta = db.meta || {};
  db.meta.updatedAt = nowIso();
  atomicWriteJson(DB_FILE, db);
}
function normalizeIdeaVotes(idea) {
  if (!idea || typeof idea !== 'object') return idea;
  if (!Array.isArray(idea.voteUsers)) {
    idea.voteUsers = [];
  }
  idea.voteUsers = Array.from(new Set(idea.voteUsers.map(String).filter(Boolean)));
  if (idea.baseVotes === undefined || idea.baseVotes === null || idea.baseVotes === '') {
    idea.baseVotes = Number(idea.votes || 0);
  }
  idea.baseVotes = Math.max(0, Number(idea.baseVotes || 0));
  idea.votes = idea.baseVotes + idea.voteUsers.length;
  return idea;
}
function normalizeDb(db) {
  if (!db || typeof db !== 'object') return db;
  ['techs','painPoints','ideas','pocs','vendors','actionItems','meetingNotes','decisionLogs','activity'].forEach(k => { if (!Array.isArray(db[k])) db[k] = []; });
  if (Array.isArray(db.ideas)) db.ideas.forEach(normalizeIdeaVotes);
  return db;
}
function prepareIdeaForSave(body, existing) {
  const item = { ...body };
  if (existing) {
    item.voteUsers = Array.isArray(existing.voteUsers) ? existing.voteUsers : [];
    item.baseVotes = Number(existing.baseVotes !== undefined ? existing.baseVotes : existing.votes || 0);
  } else {
    item.voteUsers = Array.isArray(body.voteUsers) ? Array.from(new Set(body.voteUsers.map(String).filter(Boolean))) : [];
    item.baseVotes = Number(body.baseVotes !== undefined ? body.baseVotes : body.votes || 0);
  }
  return normalizeIdeaVotes(item);
}
function sanitizeFileName(name) {
  const base = path.basename(String(name || 'upload')).replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 80);
  return base || 'upload';
}
function extensionFromMime(mime, originalName) {
  const byMime = {
    'image/jpeg': '.jpg', 'image/png': '.png', 'image/gif': '.gif', 'image/webp': '.webp',
    'video/mp4': '.mp4', 'video/webm': '.webm', 'video/quicktime': '.mov'
  };
  const ext = byMime[String(mime || '').toLowerCase()] || path.extname(String(originalName || '')).toLowerCase();
  return ['.jpg','.jpeg','.png','.gif','.webp','.mp4','.webm','.mov'].includes(ext) ? ext : '';
}
function validateAttachment(a) {
  if (!a || typeof a !== 'object') return false;
  const url = String(a.url || '');
  const mime = String(a.mimeType || '');
  return url.startsWith('/uploads/') && (mime.startsWith('image/') || mime.startsWith('video/')) && Number(a.size || 0) <= MAX_UPLOAD_BYTES;
}
function loadUsers() {
  ensureDataFiles();
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
}
function saveUsers(users) {
  atomicWriteJson(USERS_FILE, users);
}
function publicUser(u) {
  if (!u) return null;
  return { id: u.id, name: u.name, loginId: u.loginId, role: u.role, disabled: !!u.disabled, createdAt: u.createdAt, updatedAt: u.updatedAt };
}
function authFrom(req) {
  const id = req.headers['x-user-id'];
  const usersDb = loadUsers();
  const user = usersDb.users.find(u => u.id === id && !u.disabled);
  return publicUser(user);
}
function requireWrite(req, res) {
  const user = authFrom(req);
  if (!user) { jsonResponse(res, 401, { error: '로그인이 필요합니다.' }); return null; }
  if (!writeRoles.has(user.role)) { jsonResponse(res, 403, { error: '편집 권한이 없습니다.' }); return null; }
  return user;
}
function requireAdmin(req, res) {
  const user = authFrom(req);
  if (!user) { jsonResponse(res, 401, { error: '로그인이 필요합니다.' }); return null; }
  if (!adminRoles.has(user.role)) { jsonResponse(res, 403, { error: '관리자 권한이 필요합니다.' }); return null; }
  return user;
}
function addActivity(db, user, action, target, title) {
  db.activity = db.activity || [];
  db.activity.unshift({ id: uid(), at: nowIso(), user: user?.name || 'System', action, target, title: String(title || '').slice(0, 200) });
  db.activity = db.activity.slice(0, 300);
}
function broadcast(type, payload = {}) {
  const event = `event: ${type}\ndata: ${JSON.stringify({ ...payload, at: nowIso() })}\n\n`;
  for (const res of sseClients) {
    try { res.write(event); } catch { sseClients.delete(res); sseMeta.delete(res); }
  }
}
function activePresence() {
  const map = new Map();
  for (const meta of sseMeta.values()) {
    if (!meta || !meta.userId) continue;
    const prev = map.get(meta.userId);
    if (prev) {
      prev.connections += 1;
      if (new Date(meta.connectedAt) > new Date(prev.connectedAt)) prev.connectedAt = meta.connectedAt;
      prev.lastSeen = nowIso();
    } else {
      map.set(meta.userId, { ...meta, connections: 1, lastSeen: nowIso() });
    }
  }
  return Array.from(map.values()).sort((a,b) => String(a.name || '').localeCompare(String(b.name || '')));
}
function broadcastPresence() {
  broadcast('presence', { users: activePresence() });
}
function publicUsersList() {
  const usersDb = loadUsers();
  return usersDb.users.filter(u => !u.disabled).map(publicUser);
}
function extractMentions(message) {
  const tokens = String(message || '').match(/@([a-zA-Z0-9._-]+)/g) || [];
  if (!tokens.length) return [];
  const wanted = new Set(tokens.map(t => t.slice(1).toLowerCase()));
  const users = publicUsersList();
  return users.filter(u => wanted.has(String(u.loginId || '').toLowerCase()))
    .map(u => ({ id: u.id, loginId: u.loginId, name: u.name }));
}

function seedDb() {
  const created = nowIso();
  const tech1 = uid();
  const tech2 = uid();
  const tech3 = uid();
  const tech4 = uid();
  return {
    meta: { app: 'Construction Automation & Robotics Radar', version: '6.0.0-productivity-suite', createdAt: created, updatedAt: created },
    techs: [
      {
        id: tech1, title: 'Tank External Coating Robot', category: 'Robotics', trade: 'Painting',
        problem: '탱크 외벽 도장 고소작업 위험과 생산성 편차 저감', location: 'FGIP / Tank Farm', vendor: 'Qlayer / VertiDrive 후보', owner: '김종성', trl: 7,
        difficulty: 'Medium', productivity: 16, safety: 14, cost: 7, scalability: 8, status: 'Trial',
        nextAction: 'FGIP 적용 시 생산성 측정 Template 작성 및 Vendor Demo 요청',
        notes: '외벽 도장과 Blasting 기능 범위 구분 필요. 방폭, 표면 곡률, 도막 품질 기준 확인.', links: '',
        createdAt: created, updatedAt: created, updatedBy: 'System'
      },
      {
        id: tech2, title: 'Air Dome for Mobile Production Base', category: 'Temporary Facility', trade: 'Module',
        problem: '중동 사막 환경에서 모듈 제작 품질·작업환경·일정 안정성 확보', location: 'Mobile Production Base / Module Yard', vendor: 'BROADWELL / MOVEX / Liri', owner: '이영규', trl: 6,
        difficulty: 'High', productivity: 14, safety: 10, cost: 5, scalability: 8, status: 'Assess',
        nextAction: 'FOB 조건 통일, Over Spec. 조정, 견적 기준 Clarification',
        notes: '180m×200m×H60m 대형안은 기초, 운송, 블로워, 비상전원 조건 재검토 필요.', links: '',
        createdAt: created, updatedAt: created, updatedBy: 'System'
      },
      {
        id: tech3, title: 'Quadruped Robot for Site Monitoring', category: 'Robotics', trade: 'Quality',
        problem: '반복 순찰, 진척 촬영, 안전 점검의 인력 의존도 완화', location: 'Oil & Gas Construction Site', vendor: 'DEEPRobotics / Spot 비교', owner: 'Abubakar', trl: 6,
        difficulty: 'Medium', productivity: 12, safety: 12, cost: 6, scalability: 7, status: 'Assess',
        nextAction: 'SLAM, 자율주행, 현장 통신, 데이터 연계 기능 비교표 작성',
        notes: '비정형 지형, 계단, 방폭구역, 배터리 운용시간 확인 필요.', links: '',
        createdAt: created, updatedAt: created, updatedBy: 'System'
      },
      {
        id: tech4, title: 'Autonomous Material Carrier', category: 'Autonomous Equipment', trade: 'Logistics',
        problem: 'Yard 내 자재 운반 대기시간과 위치 파악 지연 감소', location: 'Module Yard / Pipe Shop', vendor: 'AppliedEV 등', owner: '배성현', trl: 5,
        difficulty: 'High', productivity: 17, safety: 9, cost: 6, scalability: 8, status: 'Watch',
        nextAction: '운반 대상, 중량, 동선, 안전구역 기준 정의',
        notes: '자율주행 자체보다 현장 물류 운영체계와 인터페이스 설계가 선행 필요.', links: '',
        createdAt: created, updatedAt: created, updatedBy: 'System'
      }
    ],
    painPoints: [
      { id: uid(), title: 'Tank 도장 작업의 고소작업 위험', trade: 'Painting', area: 'Tank Farm', currentMethod: '비계 또는 고소장비 기반 수작업', impact: '안전 Risk, 작업속도 편차, 품질 균일성 저하', recurrence: 'Common Across Projects', potential: 'High', owner: '김종성', linkedTech: 'Tank External Coating Robot', priority: 'High', createdAt: created, updatedAt: created, updatedBy: 'System' },
      { id: uid(), title: 'Module Yard 자재 위치 탐색 지연', trade: 'Logistics', area: 'Yard', currentMethod: '작업자 확인 및 수기 Tracking', impact: '장비 대기, Work Front 지연, 생산성 저하', recurrence: 'Repeated', potential: 'High', owner: '배성현', linkedTech: 'Autonomous Material Carrier', priority: 'Medium', createdAt: created, updatedAt: created, updatedBy: 'System' },
      { id: uid(), title: '사막 환경의 모듈 제작 품질 편차', trade: 'Module', area: 'Temporary Facility', currentMethod: '옥외 제작 또는 부분 차폐', impact: '온도, 분진, 풍속에 따른 품질·작업성 저하', recurrence: 'Common Across Projects', potential: 'Medium', owner: '이영규', linkedTech: 'Air Dome for Mobile Production Base', priority: 'High', createdAt: created, updatedAt: created, updatedBy: 'System' }
    ],
    ideas: [
      { id: uid(), title: 'Tank Robot PoC 생산성 측정 Template 표준화', proposer: '김종성', trade: 'Painting', description: '㎡/hr, 도막 두께 편차, 재작업률, 장비 Setup time을 공통 지표로 관리', benefit: 'PoC 결과의 경영진 보고 신뢰도 향상', difficulty: 'Low', votes: 12, status: 'Selected', linkedTech: 'Tank External Coating Robot', createdAt: created, updatedAt: created, updatedBy: 'System' },
      { id: uid(), title: 'Air Dome 내부 자재 위치 Tracking', proposer: '이영규', trade: 'Module', description: '에어돔 내부 Module 제작구역에서 RFID/UWB/QR 기반 자재 위치관리 검토', benefit: '자재 탐색시간과 장비 대기시간 감소', difficulty: 'Medium', votes: 7, status: 'Discussing', linkedTech: 'Air Dome for Mobile Production Base', createdAt: created, updatedAt: created, updatedBy: 'System' },
      { id: uid(), title: '4족 보행로봇 자동 진척 촬영 Routine', proposer: 'Abubakar', trade: 'Quality', description: '정해진 경로에서 매일 동일 시점 촬영 후 AI 분석과 연계', benefit: '진척률, 품질, 안전 데이터를 자동 축적', difficulty: 'Medium', votes: 9, status: 'New', linkedTech: 'Quadruped Robot for Site Monitoring', createdAt: created, updatedAt: created, updatedBy: 'System' }
    ],
    pocs: [
      { id: uid(), title: 'FGIP Tank Coating Robot PoC', linkedTech: 'Tank External Coating Robot', owner: '김종성', stage: 'Test Plan', start: '2026-06-20', end: '2026-07-15', kpi: '㎡/hr, 도막 두께 편차, Setup time, 고소작업 감소율', result: 'KPI 정의 및 현장 투입 조건 검토 중', status: 'Open', createdAt: created, updatedAt: created, updatedBy: 'System' },
      { id: uid(), title: 'Quadruped Robot SLAM Mapping Review', linkedTech: 'Quadruped Robot for Site Monitoring', owner: 'Abubakar', stage: 'Pre-Review', start: '2026-06-20', end: '2026-07-10', kpi: 'SLAM 정확도, 주행시간, 데이터 연계성, 현장 적용 제약', result: 'Vendor 자료 취합 필요', status: 'Open', createdAt: created, updatedAt: created, updatedBy: 'System' }
    ],
    vendors: [
      { id: uid(), name: 'Qlayer', technology: 'Tank Coating Robot', contact: '', status: 'Data Requested', nextDate: '2026-06-25', owner: '김종성', notes: '도장 범위, Blasting 가능 여부, 방폭 대응 확인 필요', createdAt: created, updatedAt: created, updatedBy: 'System' },
      { id: uid(), name: 'BROADWELL / MOVEX', technology: 'Air Dome', contact: '정훈 이사', status: 'Clarification', nextDate: '2026-06-18', owner: '이영규', notes: 'FOB 조건, Over Spec. 조정, 견적 기준 명확화 필요', createdAt: created, updatedAt: created, updatedBy: 'System' },
      { id: uid(), name: 'DEEPRobotics', technology: 'Quadruped Robot', contact: '', status: 'Contact Needed', nextDate: '2026-06-28', owner: 'Abubakar', notes: 'SLAM, 자율주행, 현장 순찰 적용성 확인', createdAt: created, updatedAt: created, updatedBy: 'System' }
    ],
    actionItems: [
      { id: uid(), title: '초기 Pilot 사용성 Feedback 취합', owner: 'carlos.lee', dueDate: '', status: 'Open', priority: 'Medium', sourceType: 'System', sourceId: '', description: '그룹원 사용성 테스트 결과를 수집하여 다음 개선항목을 정의합니다.', createdAt: created, updatedAt: created, updatedBy: 'System' }
    ],
    meetingNotes: [
      { id: uid(), title: '주간 자동화·로보틱스 Stand-up', date: today(), attendees: 'carlos.lee, js1978.kim, shb.bae, ab.sharafat, ygiz.lee, hs98.choi', agenda: '1) 신규 기술 / 기사 공유\n2) 진행 중 PoC 이슈\n3) Vendor Follow-up\n4) 금주 Action Item 확정', discussion: 'App Pilot 운영 및 기능 개선 방향을 검토합니다.', decisions: '개인별 계정 기반으로 운영하고, Chat에서 도출된 사항은 Action Item으로 전환합니다.', actions: '각 담당자는 본인 Action Item을 My Work Queue에서 확인합니다.', createdAt: created, updatedAt: created, updatedBy: 'System' }
    ],
    decisionLogs: [
      { id: uid(), title: 'Radar App Pilot 운영 방식', date: today(), owner: 'carlos.lee', status: 'Active', context: '자동화·로보틱스 기술 발굴과 PoC 후보 관리를 위해 그룹 공용 App을 Pilot 운영합니다.', options: '1) 공용 계정 운영\n2) 개인별 Knox ID 운영\n3) 정식 사내 서버 전환', decision: '개인별 Knox ID 기반으로 운영하고, 로컬 PC 서버 기반 Pilot 후 사내 서버 전환 여부를 검토합니다.', rationale: '작성자/투표/멘션/Action Item 추적을 위해 개인별 계정이 필요합니다.', nextReview: '', createdAt: created, updatedAt: created, updatedBy: 'System' }
    ],
    activity: [
      { id: uid(), at: created, user: 'System', action: 'seed', target: 'database', title: '초기 자동화·로보틱스 Radar 데이터 생성' }
    ]
  };
}

function defaultNewsSources() {
  return [
    {
      id: uid(),
      name: 'Google News KR - 건설 자동화/로봇',
      language: 'Korean',
      url: 'https://news.google.com/rss/search?q=%EA%B1%B4%EC%84%A4%20%EC%9E%90%EB%8F%99%ED%99%94%20OR%20%EA%B1%B4%EC%84%A4%20%EB%A1%9C%EB%B4%87%20OR%20%EC%8A%A4%EB%A7%88%ED%8A%B8%EA%B1%B4%EC%84%A4&hl=ko&gl=KR&ceid=KR:ko',
      enabled: true
    },
    {
      id: uid(),
      name: 'Google News EN - Construction Robotics',
      language: 'English',
      url: 'https://news.google.com/rss/search?q=%22construction%20robotics%22%20OR%20%22construction%20automation%22%20OR%20%22autonomous%20construction%20equipment%22&hl=en-US&gl=US&ceid=US:en',
      enabled: true
    },
    {
      id: uid(),
      name: 'Google News EN - Physical AI / Humanoid',
      language: 'English',
      url: 'https://news.google.com/rss/search?q=%22physical%20AI%22%20OR%20%22humanoid%20robot%22%20construction%20OR%20%22robotic%20inspection%22&hl=en-US&gl=US&ceid=US:en',
      enabled: true
    }
  ];
}

function defaultNewsCache() {
  const created = nowIso();
  return {
    meta: {
      app: 'Construction Automation & Robotics News Radar',
      version: '5.0.0-slack-collab',
      createdAt: created,
      updatedAt: created,
      lastRefreshAt: null,
      lastRefreshStatus: 'Not refreshed yet. Use Refresh News in the app.'
    },
    items: [
      {
        id: uid(),
        title: 'Sample: Construction automation news will appear here after refresh',
        source: 'System Sample',
        language: 'English',
        category: 'Construction Tech',
        publishedAt: created,
        summary: 'This sample item confirms that the News Radar menu is working. Click Refresh News after the server PC has internet access.',
        link: '',
        relevance: 50,
        saved: false,
        manual: true,
        createdAt: created,
        updatedAt: created
      }
    ]
  };
}



function defaultChat() {
  const created = nowIso();
  return {
    meta: {
      app: 'Construction Automation & Robotics Team Chat',
      version: '5.0.0-slack-collab',
      createdAt: created,
      updatedAt: created
    },
    channels: options.chatChannels,
    messages: [
      {
        id: uid(),
        channel: 'General',
        message: 'Team Chat 기능이 활성화되었습니다. 메시지뿐 아니라 이미지·동영상 첨부도 가능합니다. 자동화·로보틱스 기술, Vendor, PoC, News 관련 논의를 채널별로 공유할 수 있습니다.',
        userId: 'system',
        userName: 'System',
        role: 'system',
        createdAt: created,
        updatedAt: created
      }
    ]
  };
}

function normalizeChat(chat) {
  chat = chat && typeof chat === 'object' ? chat : defaultChat();
  chat.channels = Array.isArray(chat.channels) && chat.channels.length ? chat.channels : options.chatChannels;
  chat.messages = Array.isArray(chat.messages) ? chat.messages : [];
  chat.messages.forEach(m => {
    if (!m.id) m.id = uid();
    if (!Array.isArray(m.mentions)) m.mentions = [];
    if (!Array.isArray(m.attachments)) m.attachments = [];
    if (!Array.isArray(m.savedBy)) m.savedBy = [];
    if (!m.reactions || typeof m.reactions !== 'object') m.reactions = {};
    m.pinned = !!m.pinned;
    m.parentId = m.parentId || '';
  });
  return chat;
}
function loadChat() {
  ensureDataFiles();
  const chat = JSON.parse(fs.readFileSync(CHAT_FILE, 'utf8'));
  return normalizeChat(chat);
}

function saveChat(chat) {
  chat.meta = chat.meta || {};
  chat.meta.updatedAt = nowIso();
  normalizeChat(chat);
  chat.channels = Array.isArray(chat.channels) && chat.channels.length ? chat.channels : options.chatChannels;
  chat.messages = Array.isArray(chat.messages) ? chat.messages.slice(-1600) : [];
  atomicWriteJson(CHAT_FILE, chat);
}

function loadNewsSources() {
  ensureDataFiles();
  return JSON.parse(fs.readFileSync(NEWS_SOURCES_FILE, 'utf8'));
}
function saveNewsSources(sources) { atomicWriteJson(NEWS_SOURCES_FILE, sources); }
function loadNewsCache() {
  ensureDataFiles();
  return JSON.parse(fs.readFileSync(NEWS_CACHE_FILE, 'utf8'));
}
function saveNewsCache(cache) {
  cache.meta = cache.meta || {};
  cache.meta.updatedAt = nowIso();
  atomicWriteJson(NEWS_CACHE_FILE, cache);
}
function decodeXml(str) {
  return String(str || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
function firstTag(xml, tag) {
  const re = new RegExp('<' + tag + '(?:\\s[^>]*)?>([\\s\\S]*?)<\\/' + tag + '>', 'i');
  const m = xml.match(re);
  return m ? decodeXml(m[1]) : '';
}
function attrTag(xml, tag, attr) {
  const re = new RegExp("<" + tag + "[^>]*\\s" + attr + "=[\"\']([^\"\']+)[\"\'][^>]*>", "i");
  const m = xml.match(re);
  return m ? decodeXml(m[1]) : '';
}
function classifyNews(title, summary) {
  const text = `${title || ''} ${summary || ''}`.toLowerCase();
  if (/humanoid|physical ai|foundation model/.test(text)) return 'Physical AI';
  if (/drone|uav|uas/.test(text)) return 'Drone';
  if (/autonomous|machine control|equipment|excavator|dozer|truck/.test(text)) return 'Autonomous Equipment';
  if (/robot|robotic|로봇/.test(text)) return 'Robotics';
  if (/automation|automated|자동화/.test(text)) return 'Automation';
  if (/safety|안전/.test(text)) return 'Safety';
  if (/productivity|생산성/.test(text)) return 'Productivity';
  return 'Construction Tech';
}
function newsRelevance(title, summary) {
  const text = `${title || ''} ${summary || ''}`.toLowerCase();
  const rules = [
    [/construction|건설|plant|epc|site|yard|module|fabrication|현장|플랜트|모듈|시공/g, 12],
    [/robot|robotic|로봇|automation|자동화|autonomous|자율|physical ai|humanoid|휴머노이드/g, 18],
    [/drone|uav|inspection|점검|coating|painting|welding|용접|도장|equipment|장비/g, 10],
    [/safety|productivity|quality|schedule|안전|생산성|품질|공정/g, 8]
  ];
  let score = 30;
  for (const [re, weight] of rules) {
    const matches = text.match(re);
    if (matches) score += Math.min(30, matches.length * weight);
  }
  return Math.max(0, Math.min(100, score));
}
function parseNewsDate(v) {
  if (!v) return '';
  const d = new Date(v);
  return isNaN(d) ? String(v) : d.toISOString();
}
function parseRss(xml, source) {
  const items = [];
  const itemRe = /<item[\s\S]*?<\/item>/gi;
  const entryRe = /<entry[\s\S]*?<\/entry>/gi;
  let blocks = xml.match(itemRe) || [];
  if (!blocks.length) blocks = xml.match(entryRe) || [];
  for (const block of blocks) {
    const title = firstTag(block, 'title');
    const summary = firstTag(block, 'description') || firstTag(block, 'summary') || firstTag(block, 'content');
    let link = firstTag(block, 'link') || attrTag(block, 'link', 'href');
    const publishedAt = parseNewsDate(firstTag(block, 'pubDate') || firstTag(block, 'published') || firstTag(block, 'updated'));
    if (!title) continue;
    const category = classifyNews(title, summary);
    items.push({
      id: crypto.createHash('sha1').update(`${source.name}|${title}|${link}`).digest('hex'),
      title: title.slice(0, 260),
      source: source.name,
      language: source.language || 'Other',
      category,
      publishedAt,
      summary: summary.slice(0, 700),
      link,
      relevance: newsRelevance(title, summary),
      saved: false,
      manual: false,
      createdAt: nowIso(),
      updatedAt: nowIso()
    });
  }
  return items;
}
function fetchText(targetUrl, redirects = 0) {
  return new Promise((resolve, reject) => {
    let parsed;
    try { parsed = new URL(targetUrl); } catch (e) { reject(new Error('Invalid URL: ' + targetUrl)); return; }
    const lib = parsed.protocol === 'https:' ? https : http;
    const req = lib.get(parsed, { headers: { 'user-agent': 'CA-Robotics-Radar/3.0' }, timeout: 15000 }, (response) => {
      const code = response.statusCode || 0;
      if (code >= 300 && code < 400 && response.headers.location && redirects < 5) {
        response.resume();
        const nextUrl = new URL(response.headers.location, targetUrl).toString();
        fetchText(nextUrl, redirects + 1).then(resolve).catch(reject);
        return;
      }
      if (code < 200 || code >= 300) {
        response.resume();
        reject(new Error('HTTP ' + code + ' for ' + targetUrl));
        return;
      }
      let data = '';
      response.setEncoding('utf8');
      response.on('data', chunk => {
        data += chunk;
        if (data.length > 2500000) req.destroy(new Error('News feed is too large.'));
      });
      response.on('end', () => resolve(data));
    });
    req.on('timeout', () => req.destroy(new Error('News request timeout.')));
    req.on('error', reject);
  });
}
async function refreshNewsCache(user) {
  const sources = loadNewsSources().filter(s => s.enabled !== false && s.url);
  const previous = loadNewsCache();
  const existingManual = (previous.items || []).filter(i => i.manual);
  const existingSaved = new Set((previous.items || []).filter(i => i.saved).map(i => i.id));
  const errors = [];
  let fetched = [];
  for (const source of sources) {
    try {
      const xml = await fetchText(source.url);
      fetched = fetched.concat(parseRss(xml, source));
    } catch (e) {
      errors.push({ source: source.name, error: e.message });
    }
  }
  const map = new Map();
  for (const item of existingManual.concat(fetched)) {
    if (existingSaved.has(item.id)) item.saved = true;
    if (!map.has(item.id)) map.set(item.id, item);
  }
  const items = Array.from(map.values()).sort((a, b) => {
    const da = Date.parse(a.publishedAt || a.createdAt || '') || 0;
    const db = Date.parse(b.publishedAt || b.createdAt || '') || 0;
    return db - da || Number(b.relevance || 0) - Number(a.relevance || 0);
  }).slice(0, 200);
  const cache = {
    meta: {
      app: 'Construction Automation & Robotics News Radar',
      version: '5.0.0-slack-collab',
      updatedAt: nowIso(),
      lastRefreshAt: nowIso(),
      lastRefreshBy: user ? user.name : 'System',
      lastRefreshStatus: errors.length ? `${items.length} articles loaded with ${errors.length} source error(s).` : `${items.length} articles loaded successfully.`,
      errors
    },
    items
  };
  saveNewsCache(cache);
  return cache;
}

function scoreTech(t) {
  const diffScore = { Low: 10, Medium: 6, High: 3 }[t.difficulty] ?? 5;
  const trlScore = Math.round((Number(t.trl || 0) / 9) * 15);
  const painFit = Math.min(20, Math.round(((Number(t.productivity || 0) + Number(t.safety || 0)) / 35) * 20));
  return Math.min(100, Math.round(painFit + Number(t.productivity || 0) + Number(t.safety || 0) + trlScore + diffScore + Number(t.cost || 0) + Number(t.scalability || 0)));
}
function recommendation(score) {
  if (score >= 85) return '우선 PoC';
  if (score >= 70) return '검토 지속';
  if (score >= 50) return '관찰 대상';
  return '보류';
}
function buildReport(db) {
  const techs = [...db.techs].map(t => ({ ...t, score: scoreTech(t), rec: recommendation(scoreTech(t)) })).sort((a, b) => b.score - a.score);
  const openPoc = db.pocs.filter(p => p.status !== 'Closed');
  const dueVendors = db.vendors.filter(v => v.nextDate && v.nextDate <= today() && v.status !== 'Closed');
  const highPain = db.painPoints.filter(p => p.priority === 'High');
  const lines = [];
  lines.push('[Construction Automation & Robotics Radar 주간 요약]');
  lines.push(`작성일: ${today()}`);
  lines.push('');
  lines.push('1. 핵심 요지');
  lines.push(`- 총 기술 카드 ${db.techs.length}건, 진행 중 PoC ${openPoc.length}건, High Pain Point ${highPain.length}건, Follow-up 필요 Vendor ${dueVendors.length}건입니다.`);
  if (techs[0]) lines.push(`- 우선 검토 기술은 '${techs[0].title}'이며 평가점수 ${techs[0].score}점, 권고는 '${techs[0].rec}'입니다.`);
  lines.push('');
  lines.push('2. 우선 검토 기술 Top 5');
  techs.slice(0, 5).forEach((t, idx) => lines.push(`${idx + 1}) ${t.title} / ${t.trade} / ${t.status} / ${t.score}점 / ${t.rec} / Owner: ${t.owner || '-'}`));
  lines.push('');
  lines.push('3. 진행 중 PoC');
  if (!openPoc.length) lines.push('- 진행 중 PoC 없음');
  openPoc.forEach(p => lines.push(`- ${p.title}: ${p.stage}, 기간 ${p.start || '-'}~${p.end || '-'}, KPI: ${p.kpi || '-'}`));
  lines.push('');
  lines.push('4. Vendor Follow-up');
  if (!dueVendors.length) lines.push('- 기한 도래 또는 지연 Vendor Follow-up 없음');
  dueVendors.forEach(v => lines.push(`- ${v.name} / ${v.technology}: ${v.status}, 다음 일정 ${v.nextDate}, Owner: ${v.owner || '-'}`));
  lines.push('');
  const newsCache = loadNewsCache();
  const topNews = (newsCache.items || []).slice().sort((a, b) => Number(b.relevance || 0) - Number(a.relevance || 0)).slice(0, 5);
  lines.push('');
  lines.push('5. 최신 기술 기사 Top 5');
  if (!topNews.length) lines.push('- 수집된 기사 없음');
  topNews.forEach((n, idx) => lines.push(`${idx + 1}) ${n.title} / ${n.source || '-'} / ${n.category || '-'} / 관련도 ${n.relevance || 0}`));
  lines.push('');
  lines.push('6. 다음 조치');
  lines.push('- Trial/Assess 기술은 현장 Pain Point와 연결성을 재확인하고 PoC KPI를 선행 확정해야 합니다.');
  lines.push('- Vendor Clarification은 견적 조건, 적용 범위, Reference, 현장 제약을 분리하여 회신 받아야 합니다.');
  lines.push('- PoC 완료 건은 결과를 절차서, 체크리스트, Vendor Pool로 전환할지 판단해야 합니다.');
  return lines.join('\n');
}

const sseClients = new Set();
const sseMeta = new Map();

async function handleApi(req, res, url) {
  const method = req.method;
  const pathname = url.pathname;

  if (pathname === '/api/health') {
    jsonResponse(res, 200, { ok: true, app: 'CA Robotics Radar', version: '5.0.0-slack-collab', time: nowIso() });
    return;
  }

  if (pathname === '/api/events') {
    res.writeHead(200, {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      'connection': 'keep-alive',
      'x-accel-buffering': 'no'
    });
    const userId = String(url.searchParams.get('userId') || '').trim();
    let meta = { userId: '', name: 'Guest', loginId: '', role: 'guest', connectedAt: nowIso(), lastSeen: nowIso() };
    if (userId) {
      try {
        const usersDb = loadUsers();
        const found = usersDb.users.find(u => u.id === userId && !u.disabled);
        if (found) meta = { userId: found.id, name: found.name, loginId: found.loginId, role: found.role, connectedAt: nowIso(), lastSeen: nowIso() };
      } catch (e) {}
    }
    res.write(`event: connected\ndata: ${JSON.stringify({ at: nowIso(), user: meta, presence: activePresence() })}\n\n`);
    sseClients.add(res);
    sseMeta.set(res, meta);
    broadcastPresence();
    const ping = setInterval(() => {
      try { res.write(`event: ping\ndata: ${JSON.stringify({ at: nowIso() })}\n\n`); } catch(e) {}
    }, 25000);
    req.on('close', () => { clearInterval(ping); sseClients.delete(res); sseMeta.delete(res); broadcastPresence(); });
    return;
  }

  if (pathname === '/api/presence' && method === 'GET') {
    jsonResponse(res, 200, { users: activePresence(), at: nowIso() });
    return;
  }

  if (pathname === '/api/login' && method === 'POST') {
    try {
      const body = await readBody(req);
      const loginId = String(body.loginId || '').trim();
      const pin = String(body.pin || '');
      const usersDb = loadUsers();
      const found = usersDb.users.find(u => u.loginId === loginId);
      if (!found || found.disabled || found.pinHash !== hashPin(pin, usersDb.salt)) {
        jsonResponse(res, 401, { error: '로그인 ID 또는 PIN이 올바르지 않습니다.' });
        return;
      }
      jsonResponse(res, 200, { user: publicUser(found) });
    } catch (e) { jsonResponse(res, 400, { error: e.message }); }
    return;
  }

  if (pathname === '/api/me' && method === 'GET') {
    const user = authFrom(req);
    if (!user) { jsonResponse(res, 401, { error: '저장된 로그인 정보가 유효하지 않습니다.' }); return; }
    jsonResponse(res, 200, { user });
    return;
  }

  if (pathname === '/api/users' && method === 'GET') {
    const user = requireAdmin(req, res); if (!user) return;
    const usersDb = loadUsers();
    jsonResponse(res, 200, { users: usersDb.users.map(publicUser) });
    return;
  }

  if (pathname === '/api/users' && method === 'POST') {
    const user = requireAdmin(req, res); if (!user) return;
    try {
      const body = await readBody(req);
      const loginId = String(body.loginId || '').trim();
      const name = String(body.name || '').trim();
      const role = String(body.role || 'editor');
      const pin = String(body.pin || '').trim();
      if (!loginId || !name || !pin) throw new Error('name, loginId, pin은 필수입니다.');
      if (!['admin', 'editor', 'viewer'].includes(role)) throw new Error('role 값이 올바르지 않습니다.');
      const usersDb = loadUsers();
      if (usersDb.users.some(u => u.loginId === loginId)) throw new Error('이미 존재하는 loginId입니다.');
      const newUser = { id: uid(), name, loginId, role, disabled: false, pinHash: hashPin(pin, usersDb.salt), createdAt: nowIso(), updatedAt: nowIso() };
      usersDb.users.push(newUser);
      saveUsers(usersDb);
      jsonResponse(res, 201, { user: publicUser(newUser) });
    } catch (e) { jsonResponse(res, 400, { error: e.message }); }
    return;
  }


  const userMatch = pathname.match(/^\/api\/users\/([^/]+)$/);
  if (userMatch && (method === 'PUT' || method === 'DELETE')) {
    const admin = requireAdmin(req, res); if (!admin) return;
    const targetId = userMatch[1];
    try {
      const usersDb = loadUsers();
      const idx = usersDb.users.findIndex(u => u.id === targetId);
      if (idx < 0) { jsonResponse(res, 404, { error: '사용자를 찾을 수 없습니다.' }); return; }
      const activeAdmins = usersDb.users.filter(u => u.role === 'admin' && !u.disabled);
      const target = usersDb.users[idx];

      if (method === 'DELETE') {
        if (target.role === 'admin' && activeAdmins.length <= 1) throw new Error('마지막 활성 admin 계정은 삭제할 수 없습니다.');
        usersDb.users.splice(idx, 1);
        saveUsers(usersDb);
        jsonResponse(res, 200, { users: usersDb.users.map(publicUser) });
        return;
      }

      const body = await readBody(req);
      const name = String(body.name || target.name || '').trim();
      const loginId = String(body.loginId || target.loginId || '').trim();
      const role = String(body.role || target.role || 'editor');
      const pin = body.pin === undefined ? '' : String(body.pin || '').trim();
      const disabled = body.disabled === true || body.disabled === 'true' || body.disabled === 'on';
      if (!loginId || !name) throw new Error('name, loginId는 필수입니다.');
      if (!['admin', 'editor', 'viewer'].includes(role)) throw new Error('role 값이 올바르지 않습니다.');
      if (usersDb.users.some((u, i) => i !== idx && u.loginId === loginId)) throw new Error('이미 존재하는 loginId입니다.');
      if (target.role === 'admin' && (role !== 'admin' || disabled) && activeAdmins.length <= 1) throw new Error('마지막 활성 admin 계정은 비활성화하거나 role을 변경할 수 없습니다.');

      target.name = name;
      target.loginId = loginId;
      target.role = role;
      target.disabled = disabled;
      if (pin) target.pinHash = hashPin(pin, usersDb.salt);
      target.updatedAt = nowIso();
      saveUsers(usersDb);
      jsonResponse(res, 200, { user: publicUser(target), users: usersDb.users.map(publicUser) });
    } catch (e) { jsonResponse(res, 400, { error: e.message }); }
    return;
  }

  if (pathname === '/api/bootstrap' && method === 'GET') {
    const db = loadDb();
    jsonResponse(res, 200, { db, options, news: loadNewsCache(), chat: loadChat(), users: publicUsersList(), presence: activePresence(), serverTime: nowIso() });
    return;
  }

  if (pathname === '/api/news' && method === 'GET') {
    jsonResponse(res, 200, { news: loadNewsCache(), sources: loadNewsSources() });
    return;
  }

  if (pathname === '/api/news/refresh' && method === 'POST') {
    const user = requireWrite(req, res); if (!user) return;
    try {
      const news = await refreshNewsCache(user);
      const db = loadDb();
      addActivity(db, user, 'refresh', 'news', news.meta.lastRefreshStatus);
      saveDb(db);
      broadcast('changed', { by: user.name, collection: 'news', action: 'refresh' });
      jsonResponse(res, 200, { news });
    } catch (e) { jsonResponse(res, 400, { error: e.message }); }
    return;
  }

  if (pathname === '/api/news/manual' && method === 'POST') {
    const user = requireWrite(req, res); if (!user) return;
    try {
      const body = await readBody(req);
      const title = String(body.title || '').trim();
      if (!title) throw new Error('기사 제목은 필수입니다.');
      const cache = loadNewsCache();
      const item = {
        id: uid(),
        title,
        source: String(body.source || 'Manual').trim() || 'Manual',
        language: String(body.language || 'Korean'),
        category: String(body.category || classifyNews(body.title, body.summary || '')),
        publishedAt: body.publishedAt ? parseNewsDate(body.publishedAt) : nowIso(),
        summary: String(body.summary || '').slice(0, 700),
        link: String(body.link || '').trim(),
        relevance: Number(body.relevance || newsRelevance(body.title, body.summary || '')),
        saved: false,
        manual: true,
        createdAt: nowIso(),
        updatedAt: nowIso(),
        updatedBy: user.name
      };
      cache.items = cache.items || [];
      cache.items.unshift(item);
      cache.items = cache.items.slice(0, 200);
      cache.meta = cache.meta || {};
      cache.meta.lastManualAddAt = nowIso();
      saveNewsCache(cache);
      const db = loadDb();
      addActivity(db, user, 'create', 'news', item.title);
      saveDb(db);
      broadcast('changed', { by: user.name, collection: 'news', action: 'create', id: item.id });
      jsonResponse(res, 201, { item, news: cache });
    } catch (e) { jsonResponse(res, 400, { error: e.message }); }
    return;
  }

  const newsMatch = pathname.match(/^\/api\/news\/([^/]+)$/);
  if (newsMatch && method === 'DELETE') {
    const user = requireWrite(req, res); if (!user) return;
    const id = newsMatch[1];
    const cache = loadNewsCache();
    const before = (cache.items || []).length;
    cache.items = (cache.items || []).filter(i => i.id !== id);
    if (cache.items.length === before) { jsonResponse(res, 404, { error: 'Article not found.' }); return; }
    saveNewsCache(cache);
    const db = loadDb();
    addActivity(db, user, 'delete', 'news', id);
    saveDb(db);
    broadcast('changed', { by: user.name, collection: 'news', action: 'delete', id });
    jsonResponse(res, 200, { news: cache });
    return;
  }

  const newsSavedMatch = pathname.match(/^\/api\/news\/([^/]+)\/saved$/);
  if (newsSavedMatch && method === 'POST') {
    const user = requireWrite(req, res); if (!user) return;
    const id = newsSavedMatch[1];
    const cache = loadNewsCache();
    const item = (cache.items || []).find(i => i.id === id);
    if (!item) { jsonResponse(res, 404, { error: 'Article not found.' }); return; }
    item.saved = true;
    item.updatedAt = nowIso();
    item.updatedBy = user.name;
    saveNewsCache(cache);
    jsonResponse(res, 200, { item, news: cache });
    return;
  }



  if (pathname === '/api/uploads' && method === 'POST') {
    const user = requireWrite(req, res); if (!user) return;
    try {
      const body = await readBody(req);
      const originalName = sanitizeFileName(body.filename || 'upload');
      const mimeType = String(body.mimeType || '').toLowerCase();
      if (!(mimeType.startsWith('image/') || mimeType.startsWith('video/'))) throw new Error('이미지 또는 동영상 파일만 업로드할 수 있습니다.');
      if (!['image/jpeg','image/png','image/gif','image/webp','video/mp4','video/webm','video/quicktime'].includes(mimeType)) throw new Error('지원 형식: JPG, PNG, GIF, WEBP, MP4, WEBM, MOV');
      let base64 = String(body.data || body.dataUrl || '');
      const m = base64.match(/^data:([^;]+);base64,(.+)$/);
      if (m) base64 = m[2];
      if (!base64) throw new Error('파일 데이터가 없습니다.');
      const buffer = Buffer.from(base64, 'base64');
      if (!buffer.length) throw new Error('파일 데이터가 올바르지 않습니다.');
      if (buffer.length > MAX_UPLOAD_BYTES) throw new Error('파일 1개당 최대 25MB까지 업로드할 수 있습니다. 동영상은 필요한 부분만 짧게 편집해서 올려 주십시오.');
      const ext = extensionFromMime(mimeType, originalName);
      if (!ext) throw new Error('파일 확장자를 확인할 수 없습니다.');
      const fileName = `${Date.now()}_${uid().slice(0, 12)}${ext}`;
      const filePath = path.join(UPLOAD_DIR, fileName);
      fs.writeFileSync(filePath, buffer);
      const attachment = {
        id: uid(),
        originalName,
        filename: fileName,
        mimeType,
        size: buffer.length,
        url: `/uploads/${fileName}`,
        uploadedBy: user.name,
        uploadedAt: nowIso()
      };
      jsonResponse(res, 201, { attachment });
    } catch (e) { jsonResponse(res, 400, { error: e.message }); }
    return;
  }

  if (pathname === '/api/chat' && method === 'GET') {
    jsonResponse(res, 200, { chat: loadChat() });
    return;
  }

  if (pathname === '/api/chat' && method === 'POST') {
    const user = requireWrite(req, res); if (!user) return;
    try {
      const body = await readBody(req);
      const channel = String(body.channel || 'General').trim() || 'General';
      const message = String(body.message || '').trim();
      const attachments = Array.isArray(body.attachments) ? body.attachments.filter(validateAttachment).slice(0, MAX_CHAT_ATTACHMENTS) : [];
      if (!message && !attachments.length) throw new Error('메시지 또는 첨부파일을 입력해야 합니다.');
      if (message.length > 2000) throw new Error('메시지는 2,000자 이하로 입력하십시오.');
      const chat = loadChat();
      if (!chat.channels.includes(channel)) chat.channels.push(channel);
      const mentions = extractMentions(message);
      const parentId = String(body.parentId || '').trim();
      if (parentId && !chat.messages.some(m => m.id === parentId)) throw new Error('Thread 원본 메시지를 찾을 수 없습니다.');
      const item = {
        id: uid(),
        channel,
        message,
        mentions,
        attachments,
        parentId,
        pinned: false,
        savedBy: [],
        reactions: {},
        relatedType: String(body.relatedType || '').trim(),
        relatedId: String(body.relatedId || '').trim(),
        userId: user.id,
        userName: user.name,
        role: user.role,
        createdAt: nowIso(),
        updatedAt: nowIso()
      };
      chat.messages.push(item);
      saveChat(chat);
      const db = loadDb();
      addActivity(db, user, 'chat', channel, message.slice(0, 120));
      saveDb(db);
      broadcast('chat', { by: user.name, byId: user.id, channel, id: item.id, message: item.message, mentions: item.mentions });
      jsonResponse(res, 201, { item, chat });
    } catch (e) { jsonResponse(res, 400, { error: e.message }); }
    return;
  }


  const chatPinMatch = pathname.match(/^\/api\/chat\/([^/]+)\/pin$/);
  if (chatPinMatch && method === 'POST') {
    const user = requireWrite(req, res); if (!user) return;
    const id = chatPinMatch[1];
    try {
      const chat = loadChat();
      const msg = chat.messages.find(m => m.id === id);
      if (!msg) { jsonResponse(res, 404, { error: '메시지를 찾을 수 없습니다.' }); return; }
      msg.pinned = !msg.pinned;
      msg.pinnedAt = msg.pinned ? nowIso() : '';
      msg.pinnedBy = msg.pinned ? user.name : '';
      msg.updatedAt = nowIso();
      saveChat(chat);
      broadcast('chat', { by: user.name, byId: user.id, channel: msg.channel, id: msg.id, action: msg.pinned ? 'pin' : 'unpin' });
      jsonResponse(res, 200, { item: msg, chat });
    } catch (e) { jsonResponse(res, 400, { error: e.message }); }
    return;
  }

  const chatSaveMatch = pathname.match(/^\/api\/chat\/([^/]+)\/save$/);
  if (chatSaveMatch && method === 'POST') {
    const user = requireWrite(req, res); if (!user) return;
    const id = chatSaveMatch[1];
    try {
      const chat = loadChat();
      const msg = chat.messages.find(m => m.id === id);
      if (!msg) { jsonResponse(res, 404, { error: '메시지를 찾을 수 없습니다.' }); return; }
      msg.savedBy = Array.isArray(msg.savedBy) ? msg.savedBy : [];
      const already = msg.savedBy.includes(user.id);
      msg.savedBy = already ? msg.savedBy.filter(x => x !== user.id) : msg.savedBy.concat(user.id);
      msg.updatedAt = nowIso();
      saveChat(chat);
      jsonResponse(res, 200, { item: msg, chat, saved: !already });
    } catch (e) { jsonResponse(res, 400, { error: e.message }); }
    return;
  }

  const chatReactionMatch = pathname.match(/^\/api\/chat\/([^/]+)\/reaction$/);
  if (chatReactionMatch && method === 'POST') {
    const user = requireWrite(req, res); if (!user) return;
    const id = chatReactionMatch[1];
    try {
      const body = await readBody(req);
      const reaction = String(body.reaction || '').trim();
      const allowed = new Set(['👍','👀','✅','⚠️','💡']);
      if (!allowed.has(reaction)) throw new Error('지원하지 않는 Reaction입니다.');
      const chat = loadChat();
      const msg = chat.messages.find(m => m.id === id);
      if (!msg) { jsonResponse(res, 404, { error: '메시지를 찾을 수 없습니다.' }); return; }
      msg.reactions = msg.reactions && typeof msg.reactions === 'object' ? msg.reactions : {};
      const arr = Array.isArray(msg.reactions[reaction]) ? msg.reactions[reaction] : [];
      msg.reactions[reaction] = arr.includes(user.id) ? arr.filter(x => x !== user.id) : arr.concat(user.id);
      msg.updatedAt = nowIso();
      saveChat(chat);
      broadcast('chat', { by: user.name, byId: user.id, channel: msg.channel, id: msg.id, action: 'reaction' });
      jsonResponse(res, 200, { item: msg, chat });
    } catch (e) { jsonResponse(res, 400, { error: e.message }); }
    return;
  }

  const chatThreadMatch = pathname.match(/^\/api\/chat\/([^/]+)\/thread$/);
  if (chatThreadMatch && method === 'POST') {
    const user = requireWrite(req, res); if (!user) return;
    const parentId = chatThreadMatch[1];
    try {
      const body = await readBody(req);
      body.parentId = parentId;
      body.channel = body.channel || 'General';
      const message = String(body.message || '').trim();
      const attachments = Array.isArray(body.attachments) ? body.attachments.filter(validateAttachment).slice(0, MAX_CHAT_ATTACHMENTS) : [];
      if (!message && !attachments.length) throw new Error('Thread 댓글 또는 첨부파일을 입력해야 합니다.');
      const chat = loadChat();
      const parent = chat.messages.find(m => m.id === parentId);
      if (!parent) { jsonResponse(res, 404, { error: 'Thread 원본 메시지를 찾을 수 없습니다.' }); return; }
      const mentions = extractMentions(message);
      const item = { id: uid(), channel: parent.channel || body.channel || 'General', message, mentions, attachments, parentId, pinned:false, savedBy:[], reactions:{}, userId:user.id, userName:user.name, role:user.role, createdAt:nowIso(), updatedAt:nowIso() };
      chat.messages.push(item);
      saveChat(chat);
      const db = loadDb(); addActivity(db, user, 'thread', parent.channel || 'General', message.slice(0,120)); saveDb(db);
      broadcast('chat', { by:user.name, byId:user.id, channel:item.channel, id:item.id, parentId, message:item.message, mentions:item.mentions, action:'thread' });
      jsonResponse(res, 201, { item, chat });
    } catch (e) { jsonResponse(res, 400, { error: e.message }); }
    return;
  }

  const chatMatch = pathname.match(/^\/api\/chat\/([^/]+)$/);
  if (chatMatch && method === 'DELETE') {
    const user = requireWrite(req, res); if (!user) return;
    const id = chatMatch[1];
    try {
      const chat = loadChat();
      const idx = chat.messages.findIndex(m => m.id === id);
      if (idx < 0) { jsonResponse(res, 404, { error: '메시지를 찾을 수 없습니다.' }); return; }
      const msg = chat.messages[idx];
      if (user.role !== 'admin' && msg.userId !== user.id) { jsonResponse(res, 403, { error: '본인 메시지 또는 admin만 삭제할 수 있습니다.' }); return; }
      chat.messages.splice(idx, 1);
      saveChat(chat);
      broadcast('chat', { by: user.name, channel: msg.channel, action: 'delete', id });
      jsonResponse(res, 200, { chat });
    } catch (e) { jsonResponse(res, 400, { error: e.message }); }
    return;
  }

  if (pathname === '/api/report' && method === 'GET') {
    const db = loadDb();
    jsonResponse(res, 200, { report: buildReport(db) });
    return;
  }

  if (pathname === '/api/export' && method === 'GET') {
    const db = loadDb();
    res.writeHead(200, {
      'content-type': 'application/json; charset=utf-8',
      'content-disposition': `attachment; filename="ca-robotics-radar-${today()}.json"`
    });
    res.end(JSON.stringify(db, null, 2));
    return;
  }

  if (pathname === '/api/import' && method === 'POST') {
    const user = requireAdmin(req, res); if (!user) return;
    try {
      const incoming = await readBody(req);
      for (const c of collections) if (!Array.isArray(incoming[c])) incoming[c] = [];
      incoming.meta = incoming.meta || {};
      incoming.meta.importedAt = nowIso();
      incoming.meta.importedBy = user.name;
      incoming.activity = incoming.activity || [];
      addActivity(incoming, user, 'import', 'database', 'JSON 데이터 가져오기');
      saveDb(incoming);
      broadcast('changed', { by: user.name, collection: 'database', action: 'import' });
      jsonResponse(res, 200, { ok: true, db: incoming });
    } catch (e) { jsonResponse(res, 400, { error: e.message }); }
    return;
  }

  const itemMatch = pathname.match(/^\/api\/items\/([^/]+)(?:\/([^/]+))?$/);
  if (itemMatch) {
    const collection = itemMatch[1];
    const id = itemMatch[2];
    if (!collections.has(collection)) { jsonResponse(res, 404, { error: 'Unknown collection.' }); return; }
    const db = loadDb();

    if (method === 'GET') {
      jsonResponse(res, 200, { items: db[collection] || [] });
      return;
    }

    const user = requireWrite(req, res); if (!user) return;
    try {
      const body = await readBody(req);
      db[collection] = db[collection] || [];
      if (method === 'POST') {
        let item = { ...body, id: uid(), createdAt: nowIso(), updatedAt: nowIso(), updatedBy: user.name };
        if (collection === 'ideas') item = prepareIdeaForSave(item, null);
        db[collection].unshift(item);
        addActivity(db, user, 'create', collection, item.title || item.name || item.technology);
        saveDb(db);
        broadcast('changed', { by: user.name, collection, action: 'create', id: item.id });
        jsonResponse(res, 201, { item, db });
        return;
      }
      const idx = db[collection].findIndex(x => x.id === id);
      if (idx < 0) { jsonResponse(res, 404, { error: 'Item not found.' }); return; }
      if (method === 'PUT') {
        const existing = db[collection][idx];
        let item = { ...existing, ...body, id: existing.id, createdAt: existing.createdAt || nowIso(), updatedAt: nowIso(), updatedBy: user.name };
        if (collection === 'ideas') item = prepareIdeaForSave(item, existing);
        db[collection][idx] = item;
        addActivity(db, user, 'update', collection, item.title || item.name || item.technology);
        saveDb(db);
        broadcast('changed', { by: user.name, collection, action: 'update', id: item.id });
        jsonResponse(res, 200, { item, db });
        return;
      }
      if (method === 'DELETE') {
        const [removed] = db[collection].splice(idx, 1);
        addActivity(db, user, 'delete', collection, removed.title || removed.name || removed.technology);
        saveDb(db);
        broadcast('changed', { by: user.name, collection, action: 'delete', id });
        jsonResponse(res, 200, { removed, db });
        return;
      }
    } catch (e) { jsonResponse(res, 400, { error: e.message }); return; }
  }

  const voteMatch = pathname.match(/^\/api\/ideas\/([^/]+)\/vote$/);
  if (voteMatch && method === 'POST') {
    const user = requireWrite(req, res); if (!user) return;
    const id = voteMatch[1];
    const db = loadDb();
    const idea = db.ideas.find(i => i.id === id);
    if (!idea) { jsonResponse(res, 404, { error: 'Idea not found.' }); return; }
    normalizeIdeaVotes(idea);
    const already = idea.voteUsers.includes(user.id);
    if (already) {
      idea.voteUsers = idea.voteUsers.filter(v => v !== user.id);
    } else {
      idea.voteUsers.push(user.id);
    }
    normalizeIdeaVotes(idea);
    idea.updatedAt = nowIso();
    idea.updatedBy = user.name;
    addActivity(db, user, already ? 'unvote' : 'vote', 'ideas', idea.title);
    saveDb(db);
    broadcast('changed', { by: user.name, collection: 'ideas', action: already ? 'unvote' : 'vote', id });
    jsonResponse(res, 200, { item: idea, db, voted: !already });
    return;
  }

  jsonResponse(res, 404, { error: 'API endpoint not found.' });
}

function serveStatic(req, res, url) {
  let pathname = decodeURIComponent(url.pathname);
  let base = PUBLIC_DIR;
  if (pathname.startsWith('/uploads/')) {
    base = UPLOAD_DIR;
    pathname = '/' + pathname.slice('/uploads/'.length);
  } else if (pathname === '/') {
    pathname = '/index.html';
  }
  const filePath = safeJoin(base, pathname);
  if (!filePath) { textResponse(res, 403, 'Forbidden'); return; }
  fs.readFile(filePath, (err, data) => {
    if (err) { textResponse(res, 404, 'Not found'); return; }
    const ext = path.extname(filePath).toLowerCase();
    const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.png':'image/png', '.gif':'image/gif', '.webp':'image/webp', '.mp4':'video/mp4', '.webm':'video/webm', '.mov':'video/quicktime' };
    res.writeHead(200, { 'content-type': types[ext] || 'application/octet-stream', 'cache-control': pathname.startsWith('/uploads/') ? 'private, max-age=86400' : 'no-cache' });
    res.end(data);
  });
}

ensureDataFiles();

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  try {
    if (url.pathname.startsWith('/api/')) await handleApi(req, res, url);
    else serveStatic(req, res, url);
  } catch (e) {
    jsonResponse(res, 500, { error: e.message || 'Server error.' });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Construction Automation & Robotics Radar running at http://${HOST}:${PORT}`);
  console.log('Initial accounts: carlos.lee / 2026 (admin), group member IDs / 2026 (editor). Legacy admin/member/viewer are disabled.');
  console.log('Set DEFAULT_USER_PIN before first run if you want a different initial PIN for all personal accounts.');
});
