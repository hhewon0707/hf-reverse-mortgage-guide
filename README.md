# 주택연금 안내 서비스

> 주택연금 가입 의사결정 지원 및 고객 소통 통합 플랫폼 — 공모전·기획 시연용 프로토타입

**⚠️ 모든 수치·사례는 가상 데이터입니다. 실제 주택연금 조건과 다를 수 있습니다.**

---

## 로컬 개발 방법

### 사전 준비
- Node.js 18 이상
- npm 9 이상

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (http://localhost:5173)
npm run dev

# 빌드
npm run build

# 단위 테스트 실행
npm test
```

---

## 프로젝트 구조

```
hf-reverse-mortgage-guide/
├── src/
│   ├── components/      # 공통 컴포넌트 (헤더, 푸터, 배지 등)
│   ├── pages/           # 라우트별 페이지
│   │   ├── Home.tsx     # / — 홈
│   │   ├── Find.tsx     # /find — 나에게 맞는 주택연금 찾기
│   │   ├── Chat.tsx     # /chat — 질문하기(챗봇)
│   │   ├── Consult.tsx  # /consult — 상담 예약
│   │   ├── Status.tsx   # /status — 진행 현황
│   │   └── Admin.tsx    # /admin — 관리자 대시보드
│   ├── lib/             # 계산 로직 (estimate.ts 등)
│   └── data/            # 타입 정의
├── data/                # CSV/JSON 데이터 파일
│   ├── payment_table.csv    # 월 지급액 표 (샘플)
│   ├── rules.json           # 가입 조건 (verified:false)
│   ├── faq.json             # FAQ 20개 이상
│   └── stage_duration.csv   # 단계별 처리일 샘플
├── migrations/
│   └── 0001_init.sql        # D1 스키마 (향후 Cloudflare 연동 시 사용)
└── public/
```

---

## 주요 페이지

| 경로 | 설명 |
|------|------|
| `/` | 홈 — 가치 제안, FAQ Top 5 |
| `/find` | 나에게 맞는 주택연금 찾기 (Phase 2) |
| `/chat` | 질문하기·챗봇 (Phase 3) |
| `/consult` | 상담 예약 (Phase 4) |
| `/status` | 진행 현황 (Phase 4) |
| `/admin` | 관리자 대시보드 (Phase 5) |

---

## 데모 조회 코드 (Phase 4 완료 후 사용 가능)

| 코드 | 상태 |
|------|------|
| `HF-2024-DEMO01` | 정상 진행 중 |
| `HF-2024-DEMO02` | 서류 보완 필요 |
| `HF-2024-DEMO03` | 지연 사례 |

---

## GitHub Pages 배포

1. GitHub 저장소 → Settings → Pages
2. Source: `main` 브랜치 선택 → Save
3. GitHub Actions로 자동 배포 (`.github/workflows/deploy.yml` 추가 필요)

> **참고:** 현재 버전은 순수 프론트엔드(React SPA)로, 별도 서버 없이 GitHub Pages에 바로 배포 가능합니다.

---

## 개발 단계(Phase) 진행 현황

- [x] **Phase 0** — 프로젝트 세팅, 공통 레이아웃, 라우팅
- [ ] **Phase 1** — 데이터 파일 + 계산 로직
- [ ] **Phase 2** — /find 단계형 입력 + 결과 화면
- [ ] **Phase 3** — 챗봇
- [ ] **Phase 4** — 상담 예약 + 진행 현황
- [ ] **Phase 5** — 관리자 대시보드
- [ ] **Phase 6** — 마무리·접근성 점검

---

## 금융 서비스 안전 원칙

1. 모든 금액 결과 근처에 "참고용 예상치" 문구 표시
2. 가입 권유·단정 표현 금지
3. 챗봇은 FAQ 근거가 있을 때만 답변
4. 개인정보 최소 수집, 입력값 구간화 저장
5. 샘플·가상 데이터 항상 명시
