// Team names come from the students: each team is named from its members' first names.
// The pages call setTeamNames() with the live list, and every screen uses teamName().
let NAMES = {};
export function setTeamNames(map) { NAMES = map || {}; }
export const teamName = id => NAMES[id] || "Team";
