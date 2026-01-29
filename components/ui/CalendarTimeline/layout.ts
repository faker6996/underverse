export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function binarySearchFirstGE(arr: Date[], target: Date) {
  let lo = 0;
  let hi = arr.length;
  const t = target.getTime();
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid]!.getTime() < t) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

export function binarySearchLastLE(arr: Date[], target: Date) {
  const idx = binarySearchFirstGE(arr, target);
  if (idx === 0) return 0;
  if (idx >= arr.length) return arr.length - 1;
  const t = target.getTime();
  if (arr[idx]!.getTime() === t) return idx;
  return idx - 1;
}

export function intervalPack<T extends { startIdx: number; endIdx: number }>(items: T[]) {
  const sorted = [...items].sort((a, b) => a.startIdx - b.startIdx || a.endIdx - b.endIdx);
  const lanes: { endIdx: number }[] = [];
  const out: Array<T & { lane: number }> = [];
  for (const it of sorted) {
    let lane = -1;
    for (let i = 0; i < lanes.length; i++) {
      if (lanes[i]!.endIdx <= it.startIdx) {
        lane = i;
        break;
      }
    }
    if (lane === -1) {
      lane = lanes.length;
      lanes.push({ endIdx: it.endIdx });
    } else {
      lanes[lane]!.endIdx = it.endIdx;
    }
    out.push({ ...it, lane });
  }
  return { packed: out, laneCount: lanes.length };
}

