// src/utils/getNextAvailableId.ts

import { Alarm } from '../types/Alarm';

/**
 * Finds the smallest available integer ID not currently used by existing alarms.
 * @param alarms - Array of existing alarms.
 * @returns The next available integer ID.
 */
export const getNextAvailableId = (alarms: Alarm[]): number => {
  const usedIds = new Set(alarms.map(alarm => alarm.id));
  let id = 1;
  while (usedIds.has(id)) {
    id += 1;
  }
  return id;
};
