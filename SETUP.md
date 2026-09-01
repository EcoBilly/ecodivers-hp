# 개발 환경 세팅 (여러 컴퓨터에서 작업하기)

## 저장소 주소

```
https://github.com/EcoBilly/ecodivers-hp.git
```

## 처음 한 번 — 다른 컴퓨터에서 클론

```bash
git clone https://github.com/EcoBilly/ecodivers-hp.git
cd ecodivers-hp
npm install
```

> 필요 프로그램: Node.js 22.x, Git
> GitHub 로그인 창이 뜨면 계정 `EcoBilly` 로 로그인 (비밀번호 대신 Personal Access Token).

## Git 에 올라가지 않는 파일 — 직접 복사해야 함 ⚠️

아래 파일들은 보안상 저장소에서 제외돼 있습니다. USB 등으로 **직접 옮기세요. 절대 커밋하지 마세요.**

| 파일 | 용도 | 없으면 |
| --- | --- | --- |
| `.env.local` | Firebase / Gemini / Telegram / PayPal 키 | 로컬에서 챗봇·예약알림·상품관리 동작 안 함 |
| `.env.vercel.local` | Vercel 배포용 키 | `vercel` CLI 로 직접 배포할 때만 필요 |
| `.vercel/` 폴더 | Vercel 프로젝트 연결 정보 | `vercel` CLI 로 직접 배포할 때만 필요 |

`node_modules`, `.next` 도 제외돼 있지만 이건 `npm install` / `npm run dev` 하면 자동 생성됩니다.

## 로컬 실행

```bash
npm run dev
```

→ http://localhost:3000

## 평소 작업 흐름 (두 컴퓨터 오갈 때)

작업 **시작 전**:

```bash
git pull
```

작업 **끝난 후**:

```bash
git add -A
git commit -m "무엇을 바꿨는지"
git push
```

> 규칙: 시작 전 `git pull`, 끝나면 바로 `git push`.
> push 를 잊고 다른 컴퓨터에서 작업하면 충돌(conflict)이 납니다.

## 배포

`main` 브랜치에 `git push` 하면 Vercel 이 자동으로 프로덕션 배포합니다
(https://ecodivers-hp.vercel.app).

## 절대 건드리지 않는 부분

- `app/admin/**` (예약 일정표·정산·체크인)
- `app/api/telegram/*`, `app/api/telegram-webhook/*`
- `app/underwater-enhancer/` (AI 사진보정)
- Firestore `bookings` / `staffMembers` / `staffDaysOff` 스키마
