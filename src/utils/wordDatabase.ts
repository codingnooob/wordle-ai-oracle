
// Common English words database with frequency scoring
export const WORD_DATABASE: { [key: number]: Array<{ word: string; frequency: number }> } = {
  3: [
    { word: 'THE', frequency: 100 }, { word: 'AND', frequency: 95 }, { word: 'FOR', frequency: 90 },
    { word: 'ARE', frequency: 85 }, { word: 'BUT', frequency: 80 }, { word: 'NOT', frequency: 78 },
    { word: 'YOU', frequency: 75 }, { word: 'ALL', frequency: 72 }, { word: 'CAN', frequency: 70 },
    { word: 'HER', frequency: 68 }, { word: 'WAS', frequency: 65 }, { word: 'ONE', frequency: 63 },
    { word: 'OUR', frequency: 60 }, { word: 'OUT', frequency: 58 }, { word: 'DAY', frequency: 55 },
    { word: 'GET', frequency: 53 }, { word: 'USE', frequency: 50 }, { word: 'MAN', frequency: 48 },
    { word: 'NEW', frequency: 45 }, { word: 'NOW', frequency: 43 }, { word: 'WAY', frequency: 40 },
    { word: 'MAY', frequency: 38 }, { word: 'SAY', frequency: 35 }, { word: 'SEE', frequency: 33 },
    { word: 'HIM', frequency: 30 }, { word: 'TWO', frequency: 28 }, { word: 'HOW', frequency: 25 },
    { word: 'ITS', frequency: 23 }, { word: 'WHO', frequency: 20 }, { word: 'OIL', frequency: 18 },
    { word: 'SIT', frequency: 15 }, { word: 'SET', frequency: 13 }, { word: 'RUN', frequency: 10 },
    { word: 'EAT', frequency: 8 }, { word: 'FAR', frequency: 5 }, { word: 'SEA', frequency: 3 }
  ],
  4: [
    { word: 'THAT', frequency: 100 }, { word: 'WITH', frequency: 95 }, { word: 'HAVE', frequency: 90 },
    { word: 'THIS', frequency: 88 }, { word: 'WILL', frequency: 85 }, { word: 'YOUR', frequency: 83 },
    { word: 'FROM', frequency: 80 }, { word: 'THEY', frequency: 78 }, { word: 'KNOW', frequency: 75 },
    { word: 'WANT', frequency: 73 }, { word: 'BEEN', frequency: 70 }, { word: 'GOOD', frequency: 68 },
    { word: 'MUCH', frequency: 65 }, { word: 'SOME', frequency: 63 }, { word: 'TIME', frequency: 60 },
    { word: 'VERY', frequency: 58 }, { word: 'WHEN', frequency: 55 }, { word: 'COME', frequency: 53 },
    { word: 'HERE', frequency: 50 }, { word: 'JUST', frequency: 48 }, { word: 'LIKE', frequency: 45 },
    { word: 'LONG', frequency: 43 }, { word: 'MAKE', frequency: 40 }, { word: 'MANY', frequency: 38 },
    { word: 'OVER', frequency: 35 }, { word: 'SUCH', frequency: 33 }, { word: 'TAKE', frequency: 30 },
    { word: 'THAN', frequency: 28 }, { word: 'ONLY', frequency: 25 }, { word: 'WELL', frequency: 23 },
    { word: 'YEAR', frequency: 20 }, { word: 'WORK', frequency: 18 }, { word: 'BACK', frequency: 15 },
    { word: 'CALL', frequency: 13 }, { word: 'CAME', frequency: 10 }, { word: 'EACH', frequency: 8 },
    { word: 'EVEN', frequency: 5 }, { word: 'FIND', frequency: 3 }
  ],
  5: [
    { word: 'WHICH', frequency: 100 }, { word: 'THEIR', frequency: 98 }, { word: 'WOULD', frequency: 95 },
    { word: 'THERE', frequency: 93 }, { word: 'COULD', frequency: 90 }, { word: 'OTHER', frequency: 88 },
    { word: 'AFTER', frequency: 85 }, { word: 'FIRST', frequency: 83 }, { word: 'NEVER', frequency: 80 },
    { word: 'THESE', frequency: 78 }, { word: 'THINK', frequency: 75 }, { word: 'WHERE', frequency: 73 },
    { word: 'BEING', frequency: 70 }, { word: 'EVERY', frequency: 68 }, { word: 'GREAT', frequency: 65 },
    { word: 'MIGHT', frequency: 63 }, { word: 'SHALL', frequency: 60 }, { word: 'STILL', frequency: 58 },
    { word: 'THOSE', frequency: 55 }, { word: 'WHILE', frequency: 53 }, { word: 'PLACE', frequency: 50 },
    { word: 'RIGHT', frequency: 48 }, { word: 'ABOUT', frequency: 45 }, { word: 'AGAIN', frequency: 43 },
    { word: 'HOUSE', frequency: 38 }, { word: 'WORLD', frequency: 35 },
    { word: 'BELOW', frequency: 33 }, { word: 'ASKED', frequency: 30 }, { word: 'GOING', frequency: 28 },
    { word: 'LARGE', frequency: 25 }, { word: 'UNTIL', frequency: 23 }, { word: 'ALONG', frequency: 20 },
    { word: 'OFTEN', frequency: 15 }, { word: 'SINCE', frequency: 13 },
    { word: 'SOUND', frequency: 10 }, { word: 'MUSIC', frequency: 8 }, { word: 'PLANE', frequency: 6 },
    { word: 'BREAD', frequency: 4 }, { word: 'FRUIT', frequency: 2 },
    // Adding words that match the constraint example: C____ with L, E, R
    { word: 'CLEAR', frequency: 75 }, { word: 'CLERK', frequency: 45 }, { word: 'CREST', frequency: 35 },
    { word: 'CRUEL', frequency: 40 }, { word: 'CYBER', frequency: 30 }, { word: 'CYCLE', frequency: 50 },
    { word: 'CRIME', frequency: 55 }, { word: 'CREAM', frequency: 48 }, { word: 'CREEK', frequency: 25 },
    { word: 'CREEL', frequency: 15 }, { word: 'CREEP', frequency: 20 }, { word: 'CREME', frequency: 18 }
  ],
  6: [
    { word: 'SHOULD', frequency: 100 }, { word: 'AROUND', frequency: 95 }, { word: 'LITTLE', frequency: 90 },
    { word: 'PEOPLE', frequency: 88 }, { word: 'BEFORE', frequency: 85 }, { word: 'MOTHER', frequency: 83 },
    { word: 'THOUGH', frequency: 80 }, { word: 'SCHOOL', frequency: 78 }, { word: 'ALWAYS', frequency: 75 },
    { word: 'REALLY', frequency: 73 }, { word: 'FRIEND', frequency: 70 }, { word: 'FAMILY', frequency: 68 },
    { word: 'DURING', frequency: 65 }, { word: 'HAVING', frequency: 63 }, { word: 'SYSTEM', frequency: 60 },
    { word: 'CHANGE', frequency: 58 }, { word: 'SOCIAL', frequency: 55 }, { word: 'FOLLOW', frequency: 53 },
    { word: 'CALLED', frequency: 50 }, { word: 'POLICY', frequency: 48 }, { word: 'NATURE', frequency: 45 },
    { word: 'OFFICE', frequency: 43 }, { word: 'HEALTH', frequency: 40 }, { word: 'ENOUGH', frequency: 38 },
    { word: 'PUBLIC', frequency: 35 }, { word: 'MARKET', frequency: 33 }, { word: 'MOMENT', frequency: 30 },
    { word: 'RATHER', frequency: 28 }, { word: 'REASON', frequency: 25 }, { word: 'SIMPLY', frequency: 23 },
    { word: 'REMAIN', frequency: 20 }, { word: 'HAPPEN', frequency: 18 }, { word: 'DIFFER', frequency: 15 },
    { word: 'ACTUAL', frequency: 13 }, { word: 'ATTACK', frequency: 10 }, { word: 'BATTLE', frequency: 8 },
    { word: 'BREATH', frequency: 5 }, { word: 'BRANCH', frequency: 3 },
    // Adding more words for better matching
    { word: 'CIRCLE', frequency: 45 }, { word: 'CLEVER', frequency: 35 }, { word: 'CLOSER', frequency: 40 }
  ],
  7: [
    { word: 'THROUGH', frequency: 100 }, { word: 'BETWEEN', frequency: 95 }, { word: 'ANOTHER', frequency: 90 },
    { word: 'WITHOUT', frequency: 88 }, { word: 'BECAUSE', frequency: 85 }, { word: 'AGAINST', frequency: 83 },
    { word: 'NOTHING', frequency: 80 }, { word: 'SOMEONE', frequency: 78 }, { word: 'TOWARDS', frequency: 75 },
    { word: 'SEVERAL', frequency: 73 }, { word: 'HIMSELF', frequency: 70 }, { word: 'TONIGHT', frequency: 68 },
    { word: 'GENERAL', frequency: 65 }, { word: 'SERVICE', frequency: 63 }, { word: 'COMPANY', frequency: 60 },
    { word: 'PERHAPS', frequency: 58 }, { word: 'PROGRAM', frequency: 55 }, { word: 'INSTEAD', frequency: 53 },
    { word: 'PROCESS', frequency: 50 }, { word: 'ARTICLE', frequency: 48 }, { word: 'HUNDRED', frequency: 45 },
    { word: 'COLLEGE', frequency: 43 }, { word: 'SCIENCE', frequency: 40 }, { word: 'HISTORY', frequency: 38 },
    { word: 'MACHINE', frequency: 35 }, { word: 'PRESENT', frequency: 33 }, { word: 'MORNING', frequency: 30 },
    { word: 'EVENING', frequency: 28 }, { word: 'QUALITY', frequency: 25 }, { word: 'PRIVATE', frequency: 23 },
    { word: 'POPULAR', frequency: 20 }, { word: 'CERTAIN', frequency: 18 }, { word: 'SERIOUS', frequency: 15 },
    { word: 'OFFICER', frequency: 10 }, { word: 'PERFECT', frequency: 8 },
    { word: 'PREPARE', frequency: 5 }, { word: 'PROBLEM', frequency: 3 },
    // Adding words for constraint matching
    { word: 'CLEANER', frequency: 35 }, { word: 'CLEARER', frequency: 30 }, { word: 'CLUSTER', frequency: 25 }
  ],
  8: [
    { word: 'BUSINESS', frequency: 100 }, { word: 'TOGETHER', frequency: 95 }, { word: 'CHILDREN', frequency: 90 },
    { word: 'QUESTION', frequency: 88 }, { word: 'COMPLETE', frequency: 85 }, { word: 'YOURSELF', frequency: 83 },
    { word: 'REMEMBER', frequency: 80 }, { word: 'ALTHOUGH', frequency: 78 }, { word: 'CONTINUE', frequency: 75 },
    { word: 'POSSIBLE', frequency: 73 }, { word: 'COMPUTER', frequency: 70 }, { word: 'INCREASE', frequency: 68 },
    { word: 'INTEREST', frequency: 65 }, { word: 'CONSIDER', frequency: 63 }, { word: 'BUILDING', frequency: 60 },
    { word: 'RESEARCH', frequency: 58 }, { word: 'NATIONAL', frequency: 55 }, { word: 'PERSONAL', frequency: 53 },
    { word: 'ANALYSIS', frequency: 50 }, { word: 'LANGUAGE', frequency: 48 }, { word: 'STANDARD', frequency: 45 },
    { word: 'TRAINING', frequency: 43 }, { word: 'TEACHING', frequency: 40 }, { word: 'LEARNING', frequency: 38 },
    { word: 'THINKING', frequency: 35 }, { word: 'MATERIAL', frequency: 33 }, { word: 'PHYSICAL', frequency: 30 },
    { word: 'DAUGHTER', frequency: 28 }, { word: 'PRESSURE', frequency: 25 }, { word: 'PLANNING', frequency: 23 },
    { word: 'PAINTING', frequency: 20 }, { word: 'PRACTICE', frequency: 18 }, { word: 'REQUIRED', frequency: 15 },
    { word: 'SEPARATE', frequency: 13 }, { word: 'SURPRISE', frequency: 10 }, { word: 'POSITION', frequency: 8 },
    { word: 'STRENGTH', frequency: 5 }, { word: 'VIOLENCE', frequency: 3 }
  ]
};

export function getWordsForLength(length: number): Array<{ word: string; frequency: number }> {
  return WORD_DATABASE[length] || [];
}
