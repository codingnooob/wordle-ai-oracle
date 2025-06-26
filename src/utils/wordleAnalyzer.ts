
// Comprehensive word database for different lengths
const WORD_DATABASES = {
  3: ['CAT', 'DOG', 'BAT', 'RAT', 'HAT', 'MAT', 'SAT', 'FAT', 'PAT', 'VAT', 'BOX', 'FOX', 'COX', 'POX', 'SOX', 'FIX', 'MIX', 'SIX', 'WAX', 'TAX', 'SUN', 'RUN', 'GUN', 'FUN', 'BUN', 'NUN', 'TUN', 'PUN', 'CUP', 'PUP', 'SUP', 'TOP', 'POP', 'HOP', 'MOP', 'SOP', 'COP', 'LOB', 'MOB', 'SOB', 'COB', 'NOB', 'JOB', 'HOB', 'ROB', 'GOB', 'BOB'],
  4: ['WORD', 'GAME', 'PLAY', 'TIME', 'LOVE', 'LIFE', 'WORK', 'HOME', 'HAND', 'PART', 'YEAR', 'GOOD', 'MAKE', 'COME', 'LOOK', 'TAKE', 'GIVE', 'HELP', 'FIND', 'TELL', 'TURN', 'KEEP', 'MOVE', 'KNOW', 'SHOW', 'OPEN', 'CALL', 'SEEM', 'FEEL', 'BACK', 'FACE', 'HEAD', 'BODY', 'MIND', 'IDEA', 'FACT', 'CASE', 'SIDE', 'KIND', 'LONG', 'HIGH', 'LAST', 'NEXT', 'MUCH', 'MANY', 'MOST', 'SOME', 'BEST'],
  5: ['ABOUT', 'OTHER', 'WHICH', 'THEIR', 'WOULD', 'THERE', 'COULD', 'FIRST', 'AFTER', 'THESE', 'THINK', 'WHERE', 'BEING', 'EVERY', 'GREAT', 'MIGHT', 'SHALL', 'STILL', 'THOSE', 'WHILE', 'STATE', 'NEVER', 'HOUSE', 'WORLD', 'SCHOOL', 'SOUND', 'HEART', 'LIGHT', 'WATER', 'PLACE', 'RIGHT', 'ASKED', 'GOING', 'SMALL', 'FOUND', 'UNDER', 'AGAIN', 'HORSE', 'MUSIC', 'PAPER', 'COLOR', 'MONEY', 'FLOOR', 'VOICE', 'ABOVE', 'QUICK', 'BREAD', 'SWEET'],
  6: ['SHOULD', 'AROUND', 'BEFORE', 'THROUGH', 'LITTLE', 'NUMBER', 'PUBLIC', 'SCHOOL', 'PEOPLE', 'FAMILY', 'ALWAYS', 'DURING', 'CHANGE', 'FOLLOW', 'AROUND', 'FRIEND', 'MOTHER', 'FATHER', 'SISTER', 'BROTHER', 'OFFICE', 'PERSON', 'STREET', 'LETTER', 'GARDEN', 'MINUTE', 'SECOND', 'HANDLE', 'SIMPLE', 'COURSE', 'SYSTEM', 'FATHER', 'LEADER', 'NATURE', 'PLAYER', 'REASON', 'RESULT', 'MEMBER', 'POLICE', 'RECORD', 'MARKET', 'HEALTH', 'CHURCH', 'GROUND', 'MATTER', 'ACTION', 'DETAIL', 'WEIGHT'],
  7: ['THROUGH', 'BETWEEN', 'ANOTHER', 'BECAUSE', 'WITHOUT', 'AGAINST', 'NOTHING', 'SOMEONE', 'MORNING', 'GETTING', 'LOOKING', 'SITTING', 'EVENING', 'FEELING', 'TALKING', 'WALKING', 'WORKING', 'KITCHEN', 'BEDROOM', 'PICTURE', 'STATION', 'HOLIDAY', 'HISTORY', 'GENERAL', 'MACHINE', 'EVENING', 'OCTOBER', 'PRESENT', 'CERTAIN', 'OUTSIDE', 'SCIENCE', 'SOCIETY', 'QUALITY', 'SUPPORT', 'HUSBAND', 'SPECIAL', 'CENTRAL', 'BROTHER', 'TROUBLE', 'MILLION', 'COUNCIL', 'FINANCE', 'ACCOUNT', 'FREEDOM', 'VILLAGE', 'PACKAGE', 'SURFACE', 'HUSBAND'],
  8: ['TOGETHER', 'CHILDREN', 'BUILDING', 'POSITION', 'BUSINESS', 'QUESTION', 'DECISION', 'NATIONAL', 'PERSONAL', 'AMERICAN', 'COMPLETE', 'CONTINUE', 'IMPORTANT', 'INTEREST', 'REMEMBER', 'POSSIBLE', 'COMPUTER', 'LANGUAGE', 'STANDARD', 'INDUSTRY', 'FOOTBALL', 'HOSPITAL', 'MINISTER', 'SECURITY', 'BIRTHDAY', 'YOURSELF', 'ENTRANCE', 'SANDWICH', 'CALENDAR', 'MAGAZINE', 'PRACTICE', 'STRENGTH', 'PLEASURE', 'DAUGHTER', 'SHOULDER', 'EXERCISE', 'REPUBLIC', 'APPROACH', 'FUNCTION', 'ACTIVITY', 'RESEARCH', 'NORTHERN', 'SOUTHERN', 'PAINTING', 'DIRECTOR', 'DISTANCE', 'PURCHASE', 'INSTANCE']
};

// Letter frequency data for English words
const LETTER_FREQUENCIES = {
  'E': 12.02, 'T': 9.10, 'A': 8.12, 'O': 7.68, 'I': 6.97, 'N': 6.75, 'S': 6.33, 'H': 6.09, 'R': 5.99,
  'D': 4.25, 'L': 4.03, 'C': 2.78, 'U': 2.76, 'M': 2.41, 'W': 2.36, 'F': 2.23, 'G': 2.02, 'Y': 1.97,
  'P': 1.93, 'B': 1.29, 'V': 0.98, 'K': 0.77, 'J': 0.15, 'X': 0.15, 'Q': 0.10, 'Z': 0.07
};

interface GuessData {
  letter: string;
  state: 'unknown' | 'absent' | 'present' | 'correct';
}

export async function analyzeGuess(guessData: GuessData[], wordLength: number): Promise<Array<{word: string, probability: number}>> {
  console.log('Analyzing guess:', guessData);
  
  // Get word database for the specified length
  const wordDatabase = WORD_DATABASES[wordLength as keyof typeof WORD_DATABASES] || [];
  
  if (wordDatabase.length === 0) {
    console.warn(`No word database found for length ${wordLength}`);
    return [];
  }

  // Filter words based on the guess constraints
  const validWords = wordDatabase.filter(word => isWordValid(word, guessData));
  
  console.log(`Found ${validWords.length} valid words out of ${wordDatabase.length}`);

  // Calculate probability for each valid word
  const wordsWithProbability = validWords.map(word => ({
    word,
    probability: calculateWordProbability(word, guessData, validWords.length)
  }));

  // Sort by probability (highest first) and return top 15
  const sortedWords = wordsWithProbability
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 15);

  console.log('Top solutions:', sortedWords);
  return sortedWords;
}

function isWordValid(word: string, guessData: GuessData[]): boolean {
  const wordLetters = word.split('');
  
  for (let i = 0; i < guessData.length; i++) {
    const guess = guessData[i];
    
    if (!guess.letter) continue;
    
    switch (guess.state) {
      case 'correct':
        // Letter must be in this exact position
        if (wordLetters[i] !== guess.letter) return false;
        break;
        
      case 'present':
        // Letter must be in the word but not in this position
        if (wordLetters[i] === guess.letter) return false;
        if (!wordLetters.includes(guess.letter)) return false;
        break;
        
      case 'absent':
        // Letter must not be in the word at all
        if (wordLetters.includes(guess.letter)) return false;
        break;
    }
  }
  
  return true;
}

function calculateWordProbability(word: string, guessData: GuessData[], totalValidWords: number): number {
  // Base probability based on how many valid words remain
  let probability = Math.min(95, 100 / Math.max(1, totalValidWords) * 10);
  
  // Boost probability based on letter frequency
  const letterFrequencyScore = word.split('').reduce((score, letter) => {
    return score + (LETTER_FREQUENCIES[letter] || 0.5);
  }, 0) / word.length;
  
  probability += letterFrequencyScore * 2;
  
  // Boost words with common patterns
  const commonPatterns = ['ING', 'ION', 'ER', 'ED', 'LY', 'TH', 'ST'];
  for (const pattern of commonPatterns) {
    if (word.includes(pattern)) {
      probability += 5;
      break;
    }
  }
  
  // Penalize words with uncommon letters
  const uncommonLetters = ['Q', 'X', 'Z', 'J'];
  for (const letter of uncommonLetters) {
    if (word.includes(letter)) {
      probability -= 10;
    }
  }
  
  // Bonus for having vowels in good positions
  const vowels = ['A', 'E', 'I', 'O', 'U'];
  const vowelCount = word.split('').filter(letter => vowels.includes(letter)).length;
  if (vowelCount >= 2 && vowelCount <= 3) {
    probability += 5;
  }
  
  // Ensure probability is within reasonable bounds
  return Math.min(95, Math.max(5, probability));
}
