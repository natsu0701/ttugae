const FONT_CSS =
  "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&display=swap";

function setSplashMessage(message: string) {
  const el = document.getElementById("boot-splash-msg");
  if (el) el.textContent = message;
}

function waitForWorker(worker: ServiceWorker): Promise<void> {
  if (worker.state === "activated" || worker.state === "redundant") {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const onChange = () => {
      if (worker.state === "activated" || worker.state === "redundant") {
        worker.removeEventListener("statechange", onChange);
        resolve();
      }
    };
    worker.addEventListener("statechange", onChange);
  });
}

async function waitUntilControlled(): Promise<void> {
  if (navigator.serviceWorker.controller) return;
  await Promise.race([
    new Promise<void>((resolve) => {
      navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), { once: true });
    }),
    new Promise<void>((resolve) => {
      window.setTimeout(resolve, 4000);
    }),
  ]);
}

async function warmExternalAssets(): Promise<void> {
  try {
    const css = await fetch(FONT_CSS).then((response) => response.text());
    const urls = [...css.matchAll(/url\((?:['"]?)(https:\/\/fonts\.gstatic\.com[^)'"]+)/g)].map(
      (match) => match[1],
    );
    await Promise.all(urls.map((url) => fetch(url, { mode: "cors" }).catch(() => undefined)));
    await document.fonts.ready.catch(() => undefined);
  } catch {
    // 글꼴은 다음 방문에 다시 시도한다.
  }
}

/**
 * 첫 방문에서 서비스 워커가 사이트 자산을 다 받을 때까지 기다린다.
 * 이미 받아 둔 뒤에는 네트워크를 기다리지 않고 바로 앱을 연다.
 */
export async function prepareOfflineCache(): Promise<void> {
  if (!import.meta.env.PROD) return;
  if (!("serviceWorker" in navigator)) return;

  const scope = import.meta.env.BASE_URL;
  const swUrl = `${scope}sw.js`;

  try {
    const existing = await navigator.serviceWorker.getRegistration(scope);
    const installing = existing?.installing ?? existing?.waiting ?? null;
    const alreadyReady = Boolean(existing?.active) && !installing;

    if (alreadyReady) {
      void navigator.serviceWorker.register(swUrl, { scope, updateViaCache: "all" });
      return;
    }

    setSplashMessage("처음 열 때만 자료를 모두 받아 둡니다. 끝날 때까지 이 화면을 닫지 말아 주세요.");

    const registration = await navigator.serviceWorker.register(swUrl, {
      scope,
      updateViaCache: "all",
    });
    const pending = registration.installing ?? registration.waiting;
    if (pending) {
      await waitForWorker(pending);
    } else {
      await navigator.serviceWorker.ready;
    }

    await waitUntilControlled();
    await warmExternalAssets();
  } catch {
    // 캐시에 실패해도 온라인에서는 앱을 연다.
  }
}
