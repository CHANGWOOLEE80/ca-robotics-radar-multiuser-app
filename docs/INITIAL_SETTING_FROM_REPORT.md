# Initial Setting from Mobile Production Base Automation Report

## 적용 기준

본 버전은 `이동형 생산기지 자동화 적용 Item 종합 검토 및 추진계획 보고` 내용을 기준으로 Radar App의 초기 데이터를 구성했습니다.

## 신규 추가 메뉴

- Project Baseline
  - Executive Message
  - 의사결정 요청사항
  - Agent Architecture
  - Target KPI
  - Data Foundation
  - 2026~2028 단계별 추진 기준

## 초기 등록 데이터

### Technology Cards

1. AI Spool Runner
2. Minimal Teaching Support Shop
3. AI Drying Control & WIP Scheduler
4. Humanoid Piperack Module Assembly Support
5. Air Dome for Mobile Production Base
6. Modular Blast/Paint Booth
7. Mobile / Relocatable RT Bunker
8. Autonomous Transport Platform
9. Material Handling Exoskeleton

### Pain Point Bank

- Spool 탐색·반출·이송 지연
- 배관 Support Cobot 교시시간 과다
- Spool Drying 수동 반입·반출 및 WIP 체류
- Piperack Module 조립 간접업무 과다
- Air Dome 견적 조건 불명확

### Idea Board

- 4개 핵심 Item을 App 기본 Portfolio로 등록
- Air Dome 견적 Clarification Matrix 표준화
- Mobile Production Base Data Foundation Checklist
- PoC별 KPI Baseline Template 작성
- Humanoid 적용 전 Digital Twin Simulation 우선 수행

### PoC Pipeline

- AI Spool Runner 2026 Pilot
- Minimal Teaching Support Shop Pilot
- AI Drying Control & WIP Scheduler Concept Pilot
- Humanoid Piperack Module Assembly Simulation
- Air Dome Quotation Clarification & Investment Basis

### Vendor Tracker

- Broadwell
- Liri
- PUHUA
- BlastOne
- Eidosolutions
- Applied EV
- Sha Fu

## 적용 방법

기존 운영 데이터를 유지해야 하는 경우, 새 버전을 바로 덮어쓰지 마십시오.

- 새 초기 Setting 데이터를 사용하려면 새 버전의 `data/db.json`을 그대로 사용합니다.
- 기존 운영 중 입력한 데이터를 유지하려면 기존 `data/db.json`을 복사하지 말고, 필요한 항목만 Export/Import 또는 수동 반영하십시오.
- 사용자 계정은 기존과 동일하게 `carlos.lee / 2026` admin, 그룹원 Knox ID / 2026 editor 구조입니다.

## FabriX 연계

FabriX Assistant의 Context Data에 `Project Baseline` 항목을 추가했습니다.  
이를 선택하면 이동형 생산기지 Baseline, KPI, 단계별 추진 기준을 Prompt에 자동 포함할 수 있습니다.
