
export class FallbackDataService {
  getExpandedFallbackData(): string[] {
    const fallbackSentences = [
      "English language vocabulary consists of many common words used in daily communication and writing",
      "Five letter words are particularly common in word games and puzzles like Wordle Scrabble and crosswords",
      "The most frequent letters in English text are E T A O I N S H R D L U based on linguistic analysis",
      "Common word patterns include consonant vowel combinations that form readable and pronounceable words",
      "Dictionary validation ensures that generated words are legitimate English vocabulary items found in standard references",
      
      "Classic literature contains thousands of common English words that readers encounter in novels poetry and prose",
      "Newspaper articles magazine stories and online content provide excellent sources of contemporary word usage patterns",
      "Educational materials textbooks and academic writing demonstrate formal vocabulary and technical terminology usage",
      "Conversational speech everyday dialogue and informal communication reveal the most frequently used spoken words",
      "Business communication professional writing and formal correspondence showcase workplace vocabulary and industry terms",
      
      "Nouns represent people places things and concepts while verbs describe actions states and processes",
      "Adjectives modify and describe nouns providing color size shape emotion and other descriptive qualities",
      "Adverbs modify verbs adjectives and other adverbs indicating manner time place degree and frequency",
      "Prepositions show relationships between words indicating location direction time and other spatial temporal connections",
      "Conjunctions connect words phrases and clauses creating complex sentences and joining related ideas together",
      
      "Common prefixes include anti auto inter multi over under which modify root words meanings",
      "Frequent suffixes like able ible tion sion ness ment ly transform words into different parts speech",
      "Silent letters appear in words like knife thumb lamb comb where certain letters remain unpronounced",
      "Double consonants occur in words like letter better running swimming when adding suffixes to root words",
      "Vowel combinations create unique sounds in words like bread break great steak though throughought",
      
      "Latin roots form the basis of many English words especially in academic scientific and medical terminology",
      "Greek origins contribute to technical vocabulary particularly in science mathematics and philosophy related fields",
      "Germanic foundations provide many basic everyday words including articles pronouns and common verbs nouns",
      "French influences appear in cuisine fashion art and cultural vocabulary brought through historical language contact",
      "Modern borrowings from various languages continue to expand English vocabulary through globalization and technology"
    ];
    
    const words = new Set<string>();
    
    fallbackSentences.forEach(sentence => {
      const sentenceWords = sentence
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length >= 3 && word.length <= 8)
        .filter(word => /^[a-z]+$/.test(word))
        .map(word => word.toUpperCase());
        
      sentenceWords.forEach(word => words.add(word));
    });
    
    const categoryWords = [
      'HOUSE', 'WATER', 'PAPER', 'STORY', 'POINT', 'WORLD', 'MUSIC', 'HEART', 'COLOR', 'LIGHT',
      'MONEY', 'MONTH', 'SOUND', 'NIGHT', 'POWER', 'PLACE', 'FIELD', 'VOICE', 'THING', 'FRIEND',
      'THINK', 'SPEAK', 'LEARN', 'TEACH', 'WRITE', 'DRIVE', 'SLEEP', 'DANCE', 'LAUGH', 'SMILE',
      'WATCH', 'LISTEN', 'TRAVEL', 'CHANGE', 'CREATE', 'DELIVER', 'MANAGE', 'HANDLE', 'FINISH', 'START',
      'HAPPY', 'QUICK', 'SMART', 'FUNNY', 'BRIGHT', 'CLEAR', 'CLEAN', 'FRESH', 'SHARP', 'SMOOTH',
      'STRONG', 'GENTLE', 'SIMPLE', 'COMPLEX', 'MODERN', 'ANCIENT', 'RECENT', 'FUTURE', 'CURRENT', 'FINAL',
      'PHONE', 'EMAIL', 'SOCIAL', 'MEDIA', 'ONLINE', 'SEARCH', 'CLICK', 'SCROLL', 'SWIPE', 'TOUCH',
      'SCREEN', 'DEVICE', 'BATTERY', 'CHARGE', 'CONNECT', 'NETWORK', 'SERVER', 'CLOUD', 'BACKUP', 'UPDATE'
    ];
    
    categoryWords.forEach(word => words.add(word));
    
    return Array.from(words);
  }
}
