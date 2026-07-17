# OpenAI Build Week - 전략 노트

> 지금까지 논의/조사한 포인트 정리. (사실 근거: 공식 룰 + Devpost 페이지, aside로 확인)
> 최종 결정의 우선순위: 현재 repo 상태 > 이 노트 > 기억.

---

## 1. 해커톤 기본 사실

- **이름:** OpenAI Build Week (openai.devpost.com)
- **필수 스택:** Codex + GPT-5.6 (안 쓰면 1단계 탈락)
- **트랙 4개** (각 트랙 1등 $15,000 / 2등 $10,000):
  1. Apps for Your Life
  2. Work & Productivity
  3. Developer Tools
  4. Education
- **총 상금:** $100,000

## 2. 타임라인 (전부 PT 기준)

| 단계 | 시각 |
|---|---|
| 제출 마감 (하드) | **7/21 (화) 5:00 PM PT** |
| 심사 | 7/22 ~ 8/5 (룰) / 8/9 (Devpost 표) - 표기 불일치 |
| 수상 발표 | ~8/12 |

- 오늘 기준 마감까지 **약 4일**.
- 4:59 PM 제출 금지 - 업로드/사이트 오류 대비 버퍼 남길 것.

## 3. 심사 기준 (2단계)

**1단계 (Pass/Fail):** 테마 적합 + Codex/GPT-5.6 실제 사용 여부. 걸리면 심사 안 함.

**2단계 (4개, 전부 동일 가중치):**
| 기준 | 심사 질문 |
|---|---|
| Technological Implementation | Codex를 얼마나 깊고 능숙하게 썼나? non-trivial 하게 동작하나? |
| Design | PoC 아니라 완결된 제품 경험인가? 실제로 돌아가나? |
| Potential Impact | 진짜 청중의 진짜 문제를 구체적으로 푸나? 데모가 증명하나? |
| Quality of the Idea | 창의적/새로운가? 기존과 다른가? |

**심사위원:** Thibault Sottiaux(Head of Product), Kath Korevec, Tara Seshan,
**Leah Belsky(VP Education - Education 트랙 강력)**, Peter Steinberger.

## 4. 제출 필수물 (하나라도 빠지면 위험)

- [ ] 동작하는 프로젝트 (Codex + GPT-5.6)
- [ ] **공개 repo** (또는 비공개 + `testing@devpost.com` & `build-week-event@openai.com` 공유)
- [ ] **3분 미만 공개 유튜브 데모** (음성으로 Codex AND GPT-5.6 사용 설명)
- [ ] README (셋업 + Codex/GPT-5.6 사용법)
- [ ] **`/feedback` Codex 세션 ID** (핵심 기능 만든 스레드)
- [ ] 카테고리 선택 + 텍스트 설명
- [ ] (플러그인/개발도구면) 설치법 + 재빌드 없이 심사가 테스트할 방법

## 5. Codex 사용은 어떻게 "검증"되나 ⚠️ 중요

- **설명만 보는 게 아님.** 검증 앵커 3개:
  1. **`/feedback` 세션 ID** = 서버의 실제 Codex 세션 로그와 연결. **하드 증거.**
  2. README 서술 (자기 보고)
  3. 영상 음성 (자기 보고)
- 기존 프로젝트 확장 시엔 **timestamped 세션 로그 / dated commit history** 요구.

### ⚠️ 현재 리스크
- 지금까지 Culprit 코드는 **GJC(Claude 기반)로 작성됨 - Codex 아님.**
- 이 상태면 `/feedback` 세션 ID를 낼 Codex 세션이 없고, 심사가 세션을 열어도 흔적 없음 → 1단계에서 위험.
- **해결:** 남은 핵심 빌드(특히 M3)를 **Codex 세션에서 직접** 진행 → 검증 가능한 로그 + 세션 ID 확보. (이 머신에 `codex-cli 0.144.1` 설치됨)

## 6. 크레딧 상태: 죽음 (DEAD)

- $100 Codex 크레딧 신청 폼(`forms.gle/Ncu6iGkaHq1SwUmEA`) **마감 전에 소진되어 CLOSED.**
- "we've given out all available credits" 표시. 신청 불가.
- → **본인 OpenAI 키 / 무료 티어로 진행.** 크레딧은 완전히 배제.

## 7. Devpost 플러그인: optional, 스킵

- 룰 5조: "**not required** to enter or win", "helper, not source of truth", "output may be inaccurate".
- 요건을 검증해주는 도구 아님. 유일한 자동 관문은 **Devpost 제출 폼의 필수 필드**.
- → 설치 안 함. 크리티컬 패스 아님.

## 8. 등록 상태

- OpenAI Build Week **등록 완료** (Devpost 로그인 `sskys18`).
- **주의:** "thinking"이라는 **draft 프로젝트(2/5 steps)**가 이미 있음 → 제출 시 이걸 채우거나 새로 만들어 대체. 중복 주의.

## 9. 주제 결정 (아직 PENDING)

동일 조건(솔로, 4일, 무료 티어, 3분 영상 심사)으로 점수화. 3개 28점 동점 → 가치관 선택 문제.

| 기준 | A. Culprit (Dev Tools) | B. Grade-with-evidence (Education) | C. Contract red-flag reader (Apps) |
|---|---|---|---|
| 데모 임팩트 | 5 (bisect가 범인 증명) | 4 | 4 |
| 실제 임팩트 | 4 | 5 | 5 |
| Novelty | 3 | 3 | 3 |
| GPT-5.6 진짜 사용 | 4 | 5 | 5 |
| 4일 완성 가능성 | **5 (코어 완성+테스트)** | 4 | 4 |
| 필드 승률 (덜 붐빌수록↑) | 2 (Dev Tools 최다) | **4 (전담 Edu 심사)** | 3 |
| 무료티어 비용 | 5 | 3 | 4 |
| **합계** | **28** | **28** | **28** |

**결정 프레임 (아이디어가 아니라 가치관을 고른다):**
- **"확실히 완성해서 잘 만든 걸 낸다" → A. Culprit** (이미 절반 완성, 데모 확실성 최고)
- **"승률 최대" → B. Education 채점기** (덜 붐비는 필드 + 전담 VP 심사)
- C(계약서)는 셋 중 제일 약함 - 비추.

**GJC 추천:** A(Culprit). 4일 솔로에선 *완성된 확실한* 작품이 *애매하게 완성될* 작품을 이긴다. 코어가 이미 de-risk됨.
**단, 위 5번 리스크 때문에 남은 빌드는 Codex 세션에서 해야 함.**

### 후보별 상세 요약

**A. Culprit** - 테스트 깨진 커밋을 `git bisect`로 자동 특정 → GPT-5.6가 원인 설명 + 수정 패치. Codex MCP 플러그인.
- 상태: 결정적 코어(exec + bisect) 완성, 테스트 3개 통과, e2e 검증. 남은 건 M3(GPT-5.6).
- 강점: 데모에서 AI가 확실히 맞다는 걸 증명. 약점: Dev Tools 경쟁 최다.

**B. Grade-with-evidence** - 루브릭 + 학생 답안 다수 → GPT-5.6가 항목별 채점 + 학생 문장 인용 근거 + 경계선 표시 + 피드백.
- 상태: 미착수 (Culprit 코드 재사용 불가).
- 강점: 전담 심사위원 + 임팩트 스토리. 약점: 토큰 비용 큼.

**C. Contract red-flag reader** - 계약서 업로드 → 쉬운 말 번역 + 위험 조항 경고(조항 인용) + 협상 제안.
- 강점: 광범위 공감. 약점: Apps 트랙 최다 + 법률조언 리스크.

## 10. 남은 작업 (Culprit 기준) & 크리티컬 패스

- [ ] **M3 (마지막 코드):** `explain_commit` + `propose_fix` (GPT-5.6) → **`OPENAI_API_KEY` 필요.** Codex 세션에서 진행.
- [ ] 품질/프롬프트 패스, 엣지 케이스, README 사용기
- [ ] 배포: `npx culprit` 등 심사가 재빌드 없이 테스트할 경로
- [ ] 3분 데모 영상 (사용자 녹화 + 음성)
- [ ] Devpost 최종 제출 (repo/영상 URL, `/feedback` 세션 ID, 카테고리)

**크리티컬 패스 = (1) 주제 A/B 확정 + (2) OPENAI_API_KEY.**

## 11. 열린 결정

1. **주제: A(Culprit) vs B(Education 채점기)** - 최종 확정 필요.
2. repo 공개 vs 비공개+심사 이메일 공유 → 공개 권장(개발도구).
3. 남은 빌드를 Codex 세션에서 진행 (세션 ID 확보 목적) - 권장.

## 완료된 것 (참고)

- 스캐폴딩, 문서(PLAN/README/SUBMISSION), 데모 픽스처(`make-demo.sh`)
- 결정적 코어: `exec.ts`(러너) + `git.ts`(bisect 드라이버, 항상 reset)
- 툴 2종(`reproduce_failure`, `find_regression`) MCP 서버에 연결 + 실 JSON 스키마
- 테스트 3개 통과, MCP `tools/call` e2e 검증 (범인 = "perf: tighten loop bound")
- 커밋: `c81648f`(스캐폴드), `bfc070a`(결정적 코어)
