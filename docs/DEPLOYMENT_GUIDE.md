# Deployment Guide

## Option A. 사내 PC 또는 소형 VM 배포

1. Node.js 20 이상 설치
2. 앱 폴더 복사
3. 최초 실행 전 관리자 PIN 설정
4. `node server.js` 실행
5. Windows 방화벽에서 TCP 8080 허용
6. 그룹원에게 `http://서버IP:8080` 공유

## Option B. Docker 배포

```bash
docker compose up -d --build
```

## 운영 Checklist

- [ ] 관리자 PIN 변경
- [ ] 서버 IP 고정 또는 사내 DNS 등록
- [ ] `data` 폴더 백업 경로 지정
- [ ] Pilot 사용자 3~5명 지정
- [ ] 주간회의에서 Dashboard 기준으로 Follow-up
- [ ] 2주 후 입력 양식, 평가점수 배점, PoC 단계명 보정

## 권장 백업 명령

Linux:

```bash
tar -czf ca-radar-data-backup-$(date +%F).tar.gz data
```

Windows PowerShell:

```powershell
Compress-Archive -Path .\data -DestinationPath .\ca-radar-data-backup.zip
```
