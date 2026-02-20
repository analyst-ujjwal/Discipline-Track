
export const RANKS = [
  { name: 'Initiate', minXP: 0 },
  { name: 'Operative', minXP: 500 },
  { name: 'Specialist', minXP: 1500 },
  { name: 'Commander', minXP: 3000 },
  { name: 'Architect', minXP: 6000 },
  { name: 'Master', minXP: 10000 }
];

export const calculateLevel = (totalCompletions: number) => {
  const xp = totalCompletions * 10;
  const currentRank = [...RANKS].reverse().find(r => xp >= r.minXP) || RANKS[0];
  const nextRank = RANKS[RANKS.indexOf(currentRank) + 1] || null;
  
  let progress = 100;
  if (nextRank) {
    const range = nextRank.minXP - currentRank.minXP;
    const currentProgress = xp - currentRank.minXP;
    progress = (currentProgress / range) * 100;
  }

  return {
    xp,
    rank: currentRank.name,
    nextRank: nextRank?.name || 'MAX',
    progress
  };
};
