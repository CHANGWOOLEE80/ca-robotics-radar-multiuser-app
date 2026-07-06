# News Radar 사용 가이드

## 1. 기능 개요

News Radar는 자동화·로보틱스·Physical AI·건설 자동화 관련 최신 기사를 앱 안에서 확인하고, 유용한 기사를 Technology Card 또는 Idea Board로 전환하기 위한 기능입니다.

## 2. 기본 동작 방식

- 서버 PC에서 RSS Feed를 수집합니다.
- 수집 결과는 `data/news_cache.json`에 저장됩니다.
- 기사 소스 목록은 `data/news_sources.json`에 저장됩니다.
- 그룹원 PC는 외부 인터넷에 직접 접속하지 않고, 앱 서버가 저장한 기사 캐시를 조회합니다.

## 3. 사용 방법

1. 앱에 `member / 1111`로 로그인합니다.
2. 상단 메뉴에서 `News Radar`를 선택합니다.
3. `기사 새로고침` 버튼을 누릅니다.
4. 수집된 기사 중 의미 있는 항목은 아래 버튼으로 업무 항목으로 전환합니다.
   - `Technology Card로 전환`
   - `Idea로 전환`
5. 사내망 차단 등으로 RSS 수집이 되지 않으면 `기사 수동 등록`을 사용합니다.

## 4. 사내망 환경 주의사항

서버 PC가 외부 인터넷 또는 Google News RSS에 접속할 수 있어야 자동 수집이 됩니다. 회사 보안 정책이나 Proxy 설정에 따라 외부 RSS 접속이 차단될 수 있습니다.

차단될 경우 아래 방식 중 하나를 사용하십시오.

- 기사 수동 등록
- IT 부서에 서버 PC의 외부 RSS 접속 허용 문의
- 사내 승인된 뉴스/API Gateway 사용
- SharePoint/Power Apps 또는 사내 서버 기반 정식 운영으로 전환

## 5. News Source 수정

기사 소스는 아래 파일에서 수정할 수 있습니다.

```text
/data/news_sources.json
```

각 소스는 다음 구조입니다.

```json
{
  "name": "Google News EN - Construction Robotics",
  "language": "English",
  "url": "https://news.google.com/rss/search?...",
  "enabled": true
}
```

수정 후 서버를 재시작하거나 News Radar에서 다시 새로고침하십시오.

## 6. 저작권 관련 운영 기준

기사 전문을 저장하지 말고 제목, 출처, 발행일, 간단 요약, 링크 중심으로 관리하십시오. 필요한 경우 원문 링크를 통해 기사 원문을 확인하는 방식으로 운영하는 것이 안전합니다.
