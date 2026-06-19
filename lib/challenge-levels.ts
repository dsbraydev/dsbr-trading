export const CHALLENGE_LEVELS = [
  { level: 1,  startBalance: 20.00,      risk: 4.00,        reward: 6.00,        endBalance: 26.00 },
  { level: 2,  startBalance: 26.00,      risk: 5.20,        reward: 7.80,        endBalance: 33.80 },
  { level: 3,  startBalance: 33.80,      risk: 6.76,        reward: 10.14,       endBalance: 43.94 },
  { level: 4,  startBalance: 43.94,      risk: 8.79,        reward: 13.18,       endBalance: 57.12 },
  { level: 5,  startBalance: 57.12,      risk: 11.42,       reward: 17.14,       endBalance: 74.26 },
  { level: 6,  startBalance: 74.26,      risk: 14.85,       reward: 22.28,       endBalance: 96.54 },
  { level: 7,  startBalance: 96.54,      risk: 19.31,       reward: 28.96,       endBalance: 125.50 },
  { level: 8,  startBalance: 125.50,     risk: 25.10,       reward: 37.65,       endBalance: 163.15 },
  { level: 9,  startBalance: 163.15,     risk: 32.63,       reward: 48.95,       endBalance: 212.10 },
  { level: 10, startBalance: 212.10,     risk: 42.42,       reward: 63.63,       endBalance: 275.73 },
  { level: 11, startBalance: 275.73,     risk: 55.15,       reward: 82.72,       endBalance: 358.45 },
  { level: 12, startBalance: 358.45,     risk: 71.69,       reward: 107.54,      endBalance: 465.98 },
  { level: 13, startBalance: 465.98,     risk: 93.20,       reward: 139.79,      endBalance: 605.77 },
  { level: 14, startBalance: 605.77,     risk: 121.15,      reward: 181.73,      endBalance: 787.50 },
  { level: 15, startBalance: 787.50,     risk: 157.50,      reward: 236.25,      endBalance: 1023.75 },
  { level: 16, startBalance: 1023.75,    risk: 204.75,      reward: 307.13,      endBalance: 1330.88 },
  { level: 17, startBalance: 1330.88,    risk: 266.18,      reward: 399.26,      endBalance: 1730.14 },
  { level: 18, startBalance: 1730.14,    risk: 346.03,      reward: 519.04,      endBalance: 2249.18 },
  { level: 19, startBalance: 2249.18,    risk: 449.84,      reward: 674.75,      endBalance: 2923.93 },
  { level: 20, startBalance: 2923.93,    risk: 584.79,      reward: 877.18,      endBalance: 3801.11 },
  { level: 21, startBalance: 3801.11,    risk: 760.22,      reward: 1140.33,     endBalance: 4941.44 },
  { level: 22, startBalance: 4941.44,    risk: 988.29,      reward: 1482.43,     endBalance: 6423.87 },
  { level: 23, startBalance: 6423.87,    risk: 1284.77,     reward: 1927.16,     endBalance: 8351.03 },
  { level: 24, startBalance: 8351.03,    risk: 1670.21,     reward: 2505.31,     endBalance: 10856.34 },
  { level: 25, startBalance: 10856.34,   risk: 2171.27,     reward: 3256.90,     endBalance: 14113.24 },
  { level: 26, startBalance: 14113.24,   risk: 2822.65,     reward: 4233.97,     endBalance: 18347.21 },
  { level: 27, startBalance: 18347.21,   risk: 3669.44,     reward: 5504.16,     endBalance: 23851.37 },
  { level: 28, startBalance: 23851.37,   risk: 4770.27,     reward: 7155.41,     endBalance: 31006.78 },
  { level: 29, startBalance: 31006.78,   risk: 6201.36,     reward: 9302.03,     endBalance: 40308.81 },
  { level: 30, startBalance: 40308.81,   risk: 8061.76,     reward: 12092.64,    endBalance: 52401.45 },
] as const

export type ChallengeLevel = (typeof CHALLENGE_LEVELS)[number]

export const CHALLENGE_START_BALANCE = 20.00
export const CHALLENGE_COMPLETE_BALANCE = 52401.45

export function getLevelForBalance(balance: number): ChallengeLevel {
  for (let i = CHALLENGE_LEVELS.length - 1; i >= 0; i--) {
    if (balance >= CHALLENGE_LEVELS[i].startBalance) return CHALLENGE_LEVELS[i]
  }
  return CHALLENGE_LEVELS[0]
}
