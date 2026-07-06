# Construction Automation & Robotics Radar - Multi-user Version

## Work Hub / Mail Portal Update

이번 버전에는 **Work Hub** 메뉴가 추가되었습니다.

- 사내 메일 시스템(`https://kor3.samsung.net/portalapp/home`) 새 창 실행
- FabriX Chat 새 창 실행
- Radar App 데이터 기반 메일 초안 자동 생성
- 현재 App 업무 Context 복사
- Top Ideas, 진행 중 PoC, Vendor Follow-up, 최근 Team Chat 요약 표시

사내 메일은 보안 정책상 App 내부에 직접 내장하거나 메일 내용을 자동으로 읽지 않습니다. 우선은 **업무 Launcher + 메일 초안 생성 + Context 복사** 방식으로 연결합니다.


## 1. 목적

이 앱은 Samsung E&A 선행공사기술그룹의 자동화·로보틱스 업무를 위해 만든 **동시 접속형 업무 플랫폼**입니다.  
이전 단독 HTML 버전과 달리, 여러 그룹원이 같은 URL로 접속하여 기술 카드, 현장 Pain Point, 아이디어, PoC, Vendor Follow-up을 함께 관리할 수 있습니다.

핵심 목적은 다음과 같습니다.

- 신규 자동화·로보틱스 기술을 빠르게 등록
- 현장 Pain Point와 기술을 연결
- 그룹원 아이디어를 공유하고 투표
- PoC 진행 단계와 KPI 관리
- Vendor Clarification 및 다음 Action 추적
- 주간회의 또는 팀장 보고용 초안 생성

---

## 2. 주요 변경 사항

| 구분 | 기존 단독 HTML 버전 | Multi-user 버전 |
|---|---|---|
| 데이터 저장 | 개인 브라우저 LocalStorage | 중앙 서버 `data/db.json` |
| 동시 접속 | 불가 | 가능 |
| 실시간 갱신 | 불가 | Server-Sent Events 기반 자동 갱신 |
| 사용자 식별 | 없음 | 로그인 ID / PIN / Role |
| 권한 | 없음 | admin / editor / viewer |
| 백업 | 브라우저 JSON | 중앙 DB JSON Export / Import |
| 배포 | 파일 열기 | 사내 PC, VM, 서버, Docker 배포 가능 |

---

## 3. 빠른 실행 방법

### 3.1 사전 조건

- Node.js 20 이상 권장
- Chrome 또는 Edge 브라우저
- 같은 사내망에서 접속할 PC 또는 서버 1대

### 3.2 실행

압축을 푼 뒤 폴더에서 아래 명령을 실행합니다.

```bash
node server.js
```

브라우저에서 아래 주소로 접속합니다.

```text
http://localhost:8080
```

다른 그룹원은 서버 PC의 IP를 사용합니다.

```text
http://서버PC_IP:8080
```

예시:

```text
http://10.10.20.35:8080
```

---

## 4. 초기 계정

이번 배포본은 그룹원 개인별 Login ID가 기본 등록되어 있습니다.

| Role | Login ID | 초기 PIN | 권한 |
|---|---|---:|---|
| admin | carlos.lee | 2026 | 사용자 관리, 데이터 복원, 전체 편집 |
| editor | js1978.kim | 2026 | 데이터 등록·수정·삭제, 채팅 입력 |
| editor | shb.bae | 2026 | 데이터 등록·수정·삭제, 채팅 입력 |
| editor | ab.sharafat | 2026 | 데이터 등록·수정·삭제, 채팅 입력 |
| editor | ygiz.lee | 2026 | 데이터 등록·수정·삭제, 채팅 입력 |
| editor | hs98.choi | 2026 | 데이터 등록·수정·삭제, 채팅 입력 |

기존 공용 계정 `member / 1111`, `admin / change-me-now`, `viewer / 2222`는 운영 혼선을 줄이기 위해 비활성화되어 있습니다.

운영 안정화 후에는 `carlos.lee` 계정으로 로그인하여 Admin / Export 메뉴에서 사용자별 PIN을 변경하는 것을 권장합니다.

> 주의: 기존 폴더의 `data/users.json`을 그대로 복사하면 신규 계정 설정이 반영되지 않습니다. 이번 업데이트의 개인별 계정을 사용하려면 새 버전의 `data/users.json`을 적용하십시오. 기존 업무 데이터는 `data/db.json`, `data/chat.json`, `data/news_cache.json`, `data/news_sources.json`만 복사하는 것이 안전합니다.

---|---|---:|---|
| admin | admin | change-me-now | 사용자 추가, 데이터 복원, 전체 편집 |
| editor | member | 1111 | 데이터 등록·수정·삭제 |
| viewer | viewer | 2222 | 조회 전용 |

운영 전에 반드시 PIN을 변경해서 시작하십시오.  
최초 실행 전에 환경변수를 설정하면 기본 PIN을 바꿀 수 있습니다.

```bash
ADMIN_PIN=새관리자PIN MEMBER_PIN=새편집자PIN VIEWER_PIN=새조회PIN node server.js
```

Windows PowerShell 예시:

```powershell
$env:ADMIN_PIN="새관리자PIN"
$env:MEMBER_PIN="새편집자PIN"
$env:VIEWER_PIN="새조회PIN"
node server.js
```

> 주의: 최초 실행 후에는 `data/users.json`이 생성되므로, 환경변수를 바꿔도 기존 계정 PIN은 자동 변경되지 않습니다. 다시 초기화하려면 서버를 중지하고 `data/users.json`을 백업 후 삭제한 다음 재실행하십시오.

---

## 5. 기능

### 5.1 Dashboard

- 기술 카드 수
- 진행 중 PoC 수
- High Pain Point 수
- Follow-up 필요 Vendor 수
- 우선 검토 기술 Top 5
- 아이디어 투표 Top 5
- 최근 활동 이력

### 5.2 Technology Radar

기술을 아래 단계로 관리합니다.

- Adopt: 즉시 적용 또는 표준화 가능
- Trial: PoC 또는 현장 테스트 필요
- Assess: 기술 검토 및 Vendor 조사 단계
- Watch: 장기 모니터링 대상
- Hold: 현재 적용 보류

### 5.3 Technology Cards

기술별 표준 입력 항목을 제공합니다.

- 기술명
- 기술 분류
- 적용 공종
- 해결하려는 문제
- 적용 위치
- Vendor / 기관
- TRL
- 적용 난이도
- 생산성 점수
- 안전 점수
- 비용효과
- 확산성
- 다음 Action
- 검토 메모 / Risk
- 자료 링크

앱은 입력값을 바탕으로 자동 점수를 계산합니다.

| 점수 | 권고 |
|---:|---|
| 85 이상 | 우선 PoC |
| 70~84 | 검토 지속 |
| 50~69 | 관찰 대상 |
| 50 미만 | 보류 |

### 5.4 Pain Point Bank

현장 문제 중심으로 자동화 적용 후보를 관리합니다.

- 현장 문제
- 발생 공종
- 발생 위치
- 현재 방식
- 문제 영향
- 반복성
- 자동화 가능성
- 연결 기술
- 우선순위

### 5.5 Idea Board

그룹원이 아이디어를 등록하고 투표할 수 있습니다.

- 아이디어명
- 제안자
- 공종
- 난이도
- 기대효과
- 연결 기술
- 상태
- 투표

### 5.6 PoC Pipeline

PoC 진행 단계를 관리합니다.

- Candidate
- Pre-Review
- Test Plan
- Field Test
- Analysis
- Scale-up Decision
- Standardization

### 5.7 Vendor Tracker

Vendor와의 후속 업무를 관리합니다.

- Vendor명
- 기술
- 담당자 / 연락처
- 현재 상태
- 다음 일정
- Owner
- Clarification / Follow-up 사항

### 5.8 Report Generator

현재 데이터를 기준으로 주간 보고 초안을 자동 생성합니다.

- 핵심 요지
- 우선 검토 기술 Top 5
- 진행 중 PoC
- Vendor Follow-up
- 다음 조치

생성된 보고서는 복사, TXT 저장, 브라우저 PDF 저장이 가능합니다.

---

## 6. Docker 실행

Docker가 가능한 환경에서는 아래 명령으로 실행할 수 있습니다.

```bash
docker compose up -d --build
```

접속 주소:

```text
http://서버IP:8080
```

데이터는 `./data` 폴더에 저장됩니다.

---

## 7. 데이터 백업

앱의 Admin / Export 탭에서 JSON 내보내기를 실행하십시오.

백업 파일 예시:

```text
ca-robotics-radar-2026-06-16.json
```

운영 권장사항:

- 주 1회 JSON 백업
- 중요한 PoC 결과 입력 후 즉시 백업
- 서버 이전 전 `data` 폴더 전체 백업

---

## 8. 사내 운영 권장안

초기 2주간은 소수 인원으로 Pilot 운영하십시오.

| 기간 | 운영 방식 | 목적 |
|---|---|---|
| 1주차 | 그룹장 + 핵심 담당자 2~3명 | 입력 양식과 평가 기준 보정 |
| 2주차 | 전 그룹원 사용 | 아이디어 등록 및 Vendor Follow-up 누락 확인 |
| 3주차 이후 | 주간회의 공식 Agenda화 | PoC 후보 선정과 Action 관리 |

주간회의 전 담당자는 다음 항목을 업데이트하는 방식이 좋습니다.

- 본인 Owner 기술 카드의 Next Action
- Vendor Tracker의 다음 일정
- PoC Pipeline의 단계와 KPI
- 새로 발견한 기술 또는 전시회 자료

---

## 9. 보안 및 한계

이 버전은 사내 Pilot용 MVP입니다.

- PIN 기반 단순 로그인입니다.
- HTTPS는 포함되어 있지 않습니다.
- 파일 첨부 기능은 아직 없습니다. 자료는 링크 형태로 관리합니다.
- 중앙 데이터는 JSON 파일에 저장됩니다.
- 대규모 조직 사용 시 PostgreSQL, MS SQL, SharePoint List 등으로 전환하는 것이 바람직합니다.

운영 서버에 배포할 경우 아래 사항을 권장합니다.

- 사내망 접근 제한
- 방화벽으로 8080 포트 허용 범위 제한
- Reverse Proxy를 통한 HTTPS 적용
- 정기 백업
- 관리자 PIN 변경

---

## 10. 다음 고도화 후보

| 고도화 항목 | 설명 |
|---|---|
| 파일 첨부 | Vendor 브로슈어, 견적서, 사진, 영상 업로드 |
| MS Teams 알림 | 신규 기술, 기한 도래 Vendor, PoC 지연 알림 |
| SharePoint 연계 | 사내 공식 문서 저장소와 연결 |
| AI 요약 | 링크, 논문, 브로슈어 입력 시 자동 요약 |
| 보고서 Word 자동 생성 | 팀장/상무 보고용 Word 양식 출력 |
| KPI Dashboard | PoC별 생산성, 안전, 품질 효과 시각화 |
| SSO 연동 | 사내 계정 기반 로그인 |



## News Radar 추가 기능

이번 버전에는 `News Radar` 메뉴가 추가되었습니다.

주요 기능:

- 자동화·로보틱스·Physical AI·건설 자동화 관련 RSS 기사 수집
- 기사 검색 및 카테고리 필터
- 기사 수동 등록
- 기사 → Technology Card 전환
- 기사 → Idea Board 전환
- 주간 Report Generator에 최신 기술 기사 Top 5 반영

외부 RSS 수집은 서버 PC가 외부 인터넷에 접속할 수 있어야 작동합니다. 사내망 또는 Proxy 정책으로 차단될 경우 `기사 수동 등록` 기능을 사용하거나 IT 부서에 허용 여부를 확인하십시오. 상세 내용은 `docs/NEWS_RADAR_GUIDE.md`를 참조하십시오.

## 2026-06-16 Team Chat Input Fix

- Team Chat 입력창 권한 안내를 명확히 표시하도록 수정했습니다.
- 메시지 Draft를 보존하여 화면 자동 갱신 중에도 입력 중인 내용이 사라지지 않도록 보완했습니다.
- Enter는 전송, Shift+Enter는 줄바꿈으로 변경했습니다.
- 저장된 로그인 정보가 현재 사용자 목록과 맞지 않을 경우 자동으로 로그아웃 처리하고 재로그인을 안내합니다.
- 채팅 검색창 입력 시 한 글자 입력 후 포커스가 끊기는 문제를 완화했습니다.


## Productivity Center 업데이트

이번 버전에는 업무 생산성 향상을 위해 다음 기능이 추가되었습니다.

- Productivity Center: Due/Overdue 기반 My Work Queue
- Automation Signals: Vendor, PoC, Idea, Technology Card 자동 경고/권고
- Quick Capture: `/task`, `/idea`, `/vendor`, `/poc` 명령어로 빠른 등록
- Meeting Notes: 회의록 작성 및 Action Item 전환
- Decision Log: 주요 의사결정 기록 관리

상세 사용법은 `docs/PRODUCTIVITY_CENTER_GUIDE.md`를 참고하십시오.


## 2026-06-16 Fix: Meeting Notes / Decision Log 활성화

Productivity Center에 추가된 Meeting Notes와 Decision Log가 전체 목록 화면에서 활성화되지 않는 문제를 수정했습니다.

- Meeting Notes 목록 표시 보완
- Decision Log 목록 표시 보완
- Action Items 목록 표시 보완
- Meeting Notes → Action Item 전환 버튼 유지

상세 내용은 `docs/MEETING_DECISION_FIX_GUIDE.md`를 참조하십시오.
