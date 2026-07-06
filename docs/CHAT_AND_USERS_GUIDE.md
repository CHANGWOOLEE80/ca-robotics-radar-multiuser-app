# Team Chat 및 개인별 계정 운영 가이드

## 1. Team Chat 기능

Team Chat은 자동화·로보틱스 업무 관련 논의를 앱 안에서 바로 공유하기 위한 기능입니다.

### 채널

- General: 전체 공지 및 일반 논의
- Idea Discussion: 신규 아이디어 논의
- Technology Review: 기술 적용성 검토
- Vendor Follow-up: Vendor 문의 및 회신 공유
- PoC Planning: PoC 일정, KPI, 결과 논의
- News Radar: 기사 기반 기술 토론

### 주요 기능

- 채널별 실시간 메시지 표시
- 로그인 사용자명 기준 작성자 표시
- 본인 메시지 삭제 가능
- admin은 모든 메시지 삭제 가능
- 메시지를 Idea Board 또는 Technology Card로 전환 가능

## 2. 공용 member 계정 사용 시 유의사항

기존 `member / 1111` 계정은 임시 공용 계정입니다.

공용 계정을 여러 명이 함께 사용하면 다음 문제가 있습니다.

- 모든 작성자가 `Group Member`로 표시됨
- 누가 기술 카드, 아이디어, 채팅을 등록했는지 구분하기 어려움
- 수정·삭제 이력이 개인별로 남지 않음
- 채팅 메시지를 개인별로 추적할 수 없음

따라서 Pilot 초기 테스트 이후에는 개인별 계정을 발급하여 사용하는 것을 권장합니다.

## 3. 개인별 계정 생성 방법

1. 우측 상단 Login 클릭
2. `admin / change-me-now`로 로그인
3. Admin / Export 메뉴 이동
4. 사용자 관리에서 `+ 사용자 추가` 클릭
5. 이름, Login ID, Role, PIN 입력
6. 저장

### Role 기준

- admin: 사용자 관리, 데이터 Import, 전체 수정 가능
- editor: 기술/아이디어/PoC/Vendor/News/Chat 등록·수정 가능
- viewer: 조회 전용

## 4. member 계정 정리 방법

개인별 계정 발급 후에는 아래 중 하나를 권장합니다.

### 권장안 A: member 계정 PIN 변경

- Admin / Export > 사용자 관리
- Group Member 계정 수정
- 새 PIN 입력 후 저장

### 권장안 B: member 계정 비활성화

- Group Member 계정 수정
- 상태를 Disabled로 변경
- 저장

비활성화하면 기존에 `member / 1111`로는 로그인할 수 없습니다.

## 5. 운영 원칙

- 공식 의사결정은 메일 또는 보고서로 남깁니다.
- Chat은 논의와 아이디어 발굴 보조 수단으로 사용합니다.
- 중요한 메시지는 Idea Board, Technology Card, PoC Pipeline으로 전환합니다.
- 민감자료, 계약정보, 견적 원문 등은 사내 보안 기준에 따라 관리합니다.


## 개인별 계정 기본 세팅

이번 배포본은 다음 계정을 기본 제공합니다.

| Login ID | PIN | Role |
|---|---:|---|
| carlos.lee | 2026 | admin |
| js1978.kim | 2026 | editor |
| shb.bae | 2026 | editor |
| ab.sharafat | 2026 | editor |
| ygiz.lee | 2026 | editor |
| hs98.choi | 2026 | editor |

`member / 1111` 공용 계정은 작성자 구분과 이력 관리를 위해 비활성화되어 있습니다.
