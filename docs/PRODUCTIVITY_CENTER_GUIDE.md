# Productivity Center Guide

## 목적
Productivity Center는 자동화·로보틱스 업무에서 발생하는 대화, 아이디어, Vendor Follow-up, PoC, 회의 결과를 실제 실행 항목으로 연결하기 위한 화면입니다.

## 주요 기능

### 1. My Work Queue
- Action Item을 담당자와 기한 기준으로 정렬합니다.
- Overdue, Due Today, D-3 이하 항목을 우선 표시합니다.
- 각 Action은 바로 수정하거나 Done 처리할 수 있습니다.

### 2. Automation Signals
다음 조건을 자동 감지하여 우선 조치가 필요한 항목을 표시합니다.
- 기한이 지난 Action Item
- 3일 이내 기한 도래 Action Item
- Follow-up 날짜가 지난 Vendor
- KPI가 비어 있는 PoC
- 종료일이 7일 이내인 PoC
- 좋아요가 5개 이상인 미선정 Idea
- 평가점수 85점 이상이나 Trial/Adopt가 아닌 Technology Card

### 3. Quick Capture / Command
채팅처럼 입력해서 업무 항목을 바로 등록합니다.

예시:
```text
/task @ygiz.lee Broadwell 견적 Clarification 확인 due:2026-06-20
/idea Tank 도장 로봇 생산성 KPI 표준화
/vendor Qlayer Tank coating robot demo request due:2026-06-25
/poc Air Dome RFID material tracking test due:2026-07-15
```

### 4. Meeting Notes
회의 Agenda, 논의내용, 결정사항, Action Items를 기록합니다.
Action Items 필드에 줄 단위로 작성한 내용을 Action Item으로 전환할 수 있습니다.

### 5. Decision Log
주요 의사결정의 배경, 검토 대안, 최종 결정, 결정 근거를 남깁니다.
같은 논의를 반복하지 않기 위한 기능입니다.

## 운영 권장
- 주간회의 전에 Productivity Center를 먼저 확인합니다.
- Overdue와 Automation Signals를 우선 처리합니다.
- 회의 후 Meeting Notes를 작성하고 Action Items로 전환합니다.
- PoC 추진 여부, Vendor 선정, 적용 보류 등 주요 판단은 Decision Log에 남깁니다.
