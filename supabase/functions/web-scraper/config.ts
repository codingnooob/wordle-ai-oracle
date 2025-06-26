
import { ScrapingTarget } from './types.ts';

export const SCRAPING_TARGETS: ScrapingTarget[] = [
  {
    url: 'https://en.wikipedia.org/wiki/Most_common_words_in_English',
    name: 'Wikipedia Common Words',
  },
  {
    url: 'https://simple.wikipedia.org/wiki/List_of_common_English_words',
    name: 'Simple Wikipedia Words',
  },
  {
    url: 'https://en.wikipedia.org/wiki/English_language',
    name: 'Wikipedia English Language',
  },
  {
    url: 'https://en.wikipedia.org/wiki/List_of_English_words_of_French_origin',
    name: 'Wikipedia French Origin Words',
  },
  {
    url: 'https://en.wikipedia.org/wiki/List_of_English_words_of_German_origin',
    name: 'Wikipedia German Origin Words',
  },
  {
    url: 'https://en.wikipedia.org/wiki/Basic_English',
    name: 'Wikipedia Basic English',
  }
];

// Search queries for finding word lists
export const SEARCH_QUERIES = [
  'english word list vocabulary',
  'common english words dictionary',
  'english language learning words',
  'basic english vocabulary list',
  'english words frequency list',
  'everyday english words collection'
];

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
