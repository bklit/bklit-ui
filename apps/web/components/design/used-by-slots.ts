interface SlotItem {
  id: string;
}

/**
 * Swap one visible slot to a logo that is not already used anywhere.
 *
 * Every id in `current` (including slots hidden at the current breakpoint, so
 * they stay unique when the slot count grows) and every id still on screen
 * mid-glitch (`displayedIds`) is reserved. Slots whose glitch has not settled
 * yet (`displayedIds[i] !== current[i].id`) are not picked, so concurrent swaps
 * never hand a logo to a slot while another slot is still showing it.
 */
export function pickNextSlots<T extends SlotItem>(
  pool: readonly T[],
  current: readonly T[],
  visibleSlotCount: number,
  displayedIds: readonly (string | undefined)[] = [],
  random: () => number = Math.random
): readonly T[] {
  const reserved = new Set<string>();
  for (const item of current) {
    reserved.add(item.id);
  }
  for (const id of displayedIds) {
    if (id !== undefined) {
      reserved.add(id);
    }
  }

  const candidates = pool.filter((item) => !reserved.has(item.id));
  const settledSlots: number[] = [];
  const slotCount = Math.min(visibleSlotCount, current.length);
  for (let index = 0; index < slotCount; index++) {
    const displayed = displayedIds[index];
    if (displayed === undefined || displayed === current[index]?.id) {
      settledSlots.push(index);
    }
  }

  const slotIndex = settledSlots[Math.floor(random() * settledSlots.length)];
  const nextItem = candidates[Math.floor(random() * candidates.length)];
  if (slotIndex === undefined || nextItem === undefined) {
    return current;
  }

  const next = [...current];
  next[slotIndex] = nextItem;
  return next;
}
