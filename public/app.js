const appState = {
  db: null,
  options: null,
  user: JSON.parse(localStorage.getItem('caRadarUser') || 'null'),
  activeTab: 'dashboard',
  query: '',
  newsQuery: '',
  newsCategory: 'All',
  news: null,
  newsSources: [],
  chat: null,
  chatChannel: 'General',
  chatQuery: '',
  chatDraft: '',
  chatFiles: [],
  chatUploading: false,
  chatSearchTimer: null,
  fabrixTemplate: 'weeklyBriefing',
  fabrixContext: 'all',
  fabrixFocus: '',
  fabrixPrompt: '',
  users: [],
  presence: [],
  unreadMentions: 0,
  mentionFlashTimer: null,
  mentionSuggest: { active:false, query:'', start:0, end:0, index:0, users:[] },
  notificationAsked: false,
  presencePanelOpen: false,
  openThreadId: '',
  threadDrafts: {},
  commandText: '',
  productivityFilter: 'my',
  source: null
};

const tabs = [
  ['dashboard', 'Dashboard'],
  ['workhub', 'Work Hub'],
  ['productivity', 'Productivity Center'],
  ['follow', 'My Follow-up'],
  ['baseline', 'Project Baseline'],
  ['radar', 'Technology Radar'],
  ['techs', 'Technology Cards'],
  ['pain', 'Pain Point Bank'],
  ['ideas', 'Idea Board'],
  ['poc', 'PoC Pipeline'],
  ['vendors', 'Vendor Tracker'],
  ['news', 'News Radar'],
  ['chat', 'Team Chat'],
  ['fabrix', 'FabriX Assistant'],
  ['meetings', 'Meeting Notes'],
  ['decisions', 'Decision Log'],
  ['report', 'Report Generator'],
  ['admin', 'Admin / Export']
];

const config = {
  techs: {
    title: 'Technology Card', label: '기술 카드', idField: 'title',
    fields: [
      ['title','기술명','text','span-2'], ['status','Radar 상태','select:radarStatuses',''], ['category','기술 분류','select:categories',''], ['trade','적용 공종','select:trades',''], ['owner','Owner','text',''],
      ['problem','해결하려는 문제','textarea','span-3'], ['location','적용 위치/현장','text',''], ['vendor','Vendor / 기관','text',''], ['trl','TRL 1~9','number',''],
      ['difficulty','적용 난이도','select:difficulties',''], ['productivity','생산성 점수 0~20','number',''], ['safety','안전 점수 0~15','number',''], ['cost','비용효과 0~10','number',''], ['scalability','확산성 0~10','number',''],
      ['nextAction','다음 Action','textarea','span-3'], ['notes','검토 메모 / Risk','textarea','span-3'], ['links','자료 링크','textarea','span-3']
    ]
  },
  painPoints: {
    title: 'Pain Point', label: '현장 Pain Point', idField: 'title',
    fields: [
      ['title','현장 문제','text','span-2'], ['priority','우선순위','select:priorities',''], ['trade','공종','select:trades',''], ['area','발생 위치','text',''], ['owner','Owner','text',''],
      ['currentMethod','현재 방식','textarea','span-3'], ['impact','문제 영향','textarea','span-3'], ['recurrence','반복성','select:recurrence',''], ['potential','자동화 가능성','select:potential',''], ['linkedTech','연결 기술','text','span-2']
    ]
  },
  ideas: {
    title: 'Idea', label: '아이디어', idField: 'title',
    fields: [
      ['title','아이디어','text','span-2'], ['status','상태','select:ideaStatus',''], ['proposer','제안자','text',''], ['trade','공종','select:trades',''], ['difficulty','난이도','select:difficulties',''],
      ['description','내용','textarea','span-3'], ['benefit','기대효과','textarea','span-3'], ['linkedTech','연결 기술','text','span-3']
    ]
  },
  pocs: {
    title: 'PoC', label: 'PoC', idField: 'title',
    fields: [
      ['title','PoC명','text','span-2'], ['stage','단계','select:pocStages',''], ['linkedTech','연결 기술','text','span-2'], ['owner','Owner','text',''], ['status','상태','select:openClosed',''], ['start','시작일','date',''], ['end','종료일','date',''],
      ['kpi','KPI','textarea','span-3'], ['result','결과/현황','textarea','span-3']
    ]
  },
  actionItems: {
    title: 'Action Item', label: 'Action Item', idField: 'title',
    fields: [
      ['title','Action 제목','text','span-2'], ['owner','Owner / 담당자','text',''], ['status','상태','select:actionStatus',''], ['priority','우선순위','select:priorities',''], ['dueDate','기한','date',''],
      ['description','내용','textarea','span-3'], ['sourceType','Source Type','text',''], ['sourceId','Source ID','text','span-2']
    ]
  },

  meetingNotes: {
    title: 'Meeting Note', label: '회의록 / Stand-up', idField: 'title',
    fields: [
      ['title','회의명','text','span-2'], ['date','회의일','date',''], ['attendees','참석자','text','span-3'],
      ['agenda','Agenda','textarea','span-3'], ['discussion','논의 내용','textarea','span-3'], ['decisions','결정사항','textarea','span-3'], ['actions','Action Items','textarea','span-3']
    ]
  },
  decisionLogs: {
    title: 'Decision Log', label: 'Decision Log', idField: 'title',
    fields: [
      ['title','결정 제목','text','span-2'], ['date','결정일','date',''], ['owner','Owner','text',''], ['status','상태','select:decisionStatus',''], ['nextReview','재검토일','date',''],
      ['context','배경 / Context','textarea','span-3'], ['options','검토 대안','textarea','span-3'], ['decision','최종 결정','textarea','span-3'], ['rationale','결정 근거','textarea','span-3']
    ]
  },
  vendors: {
    title: 'Vendor', label: 'Vendor Follow-up', idField: 'name',
    fields: [
      ['name','Vendor명','text',''], ['technology','기술','text',''], ['status','상태','select:vendorStatus',''], ['contact','담당자/연락처','text',''], ['nextDate','다음 일정','date',''], ['owner','Owner','text',''],
      ['notes','Clarification / Follow-up 사항','textarea','span-3']
    ]
  }
};

function escapeHtml(str='') {
  return String(str).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
}
function today() { return new Date().toISOString().slice(0, 10); }
function fmtDateTime(iso) { if (!iso) return '-'; const d = new Date(iso); return isNaN(d) ? iso : d.toLocaleString('ko-KR', { hour12:false }); }
function cls(s='') { return String(s).toLowerCase().replaceAll(' ', '-').replaceAll('/', '-'); }
function toast(msg) { const el = document.getElementById('toast'); el.textContent = msg; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 2400); }
function canWrite() { return appState.user && ['admin','editor'].includes(appState.user.role); }
function isAdmin() { return appState.user && appState.user.role === 'admin'; }
function ideaVoteCount(idea) {
  const base = Number(idea?.baseVotes !== undefined ? idea.baseVotes : (Array.isArray(idea?.voteUsers) ? 0 : idea?.votes || 0));
  const users = Array.isArray(idea?.voteUsers) ? idea.voteUsers.length : 0;
  return base + users;
}
function hasVotedIdea(idea) {
  return !!(appState.user && Array.isArray(idea?.voteUsers) && idea.voteUsers.includes(appState.user.id));
}
function voteUserNames(idea) {
  if (!Array.isArray(idea?.voteUsers) || !idea.voteUsers.length) return '';
  const names = idea.voteUsers.map(id => {
    const u = (appState.users || []).find(x => x.id === id);
    return u ? u.name : '';
  }).filter(Boolean);
  return names.length ? names.join(', ') : `${idea.voteUsers.length}명 개인 투표`;
}
function authHint() {
  if (canWrite()) return '';
  if (!appState.user) return '<div class="notice"><strong>등록·수정 기능 안내</strong><span>현재 로그인하지 않았습니다. 우측 상단에서 개인별 Knox ID 계정으로 로그인하면 신규 등록, 수정, 삭제, 투표가 가능합니다.</span></div>';
  return '<div class="notice warn"><strong>조회 전용 계정입니다.</strong><span>현재 viewer 권한입니다. 신규 등록과 수정은 editor 또는 admin 권한으로 로그인해야 합니다.</span></div>';
}
function writeButton(label, action, extraClass='') {
  const locked = !canWrite();
  return `<button class="${extraClass}" onclick="${action}" title="${locked ? 'editor/admin 로그인 필요' : ''}">${locked ? '🔒 ' : ''}${label}</button>`;
}
function headers() { return { 'content-type': 'application/json', ...(appState.user ? { 'x-user-id': appState.user.id } : {}) }; }
async function api(path, opts={}) {
  const res = await fetch(path, { ...opts, headers: { ...headers(), ...(opts.headers || {}) } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `API 오류: ${res.status}`);
  return data;
}

async function validateStoredUser() {
  if (!appState.user || !appState.user.id) return;
  try {
    const data = await api('/api/me');
    appState.user = data.user;
    localStorage.setItem('caRadarUser', JSON.stringify(appState.user));
  } catch (e) {
    localStorage.removeItem('caRadarUser');
    appState.user = null;
    toast('저장된 로그인 정보가 현재 사용자 목록과 맞지 않아 로그아웃 처리했습니다. 다시 로그인해 주세요.');
  }
}
function scoreTech(t) {
  const diffScore = { Low: 10, Medium: 6, High: 3 }[t.difficulty] ?? 5;
  const trlScore = Math.round((Number(t.trl || 0) / 9) * 15);
  const painFit = Math.min(20, Math.round(((Number(t.productivity || 0) + Number(t.safety || 0)) / 35) * 20));
  return Math.min(100, Math.round(painFit + Number(t.productivity || 0) + Number(t.safety || 0) + trlScore + diffScore + Number(t.cost || 0) + Number(t.scalability || 0)));
}
function scoreClass(score) { return score >= 80 ? 'good' : score >= 60 ? 'mid' : 'bad'; }
function rec(score) { return score >= 85 ? '우선 PoC' : score >= 70 ? '검토 지속' : score >= 50 ? '관찰 대상' : '보류'; }
function badge(v) { return `<span class="badge ${cls(v)}">${escapeHtml(v || '-')}</span>`; }
function priorityBadge(v) { return `<span class="badge ${String(v || '').toLowerCase()}">${escapeHtml(v || '-')}</span>`; }
function filtered(list, keys) {
  const q = appState.query.trim().toLowerCase();
  if (!q) return list;
  return list.filter(item => keys.some(k => String(item[k] || '').toLowerCase().includes(q)));
}
function opt(list, selected='') {
  return list.map(v => `<option value="${escapeHtml(v)}" ${String(v)===String(selected)?'selected':''}>${escapeHtml(v)}</option>`).join('');
}
function optionList(type) {
  if (type === 'openClosed') return ['Open','Closed'];
  if (type === 'actionStatus') return ['Open','In Progress','Done','Closed','On Hold'];
  if (type === 'decisionStatus') return ['Draft','Active','Superseded','Closed'];
  return appState.options?.[type] || [];
}

async function bootstrap(silent=false) {
  try {
    await validateStoredUser();
    const data = await api('/api/bootstrap');
    appState.db = data.db;
    appState.options = data.options;
    appState.news = data.news || appState.news;
    appState.chat = data.chat || appState.chat;
    appState.users = data.users || appState.users || [];
    appState.presence = data.presence || appState.presence || [];
    if (appState.chat && appState.chat.channels && appState.chat.channels[0] && !appState.chat.channels.includes(appState.chatChannel)) appState.chatChannel = appState.chat.channels[0];
    render();
    updateUserUi();
    connectEvents();
    if (!silent) toast('데이터를 불러왔습니다.');
  } catch (e) {
    document.getElementById('app').innerHTML = `<div class="card"><h2>서버 연결 실패</h2><p>${escapeHtml(e.message)}</p><p class="tiny">서버가 실행 중인지 확인하세요. 실행 명령: <strong>node server.js</strong></p></div>`;
  }
}
function connectEvents(force=false) {
  if (appState.source && !force) return;
  if (appState.source) { try { appState.source.close(); } catch(e) {} appState.source = null; }
  const live = document.getElementById('liveStatus');
  try {
    const url = appState.user && appState.user.id ? `/api/events?userId=${encodeURIComponent(appState.user.id)}` : '/api/events';
    const es = new EventSource(url);
    appState.source = es;
    es.addEventListener('connected', (ev) => {
      live.textContent = 'Live'; live.className = 'live-pill online';
      try { const info = JSON.parse(ev.data || '{}'); if (info.presence) appState.presence = info.presence; updatePresenceUi(); } catch(e) {}
    });
    es.addEventListener('presence', (ev) => {
      const info = JSON.parse(ev.data || '{}');
      appState.presence = info.users || [];
      updatePresenceUi();
      if (appState.activeTab === 'chat') renderOnlinePanelOnly();
    });
    es.addEventListener('changed', async (ev) => {
      const info = JSON.parse(ev.data || '{}');
      await bootstrap(true);
      toast(`${info.by || '다른 사용자'}님이 ${info.collection || '데이터'}를 업데이트했습니다.`);
    });
    es.addEventListener('chat', async (ev) => {
      const info = JSON.parse(ev.data || '{}');
      await fetchChat(true);
      const mentioned = isMentioned(info);
      if (appState.activeTab === 'chat') render();
      if (mentioned) notifyMention(info);
      else if (info.by && (!appState.user || info.byId !== appState.user.id)) toast(`${info.by}님이 ${info.channel || 'Chat'}에 메시지를 남겼습니다.`);
    });
    es.onerror = () => { live.textContent = 'Reconnect'; live.className = 'live-pill offline'; };
  } catch {
    live.textContent = 'Offline'; live.className = 'live-pill offline';
  }
}
function updateUserUi() {
  const badgeEl = document.getElementById('userBadge');
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  if (appState.user) {
    badgeEl.textContent = `${appState.user.name} · ${appState.user.role}${appState.unreadMentions ? ' · @' + appState.unreadMentions : ''}`;
    loginBtn.classList.add('hidden');
    logoutBtn.classList.remove('hidden');
  } else {
    badgeEl.textContent = 'Not signed in';
    loginBtn.classList.remove('hidden');
    logoutBtn.classList.add('hidden');
  }
}
function onlineUsers() {
  const seen = new Set();
  return (appState.presence || []).filter(u => {
    if (!u || !u.userId || seen.has(u.userId)) return false;
    seen.add(u.userId);
    return true;
  });
}
function updatePresenceUi() {
  const live = document.getElementById('liveStatus');
  if (live && appState.source) {
    const users = onlineUsers();
    const n = users.length;
    live.textContent = n ? `Live · ${n} Online ▾` : 'Live · 0 Online ▾';
    live.className = 'live-pill online clickable';
    live.title = n ? `현재 접속자: ${users.map(u => u.loginId || u.name).join(', ')}` : '현재 접속자가 없습니다.';
  }
  renderPresenceDropdown();
}

function togglePresenceDropdown(ev) {
  if (ev) { ev.preventDefault(); ev.stopPropagation(); }
  appState.presencePanelOpen = !appState.presencePanelOpen;
  renderPresenceDropdown();
}

function closePresenceDropdown() {
  appState.presencePanelOpen = false;
  renderPresenceDropdown();
}

function presenceAgo(iso) {
  if (!iso) return '-';
  const diff = Date.now() - new Date(iso).getTime();
  if (!isFinite(diff) || diff < 0) return '-';
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}초 전`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  return `${hr}시간 전`;
}

function renderPresenceDropdown() {
  const box = document.getElementById('presenceDropdown');
  if (!box) return;
  if (!appState.presencePanelOpen) { box.classList.add('hidden'); box.innerHTML = ''; return; }
  const users = onlineUsers();
  box.innerHTML = `
    <div class="presence-head">
      <strong>현재 접속자</strong>
      <span>${users.length}명 온라인</span>
    </div>
    ${users.length ? `<div class="presence-list-global">${users.map(u => `
      <button class="presence-item" onclick="handlePresenceUserClick(event, '${escapeJs(u.loginId || '')}')">
        <span class="online-dot"></span>
        <span class="presence-user-main">
          <strong>${escapeHtml(u.name || u.loginId || '-')}</strong>
          <em>@${escapeHtml(u.loginId || '-')}</em>
        </span>
        <span class="presence-user-sub">${escapeHtml(u.role || '')}${u.connections && u.connections > 1 ? ` · ${u.connections} tabs` : ''}<br/>최근 신호 ${presenceAgo(u.lastSeen)}</span>
      </button>`).join('')}</div>` : '<div class="empty small-empty">현재 접속 중인 사용자가 없습니다.</div>'}
    <div class="presence-foot">사용자를 클릭하면 Team Chat에서 @호출 대상으로 입력됩니다.</div>
  `;
  box.classList.remove('hidden');
}

function handlePresenceUserClick(ev, loginId) {
  if (ev) { ev.preventDefault(); ev.stopPropagation(); }
  if (!loginId) return;
  if (appState.activeTab !== 'chat') { appState.activeTab = 'chat'; render(); }
  insertMention(loginId);
  closePresenceDropdown();
}
function renderOnlineUsers() {
  const users = onlineUsers();
  if (!users.length) return '<div class="empty small-empty">현재 온라인 사용자가 없습니다.</div>';
  return `<div class="online-list">${users.map(u => `<button class="online-user" onclick="insertMention('${escapeJs(u.loginId || '')}')"><span class="online-dot"></span><strong>${escapeHtml(u.name || u.loginId)}</strong><span>@${escapeHtml(u.loginId || '')}</span></button>`).join('')}</div>`;
}
function renderOnlinePanelOnly() {
  const el = document.getElementById('onlineUsersPanel');
  if (el) el.innerHTML = renderOnlineUsers();
}
function allMentionUsers() {
  const byId = new Map();
  const onlineIds = new Set(onlineUsers().map(u => u.userId || u.id));
  (appState.users || []).forEach(u => {
    if (!u || !u.loginId || u.active === false || u.disabled === true) return;
    byId.set(u.id || u.loginId, {
      id: u.id || u.loginId,
      loginId: u.loginId,
      name: u.name || u.loginId,
      role: u.role || '',
      online: onlineIds.has(u.id || u.loginId)
    });
  });
  onlineUsers().forEach(u => {
    const key = u.userId || u.id || u.loginId;
    const current = byId.get(key) || {};
    byId.set(key, {
      ...current,
      id: key,
      loginId: current.loginId || u.loginId,
      name: current.name || u.name || u.loginId,
      role: current.role || u.role || '',
      online: true
    });
  });
  return Array.from(byId.values())
    .filter(u => u.loginId)
    .sort((a,b) => Number(b.online) - Number(a.online) || String(a.loginId).localeCompare(String(b.loginId)));
}
function getMentionContext(text, cursor) {
  const left = String(text || '').slice(0, cursor);
  const m = left.match(/(^|\s)@([a-zA-Z0-9._-]*)$/);
  if (!m) return null;
  const atStart = cursor - (m[2] || '').length - 1;
  return { query: m[2] || '', start: atStart, end: cursor };
}
function updateMentionSuggestions() {
  const input = document.getElementById('chatInput');
  const box = document.getElementById('chatMentionSuggestions');
  if (!input || !box || !canWrite()) { hideMentionSuggestions(); return; }
  const ctx = getMentionContext(input.value, input.selectionStart || input.value.length);
  if (!ctx) { hideMentionSuggestions(); return; }
  const q = ctx.query.toLowerCase();
  const users = allMentionUsers().filter(u =>
    !q || String(u.loginId || '').toLowerCase().includes(q) || String(u.name || '').toLowerCase().includes(q)
  ).slice(0, 8);
  if (!users.length) {
    appState.mentionSuggest = { active:true, query:ctx.query, start:ctx.start, end:ctx.end, index:0, users:[] };
    box.innerHTML = '<div class="mention-empty">등록된 사용자 중 일치하는 ID가 없습니다.</div>';
    box.classList.add('show');
    return;
  }
  const prevIndex = appState.mentionSuggest && appState.mentionSuggest.active ? appState.mentionSuggest.index || 0 : 0;
  const index = Math.min(prevIndex, users.length - 1);
  appState.mentionSuggest = { active:true, query:ctx.query, start:ctx.start, end:ctx.end, index, users };
  box.innerHTML = `<div class="mention-suggest-title">@ 호출 대상 선택</div>${users.map((u,i) => `<button class="mention-suggestion ${i===index?'active':''}" onmousedown="event.preventDefault(); selectMentionSuggestion('${escapeJs(u.loginId)}')"><span class="${u.online?'online-dot':'offline-dot'}"></span><strong>${escapeHtml(u.name || u.loginId)}</strong><em>@${escapeHtml(u.loginId)}</em><small>${u.online?'online':'registered'}</small></button>`).join('')}`;
  box.classList.add('show');
}
function hideMentionSuggestions() {
  appState.mentionSuggest = { active:false, query:'', start:0, end:0, index:0, users:[] };
  const box = document.getElementById('chatMentionSuggestions');
  if (box) { box.classList.remove('show'); box.innerHTML = ''; }
}
function moveMentionSuggestion(delta) {
  const s = appState.mentionSuggest;
  if (!s || !s.active || !s.users || !s.users.length) return;
  s.index = (s.index + delta + s.users.length) % s.users.length;
  updateMentionSuggestions();
}
function selectMentionSuggestion(loginId) {
  const input = document.getElementById('chatInput');
  const s = appState.mentionSuggest || {};
  if (!input || !loginId) return;
  const start = Number.isFinite(s.start) ? s.start : (input.selectionStart || input.value.length);
  const end = Number.isFinite(s.end) ? s.end : (input.selectionStart || input.value.length);
  const mention = `@${loginId} `;
  input.value = input.value.slice(0, start) + mention + input.value.slice(end);
  appState.chatDraft = input.value;
  hideMentionSuggestions();
  input.focus();
  const pos = start + mention.length;
  try { input.setSelectionRange(pos, pos); } catch(e) {}
}
function insertMention(loginId) {
  if (!loginId) return;
  const el = document.getElementById('chatInput');
  const mention = `@${loginId} `;
  if (el) {
    const start = el.selectionStart || el.value.length;
    const end = el.selectionEnd || el.value.length;
    el.value = el.value.slice(0, start) + mention + el.value.slice(end);
    appState.chatDraft = el.value;
    el.focus();
    const pos = start + mention.length;
    try { el.setSelectionRange(pos, pos); } catch(e) {}
  } else {
    appState.chatDraft = `${appState.chatDraft || ''}${mention}`;
    render();
  }
}
function isMentioned(info) {
  if (!appState.user || !info || info.byId === appState.user.id) return false;
  const mentions = Array.isArray(info.mentions) ? info.mentions : [];
  return mentions.some(m => m.id === appState.user.id || String(m.loginId || '').toLowerCase() === String(appState.user.loginId || '').toLowerCase());
}
function requestNotificationPermission() {
  if (!('Notification' in window)) { toast('이 브라우저는 데스크톱 알림을 지원하지 않습니다.'); return; }
  Notification.requestPermission().then(p => toast(p === 'granted' ? '브라우저 알림이 허용되었습니다.' : '브라우저 알림이 허용되지 않았습니다.'));
}
function notifyMention(info) {
  appState.unreadMentions = (appState.unreadMentions || 0) + 1;
  const text = `${info.by || 'Someone'}님이 @${appState.user.loginId}로 호출했습니다.`;
  toast(text);
  flashTitle(text);
  if ('Notification' in window && Notification.permission === 'granted') {
    try { new Notification('CA Radar Team Chat Mention', { body: `${info.by || ''}: ${String(info.message || '').slice(0, 120)}` }); } catch(e) {}
  }
  updateUserUi();
}
function flashTitle(text) {
  const original = document.title.replace(/^\(멘션\)\s*/, '');
  let on = false;
  clearInterval(appState.mentionFlashTimer);
  appState.mentionFlashTimer = setInterval(() => { document.title = on ? original : '(멘션) CA Radar'; on = !on; }, 900);
  setTimeout(() => { clearInterval(appState.mentionFlashTimer); document.title = original; }, 12000);
}
function clearMentionBadge() {
  appState.unreadMentions = 0;
  updateUserUi();
}

function setTab(id) {
  appState.activeTab = id;
  appState.query = '';
  render();
  if (id === 'chat') { clearMentionBadge(); fetchChat(true); }
  if (id === 'follow') { fetchChat(true); }
  if (id === 'news') fetchNews();
}
function renderTabs() {
  const nav = document.getElementById('tabs');
  nav.innerHTML = tabs.map(([id, label]) => `<button class="tab ${appState.activeTab===id?'active':''}" onclick="setTab('${id}')">${label}</button>`).join('');
}
function render() {
  if (!appState.db || !appState.options) return;
  renderTabs();
  const views = { dashboard: renderDashboard, workhub: renderWorkHub, productivity: renderProductivityCenter, follow: renderMyFollowUp, baseline: renderBaseline, radar: renderRadar, techs: () => renderCollection('techs'), pain: () => renderCollection('painPoints'), ideas: () => renderCollection('ideas'), poc: () => renderCollection('pocs'), vendors: () => renderCollection('vendors'), news: renderNews, chat: renderChat, fabrix: renderFabrix, meetings: () => renderCollection('meetingNotes'), decisions: () => renderCollection('decisionLogs'), report: renderReport, admin: renderAdmin };
  document.getElementById('app').innerHTML = views[appState.activeTab]();
}



function ownerMatches(item) {
  if (!appState.user) return false;
  const login = String(appState.user.loginId || '').toLowerCase();
  const name = String(appState.user.name || '').toLowerCase();
  const txt = [item.owner, item.proposer, item.updatedBy, item.attendees].map(x => String(x || '').toLowerCase()).join(' ');
  return txt.includes(login) || txt.includes(name);
}
function dueStatus(dateStr) {
  if (!dateStr) return { label:'No due', cls:'muted', days:null };
  const todayD = new Date(today() + 'T00:00:00');
  const d = new Date(dateStr + 'T00:00:00');
  const diff = Math.round((d - todayD) / 86400000);
  if (diff < 0) return { label:`Overdue ${Math.abs(diff)}d`, cls:'bad', days:diff };
  if (diff === 0) return { label:'Due today', cls:'warn', days:0 };
  if (diff <= 3) return { label:`D-${diff}`, cls:'warn', days:diff };
  return { label:`D-${diff}`, cls:'good', days:diff };
}
function filteredMyActions() {
  const actions = (appState.db?.actionItems || []).filter(a => a.status !== 'Done' && a.status !== 'Closed');
  if (appState.productivityFilter === 'all' || isAdmin()) return actions;
  return actions.filter(ownerMatches);
}
function productivitySignals() {
  const db = appState.db || {};
  const todayStr = today();
  const signals = [];
  (db.actionItems || []).filter(a => a.status !== 'Done' && a.status !== 'Closed').forEach(a => {
    const ds = dueStatus(a.dueDate);
    if (ds.days !== null && ds.days <= 3) signals.push({type:'Action', priority: ds.days < 0 ? 'High' : 'Medium', title:a.title, desc:`${ds.label} · Owner: ${a.owner || '-'} · ${a.priority || '-'}`, action:`openForm('actionItems','${a.id}')`});
  });
  (db.vendors || []).filter(v => v.status !== 'Closed' && v.nextDate && v.nextDate <= todayStr).forEach(v => {
    signals.push({type:'Vendor', priority:'High', title:`${v.name} Follow-up 필요`, desc:`${v.technology || ''} · ${v.nextDate} · Owner: ${v.owner || '-'}`, action:`openForm('vendors','${v.id}')`});
  });
  (db.pocs || []).filter(p => p.status !== 'Closed').forEach(p => {
    if (!String(p.kpi || '').trim()) signals.push({type:'PoC', priority:'High', title:`${p.title} KPI 미정`, desc:`PoC 단계: ${p.stage || '-'} · Owner: ${p.owner || '-'}`, action:`openForm('pocs','${p.id}')`});
    const ds = dueStatus(p.end);
    if (ds.days !== null && ds.days <= 7) signals.push({type:'PoC', priority: ds.days < 0 ? 'High' : 'Medium', title:`${p.title} 일정 확인`, desc:`${ds.label} · ${p.stage || '-'} · Owner: ${p.owner || '-'}`, action:`openForm('pocs','${p.id}')`});
  });
  (db.ideas || []).filter(i => ideaVoteCount(i) >= 5 && !['Selected','In PoC','Closed'].includes(i.status)).forEach(i => {
    signals.push({type:'Idea', priority:'Medium', title:`좋아요 ${ideaVoteCount(i)}개 아이디어`, desc:`${i.title} · ${i.status || '-'} · PoC 후보 검토`, action:`openForm('ideas','${i.id}')`});
  });
  (db.techs || []).map(t => ({...t, score: scoreTech(t)})).filter(t => t.score >= 85 && !['Adopt','Trial'].includes(t.status)).forEach(t => {
    signals.push({type:'Tech', priority:'Medium', title:`우선 PoC 가능 기술`, desc:`${t.title} · ${t.score}점 · ${t.status || '-'}`, action:`openForm('techs','${t.id}')`});
  });
  return signals.sort((a,b)=>({High:0,Medium:1,Low:2}[a.priority]??3)-({High:0,Medium:1,Low:2}[b.priority]??3));
}
function renderProductivityCenter() {
  const actions = filteredMyActions().slice().sort((a,b)=>String(a.dueDate||'9999').localeCompare(String(b.dueDate||'9999')));
  const overdue = actions.filter(a => dueStatus(a.dueDate).days !== null && dueStatus(a.dueDate).days < 0);
  const dueSoon = actions.filter(a => dueStatus(a.dueDate).days !== null && dueStatus(a.dueDate).days >= 0 && dueStatus(a.dueDate).days <= 3);
  const signals = productivitySignals();
  const meetings = (appState.db?.meetingNotes || []).slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))).slice(0,5);
  const decisions = (appState.db?.decisionLogs || []).filter(d => d.status !== 'Closed').slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))).slice(0,5);
  return `<div class="section-head"><div><h2>Productivity Center</h2><p>Todoist의 Due/Filter, Asana의 Portfolio Dashboard, Slack의 List/Workflow 개념을 우리 업무용으로 압축한 실행 화면입니다.</p></div><div class="meta"><button onclick="openForm('actionItems')">+ Action</button><button class="secondary" onclick="openForm('meetingNotes')">+ Meeting Note</button><button class="secondary" onclick="openForm('decisionLogs')">+ Decision</button></div></div>
    ${authHint()}
    <div class="prod-kpis">
      <div class="prod-kpi bad"><strong>${overdue.length}</strong><span>Overdue</span></div>
      <div class="prod-kpi warn"><strong>${dueSoon.length}</strong><span>Due ≤3 days</span></div>
      <div class="prod-kpi"><strong>${actions.length}</strong><span>Open Actions</span></div>
      <div class="prod-kpi"><strong>${signals.length}</strong><span>System Signals</span></div>
    </div>
    <div class="card quick-command"><h3>Quick Capture / Command</h3><p class="tiny">채팅처럼 입력하면 즉시 업무 항목으로 등록합니다. 예: <code>/task @ygiz.lee Broadwell 견적 Clarification 확인 due:2026-06-20</code>, <code>/idea Tank 도장 로봇 KPI 표준화</code>, <code>/vendor Qlayer 도장 로봇 자료 요청</code></p><div class="quick-row"><input id="quickCommand" placeholder="/task, /idea, /vendor, /poc 입력" value="${escapeHtml(appState.commandText || '')}" oninput="appState.commandText=this.value" onkeydown="handleQuickCommandKey(event)"/><button onclick="submitQuickCommand()">등록</button></div></div>
    <div class="grid cols-2" style="margin-top:16px;">
      <div class="card"><div class="section-head compact"><div><h3>My Work Queue</h3><p>내 담당 또는 전체 Action Item을 기한순으로 정렬합니다.</p></div><select onchange="appState.productivityFilter=this.value; render()"><option value="my" ${appState.productivityFilter==='my'?'selected':''}>My / Admin All</option><option value="all" ${appState.productivityFilter==='all'?'selected':''}>All</option></select></div>${actions.length ? actions.slice(0,40).map(renderWorkQueueItem).join('') : '<div class="empty small-empty">열린 Action Item이 없습니다.</div>'}</div>
      <div class="card"><h3>Automation Signals</h3>${signals.length ? signals.slice(0,40).map(renderProductivitySignal).join('') : '<div class="empty small-empty">현재 자동 권고 사항이 없습니다.</div>'}</div>
    </div>
    <div class="grid cols-2" style="margin-top:16px;">
      <div class="card"><div class="section-head compact"><div><h3>Meeting Notes</h3><p>회의 결과를 Action/Decision으로 바로 연결하십시오.</p></div><button class="secondary small" onclick="setTab('meetings')">전체 보기</button></div>${meetings.length ? meetings.map(renderMeetingMini).join('') : '<div class="empty small-empty">회의록이 없습니다.</div>'}</div>
      <div class="card"><div class="section-head compact"><div><h3>Decision Log</h3><p>반복 논의를 줄이기 위해 주요 결정사항을 남깁니다.</p></div><button class="secondary small" onclick="setTab('decisions')">전체 보기</button></div>${decisions.length ? decisions.map(renderDecisionMini).join('') : '<div class="empty small-empty">Decision Log가 없습니다.</div>'}</div>
    </div>`;
}
function renderWorkQueueItem(a) {
  const ds = dueStatus(a.dueDate);
  return `<div class="work-item"><div><strong>${escapeHtml(a.title || '-')}</strong><span>${escapeHtml(a.owner || '-')} · ${escapeHtml(a.status || 'Open')} · ${escapeHtml(a.priority || '-')}</span></div><div class="work-actions"><span class="due ${ds.cls}">${escapeHtml(ds.label)}</span><button class="secondary small" onclick="openForm('actionItems','${a.id}')">수정</button><button class="small" onclick="markActionDone('${a.id}')">Done</button></div></div>`;
}
function renderProductivitySignal(s) {
  return `<div class="signal-row ${String(s.priority||'').toLowerCase()}"><div><strong>${escapeHtml(s.title)}</strong><span>${escapeHtml(s.type)} · ${escapeHtml(s.desc)}</span></div><button class="secondary small" onclick="${s.action}">열기</button></div>`;
}
function renderMeetingMini(m) {
  return `<div class="follow-row"><strong>${escapeHtml(m.title || '-')}</strong><span>${escapeHtml(m.date || '-')} · ${escapeHtml(m.attendees || '-')}</span><small>${escapeHtml(String(m.decisions || m.discussion || '').slice(0,120))}</small><div class="meta"><button class="secondary small" onclick="openForm('meetingNotes','${m.id}')">수정</button><button class="small" onclick="meetingToActions('${m.id}')">Action 전환</button></div></div>`;
}
function renderDecisionMini(d) {
  return `<div class="follow-row"><strong>${escapeHtml(d.title || '-')}</strong><span>${escapeHtml(d.status || '-')} · ${escapeHtml(d.date || '-')} · Owner ${escapeHtml(d.owner || '-')}</span><small>${escapeHtml(String(d.decision || '').slice(0,140))}</small><div class="meta"><button class="secondary small" onclick="openForm('decisionLogs','${d.id}')">수정</button></div></div>`;
}
async function markActionDone(id) {
  const a = (appState.db?.actionItems || []).find(x => x.id === id); if (!a) return;
  try { const data = await api(`/api/items/actionItems/${id}`, { method:'PUT', body: JSON.stringify({...a, status:'Done'}) }); appState.db = data.db; render(); toast('Action Item을 Done 처리했습니다.'); } catch(e) { toast(e.message); }
}
function handleQuickCommandKey(ev) { if (ev.key === 'Enter') { ev.preventDefault(); submitQuickCommand(); } }
function parseDue(text) { const m = String(text||'').match(/\bdue:(\d{4}-\d{2}-\d{2})\b/i); return m ? m[1] : ''; }
function stripCommandMeta(text) { return String(text||'').replace(/\bdue:\d{4}-\d{2}-\d{2}\b/ig,'').trim(); }
async function submitQuickCommand() {
  if (!canWrite()) { if (!appState.user) openLogin(); else toast('등록 권한이 없습니다.'); return; }
  const raw = String(document.getElementById('quickCommand')?.value || appState.commandText || '').trim();
  if (!raw) { toast('Command를 입력하십시오.'); return; }
  const lower = raw.toLowerCase(); const due = parseDue(raw); const bodyText = stripCommandMeta(raw.replace(/^\/\w+\s*/,''));
  try {
    let data;
    if (lower.startsWith('/task')) {
      const ownerMatch = bodyText.match(/@([a-zA-Z0-9._-]+)/); const owner = ownerMatch ? ownerMatch[1] : (appState.user?.loginId || appState.user?.name || '');
      const title = bodyText.replace(/@([a-zA-Z0-9._-]+)/,'').trim() || 'Quick Action';
      data = await api('/api/items/actionItems', { method:'POST', body: JSON.stringify({title, owner, status:'Open', priority:'Medium', dueDate:due, description:`Quick Capture에서 등록됨\n${raw}`, sourceType:'Quick Command', sourceId:''}) });
    } else if (lower.startsWith('/idea')) {
      data = await api('/api/items/ideas', { method:'POST', body: JSON.stringify({title:bodyText || 'Quick Idea', proposer:appState.user?.loginId || appState.user?.name || '', trade:'Common', difficulty:'Medium', description:bodyText, benefit:'검토 필요', status:'New', linkedTech:''}) });
    } else if (lower.startsWith('/vendor')) {
      data = await api('/api/items/vendors', { method:'POST', body: JSON.stringify({name:bodyText.split(' ')[0] || 'Vendor', technology:bodyText, status:'Contact Needed', contact:'', nextDate:due, owner:appState.user?.loginId || '', notes:`Quick Capture에서 등록됨\n${raw}`}) });
    } else if (lower.startsWith('/poc')) {
      data = await api('/api/items/pocs', { method:'POST', body: JSON.stringify({title:bodyText || 'Quick PoC', linkedTech:'', owner:appState.user?.loginId || '', stage:'Candidate', start:'', end:due, kpi:'정의 필요', result:'Quick Capture에서 등록됨', status:'Open'}) });
    } else {
      data = await api('/api/items/actionItems', { method:'POST', body: JSON.stringify({title:bodyText || raw, owner:appState.user?.loginId || '', status:'Open', priority:'Medium', dueDate:due, description:`Quick Capture에서 등록됨\n${raw}`, sourceType:'Quick Command', sourceId:''}) });
    }
    appState.db = data.db; appState.commandText = ''; render(); toast('Quick Capture 항목을 등록했습니다.');
  } catch(e) { toast(e.message); }
}
async function meetingToActions(id) {
  const m = (appState.db?.meetingNotes || []).find(x => x.id === id); if (!m) return;
  const text = String(m.actions || '').trim();
  if (!text) { toast('Action Items 필드에 내용이 없습니다.'); return; }
  const lines = text.split(/\n+/).map(x => x.replace(/^[-*\d.)\s]+/,'').trim()).filter(Boolean);
  if (!lines.length) { toast('전환할 Action이 없습니다.'); return; }
  if (!confirm(`${lines.length}개 Action Item으로 전환하시겠습니까?`)) return;
  try {
    let latest = null;
    for (const line of lines.slice(0,20)) {
      const ownerMatch = line.match(/@([a-zA-Z0-9._-]+)/); const owner = ownerMatch ? ownerMatch[1] : '';
      latest = await api('/api/items/actionItems', { method:'POST', body: JSON.stringify({title: line.slice(0,120), owner, status:'Open', priority:'Medium', dueDate:'', description:`Meeting Note에서 전환됨: ${m.title}\n\n${line}`, sourceType:'Meeting Note', sourceId:m.id}) });
    }
    if (latest) appState.db = latest.db; render(); toast('회의록 Action을 전환했습니다.');
  } catch(e) { toast(e.message); }
}

function renderWorkHub() {
  const dueVendors = (appState.db?.vendors || []).filter(v => v.nextDate && v.nextDate <= today() && v.status !== 'Closed');
  const openPocs = (appState.db?.pocs || []).filter(p => p.status !== 'Closed');
  const hotIdeas = (appState.db?.ideas || []).slice().sort((a,b)=>ideaVoteCount(b)-ideaVoteCount(a)).slice(0,5);
  const recentChat = ((appState.chat && appState.chat.messages) || []).slice().sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5);
  return `
    <div class="section-head"><div><h2>Work Hub</h2><p>메일·FabriX·Radar 업무를 한 화면에서 연결하는 업무 시작 화면입니다. 사내 포털은 보안 정책상 직접 내장되지 않을 수 있어 새 창으로 실행합니다.</p></div></div>
    <div class="grid cols-4">
      ${workLinkCard('메일 시스템', '사내 메일 포털을 새 창으로 엽니다. SSO가 적용되어 있으면 자동 로그인됩니다.', 'https://kor3.samsung.net/portalapp/home', '메일 열기')}
      ${workLinkCard('FabriX Chat', 'Radar App 데이터로 만든 Prompt를 FabriX에 붙여넣어 보고서·PoC·Vendor 질문서를 생성합니다.', 'https://nsena.fabrix-s.samsungsds.com/portal/chat', 'FabriX 열기')}
      ${workActionCard('Team Chat', '그룹원과 자동화·로보틱스 업무를 논의합니다.', "setTab('chat')", 'Chat 이동')}
      ${workActionCard('Idea Board', '신규 아이디어를 등록하고 Like 기반으로 우선순위를 확인합니다.', "setTab('ideas')", 'Idea 이동')}
    </div>
    <div class="grid cols-2" style="margin-top:16px;">
      <div class="card">
        <div class="section-head"><div><h2>메일 작성 보조</h2><p>App에 등록된 내용을 기반으로 메일 초안을 빠르게 생성합니다. 생성 후 복사하여 사내 메일에 붙여넣으십시오.</p></div></div>
        <div class="form-grid">
          <label><span>메일 목적</span><select id="workMailPurpose" onchange="generateWorkMailDraft()">
            <option value="weekly">주간 자동화·로보틱스 공유</option>
            <option value="idea">아이디어 등록 및 검토 요청</option>
            <option value="poc">PoC 후보 검토 요청</option>
            <option value="vendor">Vendor Follow-up 요청</option>
            <option value="chat">Team Chat 논의 후속 조치</option>
          </select></label>
          <label><span>추가 초점</span><input id="workMailFocus" placeholder="예: 중동 Post 적용 가능 아이템 중심" oninput="generateWorkMailDraft()" /></label>
        </div>
        <div class="form-actions"><button onclick="generateWorkMailDraft()">초안 생성</button><button class="secondary" onclick="copyTextById('workMailDraft')">초안 복사</button><button class="secondary" onclick="openUrl('https://kor3.samsung.net/portalapp/home')">메일 열기</button></div>
        <textarea id="workMailDraft" class="prompt-output" style="min-height:300px;" readonly>${escapeHtml(buildWorkMailDraft('weekly',''))}</textarea>
      </div>
      <div class="card">
        <div class="section-head"><div><h2>오늘의 업무 Context</h2><p>메일 또는 FabriX에 바로 활용할 수 있는 App 요약입니다.</p></div><button class="secondary small" onclick="copyTextById('workContextText')">복사</button></div>
        <textarea id="workContextText" class="prompt-output" style="min-height:300px;" readonly>${escapeHtml(buildWorkContext())}</textarea>
      </div>
    </div>
    <div class="grid cols-3" style="margin-top:16px;">
      <div class="card"><h3>Follow-up 필요 Vendor</h3>${dueVendors.length ? dueVendors.slice(0,6).map(v=>`<div class="list-row"><strong>${escapeHtml(v.name)}</strong><span>${escapeHtml(v.technology || '')}</span><small>${escapeHtml(v.nextDate || '')} · ${escapeHtml(v.owner || '')}</small></div>`).join('') : '<div class="empty small-empty">현재 Due Vendor가 없습니다.</div>'}</div>
      <div class="card"><h3>진행 중 PoC</h3>${openPocs.length ? openPocs.slice(0,6).map(p=>`<div class="list-row"><strong>${escapeHtml(p.title)}</strong><span>${escapeHtml(p.stage || '')}</span><small>${escapeHtml(p.owner || '')} · ${escapeHtml(p.end || '')}</small></div>`).join('') : '<div class="empty small-empty">진행 중 PoC가 없습니다.</div>'}</div>
      <div class="card"><h3>Top Ideas</h3>${hotIdeas.length ? hotIdeas.map(i=>`<div class="list-row"><strong>${escapeHtml(i.title)}</strong><span>👍 ${ideaVoteCount(i)} · ${escapeHtml(i.status || '')}</span><small>${escapeHtml(i.proposer || '')}</small></div>`).join('') : '<div class="empty small-empty">등록된 아이디어가 없습니다.</div>'}</div>
    </div>
    <div class="card" style="margin-top:16px;">
      <h2>통합 운영 방향</h2>
      <p>현재 버전은 사내 메일 시스템을 직접 읽거나 App 내부에 내장하지 않고, <strong>업무 Launcher + 메일 초안 생성 + Context 복사</strong> 방식으로 연결합니다.</p>
      <p class="tiny">사내 메일을 App 화면 안에 직접 표시하려면 메일 시스템의 iframe 허용, SSO 연동, 메일 API 권한, 보안 검토가 필요합니다. 현 단계에서는 새 창 실행 방식이 가장 안전합니다.</p>
    </div>`;
}

function workLinkCard(title, desc, url, btn) {
  return `<div class="card work-card"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(desc)}</p><button onclick="openUrl('${escapeJs(url)}')">${escapeHtml(btn)}</button><button class="secondary small" onclick="copyText('${escapeJs(url)}')">URL 복사</button></div>`;
}
function workActionCard(title, desc, action, btn) {
  return `<div class="card work-card"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(desc)}</p><button onclick="${action}">${escapeHtml(btn)}</button></div>`;
}
function openUrl(url) { window.open(url, '_blank', 'noopener,noreferrer'); }
function copyText(text) { navigator.clipboard?.writeText(text).then(()=>toast('복사했습니다.')).catch(()=>toast('복사에 실패했습니다.')); }
function copyTextById(id) { const el = document.getElementById(id); if (!el) return; navigator.clipboard?.writeText(el.value || el.textContent || '').then(()=>toast('복사했습니다.')).catch(()=>toast('복사에 실패했습니다.')); }
function generateWorkMailDraft() {
  const purpose = document.getElementById('workMailPurpose')?.value || 'weekly';
  const focus = document.getElementById('workMailFocus')?.value || '';
  const out = document.getElementById('workMailDraft');
  if (out) out.value = buildWorkMailDraft(purpose, focus);
}
function buildWorkContext() {
  const db = appState.db || {};
  const ideas = (db.ideas || []).slice().sort((a,b)=>ideaVoteCount(b)-ideaVoteCount(a)).slice(0,5).map(i=>`- ${i.title} (Like ${ideaVoteCount(i)}, Status: ${i.status || '-'})`).join('\n') || '- 없음';
  const techs = (db.techs || []).slice().map(t=>({...t, score: scoreTech(t)})).sort((a,b)=>b.score-a.score).slice(0,5).map(t=>`- ${t.title} (Score ${t.score}, ${t.status || '-'}, ${t.trade || '-'})`).join('\n') || '- 없음';
  const pocs = (db.pocs || []).filter(p=>p.status !== 'Closed').slice(0,5).map(p=>`- ${p.title} (${p.stage || '-'}, Owner: ${p.owner || '-'})`).join('\n') || '- 없음';
  const vendors = (db.vendors || []).filter(v=>v.status !== 'Closed').slice(0,5).map(v=>`- ${v.name} / ${v.technology || '-'} (Next: ${v.nextDate || '-'})`).join('\n') || '- 없음';
  const chat = ((appState.chat && appState.chat.messages) || []).slice().sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5).map(m=>`- [${m.channel || 'General'}] ${m.userName || '-'}: ${String(m.message || '').replace(/\s+/g,' ').slice(0,120)}`).join('\n') || '- 없음';
  return `Construction Automation & Robotics Radar - 업무 Context\n\n[Top Ideas]\n${ideas}\n\n[우선 검토 Technology]\n${techs}\n\n[진행 중 PoC]\n${pocs}\n\n[Vendor Follow-up]\n${vendors}\n\n[최근 Team Chat]\n${chat}`;
}
function buildWorkMailDraft(purpose, focus) {
  const context = buildWorkContext();
  const focusLine = focus ? `\n중점 검토사항: ${focus}\n` : '';
  if (purpose === 'idea') return `제목: 자동화·로보틱스 신규 아이디어 검토 요청\n\n프로님들께,\n\n자동화·로보틱스 Radar App에 신규 아이디어 및 검토 후보를 업데이트하였습니다.${focusLine}\n각 항목을 확인하시고, 적용 가능성·현장 제약사항·PoC 필요 여부 중심으로 의견 부탁드립니다.\n\n${context}\n\n감사합니다.`;
  if (purpose === 'poc') return `제목: 자동화·로보틱스 PoC 후보 검토 요청\n\n프로님들께,\n\n현재 Radar App에 등록된 PoC 후보를 기준으로 우선 검토가 필요한 항목을 정리하였습니다.${focusLine}\nPoC Scope, KPI, 현장 적용 조건, 필요 예산·일정 관점에서 의견 부탁드립니다.\n\n${context}\n\n감사합니다.`;
  if (purpose === 'vendor') return `제목: 자동화·로보틱스 Vendor Follow-up 사항 확인 요청\n\n프로님들께,\n\nVendor Follow-up 대상 및 Clarification 필요사항을 확인 부탁드립니다.${focusLine}\n특히 자료 요청, 기술 검증, 현장 적용 제약, 비용·납기 확인이 필요한 항목을 우선 검토해 주십시오.\n\n${context}\n\n감사합니다.`;
  if (purpose === 'chat') return `제목: Team Chat 논의사항 후속 조치 공유\n\n프로님들께,\n\nRadar App Team Chat에서 논의된 내용을 기준으로 후속 조치가 필요한 항목을 공유드립니다.${focusLine}\n각 Owner는 Action 필요사항을 확인하고, Idea Board / Technology Card / PoC Pipeline에 반영 부탁드립니다.\n\n${context}\n\n감사합니다.`;
  return `제목: 자동화·로보틱스 Radar App 주간 공유\n\n프로님들께,\n\n자동화·로보틱스 Radar App 기준으로 금주 주요 검토사항을 공유드립니다.${focusLine}\n신규 기술, 아이디어, Vendor Follow-up, PoC 후보를 확인하시고 추가 의견이나 업데이트 사항이 있으면 App에 반영 부탁드립니다.\n\n${context}\n\n감사합니다.`;
}

function renderDashboard() {
  const db = appState.db;
  const topTechs = [...db.techs].map(t => ({...t, score: scoreTech(t)})).sort((a,b)=>b.score-a.score).slice(0,5);
  const openPoc = db.pocs.filter(p => p.status !== 'Closed').length;
  const dueVendors = db.vendors.filter(v => v.nextDate && v.nextDate <= today() && v.status !== 'Closed').length;
  const highPain = db.painPoints.filter(p => p.priority === 'High').length;
  const topIdeas = [...db.ideas].sort((a,b)=>ideaVoteCount(b)-ideaVoteCount(a)).slice(0,5);
  const topNews = ((appState.news && appState.news.items) || []).slice().sort((a,b)=>Number(b.relevance||0)-Number(a.relevance||0)).slice(0,5);
  const chatCount = ((appState.chat && appState.chat.messages) || []).length;
  return `
    <div class="grid cols-5">
      ${metric(db.techs.length, '기술 카드', 'Adopt/Trial/Assess/Watch/Hold')}
      ${metric(openPoc, '진행 중 PoC', 'Candidate부터 표준화까지')}
      ${metric(highPain, 'High Pain Point', '반복 문제 중심 관리')}
      ${metric(dueVendors, 'Follow-up 필요', '오늘 이전 일정 기준')}
      ${metric(chatCount, 'Team Chat', '채널별 업무 논의 메시지')}
    </div>
    <div class="grid cols-2" style="margin-top:16px;">
      <div class="card"><div class="section-head"><div><h2>우선 검토 기술 Top 5</h2><p>평가 Matrix 자동 점수 기준입니다.</p></div><button class="secondary small" onclick="setTab('techs')">전체 보기</button></div>${tableTopTechs(topTechs)}</div>
      <div class="card"><div class="section-head"><div><h2>아이디어 투표 Top 5</h2><p>그룹원 제안 및 주간회의 안건 후보입니다.</p></div><button class="secondary small" onclick="setTab('ideas')">전체 보기</button></div>${tableTopIdeas(topIdeas)}</div>
    </div>
    <div class="grid cols-2" style="margin-top:16px;">
      <div class="card"><div class="section-head"><div><h2>최근 활동</h2><p>동시 접속 사용자의 변경 사항이 실시간 반영됩니다.</p></div></div>${renderActivity(db.activity.slice(0,8))}</div>
      <div class="card"><div class="section-head"><div><h2>최신 기술 기사 Top 5</h2><p>News Radar 수집 기사 중 관련도 기준입니다.</p></div><button class="secondary small" onclick="setTab('news')">전체 보기</button></div>${tableTopNews(topNews)}</div>
      <div class="card"><h2>운영 기준</h2>
        <div class="mini-card"><strong>1. 기술은 반드시 Pain Point와 연결</strong><p>멋있는 기술이 아니라 현장 문제 해결성이 우선입니다.</p></div>
        <div class="mini-card"><strong>2. Trial 전 KPI 확정</strong><p>생산성, 안전, 품질, 비용효과를 테스트 전에 정의해야 합니다.</p></div>
        <div class="mini-card"><strong>3. Vendor Clarification 기록</strong><p>견적 조건, Reference, 적용 범위, 현장 제약을 분리해 기록합니다.</p></div>
      </div>
    </div>`;
}

function renderBaseline() {
  const b = (appState.db && appState.db.baseline) || {};
  const decision = (b.decisionRequests || []).map((x,i)=>`<li><strong>${i+1}.</strong> ${escapeHtml(x)}</li>`).join('');
  const dataFoundation = (b.dataFoundation || []).map(x=>`<li>${escapeHtml(x)}</li>`).join('');
  const kpis = (b.targetKpis || []).map(k=>`<tr><td>${escapeHtml(k.area)}</td><td>${escapeHtml(k.target)}</td><td>${escapeHtml(k.basis)}</td><td>${escapeHtml(k.note)}</td></tr>`).join('');
  const agents = (b.agentArchitecture || []).map(a=>`<tr><td>${escapeHtml(a.level)}</td><td>${escapeHtml(a.definition)}</td><td>${escapeHtml(a.example)}</td></tr>`).join('');
  const roadmap = (b.roadmap || []).map(r=>`<tr><td>${escapeHtml(r.phase)}</td><td>${escapeHtml(r.target)}</td><td>${escapeHtml(r.completion)}</td><td>${escapeHtml(r.managementPoint)}</td></tr>`).join('');
  return `
    <div class="section-head"><div><h2>Project Baseline</h2><p>첨부 보고서를 기반으로 초기 Setting한 이동형 생산기지 자동화 기준 정보입니다.</p></div><div class="meta"><button onclick="setTab('techs')">기술 카드 보기</button><button class="secondary" onclick="setTab('poc')">PoC 보기</button><button class="secondary" onclick="setTab('fabrix')">FabriX Prompt</button></div></div>
    <div class="notice ok"><strong>${escapeHtml(b.title || 'Project Baseline')}</strong><span>${escapeHtml(b.executiveMessage || '')}</span></div>
    <div class="grid cols-2" style="margin-top:16px;">
      <div class="card"><h2>의사결정 요청사항</h2><ol class="baseline-list">${decision}</ol><p class="tiny">Source: ${escapeHtml(b.sourceDocument || '-')}</p></div>
      <div class="card"><h2>Data Foundation</h2><ul class="baseline-list">${dataFoundation}</ul></div>
    </div>
    <div class="card" style="margin-top:16px;"><h2>Agent Architecture</h2><div class="table-wrap"><table><thead><tr><th>구분</th><th>정의</th><th>적용 예시</th></tr></thead><tbody>${agents}</tbody></table></div></div>
    <div class="card" style="margin-top:16px;"><h2>Target KPI</h2><div class="table-wrap"><table><thead><tr><th>성과 항목</th><th>목표 수준</th><th>산정 기준</th><th>관리 유의사항</th></tr></thead><tbody>${kpis}</tbody></table></div></div>
    <div class="card" style="margin-top:16px;"><h2>단계별 추진 기준</h2><div class="table-wrap"><table><thead><tr><th>구분</th><th>추진 목표</th><th>완료 기준</th><th>관리 포인트</th></tr></thead><tbody>${roadmap}</tbody></table></div></div>`;
}

function metric(value, label, hint) { return `<div class="card metric"><span class="value">${value}</span><span class="label">${escapeHtml(label)}</span><span class="hint">${escapeHtml(hint)}</span></div>`; }
function tableTopTechs(list) {
  if (!list.length) return `<div class="empty">등록된 기술이 없습니다.</div>`;
  return `<div class="table-wrap"><table><thead><tr><th>기술</th><th>공종</th><th>상태</th><th>점수</th><th>권고</th></tr></thead><tbody>${list.map(t => `<tr><td><strong>${escapeHtml(t.title)}</strong><br><span class="tiny">Owner: ${escapeHtml(t.owner||'-')}</span></td><td>${escapeHtml(t.trade)}</td><td>${badge(t.status)}</td><td><span class="score ${scoreClass(t.score)}">${t.score}</span></td><td>${escapeHtml(rec(t.score))}</td></tr>`).join('')}</tbody></table></div>`;
}
function tableTopIdeas(list) {
  if (!list.length) return `<div class="empty">등록된 아이디어가 없습니다.</div>`;
  return `<div class="table-wrap"><table><thead><tr><th>아이디어</th><th>제안자</th><th>투표</th><th>상태</th></tr></thead><tbody>${list.map(i => `<tr><td><strong>${escapeHtml(i.title)}</strong><br><span class="tiny">${escapeHtml(i.benefit||'')}</span></td><td>${escapeHtml(i.proposer||'-')}</td><td>${ideaVoteCount(i)}</td><td>${badge(i.status)}</td></tr>`).join('')}</tbody></table></div>`;
}

function tableTopNews(list) {
  if (!list.length) return `<div class="empty">수집된 기사가 없습니다. News Radar에서 새로고침을 실행하세요.</div>`;
  return `<div class="activity">${list.map(n => `<div class="activity-item"><strong>${escapeHtml(n.title)}</strong><span>${escapeHtml(n.source || '-')} · ${escapeHtml(n.category || '-')} · 관련도 ${Number(n.relevance || 0)}</span></div>`).join('')}</div>`;
}

function renderActivity(list) {
  if (!list?.length) return `<div class="empty">활동 이력이 없습니다.</div>`;
  return `<div class="activity">${list.map(a => `<div class="activity-item"><strong>${escapeHtml(a.user)} · ${escapeHtml(a.action)} · ${escapeHtml(a.target)}</strong><span>${escapeHtml(a.title || '')} · ${fmtDateTime(a.at)}</span></div>`).join('')}</div>`;
}

function renderRadar() {
  const db = appState.db;
  const lanes = appState.options.radarStatuses.map(status => {
    const items = db.techs.filter(t => t.status === status).sort((a,b)=>scoreTech(b)-scoreTech(a));
    return `<div class="radar-lane"><h3>${badge(status)} <span class="tiny">${items.length}건</span></h3>${items.map(t => miniTech(t)).join('') || '<div class="empty">없음</div>'}</div>`;
  }).join('');
  return `<div class="section-head"><div><h2>Technology Radar</h2><p>Adopt / Trial / Assess / Watch / Hold 기준으로 기술 도입 단계를 관리합니다.</p></div>${writeButton('+ 기술 등록', "openForm('techs')")}</div>${authHint()}<div class="radar">${lanes}</div>`;
}
function miniTech(t) {
  const s = scoreTech(t);
  const lock = canWrite() ? '' : '🔒 ';
  return `<div class="mini-card"><strong>${escapeHtml(t.title)}</strong><p>${escapeHtml(t.problem || '')}</p><div class="meta"><span class="badge">${escapeHtml(t.trade || '-')}</span><span class="score ${scoreClass(s)}">${s}</span><span class="badge">${escapeHtml(rec(s))}</span></div><p class="tiny">Next: ${escapeHtml(t.nextAction || '-')}</p><div class="meta"><button class="secondary small" onclick="openForm('techs','${t.id}')">${lock}수정</button></div></div>`;
}

function renderCollection(collection) {
  const cfg = config[collection];
  const keys = cfg.fields.map(f => f[0]);
  const sourceList = appState.db[collection] || [];
  const list = filtered(sourceList, keys);
  return `
    <div class="section-head"><div><h2>${cfg.label}</h2><p>${sectionDesc(collection)}</p></div>${writeButton('+ 신규 등록', `openForm('${collection}')`)}</div>
    ${authHint()}
    <div class="toolbar">
      <input id="searchInput" class="search" placeholder="검색어 입력" value="${escapeHtml(appState.query)}" oninput="updateSearch(this.value, '${collection}')" autocomplete="off" />
      <button class="secondary" onclick="clearSearch('${collection}')">초기화</button>
      <span id="resultCount" class="tiny">${list.length} / ${sourceList.length}건 표시</span>
    </div>
    <div id="tableArea">${renderTable(collection, list)}</div>`;
}
function updateSearch(value, collection) {
  appState.query = value;
  const cfg = config[collection];
  const keys = cfg.fields.map(f => f[0]);
  const sourceList = appState.db[collection] || [];
  const list = filtered(sourceList, keys);
  const tableArea = document.getElementById('tableArea');
  const resultCount = document.getElementById('resultCount');
  if (tableArea) tableArea.innerHTML = renderTable(collection, list);
  if (resultCount) resultCount.textContent = `${list.length} / ${sourceList.length}건 표시`;
}
function clearSearch(collection) {
  appState.query = '';
  const input = document.getElementById('searchInput');
  if (input) input.value = '';
  updateSearch('', collection);
  if (input) input.focus();
}
function sectionDesc(collection) {
  return ({
    techs: '신규 기술의 적용성, 점수, Risk, 다음 Action을 표준 양식으로 관리합니다.',
    painPoints: '현장 반복 문제를 먼저 정의하고 적용 가능한 자동화 기술과 연결합니다.',
    ideas: '그룹원 아이디어를 등록하고 투표와 상태 관리를 통해 PoC 후보로 전환합니다.',
    pocs: 'Candidate부터 Standardization까지 PoC 실행 단계를 관리합니다.',
    vendors: 'Vendor 자료 요청, Clarification, 견적, Demo 일정을 누락 없이 추적합니다.',
    actionItems: '채팅, 회의, Vendor 논의에서 도출된 후속조치와 담당자·기한을 관리합니다.',
    meetingNotes: '회의 안건, 논의사항, 결정사항, 후속조치를 기록하고 Action Item으로 전환합니다.',
    decisionLogs: '주요 의사결정의 배경, 대안, 최종 판단과 근거를 남겨 반복 논의를 줄입니다.'
  })[collection] || '등록된 업무 항목을 관리합니다.';
}
function renderTable(collection, list) {
  if (!list.length) return `<div class="empty">표시할 데이터가 없습니다.</div>`;
  const rows = list.map(item => rowTemplate(collection, item)).join('');
  return `<div class="table-wrap"><table>${headTemplate(collection)}<tbody>${rows}</tbody></table></div>`;
}
function actions(collection, item) {
  const lock = canWrite() ? '' : '🔒 ';
  const edit = `<button class="secondary small" onclick="openForm('${collection}', '${item.id}')">${lock}수정</button><button class="danger small" onclick="deleteItem('${collection}', '${item.id}')">${lock}삭제</button>`;
  let vote = '';
  if (collection === 'ideas') {
    const voted = hasVotedIdea(item);
    const label = voted ? '👍 취소' : '👍 좋아요';
    const cls = voted ? 'secondary small voted' : 'small';
    vote = `<button class="${cls}" onclick="voteIdea('${item.id}')">${lock}${label}</button>`;
  }
  return `<div class="meta">${vote}${edit}</div>`;
}
function headTemplate(collection) {
  const heads = {
    techs: ['기술', '분류/공종', 'Vendor', 'TRL', '점수', 'Next Action', '수정'],
    painPoints: ['현장 문제', '공종/위치', '영향', '자동화 가능성', '연결 기술', '수정'],
    ideas: ['아이디어', '제안자/공종', '기대효과', '투표', '상태', '수정'],
    pocs: ['PoC', '단계', '기간', 'KPI', '결과/현황', '수정'],
    vendors: ['Vendor', '기술', '상태', '다음 일정', 'Clarification', '수정'],
    actionItems: ['Action', '담당/기한', '상태/우선순위', '내용', 'Source', '수정'],
    meetingNotes: ['회의명', '일자/참석자', 'Agenda', '결정사항', 'Action Items', '수정'],
    decisionLogs: ['결정 제목', '상태/Owner', '결정일/재검토일', '최종 결정', '결정 근거', '수정']
  }[collection] || ['제목', '내용', '상태', '수정'];
  return `<thead><tr>${heads.map(h => `<th>${h}</th>`).join('')}</tr></thead>`;
}
function rowTemplate(collection, item) {
  if (collection === 'techs') {
    const s = scoreTech(item);
    return `<tr><td><strong>${escapeHtml(item.title)}</strong><br><span class="tiny">Owner: ${escapeHtml(item.owner||'-')} · Updated: ${escapeHtml(item.updatedBy||'-')}</span><br>${badge(item.status)}</td><td>${escapeHtml(item.category||'-')}<br>${escapeHtml(item.trade||'-')}</td><td>${escapeHtml(item.vendor||'-')}</td><td>${escapeHtml(item.trl||'-')}</td><td><span class="score ${scoreClass(s)}">${s}</span><br><span class="tiny">${escapeHtml(rec(s))}</span></td><td>${escapeHtml(item.nextAction||'-')}</td><td>${actions(collection,item)}</td></tr>`;
  }
  if (collection === 'painPoints') return `<tr><td><strong>${escapeHtml(item.title)}</strong><br>${priorityBadge(item.priority)} <span class="tiny">Owner: ${escapeHtml(item.owner||'-')}</span></td><td>${escapeHtml(item.trade||'-')}<br>${escapeHtml(item.area||'-')}</td><td>${escapeHtml(item.impact||'-')}</td><td>${badge(item.potential)}</td><td>${escapeHtml(item.linkedTech||'-')}</td><td>${actions(collection,item)}</td></tr>`;
  if (collection === 'ideas') {
    const voted = hasVotedIdea(item);
    const voters = voteUserNames(item);
    return `<tr><td><strong>${escapeHtml(item.title)}</strong><br><span class="tiny">${escapeHtml(item.description||'')}</span></td><td>${escapeHtml(item.proposer||'-')}<br>${escapeHtml(item.trade||'-')}</td><td>${escapeHtml(item.benefit||'-')}</td><td><strong>${ideaVoteCount(item)}</strong>${voted ? '<br><span class="badge adopt">내 투표</span>' : ''}${voters ? `<br><span class="tiny">${escapeHtml(voters)}</span>` : ''}</td><td>${badge(item.status)}</td><td>${actions(collection,item)}</td></tr>`;
  }
  if (collection === 'pocs') return `<tr><td><strong>${escapeHtml(item.title)}</strong><br><span class="tiny">${escapeHtml(item.linkedTech||'-')} · Owner: ${escapeHtml(item.owner||'-')}</span></td><td>${badge(item.stage)}<br>${badge(item.status)}</td><td>${escapeHtml(item.start||'-')}<br>~ ${escapeHtml(item.end||'-')}</td><td>${escapeHtml(item.kpi||'-')}</td><td>${escapeHtml(item.result||'-')}</td><td>${actions(collection,item)}</td></tr>`;
  if (collection === 'vendors') return `<tr><td><strong>${escapeHtml(item.name)}</strong><br><span class="tiny">Owner: ${escapeHtml(item.owner||'-')}</span></td><td>${escapeHtml(item.technology||'-')}</td><td>${badge(item.status)}</td><td>${escapeHtml(item.nextDate||'-')}</td><td>${escapeHtml(item.notes||'-')}</td><td>${actions(collection,item)}</td></tr>`;
  if (collection === 'actionItems') {
    const due = dueStatus(item.dueDate);
    return `<tr><td><strong>${escapeHtml(item.title)}</strong><br><span class="tiny">Updated: ${escapeHtml(item.updatedBy||'-')}</span></td><td>${escapeHtml(item.owner||'-')}<br><span class="status ${due.cls}">${escapeHtml(due.label)}</span></td><td>${badge(item.status)}<br>${priorityBadge(item.priority)}</td><td>${escapeHtml(item.description||'-')}</td><td>${escapeHtml(item.sourceType||'-')}<br><span class="tiny">${escapeHtml(item.sourceId||'')}</span></td><td>${actions(collection,item)}</td></tr>`;
  }
  if (collection === 'meetingNotes') {
    return `<tr><td><strong>${escapeHtml(item.title)}</strong><br><span class="tiny">Updated: ${escapeHtml(item.updatedBy||'-')}</span></td><td>${escapeHtml(item.date||'-')}<br><span class="tiny">${escapeHtml(item.attendees||'-')}</span></td><td>${escapeHtml(item.agenda||'-')}</td><td>${escapeHtml(item.decisions||'-')}</td><td>${escapeHtml(item.actions||'-')}</td><td><div class="meta">${actions(collection,item)}<button class="secondary small" onclick="meetingToActions('${item.id}')">Action 전환</button></div></td></tr>`;
  }
  if (collection === 'decisionLogs') {
    return `<tr><td><strong>${escapeHtml(item.title)}</strong><br><span class="tiny">Updated: ${escapeHtml(item.updatedBy||'-')}</span></td><td>${badge(item.status)}<br><span class="tiny">Owner: ${escapeHtml(item.owner||'-')}</span></td><td>${escapeHtml(item.date||'-')}<br><span class="tiny">Review: ${escapeHtml(item.nextReview||'-')}</span></td><td>${escapeHtml(item.decision||'-')}</td><td>${escapeHtml(item.rationale||'-')}</td><td>${actions(collection,item)}</td></tr>`;
  }
  return `<tr><td><strong>${escapeHtml(item.title || item.name || item.id || '-')}</strong></td><td>${escapeHtml(item.description || item.notes || '-')}</td><td>${escapeHtml(item.status || '-')}</td><td>${actions(collection,item)}</td></tr>`;
}

function renderNews() {
  const news = appState.news || { meta: {}, items: [] };
  const items = filterNews(news.items || []);
  const errors = (news.meta && news.meta.errors) || [];
  const categoryOptions = ['All'].concat(appState.options?.newsCategories || []);
  return `
    <div class="section-head"><div><h2>News Radar</h2><p>자동화·로보틱스 관련 최신 기사/RSS를 수집하고 Technology Card 또는 Idea Board로 전환합니다.</p></div>
      <div class="meta"><button onclick="refreshNews()" ${canWrite()?'':'title="editor/admin 로그인 필요"'}>${canWrite()?'':'🔒 '}기사 새로고침</button><button class="secondary" onclick="openManualNewsForm()">${canWrite()?'':'🔒 '}기사 수동 등록</button></div>
    </div>
    ${authHint()}
    <div class="grid cols-5">
      ${metric((news.items || []).length, '수집 기사', '최근 캐시 기준')}
      ${metric((news.items || []).filter(n => n.relevance >= 80).length, 'High Relevance', '관련도 80점 이상')}
      ${metric((news.items || []).filter(n => n.saved).length, '전환/저장 표시', 'Card 또는 Idea 전환 후보')}
      ${metric(news.meta?.lastRefreshAt ? fmtDateTime(news.meta.lastRefreshAt) : '-', 'Last Refresh', news.meta?.lastRefreshStatus || 'Not refreshed')}
    </div>
    <div class="toolbar" style="margin-top:16px;">
      <input id="newsSearchInput" class="search" placeholder="기사 검색어 입력" value="${escapeHtml(appState.newsQuery)}" oninput="updateNewsSearch(this.value)" autocomplete="off" />
      <select class="search" style="max-width:260px;" onchange="updateNewsCategory(this.value)">${categoryOptions.map(c => `<option value="${escapeHtml(c)}" ${appState.newsCategory===c?'selected':''}>${escapeHtml(c)}</option>`).join('')}</select>
      <button class="secondary" onclick="clearNewsSearch()">초기화</button>
      <span class="tiny">${items.length} / ${(news.items || []).length}건 표시</span>
    </div>
    ${errors.length ? `<div class="notice warn"><strong>일부 기사 소스 수집 실패</strong><span>${errors.map(e => `${escapeHtml(e.source)}: ${escapeHtml(e.error)}`).join('<br>')}</span></div>` : ''}
    <div class="news-list">${items.length ? items.map(newsCard).join('') : '<div class="empty">표시할 기사가 없습니다. 서버 PC의 외부 인터넷 접속 가능 여부를 확인한 뒤 새로고침을 실행하세요.</div>'}</div>
    <div class="card" style="margin-top:16px;"><h2>News Source</h2><p class="tiny">기본 소스는 data/news_sources.json에 저장되어 있습니다. 사내망에서 Google News RSS가 차단되면 수동 등록 기능으로 기사 링크를 등록할 수 있습니다.</p>${renderNewsSources()}</div>`;
}
function filterNews(items) {
  const q = appState.newsQuery.trim().toLowerCase();
  return items.filter(n => {
    const byCategory = appState.newsCategory === 'All' || String(n.category || '') === appState.newsCategory;
    const byQuery = !q || ['title','source','summary','category','language'].some(k => String(n[k] || '').toLowerCase().includes(q));
    return byCategory && byQuery;
  });
}
function renderNewsSources() {
  if (!appState.newsSources || !appState.newsSources.length) return '<div class="empty">소스 정보 없음</div>';
  return `<div class="table-wrap"><table><thead><tr><th>Source</th><th>Language</th><th>Status</th></tr></thead><tbody>${appState.newsSources.map(s => `<tr><td>${escapeHtml(s.name)}</td><td>${escapeHtml(s.language || '-')}</td><td>${s.enabled === false ? badge('Hold') : badge('Adopt')}</td></tr>`).join('')}</tbody></table></div>`;
}
function newsCard(n) {
  const published = n.publishedAt ? fmtDateTime(n.publishedAt) : '-';
  const link = n.link ? `<a class="button ghost small" href="${escapeHtml(n.link)}" target="_blank" rel="noreferrer">원문 열기</a>` : '';
  const saved = n.saved ? '<span class="badge adopt">Saved</span>' : '';
  const lock = canWrite() ? '' : '🔒 ';
  return `<div class="card news-card"><div class="section-head"><div><h3>${escapeHtml(n.title)}</h3><p>${escapeHtml(n.source || '-')} · ${escapeHtml(n.language || '-')} · ${published}</p></div><div class="meta">${badge(n.category || 'General')}<span class="score ${scoreClass(Number(n.relevance || 0))}">${Number(n.relevance || 0)}</span>${saved}</div></div>
    <p>${escapeHtml(n.summary || '')}</p>
    <div class="meta">${link}<button class="secondary small" onclick="convertNewsToTech('${n.id}')">${lock}Technology Card로 전환</button><button class="secondary small" onclick="convertNewsToIdea('${n.id}')">${lock}Idea로 전환</button><button class="danger small" onclick="deleteNews('${n.id}')">${lock}삭제</button></div>
  </div>`;
}
function updateNewsSearch(value) { appState.newsQuery = value; const app = document.getElementById('app'); if (app) app.innerHTML = renderNews(); const input = document.getElementById('newsSearchInput'); if (input) { input.focus(); input.setSelectionRange(value.length, value.length); } }
function updateNewsCategory(value) { appState.newsCategory = value; render(); }
function clearNewsSearch() { appState.newsQuery = ''; appState.newsCategory = 'All'; render(); }
async function fetchNews() {
  const data = await api('/api/news');
  appState.news = data.news;
  appState.newsSources = data.sources || [];
}
async function refreshNews() {
  if (!canWrite()) {
    if (!appState.user) { toast('기사 새로고침은 로그인 후 가능합니다.'); openLogin(); return; }
    toast('현재 계정은 조회 전용입니다. editor 또는 admin 권한이 필요합니다.');
    return;
  }
  try {
    toast('기사 수집 중입니다. 외부망 상태에 따라 시간이 걸릴 수 있습니다.');
    const data = await api('/api/news/refresh', { method:'POST', body:'{}' });
    appState.news = data.news;
    await fetchNews();
    render();
    toast('기사 목록을 업데이트했습니다.');
  } catch(e) { toast(e.message); }
}
function openManualNewsForm() {
  if (!canWrite()) {
    if (!appState.user) { toast('수동 등록은 로그인 후 가능합니다.'); openLogin(); return; }
    toast('현재 계정은 조회 전용입니다. editor 또는 admin 권한이 필요합니다.');
    return;
  }
  openModal('기사 수동 등록', '사내망에서 외부 RSS가 차단되거나 별도 참고 링크를 남길 때 사용합니다.', `
    <div class="form-grid">
      <div class="field span-2"><label>기사 제목</label><input name="title" required /></div>
      <div class="field"><label>출처</label><input name="source" placeholder="언론사 / 기관" /></div>
      <div class="field"><label>언어</label><select name="language">${opt(optionList('languages'), 'Korean')}</select></div>
      <div class="field"><label>분류</label><select name="category">${opt(optionList('newsCategories'), 'Construction Tech')}</select></div>
      <div class="field"><label>발행일</label><input name="publishedAt" type="date" value="${today()}" /></div>
      <div class="field"><label>관련도 0~100</label><input name="relevance" type="number" value="70" /></div>
      <div class="field span-3"><label>요약</label><textarea name="summary"></textarea></div>
      <div class="field span-3"><label>원문 링크</label><textarea name="link"></textarea></div>
    </div>
    <div class="form-actions"><button class="secondary" onclick="closeModal()">취소</button><button onclick="saveManualNews()">저장</button></div>`);
}
async function saveManualNews() {
  const fd = new FormData(document.getElementById('modalBody'));
  const obj = Object.fromEntries(fd.entries());
  obj.relevance = Number(obj.relevance || 0);
  try {
    const data = await api('/api/news/manual', { method:'POST', body: JSON.stringify(obj) });
    appState.news = data.news;
    closeModal(); render(); toast('기사를 등록했습니다.');
  } catch(e) { toast(e.message); }
}
function findNews(id) { return ((appState.news && appState.news.items) || []).find(n => n.id === id); }
async function markNewsSaved(id) { try { const data = await api(`/api/news/${id}/saved`, { method:'POST', body:'{}' }); appState.news = data.news; } catch(e) {} }
function convertNewsToTech(id) {
  if (!canWrite()) { if (!appState.user) { toast('전환은 로그인 후 가능합니다.'); openLogin(); return; } toast('editor 또는 admin 권한이 필요합니다.'); return; }
  const n = findNews(id); if (!n) return;
  const preset = {
    title: n.title,
    status: Number(n.relevance || 0) >= 80 ? 'Assess' : 'Watch',
    category: n.category === 'Construction Tech' ? 'Robotics' : n.category,
    trade: 'Common',
    owner: appState.user?.name || '',
    problem: `기사 기반 기술 후보입니다.\n\n요약: ${n.summary || '-'}\n\n출처: ${n.source || '-'} / 발행일: ${n.publishedAt || '-'}`,
    location: 'TBD / Field applicability review required',
    vendor: n.source || '',
    trl: 4,
    difficulty: 'Medium',
    productivity: 10,
    safety: 8,
    cost: 5,
    scalability: 6,
    nextAction: '기사 원문 확인 후 Vendor, Reference, 적용 가능 공종, PoC 필요성을 검토',
    notes: `Original article link:\n${n.link || ''}`,
    links: n.link || ''
  };
  markNewsSaved(id);
  openForm('techs', null, preset);
}
function convertNewsToIdea(id) {
  if (!canWrite()) { if (!appState.user) { toast('전환은 로그인 후 가능합니다.'); openLogin(); return; } toast('editor 또는 admin 권한이 필요합니다.'); return; }
  const n = findNews(id); if (!n) return;
  const preset = {
    title: n.title,
    status: 'New',
    proposer: appState.user?.name || '',
    trade: 'Common',
    difficulty: 'Medium',
    baseVotes: 0,
    voteUsers: [],
    votes: 0,
    description: `기사 기반 아이디어입니다.\n\n요약: ${n.summary || '-'}\n\n출처: ${n.source || '-'} / 발행일: ${n.publishedAt || '-'}\n링크: ${n.link || '-'}`,
    benefit: '현장 적용 가능성을 검토하여 Technology Card 또는 PoC 후보로 전환 가능',
    linkedTech: n.category || ''
  };
  markNewsSaved(id);
  openForm('ideas', null, preset);
}
async function deleteNews(id) {
  if (!canWrite()) { if (!appState.user) { toast('삭제는 로그인 후 가능합니다.'); openLogin(); return; } toast('editor 또는 admin 권한이 필요합니다.'); return; }
  if (!confirm('이 기사를 News Radar에서 삭제하시겠습니까?')) return;
  try {
    const data = await api(`/api/news/${id}`, { method:'DELETE' });
    appState.news = data.news;
    render(); toast('기사를 삭제했습니다.');
  } catch(e) { toast(e.message); }
}



async function fetchChat(silent=false) {
  try {
    const data = await api('/api/chat');
    appState.chat = data.chat;
    if (appState.chat && appState.chat.channels && !appState.chat.channels.includes(appState.chatChannel)) appState.chatChannel = appState.chat.channels[0] || 'General';
    if (!silent && appState.activeTab === 'chat') render();
    if (!silent) toast('Team Chat을 새로고침했습니다.');
  } catch(e) { if (!silent) toast(e.message); }
}

function chatChannels() {
  if (appState.chat && Array.isArray(appState.chat.channels) && appState.chat.channels.length) return appState.chat.channels;
  return (appState.options && appState.options.chatChannels) || ['General'];
}

function renderChat() {
  const channels = chatChannels();
  const allChannelMessages = ((appState.chat && appState.chat.messages) || [])
    .filter(m => (m.channel || 'General') === appState.chatChannel);
  const messages = allChannelMessages
    .filter(m => !m.parentId)
    .filter(m => !appState.chatQuery || String(m.message || '').toLowerCase().includes(appState.chatQuery.toLowerCase()) || String(m.userName || '').toLowerCase().includes(appState.chatQuery.toLowerCase()))
    .sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
  const pinnedMessages = messages.filter(m => m.pinned).sort((a,b)=>new Date(b.pinnedAt || b.createdAt)-new Date(a.pinnedAt || a.createdAt));
  const writeDisabled = !canWrite();
  const inputNotice = writeDisabled
    ? `<div class="notice warn"><strong>채팅 입력 제한</strong><span>${appState.user ? '현재 viewer 권한입니다. 메시지 입력은 editor 또는 admin 권한 계정으로 로그인해야 합니다.' : '현재 로그인하지 않았습니다. 우측 상단 Login 또는 아래 버튼으로 member / 1111 또는 개인 계정으로 로그인해 주세요.'}</span></div>`
    : `<div class="notice ok"><strong>채팅 입력 가능</strong><span>현재 ${escapeHtml(appState.user.name)} 계정으로 로그인되어 있습니다. Enter는 전송, Shift+Enter는 줄바꿈입니다.</span></div>`;
  return `
    <div class="section-head"><div><h2>Team Chat</h2><p>자동화·로보틱스 기술, Vendor, PoC, News 관련 논의를 채널별로 공유합니다.</p></div><div class="meta"><button class="secondary" onclick="fetchChat()">새로고침</button></div></div>
    ${authHint()}
    <div class="chat-layout">
      <div class="card chat-side">
        <h3>Channels</h3>
        ${channels.map(ch => `<button class="chat-channel ${appState.chatChannel===ch?'active':''}" onclick="setChatChannel('${escapeJs(ch)}')">${escapeHtml(ch)}</button>`).join('')}
        <div class="chat-side-section"><div class="side-title">현재 접속자</div><div id="onlineUsersPanel">${renderOnlineUsers()}</div></div>
        <div class="notice" style="margin-top:12px;"><strong>@ 호출</strong><span>메시지 입력창에서 @를 입력하면 등록된 그룹원 목록이 표시됩니다. 선택하거나 @KnoxID 형식으로 직접 입력하면 상대방 화면에 알림이 표시됩니다.</span></div>
        <button class="secondary small" style="width:100%;" onclick="requestNotificationPermission()">브라우저 알림 허용</button>
      </div>
      <div class="card chat-main">
        <div class="toolbar">
          <select style="max-width:260px" onchange="setChatChannel(this.value)">${channels.map(ch => `<option value="${escapeHtml(ch)}" ${appState.chatChannel===ch?'selected':''}>${escapeHtml(ch)}</option>`).join('')}</select>
          <input id="chatSearchInput" class="search" placeholder="채팅 검색" value="${escapeHtml(appState.chatQuery)}" oninput="setChatQuery(this.value)" />
          <span class="tiny">${messages.length}건 표시</span>
        </div>
        <div class="pinned-box">${renderPinnedMessages(pinnedMessages)}</div><div id="chatMessages" class="chat-messages">${messages.map(renderChatMessage).join('') || '<div class="empty">아직 메시지가 없습니다.</div>'}</div>
        <div class="chat-input-box">
          ${inputNotice}
          <textarea id="chatInput" placeholder="메시지를 입력하세요. @ 입력 시 그룹원 목록이 표시됩니다. Enter=전송, Shift+Enter=줄바꿈" ${writeDisabled?'disabled':''} oninput="updateChatDraft(this.value)" onkeyup="updateMentionSuggestions()" onclick="updateMentionSuggestions()" onblur="setTimeout(hideMentionSuggestions, 160)" onkeydown="handleChatKey(event)">${escapeHtml(appState.chatDraft || '')}</textarea>
          <div id="chatMentionSuggestions" class="mention-suggestions"></div>
          <div class="attachment-toolbar">
            <label class="attach-label ${writeDisabled?'disabled':''}">📎 이미지/동영상 첨부
              <input id="chatFileInput" type="file" accept="image/*,video/*" multiple ${writeDisabled?'disabled':''} onchange="setChatFiles(this.files)" />
            </label>
            <span class="tiny">최대 3개, 파일당 25MB 이하 권장. 대용량 영상은 짧게 편집 후 업로드하십시오.</span>
          </div>
          <div id="chatSelectedFiles" class="selected-files">${renderSelectedFiles()}</div>
          <div class="form-actions"><button class="secondary" onclick="clearChatInput()">초기화</button>${writeDisabled && !appState.user ? '<button onclick="openLogin()">로그인</button>' : `<button onclick="sendChatMessage()" ${writeDisabled || appState.chatUploading?'disabled':''}>${appState.chatUploading?'업로드 중...':'전송'}</button>`}</div>
        </div>
      </div>
    </div>`;
}

function escapeJs(str='') { return String(str).replace(/\\/g,'\\\\').replace(/'/g,"\\'"); }
function setChatChannel(channel) { appState.chatChannel = channel || 'General'; appState.chatQuery = ''; render(); setTimeout(scrollChatBottom, 20); }
function setChatQuery(value) {
  appState.chatQuery = value;
  clearTimeout(appState.chatSearchTimer);
  appState.chatSearchTimer = setTimeout(() => { render(); const el=document.getElementById('chatSearchInput'); if (el) { el.focus(); const len=el.value.length; try { el.setSelectionRange(len, len); } catch(e){} } }, 180);
}
function renderChatMessage(m) {
  const mine = appState.user && m.userId === appState.user.id;
  const canDelete = canWrite() && (mine || isAdmin());
  const saved = isChatSaved(m);
  const replies = chatReplies(m.id);
  const open = appState.openThreadId === m.id;
  return `<div data-msg-id="${m.id}" class="chat-msg ${mine?'mine':''} ${m.pinned?'pinned-msg':''}">
    <div class="chat-meta"><strong>${escapeHtml(m.userName || 'Unknown')}</strong><span>${escapeHtml(m.role || '')} · ${fmtDateTime(m.createdAt)}${m.pinned ? ' · 📌 pinned' : ''}</span></div>
    <div class="chat-body">${renderMessageText(m.message || '')}${renderMentionPills(m.mentions)}${renderChatAttachments(m.attachments)}</div>
    ${renderChatReactions(m)}
    <div class="meta chat-actions">
      <button class="secondary small" onclick="toggleThread('${m.id}')">💬 Thread ${replies.length ? '('+replies.length+')' : ''}</button>
      <button class="secondary small" onclick="toggleChatPin('${m.id}')">${m.pinned?'📌 고정 해제':'📌 Pin'}</button>
      <button class="secondary small" onclick="toggleChatSave('${m.id}')">${saved?'★ 저장 취소':'☆ 저장'}</button>
      ${renderReactionButtons(m)}
      <button class="secondary small" onclick="convertChatToIdea('${m.id}')">Idea</button>
      <button class="secondary small" onclick="convertChatToTech('${m.id}')">Tech</button>
      <button class="secondary small" onclick="convertChatToAction('${m.id}')">Task</button>
      <button class="secondary small" onclick="convertChatToPoc('${m.id}')">PoC</button>
      <button class="secondary small" onclick="convertChatToVendor('${m.id}')">Vendor</button>
      ${canDelete ? `<button class="danger small" onclick="deleteChatMessage('${m.id}')">삭제</button>` : ''}
    </div>
    ${open ? renderThreadPanel(m, replies) : ''}
  </div>`;
}


function chatReplies(id) {
  return ((appState.chat && appState.chat.messages) || []).filter(x => x.parentId === id).sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt));
}
function isChatSaved(m) { return !!(appState.user && Array.isArray(m.savedBy) && m.savedBy.includes(appState.user.id)); }
function renderPinnedMessages(messages) {
  if (!messages || !messages.length) return '<div class="tiny">고정된 메시지가 없습니다. 중요한 지시·링크·PoC 기준은 Pin으로 고정하십시오.</div>';
  return `<div class="pinned-title">📌 Pinned in ${escapeHtml(appState.chatChannel)}</div>` + messages.slice(0,5).map(m => `<div class="pinned-item" onclick="focusChatMessage('${m.id}')"><strong>${escapeHtml(m.userName || '')}</strong><span>${renderMessageText(String(m.message || '').slice(0,160))}</span></div>`).join('');
}
function renderChatReactions(m) {
  const reactions = m.reactions || {};
  const items = Object.entries(reactions).filter(([r, users]) => Array.isArray(users) && users.length);
  if (!items.length) return '';
  return `<div class="reaction-row">${items.map(([r, users]) => `<button class="reaction-pill" onclick="toggleChatReaction('${m.id}','${escapeJs(r)}')">${escapeHtml(r)} ${users.length}</button>`).join('')}</div>`;
}
function renderReactionButtons(m) {
  return ['👍','👀','✅','⚠️','💡'].map(r => `<button class="ghost small reaction-btn" title="Reaction ${r}" onclick="toggleChatReaction('${m.id}','${escapeJs(r)}')">${r}</button>`).join('');
}
function renderThreadPanel(parent, replies) {
  const writeDisabled = !canWrite();
  const val = appState.threadDrafts[parent.id] || '';
  return `<div class="thread-panel">
    <div class="thread-title">Thread · ${escapeHtml(parent.userName || '')}님의 메시지</div>
    <div class="thread-replies">${replies.length ? replies.map(renderThreadReply).join('') : '<div class="empty small-empty">아직 댓글이 없습니다.</div>'}</div>
    <div class="thread-input"><textarea id="threadInput_${parent.id}" placeholder="Thread 댓글 입력" ${writeDisabled?'disabled':''} oninput="appState.threadDrafts['${parent.id}']=this.value" onkeydown="handleThreadKey(event,'${parent.id}')">${escapeHtml(val)}</textarea><button onclick="sendThreadReply('${parent.id}')" ${writeDisabled?'disabled':''}>댓글</button></div>
  </div>`;
}
function renderThreadReply(m) {
  return `<div class="thread-reply"><strong>${escapeHtml(m.userName || '')}</strong><span>${fmtDateTime(m.createdAt)}</span><div>${renderMessageText(m.message || '')}${renderMentionPills(m.mentions)}</div></div>`;
}
function focusChatMessage(id) { appState.openThreadId = id; render(); setTimeout(()=>{ const el=document.querySelector(`[data-msg-id="${id}"]`); if(el) el.scrollIntoView({behavior:'smooth', block:'center'}); }, 50); }

function renderMessageText(message='') {
  const raw = escapeHtml(message || '').replace(/@([a-zA-Z0-9._-]+)/g, '<span class="mention-token">@$1</span>');
  return raw.replaceAll('\n','<br>');
}
function renderMentionPills(mentions) {
  if (!Array.isArray(mentions) || !mentions.length) return '';
  return `<div class="mention-pills">${mentions.map(m => `<span class="mention-pill">@${escapeHtml(m.loginId || m.name || '')}</span>`).join('')}</div>`;
}
function renderChatAttachments(attachments) {
  if (!Array.isArray(attachments) || !attachments.length) return '';
  return `<div class="chat-attachments">${attachments.map(a => {
    const url = escapeHtml(a.url || '');
    const name = escapeHtml(a.originalName || a.filename || 'attachment');
    const size = formatBytes(a.size || 0);
    if (String(a.mimeType || '').startsWith('image/')) {
      return `<a class="chat-attachment" href="${url}" target="_blank" rel="noreferrer"><img src="${url}" alt="${name}" loading="lazy" /><span>${name} · ${size}</span></a>`;
    }
    if (String(a.mimeType || '').startsWith('video/')) {
      return `<div class="chat-attachment video"><video controls preload="metadata" src="${url}"></video><a href="${url}" target="_blank" rel="noreferrer">${name} · ${size}</a></div>`;
    }
    return `<a class="chat-attachment" href="${url}" target="_blank" rel="noreferrer">${name} · ${size}</a>`;
  }).join('')}</div>`;
}
function formatBytes(bytes) {
  const n = Number(bytes || 0);
  if (n < 1024) return n + ' B';
  if (n < 1024*1024) return (n/1024).toFixed(1) + ' KB';
  return (n/1024/1024).toFixed(1) + ' MB';
}
function renderSelectedFiles() {
  if (!appState.chatFiles || !appState.chatFiles.length) return '';
  return appState.chatFiles.map((f, idx) => `<span class="selected-file">${escapeHtml(f.name)} · ${formatBytes(f.size)} <button class="ghost small" onclick="removeChatFile(${idx})">제거</button></span>`).join('');
}
function setChatFiles(fileList) {
  const files = Array.from(fileList || []);
  const allowed = files.filter(f => (f.type || '').startsWith('image/') || (f.type || '').startsWith('video/')).slice(0, 3);
  const tooBig = allowed.find(f => f.size > 25 * 1024 * 1024);
  if (tooBig) { toast(`파일 크기가 너무 큽니다: ${tooBig.name}. 파일당 25MB 이하로 올려 주십시오.`); return; }
  appState.chatFiles = allowed;
  const box = document.getElementById('chatSelectedFiles');
  if (box) box.innerHTML = renderSelectedFiles();
}
function removeChatFile(idx) {
  appState.chatFiles.splice(idx, 1);
  const box = document.getElementById('chatSelectedFiles');
  if (box) box.innerHTML = renderSelectedFiles();
}
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('파일 읽기 실패'));
    reader.readAsDataURL(file);
  });
}
async function uploadChatFiles(files) {
  const uploaded = [];
  for (const file of files) {
    const dataUrl = await fileToDataUrl(file);
    const res = await api('/api/uploads', { method: 'POST', body: JSON.stringify({ filename: file.name, mimeType: file.type, dataUrl }) });
    uploaded.push(res.attachment);
  }
  return uploaded;
}
function findChatMessage(id) { return ((appState.chat && appState.chat.messages) || []).find(m => m.id === id); }
function updateChatDraft(value) { appState.chatDraft = value || ''; updateMentionSuggestions(); }
function clearChatInput() { appState.chatDraft = ''; appState.chatFiles = []; hideMentionSuggestions(); const el = document.getElementById('chatInput'); if (el) el.value = ''; const file = document.getElementById('chatFileInput'); if (file) file.value = ''; const box = document.getElementById('chatSelectedFiles'); if (box) box.innerHTML = ''; }
function handleChatKey(ev) {
  const s = appState.mentionSuggest;
  if (s && s.active) {
    if (ev.key === 'ArrowDown') { ev.preventDefault(); moveMentionSuggestion(1); return; }
    if (ev.key === 'ArrowUp') { ev.preventDefault(); moveMentionSuggestion(-1); return; }
    if ((ev.key === 'Enter' || ev.key === 'Tab') && !ev.shiftKey && s.users && s.users.length) {
      ev.preventDefault();
      selectMentionSuggestion(s.users[s.index || 0].loginId);
      return;
    }
    if (ev.key === 'Escape') { ev.preventDefault(); hideMentionSuggestions(); return; }
  }
  if (ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); sendChatMessage(); }
  if (ev.ctrlKey && ev.key === 'Enter') { ev.preventDefault(); sendChatMessage(); }
}
function scrollChatBottom() { const el = document.getElementById('chatMessages'); if (el) el.scrollTop = el.scrollHeight; }
async function sendChatMessage() {
  if (!canWrite()) { if (!appState.user) { toast('채팅은 로그인 후 가능합니다.'); openLogin(); return; } toast('editor 또는 admin 권한이 필요합니다.'); return; }
  const el = document.getElementById('chatInput');
  const message = ((el && el.value) || appState.chatDraft || '').trim();
  const files = appState.chatFiles || [];
  if (!message && !files.length) { toast('메시지 또는 첨부파일을 입력하세요.'); return; }
  try {
    appState.chatUploading = true;
    render();
    const attachments = files.length ? await uploadChatFiles(files) : [];
    const data = await api('/api/chat', { method:'POST', body: JSON.stringify({ channel: appState.chatChannel, message, attachments }) });
    appState.chat = data.chat;
    appState.chatDraft = '';
    appState.chatFiles = [];
    appState.chatUploading = false;
    if (el) el.value = '';
    render(); setTimeout(scrollChatBottom, 20); toast('메시지를 전송했습니다.');
  } catch(e) { appState.chatUploading = false; render(); toast(e.message); }
}
async function deleteChatMessage(id) {
  if (!confirm('이 메시지를 삭제하시겠습니까?')) return;
  try {
    const data = await api(`/api/chat/${id}`, { method:'DELETE' });
    appState.chat = data.chat;
    render(); toast('메시지를 삭제했습니다.');
  } catch(e) { toast(e.message); }
}

async function toggleChatPin(id) {
  if (!canWrite()) { if (!appState.user) openLogin(); else toast('editor/admin 권한이 필요합니다.'); return; }
  try { const data = await api(`/api/chat/${id}/pin`, { method:'POST', body:'{}' }); appState.chat = data.chat; render(); toast(data.item.pinned ? '메시지를 고정했습니다.' : '고정을 해제했습니다.'); } catch(e) { toast(e.message); }
}
async function toggleChatSave(id) {
  if (!canWrite()) { if (!appState.user) openLogin(); else toast('editor/admin 권한이 필요합니다.'); return; }
  try { const data = await api(`/api/chat/${id}/save`, { method:'POST', body:'{}' }); appState.chat = data.chat; render(); toast(data.saved ? 'My Follow-up에 저장했습니다.' : '저장을 취소했습니다.'); } catch(e) { toast(e.message); }
}
async function toggleChatReaction(id, reaction) {
  if (!canWrite()) { if (!appState.user) openLogin(); else toast('editor/admin 권한이 필요합니다.'); return; }
  try { const data = await api(`/api/chat/${id}/reaction`, { method:'POST', body: JSON.stringify({ reaction }) }); appState.chat = data.chat; render(); } catch(e) { toast(e.message); }
}
function toggleThread(id) { appState.openThreadId = appState.openThreadId === id ? '' : id; render(); }
function handleThreadKey(ev, id) { if (ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); sendThreadReply(id); } }
async function sendThreadReply(parentId) {
  if (!canWrite()) { if (!appState.user) openLogin(); else toast('editor/admin 권한이 필요합니다.'); return; }
  const el = document.getElementById(`threadInput_${parentId}`);
  const message = (el && el.value || appState.threadDrafts[parentId] || '').trim();
  if (!message) { toast('댓글 내용을 입력하십시오.'); return; }
  try {
    const data = await api(`/api/chat/${parentId}/thread`, { method:'POST', body: JSON.stringify({ message, channel: appState.chatChannel }) });
    appState.chat = data.chat; appState.threadDrafts[parentId] = ''; render(); toast('Thread 댓글을 등록했습니다.');
  } catch(e) { toast(e.message); }
}

function convertChatToIdea(id) {
  if (!canWrite()) { if (!appState.user) { toast('전환은 로그인 후 가능합니다.'); openLogin(); return; } toast('editor 또는 admin 권한이 필요합니다.'); return; }
  const m = findChatMessage(id); if (!m) return;
  openForm('ideas', null, {
    title: `Chat idea - ${m.message.slice(0, 60)}`,
    status: 'New', proposer: m.userName || appState.user.name, trade: 'Common', difficulty: 'Medium', baseVotes: 0,
    voteUsers: [],
    votes: 0,
    description: `Team Chat에서 전환된 아이디어입니다.\n\n채널: ${m.channel}\n작성자: ${m.userName}\n작성일: ${fmtDateTime(m.createdAt)}\n\n원문:\n${m.message}`,
    benefit: '추가 검토 후 Technology Card 또는 PoC 후보로 전환 가능', linkedTech: ''
  });
}
function convertChatToTech(id) {
  if (!canWrite()) { if (!appState.user) { toast('전환은 로그인 후 가능합니다.'); openLogin(); return; } toast('editor 또는 admin 권한이 필요합니다.'); return; }
  const m = findChatMessage(id); if (!m) return;
  openForm('techs', null, {
    title: `Chat Tech - ${m.message.slice(0, 55)}`,
    status: 'Assess', category: 'Robotics', trade: 'Common', owner: appState.user.name,
    problem: `Team Chat 논의에서 도출된 기술 검토 후보입니다.\n\n원문: ${m.message || '-'}\n\n첨부파일: ${Array.isArray(m.attachments) && m.attachments.length ? m.attachments.map(a => (a.originalName || a.filename) + ' - ' + a.url).join(' / ') : '-'}`,
    location: '', vendor: '', trl: 5, difficulty: 'Medium', productivity: 10, safety: 8, cost: 5, scalability: 6,
    nextAction: '기술 적용성, Vendor, 현장 Pain Point 연결성 확인', notes: `채널: ${m.channel}\n작성자: ${m.userName}\n작성일: ${fmtDateTime(m.createdAt)}`, links: Array.isArray(m.attachments) && m.attachments.length ? m.attachments.map(a => a.url).join('\n') : ''
  });
}



function convertChatToAction(id) {
  if (!canWrite()) { if (!appState.user) { toast('전환은 로그인 후 가능합니다.'); openLogin(); return; } toast('editor 또는 admin 권한이 필요합니다.'); return; }
  const m = findChatMessage(id); if (!m) return;
  openForm('actionItems', null, { title: `Chat Action - ${String(m.message||'').slice(0,55)}`, owner: appState.user.loginId || appState.user.name, status: 'Open', priority: 'Medium', dueDate: '', sourceType: 'Team Chat', sourceId: m.id, description: `Team Chat에서 전환된 Action Item입니다.\n\n채널: ${m.channel}\n작성자: ${m.userName}\n작성일: ${fmtDateTime(m.createdAt)}\n\n원문:\n${m.message}` });
}
function convertChatToPoc(id) {
  if (!canWrite()) { if (!appState.user) { toast('전환은 로그인 후 가능합니다.'); openLogin(); return; } toast('editor 또는 admin 권한이 필요합니다.'); return; }
  const m = findChatMessage(id); if (!m) return;
  openForm('pocs', null, { title: `Chat PoC - ${String(m.message||'').slice(0,55)}`, stage: 'Candidate', linkedTech: '', owner: appState.user.name, status: 'Open', start: '', end: '', kpi: 'PoC KPI 정의 필요', result: `Team Chat에서 후보로 전환됨.\n\n채널: ${m.channel}\n작성자: ${m.userName}\n원문:\n${m.message}` });
}
function convertChatToVendor(id) {
  if (!canWrite()) { if (!appState.user) { toast('전환은 로그인 후 가능합니다.'); openLogin(); return; } toast('editor 또는 admin 권한이 필요합니다.'); return; }
  const m = findChatMessage(id); if (!m) return;
  openForm('vendors', null, { name: 'TBD Vendor', technology: '', status: 'Clarification', contact: '', nextDate: '', owner: appState.user.name, notes: `Team Chat에서 전환된 Vendor Follow-up입니다.\n\n채널: ${m.channel}\n작성자: ${m.userName}\n작성일: ${fmtDateTime(m.createdAt)}\n\n원문:\n${m.message}` });
}

const FABRIX_CHAT_URL = 'https://nsena.fabrix-s.samsungsds.com/portal/chat';
const fabrixTemplateCatalog = {
  weeklyBriefing: {
    label: '주간 기술 브리핑 / 팀장 보고 초안',
    hint: '앱에 축적된 Tech, Idea, PoC, Vendor, News, Chat 내용을 한 번에 요약합니다.'
  },
  techReview: {
    label: '기술 적용성 검토 보고서',
    hint: '기술별 현장 적용성, Pain Point 적합성, Risk, PoC 필요성을 평가합니다.'
  },
  pocPlan: {
    label: 'PoC 계획서 초안',
    hint: 'PoC 목적, Scope, KPI, 일정, 역할, 의사결정 기준을 작성합니다.'
  },
  vendorClarification: {
    label: 'Vendor Clarification 질문서',
    hint: 'Vendor에게 확인해야 할 기술·상업·HSE·운영 조건을 정리합니다.'
  },
  newsToIdea: {
    label: '뉴스/기사 → 적용 아이디어 전환',
    hint: 'News Radar 기사와 링크를 분석하여 SE&A 적용 후보와 Action을 도출합니다.'
  },
  ceoOnePager: {
    label: 'CEO/임원 보고용 1 Page 요약',
    hint: '핵심 의사결정 사항, 효과, Risk, 요청사항 중심으로 압축합니다.'
  }
};

function renderFabrix() {
  const templates = Object.entries(fabrixTemplateCatalog).map(([k,v]) => `<option value="${k}" ${appState.fabrixTemplate===k?'selected':''}>${escapeHtml(v.label)}</option>`).join('');
  const ctxs = ['all','baseline','techs','ideas','painPoints','pocs','vendors','news','chat'].map(k => `<option value="${k}" ${appState.fabrixContext===k?'selected':''}>${fabrixContextLabel(k)}</option>`).join('');
  const prompt = appState.fabrixPrompt || buildFabrixPrompt(false);
  appState.fabrixPrompt = prompt;
  return `
    <div class="section-head"><div><h2>FabriX Assistant</h2><p>FabriX에 전달할 업무형 Prompt를 앱 데이터 기반으로 생성합니다. 복사 후 FabriX Chat에서 실행하십시오.</p></div><div class="meta"><button onclick="generateFabrixPrompt()">Prompt 생성</button><button class="secondary" onclick="copyFabrixPrompt()">복사</button><button class="secondary" onclick="downloadFabrixPrompt()">TXT 저장</button><button onclick="openFabrixChat()">FabriX 열기</button></div></div>
    <div class="notice ok"><strong>사용 방식</strong><span>사내 FabriX는 별도 포털에서 자동 로그인됩니다. 보안·SSO·브라우저 정책상 이 앱이 FabriX에 직접 질문을 주입하지 않고, Prompt를 복사한 뒤 FabriX Chat에서 실행하는 방식으로 구성했습니다.</span></div>
    <div class="grid cols-3">
      <div class="card">
        <h3>1. Prompt 목적 선택</h3>
        <div class="field"><label>Prompt Template</label><select id="fabrixTemplate" onchange="setFabrixTemplate(this.value)">${templates}</select></div>
        <p class="tiny" style="margin-top:8px;">${escapeHtml(fabrixTemplateCatalog[appState.fabrixTemplate]?.hint || '')}</p>
      </div>
      <div class="card">
        <h3>2. 데이터 범위 선택</h3>
        <div class="field"><label>Context Data</label><select id="fabrixContext" onchange="setFabrixContext(this.value)">${ctxs}</select></div>
        <p class="tiny" style="margin-top:8px;">선택 범위의 최신/중요 데이터를 Prompt에 자동 삽입합니다.</p>
      </div>
      <div class="card">
        <h3>3. 검토 초점 입력</h3>
        <div class="field"><label>Focus / Instruction</label><textarea id="fabrixFocus" placeholder="예: FGIP 탱크 도장 로봇 PoC 관점으로 검토, 중동 Post R&R과 연결 등" oninput="setFabrixFocus(this.value)">${escapeHtml(appState.fabrixFocus || '')}</textarea></div>
      </div>
    </div>
    <div class="grid cols-2" style="margin-top:16px;">
      <div class="card">
        <h2>Generated Prompt</h2>
        <textarea id="fabrixPrompt" class="fabrix-prompt" oninput="appState.fabrixPrompt=this.value">${escapeHtml(prompt)}</textarea>
        <div class="form-actions"><button class="secondary" onclick="generateFabrixPrompt()">다시 생성</button><button onclick="copyFabrixPrompt()">복사</button><button class="secondary" onclick="openFabrixChat()">FabriX Chat 열기</button></div>
      </div>
      <div class="card">
        <h2>활용 시나리오</h2>
        <div class="activity">
          <div class="activity-item"><strong>기술 검토</strong><span>Technology Card 또는 News Radar 내용을 FabriX에 넣어 적용성, 제약조건, PoC 기준을 정리합니다.</span></div>
          <div class="activity-item"><strong>보고서 작성</strong><span>주간회의, 팀장 보고, CEO 1-page 보고 초안을 생성합니다.</span></div>
          <div class="activity-item"><strong>Vendor 질의</strong><span>Clarification 질문서와 미팅 Agenda를 생성하여 Follow-up 품질을 높입니다.</span></div>
          <div class="activity-item"><strong>아이디어 고도화</strong><span>Team Chat·Idea Board 내용을 기반으로 Action Plan과 KPI를 구체화합니다.</span></div>
        </div>
        <div class="notice warn" style="margin-top:14px;"><strong>주의</strong><span>가격, 법규, Vendor 최신 정보 등 변동 가능성이 큰 내용은 FabriX 답변만으로 확정하지 말고 원문·Vendor 회신·공식 자료로 검증하십시오.</span></div>
      </div>
    </div>`;
}
function fabrixContextLabel(k) {
  return ({ all:'전체 데이터', baseline:'Project Baseline', techs:'Technology Cards', ideas:'Idea Board', painPoints:'Pain Point Bank', pocs:'PoC Pipeline', vendors:'Vendor Tracker', news:'News Radar', chat:'Team Chat' })[k] || k;
}
function setFabrixTemplate(v) { appState.fabrixTemplate = v; generateFabrixPrompt(false); }
function setFabrixContext(v) { appState.fabrixContext = v; generateFabrixPrompt(false); }
function setFabrixFocus(v) { appState.fabrixFocus = v; }
function generateFabrixPrompt(showToast=true) {
  appState.fabrixPrompt = buildFabrixPrompt(true);
  const el = document.getElementById('fabrixPrompt');
  if (el) el.value = appState.fabrixPrompt;
  if (showToast) toast('FabriX Prompt를 생성했습니다.');
}
function collectFabrixContext() {
  const db = appState.db || {};
  const ctx = appState.fabrixContext || 'all';
  const include = (key) => ctx === 'all' || ctx === key;
  const lines = [];
  if (include('baseline')) {
    const b = db.baseline || {};
    lines.push('## Project Baseline');
    lines.push(`Title: ${b.title || '-'}`);
    lines.push(`Executive Message: ${oneLine(b.executiveMessage, 500)}`);
    lines.push('Decision Requests: ' + ((b.decisionRequests || []).map((x,i)=>`${i+1}) ${oneLine(x, 180)}`).join(' / ') || '-'));
    lines.push('Target KPIs: ' + ((b.targetKpis || []).map(k=>`${k.area}: ${k.target}`).join(' / ') || '-'));
    lines.push('Roadmap: ' + ((b.roadmap || []).map(r=>`${r.phase}: ${r.target}`).join(' / ') || '-'));
  }
  if (include('techs')) {
    const techs = [...(db.techs || [])].map(t => ({...t, score: scoreTech(t)})).sort((a,b)=>b.score-a.score).slice(0, 10);
    lines.push('## Technology Cards');
    lines.push(...techs.map((t,i)=>`${i+1}. ${t.title || '-'} | Status: ${t.status || '-'} | Trade: ${t.trade || '-'} | Vendor: ${t.vendor || '-'} | Score: ${t.score} | Problem: ${oneLine(t.problem)} | Next Action: ${oneLine(t.nextAction)} | Risk/Notes: ${oneLine(t.notes)}`));
  }
  if (include('painPoints')) {
    const pains = [...(db.painPoints || [])].sort((a,b)=>String(a.priority).localeCompare(String(b.priority))).slice(0, 10);
    lines.push('\n## Field Pain Points');
    lines.push(...pains.map((p,i)=>`${i+1}. ${p.title || '-'} | Priority: ${p.priority || '-'} | Trade: ${p.trade || '-'} | Area: ${p.area || '-'} | Recurrence: ${p.recurrence || '-'} | Impact: ${oneLine(p.impact)} | Automation Potential: ${p.potential || '-'}`));
  }
  if (include('ideas')) {
    const ideas = [...(db.ideas || [])].sort((a,b)=>Number(b.votes||0)-Number(a.votes||0)).slice(0, 10);
    lines.push('\n## Idea Board');
    lines.push(...ideas.map((x,i)=>`${i+1}. ${x.title || '-'} | Status: ${x.status || '-'} | Proposer: ${x.proposer || '-'} | Trade: ${x.trade || '-'} | Votes: ${ideaVoteCount(x)} | Description: ${oneLine(x.description)} | Benefit: ${oneLine(x.benefit)}`));
  }
  if (include('pocs')) {
    const pocs = [...(db.pocs || [])].slice(0, 10);
    lines.push('\n## PoC Pipeline');
    lines.push(...pocs.map((p,i)=>`${i+1}. ${p.title || '-'} | Stage: ${p.stage || '-'} | Owner: ${p.owner || '-'} | Status: ${p.status || '-'} | Period: ${p.start || '-'}~${p.end || '-'} | KPI: ${oneLine(p.kpi)} | Result: ${oneLine(p.result)}`));
  }
  if (include('vendors')) {
    const vendors = [...(db.vendors || [])].slice(0, 10);
    lines.push('\n## Vendor Tracker');
    lines.push(...vendors.map((v,i)=>`${i+1}. ${v.name || '-'} | Technology: ${v.technology || '-'} | Status: ${v.status || '-'} | Next Date: ${v.nextDate || '-'} | Owner: ${v.owner || '-'} | Notes: ${oneLine(v.notes)}`));
  }
  if (include('news')) {
    const news = ((appState.news && appState.news.items) || []).slice().sort((a,b)=>Number(b.relevance||0)-Number(a.relevance||0)).slice(0, 10);
    lines.push('\n## News Radar');
    lines.push(...news.map((n,i)=>`${i+1}. ${n.title || '-'} | Source: ${n.source || '-'} | Published: ${n.publishedAt || '-'} | Category: ${n.category || '-'} | Relevance: ${n.relevance || '-'} | Summary: ${oneLine(n.summary)} | URL: ${n.url || ''}`));
  }
  if (include('chat')) {
    const msgs = ((appState.chat && appState.chat.messages) || []).slice().sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0, 12);
    lines.push('\n## Recent Team Chat');
    lines.push(...msgs.map((m,i)=>`${i+1}. [${m.channel || 'General'}] ${m.userName || '-'} at ${fmtDateTime(m.createdAt)}: ${oneLine(m.message)}`));
  }
  return lines.join('\n');
}
function oneLine(v, max=260) { return String(v || '').replace(/\s+/g, ' ').trim().slice(0, max); }
function buildFabrixPrompt(force=false) {
  const focus = (appState.fabrixFocus || '').trim();
  const context = collectFabrixContext();
  const template = appState.fabrixTemplate || 'weeklyBriefing';
  const common = `당신은 Oil & Gas EPC 건설사의 Construction Automation / Robotics / Digital Transformation 전략 컨설턴트입니다.\n아래 앱 데이터를 근거로, Samsung E&A 선행공사기술그룹 관점에서 분석하십시오.\n\n작성 원칙:\n- 먼저 결론과 권고안을 제시하십시오.\n- 현장 적용 가능성, 안전, 생산성, 품질, 비용, 일정 영향을 구분하십시오.\n- 불확실한 내용은 추정이라고 표시하고 추가 확인사항을 제시하십시오.\n- EPC 현장 적용을 전제로 PoC, Vendor Clarification, 표준화 Action까지 연결하십시오.\n- 한국어로 작성하되 필요한 기술 용어는 괄호 안에 영문을 병기하십시오.\n${focus ? `\n추가 검토 초점: ${focus}\n` : ''}\n\n[앱 데이터]\n${context || '선택된 데이터가 없습니다.'}\n`;
  const tasks = {
    weeklyBriefing: `\n[요청 작업]\n1. 이번 주 핵심 이슈 5개를 선정하십시오.\n2. 각 이슈별로 중요도, 근거, 필요한 Action, 담당 역할을 제안하십시오.\n3. 팀장 보고용 요약 메일 초안을 작성하십시오.\n4. 다음 주 회의 Agenda를 5개 이내로 제안하십시오.`,
    techReview: `\n[요청 작업]\n1. 기술별 현장 적용성 평가표를 작성하십시오.\n2. Pain Point 적합성, TRL, 현장 난이도, HSE Risk, 비용효과, 확산성을 평가하십시오.\n3. 즉시 PoC / 추가검토 / Watch / Hold로 분류하십시오.\n4. 상위 3개 기술에 대해 PoC KPI와 검증 방법을 제안하십시오.`,
    pocPlan: `\n[요청 작업]\n1. PoC 추진 대상과 목적을 명확히 정의하십시오.\n2. Scope, Test Site, 기간, 준비물, 인력 R&R, KPI, Acceptance Criteria를 표로 작성하십시오.\n3. 예상 Risk와 사전 조치사항을 제시하십시오.\n4. PoC 결과 보고서 목차를 작성하십시오.`,
    vendorClarification: `\n[요청 작업]\n1. Vendor에게 확인해야 할 Clarification 질문을 기술, HSE, 운용, 유지보수, 상업조건, Reference로 구분하십시오.\n2. 미팅 Agenda와 요청 자료 목록을 작성하십시오.\n3. Vendor 회신을 평가하기 위한 비교 Matrix를 제안하십시오.\n4. 필요 시 영문 이메일 초안을 작성하십시오.`,
    newsToIdea: `\n[요청 작업]\n1. 기사/링크별로 우리 회사 현장 적용 가능성을 판단하십시오.\n2. 실제 적용 가능한 Idea Board 후보를 도출하십시오.\n3. Technology Card로 전환할 수 있는 항목을 정리하십시오.\n4. 추가 확인이 필요한 Vendor, Reference, 규격, 현장 조건을 제시하십시오.`,
    ceoOnePager: `\n[요청 작업]\n1. 제목은 한 줄로 작성하십시오.\n2. 의사결정권자가 바로 이해할 수 있도록 핵심 메시지를 5문장 이내로 제시하십시오.\n3. 현황/문제점, 대안, 기대효과, Risk, 요청사항을 1 Page 형식으로 작성하십시오.\n4. 불필요한 배경 설명은 줄이고, 승인 또는 지시가 필요한 사항을 명확히 하십시오.`
  };
  return `${common}${tasks[template] || tasks.weeklyBriefing}`;
}
async function copyFabrixPrompt() {
  const el = document.getElementById('fabrixPrompt');
  const text = (el && el.value) || appState.fabrixPrompt || buildFabrixPrompt();
  try { await navigator.clipboard.writeText(text); toast('FabriX Prompt를 복사했습니다.'); }
  catch(e) { toast('브라우저 복사 권한이 제한되었습니다. Prompt를 직접 선택해 복사해 주세요.'); }
}
function openFabrixChat() {
  window.open(FABRIX_CHAT_URL, '_blank', 'noopener,noreferrer');
  toast('FabriX Chat을 열었습니다. 복사한 Prompt를 붙여넣어 실행하십시오.');
}
function downloadFabrixPrompt() {
  const text = document.getElementById('fabrixPrompt')?.value || appState.fabrixPrompt || buildFabrixPrompt();
  const blob = new Blob([text], {type:'text/plain;charset=utf-8'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `FabriX_Prompt_CA_Robotics_${today()}.txt`;
  a.click();
  URL.revokeObjectURL(a.href);
}


function renderMyFollowUp() {
  const user = appState.user;
  const allMessages = ((appState.chat && appState.chat.messages) || []);
  const saved = user ? allMessages.filter(m => Array.isArray(m.savedBy) && m.savedBy.includes(user.id)).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)) : [];
  const mentions = user ? allMessages.filter(m => Array.isArray(m.mentions) && m.mentions.some(x => x.id === user.id)).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)) : [];
  const login = String(user?.loginId || '').toLowerCase();
  const name = String(user?.name || '').toLowerCase();
  const actions = ((appState.db && appState.db.actionItems) || []).filter(a => isAdmin() || String(a.owner || '').toLowerCase().includes(login) || String(a.owner || '').toLowerCase().includes(name)).sort((a,b)=>String(a.dueDate||'9999').localeCompare(String(b.dueDate||'9999')));
  return `<div class="section-head"><div><h2>My Follow-up</h2><p>내가 저장한 메시지, 내가 @호출된 메시지, 담당 Action Item을 한 화면에서 확인합니다.</p></div><div class="meta"><button class="secondary" onclick="fetchChat(true).then(()=>render())">새로고침</button>${canWrite()?'<button onclick="openForm(\'actionItems\')">+ Action Item</button>':''}</div></div>
    ${authHint()}
    <div class="grid cols-3">
      <div class="card"><h3>★ Saved Messages</h3>${saved.length ? saved.slice(0,30).map(renderFollowMessage).join('') : '<div class="empty small-empty">저장한 메시지가 없습니다.</div>'}</div>
      <div class="card"><h3>@ Mentions</h3>${mentions.length ? mentions.slice(0,30).map(renderFollowMessage).join('') : '<div class="empty small-empty">나를 호출한 메시지가 없습니다.</div>'}</div>
      <div class="card"><h3>Action Items</h3>${actions.length ? actions.slice(0,50).map(renderActionItemMini).join('') : '<div class="empty small-empty">담당 Action Item이 없습니다.</div>'}</div>
    </div>`;
}
function renderFollowMessage(m) {
  return `<div class="follow-row" onclick="appState.chatChannel='${escapeJs(m.channel||'General')}'; appState.openThreadId='${m.parentId || m.id}'; setTab('chat')"><strong>[${escapeHtml(m.channel || 'General')}] ${escapeHtml(m.userName || '')}</strong><span>${renderMessageText(String(m.message || '').slice(0,180))}</span><small>${fmtDateTime(m.createdAt)}</small></div>`;
}
function renderActionItemMini(a) {
  return `<div class="follow-row"><strong>${escapeHtml(a.title || '-')}</strong><span>${escapeHtml(a.status || 'Open')} · ${escapeHtml(a.priority || '-')} · Due ${escapeHtml(a.dueDate || '-')}</span><small>Owner: ${escapeHtml(a.owner || '-')}</small><div class="meta"><button class="secondary small" onclick="openForm('actionItems','${a.id}')">수정</button></div></div>`;
}

function renderReport() {
  return `<div class="section-head"><div><h2>Report Generator</h2><p>현재 데이터를 기준으로 주간회의 또는 팀장 보고용 초안을 생성합니다.</p></div><div class="meta"><button onclick="refreshReport()">보고서 생성</button><button class="secondary" onclick="copyReport()">복사</button><button class="secondary" onclick="downloadReport()">TXT 저장</button><button class="ghost" onclick="window.print()">PDF 저장</button></div></div><div id="reportBox" class="report-box">보고서 생성 버튼을 누르세요.</div>`;
}
async function refreshReport() { try { const data = await api('/api/report'); document.getElementById('reportBox').textContent = data.report; } catch(e) { toast(e.message); } }
async function copyReport() { const text = document.getElementById('reportBox')?.textContent || ''; await navigator.clipboard.writeText(text); toast('보고서 초안을 복사했습니다.'); }
function downloadReport() { const text = document.getElementById('reportBox')?.textContent || ''; const blob = new Blob([text], {type:'text/plain;charset=utf-8'}); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `CA_Robotics_Radar_Report_${today()}.txt`; a.click(); URL.revokeObjectURL(a.href); }

function renderAdmin() {
  return `<div class="grid cols-2">
    <div class="card"><div class="section-head"><div><h2>데이터 백업 / 복원</h2><p>중앙 DB 전체를 JSON으로 내보내거나 관리자 권한으로 가져올 수 있습니다.</p></div></div>
      <div class="meta"><a class="button" href="/api/export">JSON 내보내기</a><button class="secondary" onclick="document.getElementById('importFile').click()" ${isAdmin()?'':'disabled'}>JSON 가져오기</button><input id="importFile" type="file" accept=".json,application/json" class="hidden" onchange="importJson(this.files[0])" /></div>
      <p class="tiny">복원은 관리자만 가능합니다. 운영 전 반드시 기존 JSON을 백업하십시오.</p>
    </div>
    <div class="card"><div class="section-head"><div><h2>사용자 관리</h2><p>관리자는 그룹원 계정 추가, 수정, PIN 변경, 비활성화, 삭제를 할 수 있습니다.</p></div>${isAdmin()?'<button onclick="openUserForm()">+ 사용자 추가</button>':''}</div><div id="usersArea">${isAdmin()?'사용자 목록을 불러오는 중입니다.':'관리자 로그인 후 확인할 수 있습니다.'}</div><div class="notice warn" style="margin-top:12px;"><strong>권장 운영</strong><span>개인별 Knox ID 계정을 기준으로 운영하십시오. 초기 PIN은 2026이며, 운영 안정화 후 개인별 PIN 변경을 권장합니다.</span></div></div>
    <div class="card span-2"><h2>최근 활동</h2>${renderActivity(appState.db.activity || [])}</div>
  </div>`;
}
async function loadUsersIntoAdmin() {
  if (appState.activeTab !== 'admin' || !isAdmin()) return;
  try {
    const data = await api('/api/users');
    const area = document.getElementById('usersArea');
    if (!area) return;
    appState.users = data.users;
    area.innerHTML = `<div class="table-wrap"><table><thead><tr><th>이름</th><th>Login ID</th><th>Role</th><th>상태</th><th>관리</th></tr></thead><tbody>${data.users.map(u => `<tr><td>${escapeHtml(u.name)}</td><td>${escapeHtml(u.loginId)}</td><td>${badge(u.role)}</td><td>${u.disabled ? badge('Disabled') : badge('Active')}</td><td><div class="meta"><button class="secondary small" onclick="openUserForm('${u.id}')">수정/PIN</button><button class="danger small" onclick="deleteUser('${u.id}')">삭제</button></div></td></tr>`).join('')}</tbody></table></div>`;
  } catch(e) { toast(e.message); }
}

function openLogin() {
  openModal('로그인', '동시 사용을 위해 사용자를 식별합니다. 초기 계정은 README를 확인하십시오.', `
    <div class="form-grid">
      <div class="field span-2"><label>Login ID</label><input name="loginId" placeholder="carlos.lee / js1978.kim / ..." required /></div>
      <div class="field"><label>PIN</label><input name="pin" type="password" required /></div>
    </div>
    <div class="form-actions"><button class="secondary" onclick="closeModal()">취소</button><button onclick="submitLogin()">로그인</button></div>`);
}
async function submitLogin() {
  const form = document.getElementById('modalBody');
  const fd = new FormData(form);
  try {
    const data = await api('/api/login', { method:'POST', body: JSON.stringify(Object.fromEntries(fd.entries())) });
    appState.user = data.user;
    localStorage.setItem('caRadarUser', JSON.stringify(data.user));
    closeModal(); updateUserUi(); connectEvents(true); await bootstrap(true); render(); toast(`${data.user.name}님으로 로그인했습니다.`);
    setTimeout(loadUsersIntoAdmin, 50);
  } catch(e) { toast(e.message); }
}
function logout() { localStorage.removeItem('caRadarUser'); appState.user = null; appState.unreadMentions = 0; updateUserUi(); connectEvents(true); render(); toast('로그아웃했습니다.'); }

function openForm(collection, id=null, preset=null) {
  if (!canWrite()) {
    if (!appState.user) { toast('등록·수정은 로그인 후 가능합니다.'); openLogin(); return; }
    toast('현재 계정은 조회 전용입니다. editor 또는 admin 권한이 필요합니다.');
    return;
  }
  const cfg = config[collection];
  const item = id ? (appState.db[collection] || []).find(x => x.id === id) : (preset || {});
  const fields = cfg.fields.map(([key, label, type, span]) => renderField(key, label, type, span, item?.[key])).join('');
  openModal(id ? `${cfg.label} 수정` : `${cfg.label} 신규 등록`, '입력 내용은 중앙 DB에 저장되고 접속 중인 그룹원 화면에 실시간 반영됩니다.', `
    <div class="form-grid">${fields}</div>
    <div class="form-actions"><button class="secondary" onclick="closeModal()">취소</button><button onclick="saveItem('${collection}', '${id || ''}')">저장</button></div>`);
}
function renderField(key, label, type, span='', value='') {
  const clsName = span || '';
  if (type.startsWith('select:')) {
    const listName = type.split(':')[1];
    return `<div class="field ${clsName}"><label>${escapeHtml(label)}</label><select name="${key}">${opt(optionList(listName), value)}</select></div>`;
  }
  if (type === 'textarea') return `<div class="field ${clsName}"><label>${escapeHtml(label)}</label><textarea name="${key}">${escapeHtml(value || '')}</textarea></div>`;
  return `<div class="field ${clsName}"><label>${escapeHtml(label)}</label><input name="${key}" type="${type}" value="${escapeHtml(value ?? '')}" /></div>`;
}
function collectForm() {
  const fd = new FormData(document.getElementById('modalBody'));
  const obj = Object.fromEntries(fd.entries());
  for (const k of ['trl','productivity','safety','cost','scalability','votes']) if (obj[k] !== undefined) obj[k] = Number(obj[k] || 0);
  return obj;
}
async function saveItem(collection, id='') {
  try {
    const body = collectForm();
    const path = id ? `/api/items/${collection}/${id}` : `/api/items/${collection}`;
    const method = id ? 'PUT' : 'POST';
    const data = await api(path, { method, body: JSON.stringify(body) });
    appState.db = data.db;
    closeModal(); render(); toast('저장했습니다.');
  } catch(e) { toast(e.message); }
}
async function deleteItem(collection, id) {
  if (!canWrite()) {
    if (!appState.user) { toast('삭제는 로그인 후 가능합니다.'); openLogin(); return; }
    toast('현재 계정은 조회 전용입니다. editor 또는 admin 권한이 필요합니다.');
    return;
  }
  if (!confirm('삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
  try {
    const data = await api(`/api/items/${collection}/${id}`, { method:'DELETE' });
    appState.db = data.db;
    render(); toast('삭제했습니다.');
  } catch(e) { toast(e.message); }
}
async function voteIdea(id) {
  if (!canWrite()) {
    if (!appState.user) { toast('투표는 로그인 후 가능합니다.'); openLogin(); return; }
    toast('현재 계정은 조회 전용입니다. editor 또는 admin 권한이 필요합니다.');
    return;
  }
  try {
    const data = await api(`/api/ideas/${id}/vote`, { method:'POST', body:'{}' });
    appState.db = data.db;
    render(); toast(data.voted ? '좋아요를 반영했습니다.' : '좋아요를 취소했습니다.');
  } catch(e) { toast(e.message); }
}

function openUserForm(id='') {
  if (!isAdmin()) { toast('관리자 권한이 필요합니다.'); return; }
  const u = id ? (appState.users || []).find(x => x.id === id) : null;
  openModal(id ? '사용자 수정 / PIN 변경' : '사용자 추가', '역할: admin은 사용자/데이터 관리, editor는 등록·수정·채팅, viewer는 조회만 가능합니다.', `
    <div class="form-grid">
      <div class="field"><label>이름</label><input name="name" required value="${escapeHtml(u?.name || '')}" /></div>
      <div class="field"><label>Login ID</label><input name="loginId" required value="${escapeHtml(u?.loginId || '')}" /></div>
      <div class="field"><label>Role</label><select name="role"><option value="editor" ${u?.role==='editor'?'selected':''}>editor</option><option value="viewer" ${u?.role==='viewer'?'selected':''}>viewer</option><option value="admin" ${u?.role==='admin'?'selected':''}>admin</option></select></div>
      <div class="field"><label>${id?'새 PIN / 변경 시만 입력':'PIN'}</label><input name="pin" type="password" ${id?'':'required'} /></div>
      <div class="field"><label>상태</label><select name="disabled"><option value="false" ${!u?.disabled?'selected':''}>Active</option><option value="true" ${u?.disabled?'selected':''}>Disabled</option></select></div>
    </div>
    <div class="form-actions"><button class="secondary" onclick="closeModal()">취소</button><button onclick="submitUser('${id}')">저장</button></div>`);
}
async function submitUser(id='') {
  const fd = new FormData(document.getElementById('modalBody'));
  const body = Object.fromEntries(fd.entries());
  body.disabled = body.disabled === 'true';
  try {
    const path = id ? `/api/users/${id}` : '/api/users';
    const method = id ? 'PUT' : 'POST';
    await api(path, { method, body: JSON.stringify(body) });
    closeModal(); toast(id ? '사용자를 수정했습니다.' : '사용자를 추가했습니다.'); await loadUsersIntoAdmin();
  } catch(e) { toast(e.message); }
}
async function deleteUser(id) {
  if (!isAdmin()) { toast('관리자 권한이 필요합니다.'); return; }
  const u = (appState.users || []).find(x => x.id === id);
  if (!confirm(`${u?.name || '사용자'} 계정을 삭제하시겠습니까?`)) return;
  try {
    const data = await api(`/api/users/${id}`, { method:'DELETE' });
    appState.users = data.users || [];
    await loadUsersIntoAdmin();
    toast('사용자를 삭제했습니다.');
  } catch(e) { toast(e.message); }
}

async function importJson(file) {
  if (!file) return;
  if (!confirm('현재 중앙 DB를 선택한 JSON으로 교체합니다. 계속하시겠습니까?')) return;
  try {
    const text = await file.text();
    const json = JSON.parse(text);
    const data = await api('/api/import', { method:'POST', body: JSON.stringify(json) });
    appState.db = data.db; render(); toast('JSON 데이터를 가져왔습니다.');
  } catch(e) { toast(e.message); }
}

function openModal(title, desc, html) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalDesc').textContent = desc || '';
  document.getElementById('modalBody').innerHTML = html;
  document.getElementById('modal').classList.remove('hidden');
}
function closeModal() { document.getElementById('modal').classList.add('hidden'); }

const originalRender = render;
render = function() {
  originalRender();
  setTimeout(loadUsersIntoAdmin, 20);
};

bootstrap(true).then(() => { fetchNews(); fetchChat(true); }).catch(()=>{});
updateUserUi();


// Global presence dropdown close handler
document.addEventListener('click', function(ev) {
  const box = document.getElementById('presenceDropdown');
  const live = document.getElementById('liveStatus');
  if (!box || !live) return;
  if (box.contains(ev.target) || live.contains(ev.target)) return;
  if (appState.presencePanelOpen) closePresenceDropdown();
});
