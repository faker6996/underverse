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
  const out: Array<T & { lane: number }> = [];

  const active: Array<{ endIdx: number; lane: number }> = [];
  const freeLanes: number[] = [];
  let nextLane = 0;

  const pushActive = (item: { endIdx: number; lane: number }) => {
    active.push(item);
    let i = active.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      const a = active[i]!;
      const b = active[p]!;
      if (a.endIdx > b.endIdx || (a.endIdx === b.endIdx && a.lane >= b.lane)) break;
      active[i] = b;
      active[p] = a;
      i = p;
    }
  };

  const popActive = () => {
    const top = active[0]!;
    const last = active.pop()!;
    if (active.length > 0) {
      active[0] = last;
      let i = 0;
      while (true) {
        const l = i * 2 + 1;
        const r = l + 1;
        let m = i;
        if (l < active.length) {
          const al = active[l]!;
          const am = active[m]!;
          if (al.endIdx < am.endIdx || (al.endIdx === am.endIdx && al.lane < am.lane)) m = l;
        }
        if (r < active.length) {
          const ar = active[r]!;
          const am = active[m]!;
          if (ar.endIdx < am.endIdx || (ar.endIdx === am.endIdx && ar.lane < am.lane)) m = r;
        }
        if (m === i) break;
        const cur = active[i]!;
        active[i] = active[m]!;
        active[m] = cur;
        i = m;
      }
    }
    return top;
  };

  const pushFreeLane = (lane: number) => {
    freeLanes.push(lane);
    let i = freeLanes.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (freeLanes[p]! <= freeLanes[i]!) break;
      const tmp = freeLanes[p]!;
      freeLanes[p] = freeLanes[i]!;
      freeLanes[i] = tmp;
      i = p;
    }
  };

  const popFreeLane = () => {
    const top = freeLanes[0]!;
    const last = freeLanes.pop()!;
    if (freeLanes.length > 0) {
      freeLanes[0] = last;
      let i = 0;
      while (true) {
        const l = i * 2 + 1;
        const r = l + 1;
        let m = i;
        if (l < freeLanes.length && freeLanes[l]! < freeLanes[m]!) m = l;
        if (r < freeLanes.length && freeLanes[r]! < freeLanes[m]!) m = r;
        if (m === i) break;
        const tmp = freeLanes[i]!;
        freeLanes[i] = freeLanes[m]!;
        freeLanes[m] = tmp;
        i = m;
      }
    }
    return top;
  };

  for (const it of sorted) {
    while (active.length > 0 && active[0]!.endIdx <= it.startIdx) {
      pushFreeLane(popActive().lane);
    }

    const lane = freeLanes.length > 0 ? popFreeLane() : nextLane++;
    pushActive({ endIdx: it.endIdx, lane });
    out.push({ ...it, lane });
  }

  return { packed: out, laneCount: nextLane };
}
