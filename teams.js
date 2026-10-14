// =====================================================================
// TEAMS: every team the teacher console can put in a game.
// When you create a game, you check which of these are playing; only those
// show up in the students' team dropdown. Edit names freely.
// =====================================================================
export const TEAMS = [
  { id: "teal",    name: "Teal" },
  { id: "navy",    name: "Navy" },
  { id: "crimson", name: "Crimson" },
  { id: "gold",    name: "Gold" },
  { id: "forest",  name: "Forest" },
  { id: "orange",  name: "Orange" },
  { id: "silver",  name: "Silver" },
  { id: "black",   name: "Black" },
  { id: "sky",     name: "Sky" },
  { id: "coral",   name: "Coral" },
  { id: "lime",    name: "Lime" },
  { id: "plum",    name: "Plum" }
];

export const teamName = id => (TEAMS.find(t => t.id === id) || { name: id }).name;
