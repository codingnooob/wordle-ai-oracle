
import { GuessData } from './constraints/types';

export interface MLWordleSolution {
  word: string;
  probability: number;
}

class MLWordleAnalyzer {
  private commonWords: { [key: number]: string[] } = {
    3: ['THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER', 'WAS', 'ONE', 'OUR', 'OUT', 'DAY', 'GET', 'HAS', 'HIM', 'HIS', 'HOW', 'ITS', 'NEW', 'NOW', 'OLD', 'SEE', 'TWO', 'WHO', 'BOY', 'DID', 'HAD', 'LET', 'MAN', 'PUT', 'SAY', 'SHE', 'TOO', 'USE'],
    4: ['THAT', 'WITH', 'HAVE', 'THIS', 'WILL', 'YOUR', 'FROM', 'THEY', 'KNOW', 'WANT', 'BEEN', 'GOOD', 'MUCH', 'SOME', 'TIME', 'VERY', 'WHEN', 'COME', 'HERE', 'JUST', 'LIKE', 'LONG', 'MAKE', 'MANY', 'OVER', 'SUCH', 'TAKE', 'THAN', 'THEM', 'WELL', 'WERE', 'WHAT', 'WORD', 'WORK', 'YEAR', 'ALSO', 'BACK', 'CALL', 'CAME', 'EACH', 'EVEN', 'FIND', 'GIVE', 'HAND', 'HIGH', 'KEEP', 'LAST', 'LEFT', 'LIFE', 'LIVE', 'LOOK', 'MADE', 'MOST', 'MOVE', 'MUST', 'NAME', 'NEED', 'NEXT', 'ONLY', 'OPEN', 'PART', 'PLAY', 'SAID', 'SAME', 'SEEM', 'SHOW', 'SIDE', 'TELL', 'TURN', 'USED', 'WANT', 'WAYS', 'WENT', 'WORE'],
    5: ['WHICH', 'THEIR', 'WOULD', 'THERE', 'COULD', 'OTHER', 'AFTER', 'FIRST', 'NEVER', 'THESE', 'THINK', 'WHERE', 'BEING', 'EVERY', 'GREAT', 'MIGHT', 'SHALL', 'STILL', 'THOSE', 'UNDER', 'WHILE', 'ABOUT', 'AGAIN', 'ANOTHER', 'BEFORE', 'FOUND', 'HOUSE', 'LARGE', 'PLACE', 'RIGHT', 'SMALL', 'SOUND', 'STILL', 'SUCH', 'WATER', 'WORDS', 'WORLD', 'WRITE', 'YEARS', 'YOUNG', 'ABOVE', 'ALONE', 'ALONG', 'BEGAN', 'BELOW', 'BRING', 'BUILD', 'CARRY', 'CLEAN', 'CLOSE', 'COULD', 'COUNT', 'DOING', 'DRIVE', 'EARLY', 'EARTH', 'FIELD', 'FINAL', 'FORCE', 'FRONT', 'GIVEN', 'GREEN', 'GROUP', 'HANDS', 'HEARD', 'HEART', 'HEAVY', 'HORSE', 'LIGHT', 'LINES', 'LIVED', 'LOCAL', 'MONEY', 'MUSIC', 'NIGHT', 'NORTH', 'ORDER', 'PAPER', 'PARTY', 'PEACE', 'PIECE', 'POINT', 'POWER', 'QUICK', 'QUITE', 'RADIO', 'READY', 'REACH', 'ROUND', 'SENSE', 'SHALL', 'SHORT', 'SHOWN', 'SINCE', 'SPACE', 'SPEAK', 'SPEED', 'SPEND', 'SPOKE', 'START', 'STATE', 'STICK', 'STOOD', 'STORE', 'STORY', 'STUDY', 'TAKEN', 'TEACH', 'THANK', 'THEIR', 'THERE', 'THICK', 'THING', 'THIRD', 'THOSE', 'THREE', 'THREW', 'TODAY', 'TOTAL', 'TOUCH', 'TRACK', 'TRADE', 'TRIED', 'TRUCK', 'TRULY', 'UNDER', 'UNITY', 'UNTIL', 'VOICE', 'WASTE', 'WATCH', 'WHEEL', 'WHOLE', 'WHOSE', 'WOMAN', 'WORTH', 'WOULD', 'WRITE', 'WROTE', 'YOUTH'],
    6: ['SHOULD', 'AROUND', 'LITTLE', 'PEOPLE', 'BEFORE', 'MOTHER', 'THOUGH', 'SCHOOL', 'ALWAYS', 'REALLY', 'FATHER', 'FRIEND', 'HAVING', 'LETTER', 'MAKING', 'NUMBER', 'OFFICE', 'PERSON', 'PUBLIC', 'SECOND', 'FAMILY', 'ENOUGH', 'FOLLOW', 'CHANGE', 'NEEDED', 'SIMPLY', 'TURNED', 'WANTED', 'ALMOST', 'BETTER', 'COURSE', 'DURING', 'EITHER', 'HAPPEN', 'LIVING', 'MOVING', 'NATURE', 'OTHERS', 'REASON', 'STRONG', 'SYSTEM', 'TOWARD', 'TRYING', 'UNIQUE', 'WITHIN', 'WONDER', 'WORKED', 'ACROSS', 'ACTION', 'ACTUAL', 'ANIMAL', 'ANSWER', 'AROUND', 'BEAUTY', 'BECOME', 'BEYOND', 'BRIGHT', 'BUDGET', 'CAMERA', 'CAREER', 'CHOSEN', 'CIRCLE', 'CLOTHE', 'COMMON', 'COUPLE', 'CREATE', 'CUSTOM', 'DANGER', 'DEGREE', 'DETAIL', 'DOUBLE', 'ENOUGH', 'Europe', 'FAMOUS', 'FIGURE', 'FORGET', 'FORMER', 'FUTURE', 'GROUND', 'GROWTH', 'HAPPEN', 'INCOME', 'ISLAND', 'KNIGHT', 'LISTEN', 'MANAGE', 'MASTER', 'MAYBE', 'MEMBER', 'MEMORY', 'METHOD', 'MIDDLE', 'MINUTE', 'MODERN', 'MOMENT', 'NOTICE', 'OBJECT', 'OBTAIN', 'ORANGE', 'PARENT', 'PLANET', 'PLAYER', 'PLEASE', 'POLICY', 'PRETTY', 'PRINCE', 'PROFIT', 'PROPER', 'PURPLE', 'RECORD', 'REMAIN', 'REPORT', 'RESULT', 'RETURN', 'REVIEW', 'SAFETY', 'SAMPLE', 'SEARCH', 'SECRET', 'SENIOR', 'SILENT', 'SILVER', 'SIMPLE', 'SINGLE', 'SMOOTH', 'SOCIAL', 'SOURCE', 'SPIRIT', 'SPREAD', 'SPRING', 'SQUARE', 'STREAM', 'STREET', 'STROKE', 'SUMMER', 'SUPPLY', 'SWITCH', 'SYSTEM', 'TARGET', 'THREAD', 'TWELVE', 'UNIQUE', 'VALLEY', 'VOLUME', 'WEIGHT', 'WINTER', 'YELLOW'],
    7: ['THROUGH', 'BETWEEN', 'ANOTHER', 'WITHOUT', 'BECAUSE', 'AGAINST', 'NOTHING', 'SOMEONE', 'TOWARDS', 'SEVERAL', 'ALREADY', 'ARTICLE', 'COMPANY', 'CONTENT', 'COUNTRY', 'EVENING', 'EXAMPLE', 'GENERAL', 'HOWEVER', 'INCLUDE', 'MACHINE', 'MESSAGE', 'PICTURE', 'PROBLEM', 'PROGRAM', 'PROJECT', 'PURPOSE', 'SCIENCE', 'SERVICE', 'SPECIAL', 'STATION', 'STUDENT', 'SUBJECT', 'SUCCESS', 'SUPPORT', 'SURFACE', 'TEACHER', 'THOUGHT', 'THROUGH', 'TONIGHT', 'TRAFFIC', 'TROUBLE', 'VERSION', 'WEATHER', 'WESTERN', 'WRITING', 'ACCOUNT', 'ADDRESS', 'ADVANCE', 'AMAZING', 'ANCIENT', 'ANALYSE', 'ANXIETY', 'BENEFIT', 'BIOLOGY', 'CABINET', 'CABINET', 'CAPITAL', 'CAPTAIN', 'CENTRAL', 'CENTURY', 'CERTAIN', 'CHAPTER', 'CHARITY', 'CHICKEN', 'CLIMATE', 'COLLEGE', 'COMBINE', 'COMFORT', 'COMMAND', 'COMMENT', 'COMPLEX', 'CONCEPT', 'CONCERN', 'CONCERT', 'CONNECT', 'CONSEIL', 'CONTACT', 'CONTAIN', 'CONTEST', 'CONTEXT', 'CONTROL', 'CORRECT', 'COURAGE', 'CRAFT', 'CREATIVE', 'CULTURE', 'CURRENT', 'DEALING', 'DELIVER', 'DEVELOP', 'DIAMOND', 'DIGITAL', 'DISPLAY', 'DIVERSE', 'ECONOMY', 'EDITION', 'ELEMENT', 'EMOTION', 'ENGLISH', 'EVENING', 'EXACTLY', 'EXAMINE', 'EXCITED', 'EXPLAIN', 'EXPLORE', 'EXPRESS', 'EXTREME', 'FASHION', 'FEATURE', 'FINANCE', 'FOREIGN', 'FORWARD', 'FREEDOM', 'GALLERY', 'GREATER', 'GROWING', 'HANGING', 'HEALTHY', 'HELPING', 'HIMSELF', 'HISTORY', 'HOLIDAY', 'HUSBAND', 'IMAGINE', 'IMPROVE', 'INITIAL', 'INQUIRY', 'INSTANT', 'INSTEAD', 'JOURNEY', 'JUSTICE', 'KITCHEN', 'LEADING', 'LEATHER', 'LIMITED', 'MACHINE', 'MANAGER', 'MEANING', 'MEASURE', 'MEDICAL', 'MEETING', 'MENTION', 'MESSAGE', 'MINERAL', 'MISSION', 'MISTAKE', 'MIXTURE', 'MONITOR', 'MORNING', 'MUSICAL', 'NATURAL', 'NETWORK', 'NEITHER', 'OCTOBER', 'OPERATE', 'OPINION', 'OPENING', 'ORGANIC', 'OUTDOOR', 'OVERALL', 'PACKAGE', 'PAINTED', 'PARKING', 'PARTIAL', 'PARTNER', 'PASSAGE', 'PASSION', 'PATTERN', 'PAYMENT', 'PERFECT', 'PERFORM', 'PERHAPS', 'PICTURE', 'PLASTIC', 'POPULAR', 'PORTION', 'PORTION', 'PREPARE', 'PRESENT', 'PREVENT', 'PRIMARY', 'PRINTER', 'PRIVACY', 'PRIVATE', 'PROBLEM', 'PROCESS', 'PRODUCE', 'PRODUCT', 'PROFILE', 'PROJECT', 'PROMISE', 'PROTECT', 'PROVIDE', 'PURPOSE', 'QUALITY', 'QUICKLY', 'RAILWAY', 'REALITY', 'REALIZE', 'RECEIPT', 'RECEIVE', 'REFLECT', 'REGULAR', 'RELATED', 'RELEASE', 'REMAINS', 'REPLACE', 'REQUEST', 'REQUIRE', 'RESERVE', 'RESPECT', 'RESPOND', 'RESTORE', 'RESULTS', 'RETREAT', 'REVENUE', 'REVERSE', 'ROUTINE', 'SECTION', 'SEEKING', 'SELLING', 'SEMINAR', 'SERIOUS', 'SERVICE', 'SESSION', 'SETTING', 'SEVERAL', 'SHELTER', 'SHOWING', 'SIMILAR', 'SMOKING', 'SOCIETY', 'SOMEHOW', 'SOMEONE', 'SPECIAL', 'SPONSOR', 'STATION', 'STORAGE', 'STRANGE', 'STRETCH', 'STUDENT', 'SUBJECT', 'SUCCESS', 'SUGGEST', 'SUMMARY', 'SUPPORT', 'SUPPOSE', 'SURFACE', 'SURGERY', 'SURPLUS', 'SURVIVE', 'TEACHING', 'THEATRE', 'THERAPY', 'TONIGHT', 'TOWARDS', 'TRAFFIC', 'TROUBLE', 'TURNING', 'TYPICAL', 'UNKNOWN', 'UNUSUAL', 'UPGRADE', 'VARIETY', 'VARIOUS', 'VEHICLE', 'VERSION', 'VILLAGE', 'VISIBLE', 'VISITOR', 'WAITING', 'WARNING', 'WEEKEND', 'WELCOME', 'WESTERN', 'WHETHER', 'WILLING', 'WINDOW', 'WITNESS', 'WORKING', 'WRITTEN'],
    8: ['BUSINESS', 'TOGETHER', 'CHILDREN', 'QUESTION', 'COMPLETE', 'YOURSELF', 'REMEMBER', 'ALTHOUGH', 'CONTINUE', 'POSSIBLE', 'ACTUALLY', 'BUILDING', 'CONSIDER', 'DECISION', 'EVERYONE', 'FEBRUARY', 'GREATEST', 'HAPPENED', 'INCREASE', 'LANGUAGE', 'MAGAZINE', 'MARRIAGE', 'MATERIAL', 'MEDICINE', 'MOUNTAIN', 'NOVEMBER', 'ORIGINAL', 'PAINTING', 'PERSONAL', 'PHYSICAL', 'PLATFORM', 'POLITICS', 'POSITION', 'POSITIVE', 'POSSIBLE', 'POWERFUL', 'PREPARED', 'PRESENCE', 'PRESSURE', 'PREVIOUS', 'PROBABLY', 'PRODUCER', 'PROGRESS', 'PROPOSAL', 'PURCHASE', 'QUESTION', 'REACTION', 'RECOGNIZE', 'RECOVERY', 'RELATIVE', 'REMEMBER', 'REPUBLIC', 'RESEARCH', 'RESOURCE', 'RESPONSE', 'SECURITY', 'SELECTED', 'SENTENCE', 'SEPARATE', 'SEQUENCE', 'SHOULDER', 'SLIGHTLY', 'SOMEBODY', 'SOMEBODY', 'SOUTHERN', 'STANDARD', 'STRAIGHT', 'STRENGTH', 'STRUGGLE', 'SUDDENLY', 'SUGGESTS', 'SUITABLE', 'SURPRISE', 'SWIMMING', 'TEACHING', 'THINKING', 'THOUSAND', 'THURSDAY', 'TOGETHER', 'TOMORROW', 'TREASURE', 'TRIANGLE', 'TROPICAL', 'UNIVERSE', 'VACATION', 'VALUABLE', 'VARIABLE', 'VEGETATE', 'WHATEVER', 'WIRELESS', 'WITHDRAW', 'YOURSELF']
  };

  async analyzeGuess(guessData: GuessData[], wordLength: number): Promise<MLWordleSolution[]> {
    console.log('Starting ML analysis for guess:', guessData);
    
    // Get all possible words for the given length
    const candidateWords = this.getAllCandidateWords(wordLength);
    
    // Filter words based on constraints
    const validWords = candidateWords.filter(word => this.satisfiesConstraints(word, guessData));
    
    // Score and rank the valid words
    const scoredWords = validWords.map(word => ({
      word: word.toUpperCase(),
      probability: this.calculateProbability(word, guessData, wordLength)
    }));
    
    // Sort by probability (highest first) and take top 15
    scoredWords.sort((a, b) => b.probability - a.probability);
    
    console.log('ML Analysis complete:', scoredWords.slice(0, 15));
    return scoredWords.slice(0, 15);
  }

  private getAllCandidateWords(wordLength: number): string[] {
    // Get common words for the specified length
    const commonWords = this.commonWords[wordLength] || [];
    
    // Generate additional permutations based on common letter patterns
    const additionalWords = this.generateWordPermutations(wordLength);
    
    // Combine and deduplicate
    const allWords = [...new Set([...commonWords, ...additionalWords])];
    
    return allWords;
  }

  private generateWordPermutations(wordLength: number): string[] {
    const commonLetters = 'ETAOINSHRDLCUMWFGYPBVKJXQZ';
    const vowels = 'AEIOU';
    const consonants = 'BCDFGHJKLMNPQRSTVWXYZ';
    const words: string[] = [];
    
    // Generate words with common patterns
    for (let i = 0; i < 100; i++) {
      let word = '';
      
      // Ensure at least one vowel
      const vowelPositions = new Set<number>();
      const numVowels = Math.min(Math.max(1, Math.floor(Math.random() * 3) + 1), wordLength - 1);
      
      while (vowelPositions.size < numVowels) {
        vowelPositions.add(Math.floor(Math.random() * wordLength));
      }
      
      for (let j = 0; j < wordLength; j++) {
        if (vowelPositions.has(j)) {
          word += vowels[Math.floor(Math.random() * vowels.length)];
        } else {
          word += consonants[Math.floor(Math.random() * consonants.length)];
        }
      }
      
      // Only add if it looks like a reasonable English word pattern
      if (this.isReasonableWordPattern(word)) {
        words.push(word);
      }
    }
    
    return words;
  }

  private isReasonableWordPattern(word: string): boolean {
    const vowels = 'AEIOU';
    let vowelCount = 0;
    let consonantStreak = 0;
    let vowelStreak = 0;
    
    for (const letter of word) {
      if (vowels.includes(letter)) {
        vowelCount++;
        vowelStreak++;
        consonantStreak = 0;
        
        // Too many vowels in a row
        if (vowelStreak > 2) return false;
      } else {
        consonantStreak++;
        vowelStreak = 0;
        
        // Too many consonants in a row
        if (consonantStreak > 3) return false;
      }
    }
    
    // Must have at least one vowel and reasonable vowel ratio
    return vowelCount >= 1 && vowelCount <= Math.ceil(word.length * 0.7);
  }

  private satisfiesConstraints(word: string, guessData: GuessData[]): boolean {
    const wordUpper = word.toUpperCase();
    
    for (let i = 0; i < guessData.length; i++) {
      const tile = guessData[i];
      if (!tile.letter) continue;
      
      const letter = tile.letter.toUpperCase();
      const wordLetter = wordUpper[i];
      
      switch (tile.state) {
        case 'correct':
          if (wordLetter !== letter) return false;
          break;
        case 'present':
          if (!wordUpper.includes(letter) || wordLetter === letter) return false;
          break;
        case 'absent':
          if (wordUpper.includes(letter)) return false;
          break;
      }
    }
    
    return true;
  }

  private calculateProbability(word: string, guessData: GuessData[], wordLength: number): number {
    let score = 0.5; // Base probability
    
    const wordUpper = word.toUpperCase();
    const letterFreq = this.getLetterFrequencies();
    
    // Bonus for common letters
    for (const letter of wordUpper) {
      score += (letterFreq[letter] || 0) * 0.1;
    }
    
    // Bonus for common word patterns
    if (this.commonWords[wordLength]?.includes(wordUpper)) {
      score += 0.3;
    }
    
    // Bonus for satisfying more constraints
    let constraintsSatisfied = 0;
    let totalConstraints = 0;
    
    for (const tile of guessData) {
      if (!tile.letter) continue;
      totalConstraints++;
      
      const letter = tile.letter.toUpperCase();
      switch (tile.state) {
        case 'correct':
        case 'present':
        case 'absent':
          constraintsSatisfied++;
          break;
      }
    }
    
    if (totalConstraints > 0) {
      score += (constraintsSatisfied / totalConstraints) * 0.2;
    }
    
    // Normalize to 0-1 range
    return Math.min(0.95, Math.max(0.05, score));
  }

  private getLetterFrequencies(): { [key: string]: number } {
    return {
      'E': 0.12, 'T': 0.09, 'A': 0.08, 'O': 0.08, 'I': 0.07, 'N': 0.07,
      'S': 0.06, 'H': 0.06, 'R': 0.06, 'D': 0.04, 'L': 0.04, 'C': 0.03,
      'U': 0.03, 'M': 0.02, 'W': 0.02, 'F': 0.02, 'G': 0.02, 'Y': 0.02,
      'P': 0.02, 'B': 0.01, 'V': 0.01, 'K': 0.01, 'J': 0.001, 'X': 0.001,
      'Q': 0.001, 'Z': 0.001
    };
  }
}

// Export singleton instance
export const mlWordleAnalyzer = new MLWordleAnalyzer();
