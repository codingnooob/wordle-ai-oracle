
export interface ScrapingTarget {
  url: string;
  name: string;
}

export interface ScrapeResult {
  source: string;
  wordCount: number;
  success: boolean;
}

export interface ScrapingResponse {
  words: string[];
  totalWords: number;
  totalScraped?: number; // Added to track how many words were actually scraped
  scrapeResults: ScrapeResult[];
  timestamp: string;
  error?: string;
  fallback?: boolean;
}
