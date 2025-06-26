
export function getFallbackWords(): string[] {
  // Comprehensive fallback word lists organized by length
  const wordsByLength: { [key: number]: string[] } = {
    3: [
      'THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER',
      'WAS', 'ONE', 'OUR', 'OUT', 'DAY', 'HAD', 'HAS', 'HIS', 'HOW', 'ITS',
      'MAY', 'NEW', 'NOW', 'OLD', 'SEE', 'TWO', 'WHO', 'BOY', 'DID', 'GET',
      'LET', 'MAN', 'RUN', 'SUN', 'TOP', 'WAY', 'WIN', 'YES', 'YET', 'AGO'
    ],
    4: [
      'THAT', 'WITH', 'HAVE', 'THIS', 'WILL', 'YOUR', 'FROM', 'THEY', 'KNOW', 'WANT',
      'BEEN', 'GOOD', 'MUCH', 'SOME', 'TIME', 'VERY', 'WHEN', 'COME', 'HERE', 'JUST',
      'LIKE', 'LONG', 'MAKE', 'MANY', 'OVER', 'SUCH', 'TAKE', 'THAN', 'THEM', 'WELL',
      'BACK', 'CALL', 'CAME', 'EACH', 'FIND', 'GIVE', 'HAND', 'HIGH', 'KEEP', 'KIND',
      'LAST', 'LEFT', 'LIFE', 'LIVE', 'LOOK', 'MADE', 'MOST', 'MOVE', 'MUST', 'NAME'
    ],
    5: [
      'WHICH', 'THEIR', 'WOULD', 'THERE', 'COULD', 'OTHER', 'AFTER', 'FIRST', 'NEVER', 'THESE',
      'THINK', 'WHERE', 'BEING', 'EVERY', 'GREAT', 'MIGHT', 'SHALL', 'STILL', 'THOSE', 'UNDER',
      'WHILE', 'ABOUT', 'AGAIN', 'BEFORE', 'HOUSE', 'RIGHT', 'SMALL', 'SOUND', 'STILL', 'SUCH',
      'PLACE', 'WORLD', 'YEARS', 'YOUNG', 'ASKED', 'GOING', 'HEARD', 'LARGE', 'LIGHT', 'LIVED'
    ],
    6: [
      'SHOULD', 'AROUND', 'LITTLE', 'PEOPLE', 'BEFORE', 'MOTHER', 'THOUGH', 'SCHOOL', 'ALWAYS', 'REALLY',
      'ANSWER', 'APPEAR', 'DURING', 'FOLLOW', 'FRIEND', 'GROUND', 'HAPPEN', 'LETTER', 'LISTEN', 'MOMENT',
      'NUMBER', 'OBJECT', 'PLAYED', 'REASON', 'SECOND', 'SYSTEM', 'THINGS', 'TURNED', 'WALKED', 'WANTED'
    ],
    7: [
      'THROUGH', 'BETWEEN', 'ANOTHER', 'WITHOUT', 'BECAUSE', 'AGAINST', 'NOTHING', 'SOMEONE', 'TOWARDS', 'SEVERAL',
      'ALREADY', 'CHANGED', 'DECIDED', 'EVENING', 'FINALLY', 'GENERAL', 'HOWEVER', 'INSTEAD', 'KITCHEN', 'LEARNED',
      'MACHINE', 'NATURAL', 'PERHAPS', 'PRESENT', 'PROBLEM', 'QUICKLY', 'REACHED', 'STARTED', 'THOUGHT', 'VILLAGE'
    ],
    8: [
      'BUSINESS', 'TOGETHER', 'CHILDREN', 'QUESTION', 'COMPLETE', 'YOURSELF', 'REMEMBER', 'ALTHOUGH', 'CONTINUE', 'POSSIBLE',
      'BIRTHDAY', 'BUILDING', 'COMPUTER', 'DISTANCE', 'EVERYONE', 'FOLLOWED', 'HAPPENED', 'INTEREST', 'LANGUAGE', 'MOUNTAIN',
      'NEIGHBOR', 'OPPOSITE', 'PICTURE', 'PROBABLY', 'RECOGNIZE', 'STRENGTH', 'TROUBLE', 'UMBRELLA', 'VACATION', 'WONDERFUL'
    ]
  };
  
  // Flatten all words into a single array
  const allWords: string[] = [];
  for (const lengthWords of Object.values(wordsByLength)) {
    allWords.push(...lengthWords);
  }
  
  return allWords;
}
