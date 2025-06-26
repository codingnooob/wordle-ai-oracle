
import { wordApiService } from './wordApiService';

// Legacy word database for immediate fallback - much smaller now
const FALLBACK_WORDS: { [key: number]: Array<{ word: string; frequency: number }> } = {
  3: [
    { word: 'THE', frequency: 100 }, { word: 'AND', frequency: 95 }, { word: 'FOR', frequency: 90 },
    { word: 'ARE', frequency: 85 }, { word: 'BUT', frequency: 80 }, { word: 'NOT', frequency: 78 },
    { word: 'YOU', frequency: 75 }, { word: 'ALL', frequency: 72 }, { word: 'CAN', frequency: 70 },
    { word: 'HER', frequency: 68 }
  ],
  4: [
    { word: 'THAT', frequency: 100 }, { word: 'WITH', frequency: 95 }, { word: 'HAVE', frequency: 90 },
    { word: 'THIS', frequency: 88 }, { word: 'WILL', frequency: 85 }, { word: 'YOUR', frequency: 83 },
    { word: 'FROM', frequency: 80 }, { word: 'THEY', frequency: 78 }, { word: 'KNOW', frequency: 75 },
    { word: 'WANT', frequency: 73 }
  ],
  5: [
    { word: 'WHICH', frequency: 100 }, { word: 'THEIR', frequency: 98 }, { word: 'WOULD', frequency: 95 },
    { word: 'THERE', frequency: 93 }, { word: 'COULD', frequency: 90 }, { word: 'OTHER', frequency: 88 },
    { word: 'AFTER', frequency: 85 }, { word: 'FIRST', frequency: 83 }, { word: 'NEVER', frequency: 80 },
    { word: 'THESE', frequency: 78 }
  ],
  6: [
    { word: 'SHOULD', frequency: 100 }, { word: 'AROUND', frequency: 95 }, { word: 'LITTLE', frequency: 90 },
    { word: 'PEOPLE', frequency: 88 }, { word: 'BEFORE', frequency: 85 }, { word: 'MOTHER', frequency: 83 },
    { word: 'THOUGH', frequency: 80 }, { word: 'SCHOOL', frequency: 78 }, { word: 'ALWAYS', frequency: 75 },
    { word: 'REALLY', frequency: 73 }
  ],
  7: [
    { word: 'THROUGH', frequency: 100 }, { word: 'BETWEEN', frequency: 95 }, { word: 'ANOTHER', frequency: 90 },
    { word: 'WITHOUT', frequency: 88 }, { word: 'BECAUSE', frequency: 85 }, { word: 'AGAINST', frequency: 83 },
    { word: 'NOTHING', frequency: 80 }, { word: 'SOMEONE', frequency: 78 }, { word: 'TOWARDS', frequency: 75 },
    { word: 'SEVERAL', frequency: 73 }
  ],
  8: [
    { word: 'BUSINESS', frequency: 100 }, { word: 'TOGETHER', frequency: 95 }, { word: 'CHILDREN', frequency: 90 },
    { word: 'QUESTION', frequency: 88 }, { word: 'COMPLETE', frequency: 85 }, { word: 'YOURSELF', frequency: 83 },
    { word: 'REMEMBER', frequency: 80 }, { word: 'ALTHOUGH', frequency: 78 }, { word: 'CONTINUE', frequency: 75 },
    { word: 'POSSIBLE', frequency: 73 }
  ]
};

export async function getWordsForLength(length: number): Promise<Array<{ word: string; frequency: number }>> {
  try {
    // Try to get words from the API service
    const apiWords = await wordApiService.getWordsForLength(length);
    if (apiWords && apiWords.length > 0) {
      return apiWords;
    }
  } catch (error) {
    console.warn(`API service failed for length ${length}, using fallback:`, error);
  }
  
  // Fallback to the manual list if API fails
  return FALLBACK_WORDS[length] || [];
}

// Legacy synchronous export for backward compatibility
export const WORD_DATABASE = FALLBACK_WORDS;

// Export API service utilities
export { wordApiService };
