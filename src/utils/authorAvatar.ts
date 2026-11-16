import { findLoungeAuthor, handleFromAuthor } from "../data/loungeAuthors.ts";

const SKIN = ["#F8E0C8", "#F3D5B5", "#E8B98A", "#D8A07A", "#C68642"];
const HAIR = ["#2B2118", "#5C3317", "#C97B4A", "#E8C37A", "#1F3A4C", "#6B3A2A", "#3D2B1F"];
const SHIRT = ["#FC5F53", "#7BA17D", "#E8A0BF", "#5B7C99", "#E6C35C", "#8E6BBF", "#D97B54"];
const BG = ["#FFF3EE", "#F3F0E8", "#EEF4F1", "#F7EEE6", "#F0F0F6", "#FDECE8"];

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pick<T>(list: T[], hash: number, salt: number): T {
  return list[(hash + salt) % list.length];
}

function portraitSvg(seed: string): string {
  const hash = hashString(seed.toLowerCase());
  const skin = pick(SKIN, hash, 3);
  const hair = pick(HAIR, hash, 11);
  const shirt = pick(SHIRT, hash, 19);
  const bg = pick(BG, hash, 29);
  const style = hash % 4;
  const yarn = pick(SHIRT, hash, 41);

  const hairShape =
    style === 0
      ? `<ellipse cx="40" cy="28" rx="22" ry="16" fill="${hair}"/>`
      : style === 1
        ? `<circle cx="40" cy="16" r="10" fill="${hair}"/><ellipse cx="40" cy="30" rx="20" ry="14" fill="${hair}"/>`
        : style === 2
          ? `<path d="M18 34c2-16 14-22 22-22s20 6 22 22H18z" fill="${hair}"/>`
          : `<path d="M16 58c0-22 10-36 24-36s24 14 24 36H16z" fill="${hair}"/><ellipse cx="40" cy="30" rx="20" ry="14" fill="${hair}"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
    <circle cx="40" cy="40" r="40" fill="${bg}"/>
    <path d="M12 80c4-18 16-28 28-28s24 10 28 28" fill="${shirt}"/>
    ${hairShape}
    <circle cx="40" cy="40" r="16" fill="${skin}"/>
    <circle cx="34" cy="39" r="2.1" fill="#3A2A22"/>
    <circle cx="46" cy="39" r="2.1" fill="#3A2A22"/>
    <path d="M35 47c3 3 7 3 10 0" fill="none" stroke="#B57A62" stroke-width="1.6" stroke-linecap="round"/>
    <circle cx="62" cy="58" r="8" fill="${yarn}"/>
    <path d="M57 58c3-3 7-3 10 0M57 62c3-2 7-2 10 0" fill="none" stroke="#fff" stroke-width="1.2" opacity=".7"/>
  </svg>`;
}

export function authorAvatarUrl(name: string): string {
  const found = findLoungeAuthor(name);
  if (found?.avatarUrl) return found.avatarUrl;
  const seed = found?.handle ?? handleFromAuthor(name);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(portraitSvg(seed))}`;
}
