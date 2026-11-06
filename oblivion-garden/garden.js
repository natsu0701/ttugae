(() => {
  const DAY = 86400000;
  const HANG_LIMIT = 12;
  const KEY = "mangak-garden-guestbook-v1";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const now = Date.now();
  const SEEDS = [
    { id: "seed-1", name: "무명", text: "얼굴보다 손의 온도가 오래 남았다.", at: now - 26 * DAY },
    { id: "seed-2", name: "지나가던 이", text: "이름을 부르지 말아 달라.", at: now - 18 * DAY },
    { id: "seed-3", name: "아이", text: "눈이 감겨도 빛은 남아 있었다.", at: now - 9 * DAY },
    { id: "seed-4", name: "기록 없는 이", text: "나는 여기 서 있었다.", at: now - 41 * DAY },
    { id: "seed-5", name: "정원", text: "꽃은 누구의 것인지 묻지 않는다.", at: now - 13 * DAY },
  ];

  const $ = (id) => document.getElementById(id);
  const world = $("world");
  const sky = $("sky");
  const cluster = $("cluster");
  const invite = $("invite");
  const voidEl = $("void");
  const lamp = $("lamp");
  const paper = $("paper");
  const reading = $("reading");
  const sunken = $("sunken");
  const form = $("leave-form");
  const nameInput = $("name-input");
  const textInput = $("text-input");
  const formError = $("form-error");
  const countEl = $("count");
  const live = $("live");
  const sunkenOpen = $("sunken-open");
  const sunkenCount = $("sunken-count");
  const sunkenList = $("sunken-list");
  const readText = $("read-text");
  const readWho = $("read-who");
  const readWhen = $("read-when");
  const readRemove = $("read-remove");

  let returnFocus = invite;
  let readingEntry = null;

  function loadOwn() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
      if (!Array.isArray(raw)) return [];
      return raw.map(cleanStored).filter(Boolean).slice(-40);
    } catch {
      return [];
    }
  }

  function cleanStored(entry) {
    if (!entry || typeof entry !== "object") return null;
    const name = String(entry.name || "").trim().slice(0, 12);
    const text = String(entry.text || "").trim().replace(/\s+/g, " ").slice(0, 60);
    const at = Number(entry.at);
    const id = String(entry.id || "");
    if (!name || !text || !id || !Number.isFinite(at)) return null;
    return { id, name, text, at, own: true };
  }

  function saveOwn(list) {
    const payload = list.slice(-40).map(({ id, name, text, at }) => ({ id, name, text, at }));
    try {
      localStorage.setItem(KEY, JSON.stringify(payload));
    } catch {
      /* private mode or a full disk: the garden still holds the words for this visit */
    }
  }

  function allEntries() {
    const own = loadOwn();
    return [...own, ...SEEDS.map((entry) => ({ ...entry, own: false }))].sort((a, b) => b.at - a.at);
  }

  function variation(id) {
    let h = 0;
    for (const ch of id) h = (h * 33 + ch.charCodeAt(0)) >>> 0;
    const tilt = `${((h % 23) - 11) / 10}deg`;
    const dur = `${6.4 + (h % 28) / 10}s`;
    const delay = `${-((h % 40) / 8)}s`;
    const drop = 12 + (h % 20);
    const hgt = `${206 + (h % 5) * 12}px`;
    return { tilt, dur, delay, drop, h: hgt };
  }

  function whenLabel(at) {
    const min = (Date.now() - at) / 60000;
    if (min < 1) return "방금";
    if (min < 60) return `${Math.floor(min)}분 전`;
    const hr = min / 60;
    if (hr < 24) return `${Math.floor(hr)}시간 전`;
    const day = hr / 24;
    if (day < 2) return "어제";
    if (day < 60) return `${Math.floor(day)}일 전`;
    return "오래전";
  }

  function makeHang(entry, arrive) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = arrive ? "hang is-new" : "hang";
    btn.dataset.id = entry.id;
    const days = (Date.now() - entry.at) / DAY;
    const sink = Math.max(0, Math.min(120, days * 3.1));
    const fade = Math.max(0.4, 1 - days * 0.01);
    const look = variation(entry.id);
    btn.style.setProperty("--fade", fade.toFixed(3));
    btn.style.setProperty("--tilt", look.tilt);
    btn.style.setProperty("--dur", look.dur);
    btn.style.setProperty("--delay", look.delay);
    btn.style.setProperty("--age", Math.min(0.42, days * 0.009).toFixed(3));
    btn.style.setProperty("--h", look.h);

    const thread = document.createElement("span");
    thread.className = "thread";
    thread.style.height = `${Math.round(look.drop + sink)}px`;
    thread.setAttribute("aria-hidden", "true");

    const ring = document.createElement("span");
    ring.className = "ring";
    ring.setAttribute("aria-hidden", "true");

    const sheet = document.createElement("span");
    sheet.className = "sheet";
    const body = document.createElement("span");
    body.className = "body";
    body.textContent = entry.text;
    const who = document.createElement("span");
    who.className = "who";
    who.textContent = entry.name;
    sheet.append(body, who);
    btn.append(thread, ring, sheet);
    btn.addEventListener("click", () => openReading(entry));
    if (arrive) {
      btn.addEventListener("animationend", () => btn.classList.remove("is-new"), { once: true });
    }
    return btn;
  }

  function scrollToCenter(node, smooth) {
    if (!node) return;
    const nodeRect = node.getBoundingClientRect();
    const skyRect = sky.getBoundingClientRect();
    const next = sky.scrollLeft + (nodeRect.left + nodeRect.width / 2) - (skyRect.left + skyRect.width / 2);
    sky.scrollTo({ left: next, behavior: smooth ? "smooth" : "auto" });
  }

  function render(options = {}) {
    const { arriveId = null, recenter = false } = options;
    const entries = allEntries();
    const hanging = entries.slice(0, HANG_LIMIT);
    const sunk = entries.slice(HANG_LIMIT);
    const left = [];
    const right = [];
    hanging.forEach((entry, index) => (index % 2 === 0 ? right : left).push(entry));
    left.reverse();

    cluster.replaceChildren();
    left.forEach((entry) => cluster.append(makeHang(entry, entry.id === arriveId)));
    const gap = document.createElement("span");
    gap.className = "sky-gap";
    gap.setAttribute("aria-hidden", "true");
    gap.append(invite);
    cluster.append(gap);
    right.forEach((entry) => cluster.append(makeHang(entry, entry.id === arriveId)));

    sunkenOpen.hidden = sunk.length === 0;
    sunkenCount.textContent = sunk.length ? String(sunk.length) : "";
    sunkenList.replaceChildren();
    sunk.forEach((entry) => {
      const item = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      const name = document.createElement("span");
      name.className = "s-name";
      name.textContent = entry.name;
      const text = document.createElement("span");
      text.className = "s-text";
      text.textContent = entry.text;
      btn.append(name, text);
      btn.addEventListener("click", () => {
        sunken.close();
        openReading(entry);
      });
      item.append(btn);
      sunkenList.append(item);
    });

    if (arriveId || recenter) {
      requestAnimationFrame(() => {
        const target = arriveId ? cluster.querySelector(`[data-id="${CSS.escape(arriveId)}"]`) : gap;
        scrollToCenter(target, Boolean(arriveId) && !reduce);
      });
    }
  }

  function openPaper() {
    returnFocus = invite;
    formError.hidden = true;
    nameInput.classList.remove("is-invalid");
    textInput.classList.remove("is-invalid");
    document.body.classList.add("is-writing");
    paper.showModal();
    nameInput.focus();
  }

  function closePaper() {
    if (paper.open) paper.close();
  }

  function openReading(entry) {
    readingEntry = entry;
    readText.textContent = entry.text;
    readWho.textContent = entry.name;
    readWhen.textContent = whenLabel(entry.at);
    readRemove.hidden = !entry.own;
    readRemove.dataset.armed = "";
    readRemove.textContent = "거두어 가다";
    document.body.classList.add("is-reading");
    reading.showModal();
    $("read-close").focus();
  }

  function idOf() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = nameInput.value.trim().slice(0, 10);
    const text = textInput.value.trim().replace(/\s+/g, " ").slice(0, 60);
    nameInput.classList.toggle("is-invalid", !name);
    textInput.classList.toggle("is-invalid", !text);
    if (!name || !text) {
      formError.hidden = false;
      (name ? textInput : nameInput).focus();
      return;
    }
    const entry = { id: idOf(), name, text, at: Date.now() };
    const own = loadOwn();
    own.push(entry);
    saveOwn(own);
    nameInput.value = "";
    textInput.value = "";
    countEl.textContent = "60";
    formError.hidden = true;
    closePaper();
    render({ arriveId: entry.id });
    live.textContent = "말이 걸렸다.";
    returnFocus = invite;
  });

  textInput.addEventListener("input", () => {
    countEl.textContent = String(60 - textInput.value.length);
  });

  textInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  $("paper-cancel").addEventListener("click", closePaper);
  paper.addEventListener("click", (event) => {
    if (event.target === paper) closePaper();
  });
  paper.addEventListener("close", () => {
    document.body.classList.remove("is-writing");
    if (returnFocus && document.contains(returnFocus)) returnFocus.focus();
  });

  $("read-close").addEventListener("click", () => reading.close());
  reading.addEventListener("click", (event) => {
    if (event.target === reading) reading.close();
  });
  reading.addEventListener("close", () => {
    document.body.classList.remove("is-reading");
    readRemove.dataset.armed = "";
    if (returnFocus && document.contains(returnFocus)) returnFocus.focus();
  });

  readRemove.addEventListener("click", () => {
    if (!readingEntry || !readingEntry.own) return;
    if (readRemove.dataset.armed !== "1") {
      readRemove.dataset.armed = "1";
      readRemove.textContent = "정말 거둔다";
      return;
    }
    const id = readingEntry.id;
    saveOwn(loadOwn().filter((entry) => entry.id !== id));
    readingEntry = null;
    returnFocus = invite;
    reading.close();
    render({ recenter: true });
    live.textContent = "말을 거두었다.";
  });

  sunkenOpen.addEventListener("click", () => {
    returnFocus = sunkenOpen;
    sunken.showModal();
    $("sunken-close").focus();
  });
  $("sunken-close").addEventListener("click", () => sunken.close());
  sunken.addEventListener("click", (event) => {
    if (event.target === sunken) sunken.close();
  });
  sunken.addEventListener("close", () => {
    if (!reading.open && returnFocus && document.contains(returnFocus)) returnFocus.focus();
  });

  invite.addEventListener("click", openPaper);

  window.addEventListener("storage", (event) => {
    if (event.key === KEY) render();
  });

  const started = performance.now();
  const MIN_BLACK = 1200;
  let parting = false;
  const pending = [];

  function later(fn, ms) {
    const id = window.setTimeout(fn, ms);
    pending.push(id);
  }

  function clearPending() {
    pending.forEach((id) => window.clearTimeout(id));
    pending.length = 0;
  }

  function part() {
    if (parting) return;
    parting = true;
    clearPending();
    document.body.classList.add("is-parting");
    window.setTimeout(() => document.body.classList.add("is-garden"), reduce ? 180 : 1800);
    window.setTimeout(() => {
      document.body.classList.add("is-settled");
      voidEl.hidden = true;
    }, reduce ? 420 : 3900);
  }

  function requestPart() {
    if (parting) return;
    const wait = Math.max(0, MIN_BLACK - (performance.now() - started));
    window.setTimeout(part, wait);
  }

  function begin() {
    if (reduce) {
      later(part, 700);
      return;
    }
    later(() => document.body.classList.add("is-line"), 1500);
    later(() => document.body.classList.add("is-hint"), 2900);
    later(part, 5200);
  }

  voidEl.addEventListener("click", requestPart);
  document.addEventListener("keydown", (event) => {
    if (voidEl.hidden || parting) return;
    if (event.key === "Enter" || event.key === " " || event.key === "Escape") {
      event.preventDefault();
      requestPart();
    }
  });

  let tx = 0;
  let ty = 0;
  let cx = 0;
  let cy = 0;
  let look = 0.5;

  window.addEventListener("pointermove", (event) => {
    tx = event.clientX / window.innerWidth - 0.5;
    ty = event.clientY / window.innerHeight - 0.5;
    look = event.clientX / window.innerWidth;
    lamp.style.left = `${event.clientX}px`;
    lamp.style.top = `${event.clientY}px`;
  });

  function tick(nowMs) {
    if (!reduce && document.body.classList.contains("is-settled")) {
      const idle = performance.now() - lastMove > 2800;
      if (idle) {
        const t = nowMs / 1000;
        tx = Math.sin(t * 0.13) * 0.28;
        ty = Math.cos(t * 0.1) * 0.16;
        look = 0.5 + Math.sin(t * 0.13) * 0.18;
      }
      cx += (tx - cx) * 0.055;
      cy += (ty - cy) * 0.055;
      world.style.setProperty("--px", cx.toFixed(4));
      world.style.setProperty("--py", cy.toFixed(4));
      world.style.setProperty("--look", look.toFixed(4));
      world.style.setProperty("--wind", `${(cx * 7).toFixed(3)}deg`);
    }
    window.requestAnimationFrame(tick);
  }

  let lastMove = performance.now();
  window.addEventListener("pointermove", () => {
    lastMove = performance.now();
  });

  render({ recenter: true });
  begin();
  window.requestAnimationFrame(tick);
})();
