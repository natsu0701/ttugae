export function qrModules(code: string, size = 29) {
  let hash = 2166136261;
  for (let i = 0; i < code.length; i += 1) {
    hash ^= code.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const seed = hash >>> 0;
  const cells = Array.from({ length: size }, () => Array(size).fill(false));
  const bit = (x: number, y: number) => ((seed >>> ((x * 11 + y * 3) % 31)) & 1) === 1;
  const paintFinder = (ox: number, oy: number) => {
    for (let y = 0; y < 7; y += 1) {
      for (let x = 0; x < 7; x += 1) {
        const edge = x === 0 || y === 0 || x === 6 || y === 6;
        const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        cells[oy + y][ox + x] = edge || core;
      }
    }
  };
  paintFinder(0, 0);
  paintFinder(size - 7, 0);
  paintFinder(0, size - 7);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const inFinder =
        (x < 8 && y < 8) || (x >= size - 8 && y < 8) || (x < 8 && y >= size - 8);
      if (!inFinder) cells[y][x] = bit(x, y);
    }
  }
  return cells;
}
