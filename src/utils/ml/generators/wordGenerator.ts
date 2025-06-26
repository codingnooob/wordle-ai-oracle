import { GuessData, WordConstraints } from '../../constraints/types';
import { validateWordAgainstConstraints } from '../../constraints/validator';

export class WordGenerator {
  private webScrapedData: string[] = [];

  setWebScrapedData(data: string[]): void {
    this.webScrapedData = data;
    console.log(`📚 Set web scraped data: ${data.length} words available for generation`);
  }

  async generateConstraintAwareCandidates(
    guessData: GuessData[], 
    wordLength: number, 
    constraints: WordConstraints,
    textGenerator: any
  ): Promise<string[]> {
    const candidates = new Set<string>();
    console.log(`🎯 Generating constraint-aware candidates for ${wordLength}-letter words`);

    // Step 1: Filter web scraped data by constraints first
    const constraintFilteredWords = this.webScrapedData
      .filter(word => word.length === wordLength)
      .filter(word => {
        const wordUpper = word.toUpperCase();
        return validateWordAgainstConstraints(wordUpper, constraints);
      });

    console.log(`📊 Constraint-filtered web data: ${constraintFilteredWords.length} words from ${this.webScrapedData.length} total`);
    constraintFilteredWords.forEach(word => candidates.add(word.toUpperCase()));

    // Step 2: Generate constraint-aware words using known letters
    const knownLetters = this.extractKnownLetters(guessData, constraints);
    if (knownLetters.length > 0) {
      const generatedWords = this.generateWordsWithKnownLetters(wordLength, knownLetters, constraints);
      generatedWords.forEach(word => candidates.add(word));
      console.log(`🔤 Generated ${generatedWords.length} words using known letters: ${knownLetters.join(',')}`);
    }

    // Step 3: Add common words that satisfy constraints
    const constraintFilteredCommon = this.getCommonWords(wordLength)
      .filter(word => validateWordAgainstConstraints(word, constraints));
    
    constraintFilteredCommon.forEach(word => candidates.add(word));
    console.log(`📖 Added ${constraintFilteredCommon.length} constraint-filtered common words`);

    const finalCandidates = Array.from(candidates);
    console.log(`✅ Total constraint-aware candidates: ${finalCandidates.length}`);
    
    return finalCandidates;
  }

  private extractKnownLetters(guessData: GuessData[], constraints: WordConstraints): string[] {
    const knownLetters = new Set<string>();
    
    // Add correct position letters
    for (const letter of constraints.correctPositions.values()) {
      knownLetters.add(letter);
    }
    
    // Add present letters
    for (const letter of constraints.presentLetters) {
      knownLetters.add(letter);
    }
    
    return Array.from(knownLetters);
  }

  private generateWordsWithKnownLetters(
    wordLength: number, 
    knownLetters: string[], 
    constraints: WordConstraints
  ): string[] {
    const words: string[] = [];
    const vowels = 'AEIOU';
    const consonants = 'BCDFGHJKLMNPQRSTVWXYZ';
    
    // Generate words that incorporate known letters and respect constraints
    for (let attempt = 0; attempt < 200 && words.length < 50; attempt++) {
      let word = '';
      const usedKnownLetters = new Set<string>();
      
      // Fill correct positions first
      for (let i = 0; i < wordLength; i++) {
        if (constraints.correctPositions.has(i)) {
          word += constraints.correctPositions.get(i);
        } else {
          word += '_';
        }
      }
      
      // Fill remaining positions while respecting constraints
      for (let i = 0; i < wordLength; i++) {
        if (word[i] === '_') {
          const excludedAtPosition = constraints.positionExclusions.get(i) || new Set();
          
          // Try to place a present letter that's not excluded at this position
          let placedLetter = false;
          for (const letter of knownLetters) {
            if (!usedKnownLetters.has(letter) && 
                !excludedAtPosition.has(letter) && 
                constraints.presentLetters.has(letter)) {
              word = word.substring(0, i) + letter + word.substring(i + 1);
              usedKnownLetters.add(letter);
              placedLetter = true;
              break;
            }
          }
          
          // If no present letter works, use a random valid letter
          if (!placedLetter) {
            const availableLetters = (vowels + consonants)
              .split('')
              .filter(letter => 
                !constraints.absentLetters.has(letter) && 
                !excludedAtPosition.has(letter)
              );
            
            if (availableLetters.length > 0) {
              const randomLetter = availableLetters[Math.floor(Math.random() * availableLetters.length)];
              word = word.substring(0, i) + randomLetter + word.substring(i + 1);
            }
          }
        }
      }
      
      // Validate the generated word
      if (word.length === wordLength && 
          !word.includes('_') && 
          validateWordAgainstConstraints(word, constraints)) {
        words.push(word);
      }
    }
    
    return words;
  }

  async generateCandidateWords(
    guessData: Array<{letter: string, state: string}>, 
    wordLength: number, 
    textGenerator: any
  ): Promise<string[]> {
    const candidates = new Set<string>();

    // Use scraped web data as base
    const webWords = this.webScrapedData.filter(word => word.length === wordLength);
    webWords.forEach(word => candidates.add(word.toUpperCase()));

    // Generate words based on constraints
    const knownLetters = guessData
      .filter(tile => tile.letter && (tile.state === 'correct' || tile.state === 'present'))
      .map(tile => tile.letter.toLowerCase())
      .join('');

    if (knownLetters.length > 0 && textGenerator) {
      try {
        const prompt = `Words containing letters ${knownLetters}:`;
        const generated = await textGenerator(prompt, {
          max_new_tokens: 50,
          num_return_sequences: 5,
          temperature: 0.7
        });

        if (Array.isArray(generated)) {
          generated.forEach((result: any) => {
            const text = result.generated_text || '';
            const words = text.split(/\s+/)
              .filter((word: string) => word.length === wordLength && /^[a-zA-Z]+$/.test(word));
            words.forEach((word: string) => candidates.add(word.toUpperCase()));
          });
        }
      } catch (error) {
        console.error('Text generation failed:', error);
      }
    }

    // Add common English words as fallback
    const commonWords = this.getCommonWords(wordLength);
    commonWords.forEach(word => candidates.add(word));

    return Array.from(candidates);
  }

  private getCommonWords(wordLength: number): string[] {
    const commonWordSets: { [key: number]: string[] } = {
      3: ['THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER'],
      4: ['THAT', 'WITH', 'HAVE', 'THIS', 'WILL', 'YOUR', 'FROM', 'THEY', 'KNOW', 'WANT'],
      5: ['ABOUT', 'WOULD', 'THERE', 'THEIR', 'COULD', 'OTHER', 'AFTER', 'FIRST', 'NEVER', 'THESE', 'WORDS', 'WORLD', 'WROTE', 'WORSE', 'WORRY', 'WORKS', 'WORTH', 'WHOSE', 'WIDER', 'WHILE'],
      6: ['SHOULD', 'AROUND', 'LITTLE', 'PEOPLE', 'BEFORE', 'MOTHER', 'THOUGH', 'SCHOOL', 'ALWAYS', 'REALLY'],
      7: ['THROUGH', 'BETWEEN', 'ANOTHER', 'WITHOUT', 'BECAUSE', 'AGAINST', 'NOTHING', 'SOMEONE', 'TOWARDS', 'SEVERAL'],
      8: ['BUSINESS', 'TOGETHER', 'CHILDREN', 'QUESTION', 'COMPLETE', 'YOURSELF', 'REMEMBER', 'ALTHOUGH', 'CONTINUE', 'POSSIBLE']
    };

    return commonWordSets[wordLength] || [];
  }
}
