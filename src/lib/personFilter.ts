import type { Person } from './types';

/** Filter value meaning "every person"; person ids are UUIDs, so it can never collide with one. */
export const EVERYONE = 'everyone';

export function matchesPersonFilter(filter: string, personId: string): boolean {
  return filter === EVERYONE || filter === personId;
}

/** Falls back to everyone when the selected person no longer exists (deleted, or another tab). */
export function resolvePersonFilter(filter: string, people: readonly Person[]): string {
  return people.some((person) => person.id === filter) ? filter : EVERYONE;
}
