# Slack-style Collaboration Update Guide

## 추가 기능

1. **Thread**
   - Team Chat 메시지별로 `Thread` 버튼을 눌러 댓글을 등록합니다.
   - 하나의 기술/PoC/Vendor 이슈에 대한 논의를 묶어서 관리할 수 있습니다.

2. **Pin / 중요 메시지 고정**
   - 중요한 메시지는 `Pin`으로 채널 상단에 고정합니다.
   - 예: 접속 주소, 금주 집중 검토 기술, PoC KPI, Vendor 질문 리스트.

3. **Saved Messages / My Follow-up**
   - 메시지의 `저장` 버튼을 누르면 `My Follow-up` 메뉴에 표시됩니다.
   - 내가 @호출된 메시지도 `My Follow-up`에서 확인할 수 있습니다.

4. **업무 전환 버튼**
   - Team Chat 메시지를 `Idea`, `Tech`, `Task`, `PoC`, `Vendor`로 전환할 수 있습니다.
   - 대화를 실행 항목으로 전환하기 위한 기능입니다.

5. **Reaction**
   - Team Chat 메시지에 업무형 Reaction을 사용할 수 있습니다.
   - `👍` 동의, `👀` 검토 필요, `✅` 완료, `⚠️` Risk, `💡` 아이디어.

## 백업 주의사항

첨부파일과 데이터가 분리되어 있으므로 운영 백업 시 아래 폴더를 함께 백업하십시오.

```text
data
uploads
```

## 기존 데이터 유지 적용

기존 운영 폴더에서 아래 항목을 새 버전 폴더에 복사하면 됩니다.

```text
data
uploads
```

단, 새 버전의 `server.js`, `public/app.js`, `public/styles.css`는 반드시 유지하십시오.
