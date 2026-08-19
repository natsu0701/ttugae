# 뜨개러투게더 (ttugae-web)

React + Tailwind CSS + Framer Motion 랜딩·에디터 페이지입니다.  
백엔드 없이 브라우저에서 동작하는 정적 사이트라서, `npm run build` 결과물(`dist/`)만 올리면 배포할 수 있습니다.

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 을 열고 스크롤해 털실 애니메이션을 확인하세요.

## 프로덕션 빌드

```bash
npm install
npm run build
npm run preview
```

- `npm run build` — TypeScript 검사 후 `dist/` 에 정적 파일을 만듭니다.
- `npm run preview` — 배포본을 로컬에서 미리 봅니다 (`http://localhost:4173`).

로그인·도안 저장은 `localStorage` 를 사용하므로 서버나 데이터베이스는 필요 없습니다.

## 배포하는 방법

이 저장소는 Origin Git에 있습니다. Vercel / Netlify / Cloudflare Pages 는 GitHub·GitLab 연동이 기본이라, **로컬에서 빌드 후 CLI로 올리는 방법**이 가장 빠릅니다. GitHub에 같은 코드를 올려 두면 대시보드에서 연결해 자동 배포할 수도 있습니다.

공통 설정:

| 항목 | 값 |
| --- | --- |
| Framework | Vite |
| Build command | `npm run build` |
| Output / Publish directory | `dist` |
| Node | 18 이상 (권장 22) |

`/community`, `/mypage` 같은 클라이언트 라우트는 아래 파일이 처리합니다.

- Vercel: `vercel.json`
- Netlify: `netlify.toml`
- Cloudflare Pages / Netlify: `public/_redirects`

### 1) Vercel (권장)

1. [Vercel](https://vercel.com/signup) 계정을 만듭니다.
2. 프로젝트 폴더에서:

```bash
npm install
npx vercel login
npx vercel
```

3. 프로덕션에 올리려면:

```bash
npx vercel --prod
```

GitHub에 이 저장소를 미러해 두었다면 [Vercel New Project](https://vercel.com/new)에서 저장소를 선택하고 Framework Preset을 Vite로 두면 push마다 자동 배포됩니다.

### 2) Netlify

```bash
npm install
npm run build
npx netlify login
npx netlify deploy --dir=dist
npx netlify deploy --prod --dir=dist
```

또는 [Netlify Drop](https://app.netlify.com/drop)에 `dist/` 폴더를 드래그해도 됩니다.

### 3) Cloudflare Pages

```bash
npm install
npm run build
npx wrangler login
npx wrangler pages deploy dist --project-name=ttugae-web
```

대시보드를 쓸 때는 Build command `npm run build`, Build output directory `dist` 로 지정하세요.

### 커스텀 도메인

배포가 끝난 뒤 각 호스팅 대시보드의 Domains에서 원하는 도메인을 연결하면 됩니다. HTTPS는 플랫폼이 발급합니다.

## 배포 후 확인

1. 랜딩 페이지가 열리는지
2. 에디터로 들어가 도안을 그릴 수 있는지
3. `/community` 를 주소창에 직접 입력하거나 새로고침해도 404가 아닌지
