-- ============================================================
-- 주택연금 안내 서비스 — D1 초기 스키마
-- /migrations/0001_init.sql
-- 주의: 개인 식별정보(이름, 전화번호, 주민번호, 정확한 주소)는 저장하지 않습니다.
--       연령·주택가격은 구간(band)으로 저장합니다.
-- ============================================================

-- 1. 시뮬레이션 결과 로그
CREATE TABLE IF NOT EXISTS simulations (
  id               TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  mode             TEXT NOT NULL CHECK(mode IN ('self', 'child')),        -- 본인/자녀 모드
  age_band         TEXT NOT NULL,   -- 예: '60-64', '65-69'
  house_price_band TEXT NOT NULL,   -- 예: '2억-3억', '3억-4억'
  loan_band        TEXT NOT NULL,   -- 담보대출 잔액 구간
  bequest_pref     TEXT NOT NULL CHECK(bequest_pref IN ('want', 'neutral', 'max_income')),
  stay_pref        INTEGER NOT NULL DEFAULT 1,  -- 계속 거주 의향 (0/1)
  concerns         TEXT NOT NULL DEFAULT '[]',  -- JSON 배열 ['상속', '집값변동', ...]
  est_min          INTEGER NOT NULL,            -- 예상 월 지급 최솟값 (원)
  est_max          INTEGER NOT NULL,            -- 예상 월 지급 최댓값 (원)
  converted_to_consult INTEGER NOT NULL DEFAULT 0  -- 상담 예약으로 전환 여부
);

-- 2. 챗봇 대화 로그
CREATE TABLE IF NOT EXISTS chat_logs (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  session_id  TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  question    TEXT NOT NULL,
  category    TEXT,         -- '목적', '조건', '월지급액', '절차', '서류', '자녀상속'
  age_band    TEXT,         -- 사용자가 입력한 경우에만
  resolved    INTEGER,      -- 0: 미해결, 1: 해결, NULL: 피드백 없음
  source_ids  TEXT NOT NULL DEFAULT '[]',  -- JSON: 사용된 FAQ ID 배열
  escalated   INTEGER NOT NULL DEFAULT 0   -- 상담 연결로 넘어갔는지 여부
);

-- 3. 상담 예약
CREATE TABLE IF NOT EXISTS consult_requests (
  id               TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  method           TEXT NOT NULL CHECK(method IN ('visit', 'phone', 'video')),
  branch           TEXT,         -- 희망 지사 (방문일 때)
  preferred_slot   TEXT,         -- 희망 날짜·시간대 (예: '2024-12-10 오전')
  proxy_by_child   INTEGER NOT NULL DEFAULT 0,  -- 자녀 대리 신청 여부
  summary_json     TEXT NOT NULL DEFAULT '{}',  -- 상담 전 요약 카드 JSON
  public_code      TEXT NOT NULL UNIQUE,         -- 고객용 조회 코드
  status           TEXT NOT NULL DEFAULT 'pending'
                   CHECK(status IN ('pending', 'confirmed', 'completed', 'cancelled'))
);

-- 4. 신청 진행 현황
CREATE TABLE IF NOT EXISTS applications (
  id               TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  public_code      TEXT NOT NULL UNIQUE,
  stage            INTEGER NOT NULL DEFAULT 1 CHECK(stage BETWEEN 1 AND 4),
  -- 1: 상담·신청 접수 / 2: 서류 확인·보증 심사 / 3: 보증 약정·담보 설정 / 4: 금융기관 대출 약정
  stage_updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  delay_reason     TEXT,          -- 지연 사유 (있을 때만)
  missing_docs     TEXT NOT NULL DEFAULT '[]',  -- 보완 필요 서류 JSON 배열
  expected_done_min TEXT,         -- 예상 완료일 최솟값 (날짜 문자열)
  expected_done_max TEXT          -- 예상 완료일 최댓값 (날짜 문자열)
);

-- 5. 단계별 이력 (타임라인용)
CREATE TABLE IF NOT EXISTS stage_history (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  application_id  TEXT NOT NULL REFERENCES applications(id),
  stage           INTEGER NOT NULL CHECK(stage BETWEEN 1 AND 4),
  entered_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 6. 자유 의견·피드백
CREATE TABLE IF NOT EXISTS feedback (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  type        TEXT NOT NULL CHECK(type IN ('positive', 'negative', 'suggestion', 'other')),
  text        TEXT,
  age_band    TEXT   -- 사용자가 입력한 연령대 (선택)
);

-- ============================================================
-- 인덱스
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_simulations_created_at    ON simulations(created_at);
CREATE INDEX IF NOT EXISTS idx_simulations_age_band      ON simulations(age_band);
CREATE INDEX IF NOT EXISTS idx_chat_logs_session_id      ON chat_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_logs_category        ON chat_logs(category);
CREATE INDEX IF NOT EXISTS idx_chat_logs_resolved        ON chat_logs(resolved);
CREATE INDEX IF NOT EXISTS idx_consult_public_code       ON consult_requests(public_code);
CREATE INDEX IF NOT EXISTS idx_applications_public_code  ON applications(public_code);
CREATE INDEX IF NOT EXISTS idx_stage_history_app_id      ON stage_history(application_id);
