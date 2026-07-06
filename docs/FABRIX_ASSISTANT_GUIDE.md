# FabriX Assistant Guide

## 목적

FabriX Assistant는 Construction Automation & Robotics Radar App에 저장된 Technology Card, Idea Board, Pain Point, PoC, Vendor, News, Team Chat 데이터를 기반으로 FabriX Chat에 붙여넣을 수 있는 업무형 Prompt를 자동 생성하는 기능입니다.

현재 버전은 FabriX API 직접 연동 방식이 아니라, **Prompt 생성 → 복사 → FabriX Chat 열기 → 붙여넣기** 방식입니다. 사내 SSO와 보안 정책, 브라우저 CORS 제한 때문에 별도 승인 없이 FabriX에 자동 전송하지 않습니다.

## 접속

Radar App에서 `FabriX Assistant` 메뉴를 선택합니다.

## 사용 순서

1. Prompt 목적 선택
   - 주간 기술 브리핑 / 팀장 보고 초안
   - 기술 적용성 검토 보고서
   - PoC 계획서 초안
   - Vendor Clarification 질문서
   - 뉴스/기사 → 적용 아이디어 전환
   - CEO/임원 보고용 1 Page 요약

2. 데이터 범위 선택
   - 전체 데이터
   - Technology Cards
   - Idea Board
   - Pain Point Bank
   - PoC Pipeline
   - Vendor Tracker
   - News Radar
   - Team Chat

3. 검토 초점 입력
   - 예: `FGIP 탱크 도장 로봇 PoC 관점으로 검토`
   - 예: `중동 Post R&R과 연결하여 정리`
   - 예: `Vendor Clarification 질문 중심으로 작성`

4. `Prompt 생성` 클릭

5. `복사` 클릭

6. `FabriX Chat 열기` 클릭

7. FabriX Chat에 Prompt를 붙여넣고 실행

## 설계 의도

FabriX는 사내 데이터와 업무 시스템을 연결해 기업 업무에 생성형 AI를 적용하기 위한 플랫폼입니다. Radar App에서는 FabriX를 다음 용도로 활용하는 것을 우선 목표로 합니다.

- 기술 적용성 평가
- PoC 계획서 초안 생성
- Vendor 질의서 생성
- 주간회의/팀장 보고 초안 작성
- News Radar 기사 기반 아이디어 도출
- Team Chat 논의의 Action Item 전환

## 주의사항

- FabriX 답변은 업무 초안으로 활용하고, 최종 판단은 원문 자료, Vendor 회신, 사내 기준, 현장 조건으로 검증하십시오.
- 최신 단가, 법규, 인증, Vendor Reference 등은 별도 확인이 필요합니다.
- 회사 보안 정책상 민감 정보, 계약 정보, 개인정보를 입력할 때는 사내 기준을 준수하십시오.

## 향후 고도화 가능 기능

FabriX에서 공식 API, Agent endpoint, 사내 승인된 연동 방식이 제공되면 다음 기능을 추가할 수 있습니다.

- App에서 FabriX Agent 직접 호출
- Technology Card 자동 요약 저장
- PoC 계획서 자동 생성 후 App DB 저장
- Team Chat 요약 자동 작성
- News Radar 기사 자동 평가
- Word 보고서 자동 생성
