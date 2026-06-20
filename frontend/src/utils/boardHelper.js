export const SNAKES = {
  99: 54,
  87: 24,
  72: 41,
  68: 18,
  62: 19,
  49: 11
};

export const LADDERS = {
  4: 25,
  13: 46,
  33: 69,
  42: 63,
  50: 91
};

export const TRAPS = {
  15: { type: 'freeze', label: 'Sticky Quicksand', desc: 'Skip next turn' },
  55: { type: 'freeze', label: 'Sticky Quicksand', desc: 'Skip next turn' },
  38: { type: 'mine', label: 'Pitfall Spike', desc: 'Go back 3 cells' },
  79: { type: 'mine', label: 'Pitfall Spike', desc: 'Go back 3 cells' }
};

export const BOOSTERS = {
  8: { type: 'shield', label: 'Protection Charm', desc: 'Shield from next snake' },
  45: { type: 'shield', label: 'Protection Charm', desc: 'Shield from next snake' },
  22: { type: 'speed', label: 'Pegasus Boots', desc: 'Move 4 cells forward' },
  67: { type: 'speed', label: 'Pegasus Boots', desc: 'Move 4 cells forward' },
  35: { type: 'double', label: 'Time Hourglass', desc: 'Get an extra turn' },
  80: { type: 'double', label: 'Time Hourglass', desc: 'Get an extra turn' }
};


/**
 * Returns the center coordinates of a grid cell as percentages (0 to 100)
 * matching boustrophedon layout (snaking rows from bottom up).
 */
export const getCellCoordinates = (cellNumber) => {
  if (cellNumber < 1) cellNumber = 1;
  if (cellNumber > 100) cellNumber = 100;

  const zeroBasedCell = cellNumber - 1;
  const row = Math.floor(zeroBasedCell / 10); // 0 (bottom) to 9 (top)
  
  let col;
  if (row % 2 === 0) {
    // Even rows go left to right
    col = zeroBasedCell % 10;
  } else {
    // Odd rows go right to left
    col = 9 - (zeroBasedCell % 10);
  }

  // Convert to percentages (0-100)
  const x = (col + 0.5) * 10;
  // Since SVG/HTML coordinates start at top-left, we subtract row percentage from 100
  const y = 100 - (row + 0.5) * 10;

  return { x, y, row, col };
};

export const getAvatars = () => {
  return [
    { id: 'avatar1', label: 'The Explorer', color: 'text-neonBlue border-neonBlue bg-yellow-950/45' },
    { id: 'avatar2', label: 'The Aristocrat', color: 'text-[#C5A059] border-[#C5A059] bg-amber-950/45' },
    { id: 'avatar3', label: 'The Alchemist', color: 'text-neonPurple border-neonPurple bg-red-950/45' },
    { id: 'avatar4', label: 'The Nomad', color: 'text-gray-300 border-gray-400 bg-stone-900/45' },
    { id: 'avatar5', label: 'The Scholar', color: 'text-electricPurple border-electricPurple bg-emerald-950/45' }
  ];
};
