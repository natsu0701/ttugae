# 뜨개러투게더 (ttugae-web)

React + Tailwind CSS + Framer Motion 랜딩·에디터 페이지입니다.
백엔드 없이 브라우저에서 동작하는 정적 사이트입니다.

배포 URL: [https://natsu0701.github.io/ttugae/](https://natsu0701.github.io/ttugae/)

## 로컬 실행

```bash
npm install
npm run dev
```

GitHub Pages와 같은 하위 경로를 쓰므로 개발 서버는 `http://localhost:5173/ttugae/` 에서 열립니다.

## 프로덕션 빌드

```bash
npm install
npm run build
npm run preview
```

미리보기는 `http://localhost:4173/ttugae/` 입니다.

## GitHub Pages 배포

`main`에 push하면 GitHub Actions가 `dist/`를 빌드해 Pages에 올립니다.

처음 한 번만 저장소에서 **Settings → Pages → Build and deployment → Source: GitHub Actions** 로 바꿔 주세요.
