
export class WordGenerator {
  private webScrapedData: string[] = [];

  setWebScrapedData(data: string[]): void {
    this.webScrapedData = data;
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
      5: ['ABOUT', 'WOULD', 'THERE', 'THEIR', 'COULD', 'OTHER', 'AFTER', 'FIRST', 'NEVER', 'THESE'],
      6: ['SHOULD', 'AROUND', 'LITTLE', 'PEOPLE', 'BEFORE', 'MOTHER', 'THOUGH', 'SCHOOL', 'ALWAYS', 'REALLY'],
      7: ['THROUGH', 'BETWEEN', 'ANOTHER', 'WITHOUT', 'BECAUSE', 'AGAINST', 'NOTHING', 'SOMEONE', 'TOWARDS', 'SEVERAL'],
      8: ['BUSINESS', 'TOGETHER', 'CHILDREN', 'QUESTION', 'COMPLETE', 'YOURSELF', 'REMEMBER', 'ALTHOUGH', 'CONTINUE', 'POSSIBLE']
    };

    return commonWordSets[wordLength] || [];
  }
}
