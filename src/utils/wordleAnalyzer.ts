
// Comprehensive word database for different lengths
const WORD_DATABASES = {
  3: ['CAT', 'DOG', 'BAT', 'RAT', 'HAT', 'MAT', 'SAT', 'FAT', 'PAT', 'VAT', 'BOX', 'FOX', 'COX', 'POX', 'SOX', 'FIX', 'MIX', 'SIX', 'WAX', 'TAX', 'SUN', 'RUN', 'GUN', 'FUN', 'BUN', 'NUN', 'TUN', 'PUN', 'CUP', 'PUP', 'SUP', 'TOP', 'POP', 'HOP', 'MOP', 'SOP', 'COP', 'LOB', 'MOB', 'SOB', 'COB', 'NOB', 'JOB', 'HOB', 'ROB', 'GOB', 'BOB'],
  4: ['WORD', 'GAME', 'PLAY', 'TIME', 'LOVE', 'LIFE', 'WORK', 'HOME', 'HAND', 'PART', 'YEAR', 'GOOD', 'MAKE', 'COME', 'LOOK', 'TAKE', 'GIVE', 'HELP', 'FIND', 'TELL', 'TURN', 'KEEP', 'MOVE', 'KNOW', 'SHOW', 'OPEN', 'CALL', 'SEEM', 'FEEL', 'BACK', 'FACE', 'HEAD', 'BODY', 'MIND', 'IDEA', 'FACT', 'CASE', 'SIDE', 'KIND', 'LONG', 'HIGH', 'LAST', 'NEXT', 'MUCH', 'MANY', 'MOST', 'SOME', 'BEST'],
  5: ['ABOUT', 'OTHER', 'WHICH', 'THEIR', 'WOULD', 'THERE', 'COULD', 'FIRST', 'AFTER', 'THESE', 'THINK', 'WHERE', 'BEING', 'EVERY', 'GREAT', 'MIGHT', 'SHALL', 'STILL', 'THOSE', 'WHILE', 'STATE', 'NEVER', 'HOUSE', 'WORLD', 'SCHOOL', 'SOUND', 'HEART', 'LIGHT', 'WATER', 'PLACE', 'RIGHT', 'ASKED', 'GOING', 'SMALL', 'FOUND', 'UNDER', 'AGAIN', 'HORSE', 'MUSIC', 'PAPER', 'COLOR', 'MONEY', 'FLOOR', 'VOICE', 'ABOVE', 'QUICK', 'BREAD', 'SWEET', 'PIECE', 'CLOSE', 'SINCE', 'FIELD', 'STUDY', 'STORY', 'FORCE', 'SPACE', 'DANCE', 'PRICE', 'CHIEF', 'CHEST', 'CHECK', 'SCENE', 'BEACH', 'SERVE', 'DRIVE', 'CYCLE', 'PRIZE', 'CRIME', 'SLICE', 'FENCE', 'SHELF', 'KNIFE', 'VOICE', 'SPICE', 'TWICE', 'NERVE', 'CURVE', 'RANGE', 'JUDGE', 'STAGE', 'PRIDE', 'GLIDE', 'GRACE', 'PHASE', 'CHASE', 'BRAKE', 'SCALE', 'PLATE', 'PLANE', 'FRAME', 'FLAME', 'SHAME', 'SHARE', 'SHAKE', 'SHADE', 'SHAPE', 'SHAVE', 'SHORE', 'SMOKE', 'SMILE', 'SPINE', 'SCOPE', 'SCORE', 'STORE', 'STYLE', 'SWING', 'SPEND', 'SPLIT', 'SPORT', 'SPRAY', 'STAIN', 'STARK', 'STARE', 'STEEL', 'STICK', 'STING', 'STONE', 'STORM', 'STRIP', 'STUFF', 'SUGAR', 'SUPER', 'SWEET', 'SWIFT', 'THICK', 'THREW', 'TIRED', 'TITLE', 'TRIED', 'TRUST', 'UNITY', 'UPPER', 'VALUE', 'VIDEO', 'VIRUS', 'WASTE', 'WHEEL', 'WEIRD', 'WIDER', 'WINDY', 'WROTE', 'YOUTH'],
  6: ['SHOULD', 'AROUND', 'BEFORE', 'THROUGH', 'LITTLE', 'NUMBER', 'PUBLIC', 'SCHOOL', 'PEOPLE', 'FAMILY', 'ALWAYS', 'DURING', 'CHANGE', 'FOLLOW', 'FRIEND', 'MOTHER', 'FATHER', 'SISTER', 'BROTHER', 'OFFICE', 'PERSON', 'STREET', 'LETTER', 'GARDEN', 'MINUTE', 'SECOND', 'HANDLE', 'SIMPLE', 'COURSE', 'SYSTEM', 'LEADER', 'NATURE', 'PLAYER', 'REASON', 'RESULT', 'MEMBER', 'POLICE', 'RECORD', 'MARKET', 'HEALTH', 'CHURCH', 'GROUND', 'MATTER', 'ACTION', 'DETAIL', 'WEIGHT', 'PRINCE', 'CHOICE', 'CHANCE', 'BRIDGE', 'BRANCH', 'BREATH', 'BRIGHT', 'BUDGET', 'BUTTER', 'CAMERA', 'CANCER', 'CASTLE', 'CENTER', 'CHANGE', 'CHARGE', 'CHEESE', 'CHERRY', 'CHURCH', 'CIRCLE', 'CLIENT', 'COFFEE', 'CORNER', 'COUPLE', 'CREATE', 'CREDIT', 'CRISIS', 'CUSTOM', 'DAMAGE', 'DANGER', 'DEFEND', 'DEGREE', 'DESIGN', 'DEVICE', 'DINNER', 'DOCTOR', 'DOUBLE', 'DRIVER', 'EDITOR', 'ENERGY', 'ENGINE', 'ESCAPE', 'EXPERT', 'FABRIC', 'FINGER', 'FORGET', 'FORMAT', 'FORMER', 'FRIEND', 'FROZEN', 'FUTURE', 'GARAGE', 'GENDER', 'GENTLE', 'GLOBAL', 'GOLDEN', 'GROWTH', 'HARDLY', 'HEIGHT', 'HELPER', 'HONEST', 'HUNGRY', 'IMPACT', 'INCOME', 'INJURY', 'INSECT', 'ISLAND', 'JUNGLE', 'JUNIOR', 'KIDNEY', 'LADDER', 'LAWYER', 'LENGTH', 'LESSON', 'LETTER', 'LIQUID', 'LISTEN', 'LUMBER', 'LUXURY', 'MAINLY', 'MANNER', 'MARGIN', 'MARINE', 'MASTER', 'MATURE', 'MEDIUM', 'MEMORY', 'MENTAL', 'METHOD', 'MIDDLE', 'MINING', 'MINUTE', 'MIRROR', 'MOBILE', 'MODERN', 'MOSTLY', 'MOTION', 'MOVING', 'MUSCLE', 'NATURE', 'NEARLY', 'NEPHEW', 'NORMAL', 'NOTICE', 'OBTAIN', 'OFFICE', 'OPTION', 'ORANGE', 'ORIGIN', 'PALACE', 'PARENT', 'PARTLY', 'PATROL', 'PERIOD', 'PERMIT', 'PHRASE', 'PLENTY', 'POETRY', 'POTATO', 'POWDER', 'PREFER', 'PRETTY', 'PRINCE', 'PRISON', 'PROFIT', 'PROPER', 'PURPLE', 'QUAINT', 'RABBIT', 'RARELY', 'RATHER', 'READER', 'REALLY', 'REASON', 'RECORD', 'REDUCE', 'REGIME', 'REGION', 'RELATE', 'REMAIN', 'REMOTE', 'REMOVE', 'REPAIR', 'REPEAT', 'RESCUE', 'RESULT', 'RETURN', 'REVIEW', 'RIBBON', 'SAFETY', 'SAMPLE', 'SCHEME', 'SCREEN', 'SCRIPT', 'SEARCH', 'SEASON', 'SECRET', 'SECURE', 'SELECT', 'SENIOR', 'SERIES', 'SETTLE', 'SEVERE', 'SHADOW', 'SHOULD', 'SHOWER', 'SILVER', 'SIMPLY', 'SINGER', 'SISTER', 'SKILLS', 'SMOOTH', 'SOCCER', 'SOCIAL', 'SOLELY', 'SOURCE', 'SPRING', 'SQUARE', 'STABLE', 'STRAND', 'STREAM', 'STREET', 'STRIKE', 'STRING', 'STRONG', 'STUDIO', 'SUBMIT', 'SUDDEN', 'SUMMER', 'SUMMIT', 'SUNDAY', 'SUNSET', 'SUPPLY', 'SWITCH', 'SYMBOL', 'SYSTEM', 'TEMPLE', 'THREAD', 'THROAT', 'TIMBER', 'TOMATO', 'TONGUE', 'TOWARD', 'TRAVEL', 'TREATY', 'TRIPLE', 'TURKEY', 'UNIQUE', 'UNLESS', 'UPDATE', 'UPWARD', 'URGENT', 'USEFUL', 'VALLEY', 'VENDOR', 'VERIFY', 'VICTIM', 'VISION', 'VOLUME', 'WEALTH', 'WEAPON', 'WEEKLY', 'WEIGHT', 'WIDELY', 'WINNER', 'WINTER', 'WISDOM', 'WITHIN', 'WOODEN', 'WRITER'],
  7: ['THROUGH', 'BETWEEN', 'ANOTHER', 'BECAUSE', 'WITHOUT', 'AGAINST', 'NOTHING', 'SOMEONE', 'MORNING', 'GETTING', 'LOOKING', 'SITTING', 'EVENING', 'FEELING', 'TALKING', 'WALKING', 'WORKING', 'KITCHEN', 'BEDROOM', 'PICTURE', 'STATION', 'HOLIDAY', 'HISTORY', 'GENERAL', 'MACHINE', 'OCTOBER', 'PRESENT', 'CERTAIN', 'OUTSIDE', 'SCIENCE', 'SOCIETY', 'QUALITY', 'SUPPORT', 'HUSBAND', 'SPECIAL', 'CENTRAL', 'BROTHER', 'TROUBLE', 'MILLION', 'COUNCIL', 'FINANCE', 'ACCOUNT', 'FREEDOM', 'VILLAGE', 'PACKAGE', 'SURFACE', 'BALANCE', 'BENEFIT', 'CABINET', 'CALIBER', 'CAPITAL', 'CAREFUL', 'CENTURY', 'CHAMBER', 'CHANNEL', 'CHAPTER', 'CHARITY', 'CHICKEN', 'CLASSIC', 'CLIMATE', 'CLOTHES', 'CLUSTER', 'COLLEGE', 'COMBINE', 'COMMAND', 'COMMENT', 'COMPANY', 'COMPETE', 'COMPLEX', 'CONCEPT', 'CONDUCT', 'CONFIRM', 'CONNECT', 'CONSENT', 'CONSIST', 'CONTACT', 'CONTAIN', 'CONTENT', 'CONTEST', 'CONTEXT', 'CONTROL', 'CONVERT', 'CORRECT', 'COTTAGE', 'COUNCIL', 'COUNTER', 'COUNTRY', 'COURAGE', 'CRYSTAL', 'CULTURE', 'CURRENT', 'CUSTODY', 'DELIVER', 'DEPOSIT', 'DESERVE', 'DESTINY', 'DEVELOP', 'DIAMOND', 'DIGITAL', 'DISPLAY', 'DIVERSE', 'DRAWING', 'DROUGHT', 'EASTERN', 'ECONOMY', 'EDUCATE', 'ELEMENT', 'EMOTION', 'ENHANCE', 'EVENING', 'EXAMINE', 'EXAMPLE', 'EXHIBIT', 'EXPLAIN', 'EXPLORE', 'EXPRESS', 'EXTREME', 'FACULTY', 'FAILURE', 'FANTASY', 'FASHION', 'FEATURE', 'FEELING', 'FERTILE', 'FICTION', 'FIFTEEN', 'FINANCE', 'FINDING', 'FOREIGN', 'FOREVER', 'FORTUNE', 'FORWARD', 'FREEDOM', 'FUNERAL', 'FURTHER', 'GALLERY', 'GARBAGE', 'GATEWAY', 'GENERAL', 'GENETIC', 'GENUINE', 'GESTURE', 'GETTING', 'GLACIER', 'GLIMPSE', 'GODDESS', 'GRAMMAR', 'GRAVITY', 'GROCERY', 'GROWING', 'HABITAT', 'HALFWAY', 'HARMONY', 'HEADING', 'HEALTHY', 'HEARING', ' 
HEATING', 'HELPFUL', 'HERSELF', 'HIGHWAY', 'HIMSELF', 'HISTORY', 'HOLIDAY', 'HORMONE', 'HOUSING', 'HUNTING', 'HUSBAND', 'IMAGERY', 'IMAGINE', 'IMPULSE', 'INCLUDE', 'INDOORS', 'INHABIT', 'INITIAL', 'INQUIRY', 'INSIGHT', 'INSPECT', 'INSTALL', 'INSTANT', 'INSTEAD', 'INTEGRAL', 'INTENSE', 'INTERIM', 'INVERSE', 'JOINTLY', 'JOURNAL', 'JOURNEY', 'JUSTICE', 'JUSTIFY', 'KITCHEN', 'LANDING', 'LARGELY', 'LAUNDRY', 'LAWSUIT', 'LEADING', 'LEARNED', 'LEATHER', 'LENGTHY', 'LIBRARY', 'LIGHTEN', 'LIMITED', 'LISTING', 'LOADING', 'LOCATION', 'LOCKOUT', 'LOOKING', 'LOYALTY', 'MACHINE', 'MAILBOX', 'MANDATE', 'MANSION', 'MAPPING', 'MARTIAL', 'MASTERY', 'MAXIMUM', 'MEANING', 'MEASURE', 'MEDICAL', 'MEETING', 'MELODY', 'MENTION', 'MESSAGE', 'MINERAL', 'MINIMUM', 'MISSING', 'MISSION', 'MISTAKE', 'MIXTURE', 'MONITOR', 'MONTHLY', 'MORNING', 'MUSICAL', 'MYSTERY', 'NATURAL', 'NEGLECT', 'NETWORK', 'NEUTRAL', 'NURSERY', 'NURSING', 'OBJECTIVE', 'OBVIOUS', 'OCTOBER', 'OFFENSE', 'ONGOING', 'OPENING', 'OPINION', 'OPTICAL', 'ORGANIC', 'OUTCOME', 'OUTDOOR', 'OUTLINE', 'OUTPUT', 'OUTSIDE', 'OVERALL', 'OVERLAP', 'OVERLAY', 'PACKAGE', 'PAINFUL', 'PALETTE', 'PARKING', 'PARTIAL', 'PARTNER', 'PASSAGE', 'PASSION', 'PASSIVE', 'PATIENT', 'PATTERN', 'PAYMENT', 'PENALTY', 'PERFECT', 'PERFORM', 'PERHAPS', 'PERSIST', 'PHYSICS', 'PICTURE', 'PIONEER', 'PLASTIC', 'PLEASED', 'POETRY', 'PORTION', 'POVERTY', 'PRECISE', 'PREMIER', 'PREMIUM', 'PREPARE', 'PRESENT', 'PREVENT', 'PRICING', 'PRIMARY', 'PRINTER', 'PRIVACY', 'PRIVATE', 'PROBLEM', 'PROCESS', 'PRODUCE', 'PROFILE', 'PROJECT', 'PROMISE', 'PROTECT', 'PROUDLY', 'PROVIDE', 'PUBLISH', 'PURPOSE', 'PURSUIT', 'PUSHING', 'PYRAMID', 'QUALIFY', 'QUALITY', 'QUARTER', 'QUICKER', 'QUIETLY', 'RADICAL', 'RAILWAY', 'RAPIDLY', 'READILY', 'READING', 'REALITY', 'RECEIPT', 'RECEIVE', 'RECOVER', 'REFLECT', 'REGULAR', 'REJECT', 'RELATED', 'RELEASE', 'RELIABLE', 'REMAINS', 'REMOVAL', 'REMOVED', 'REPLACE', 'REQUIRE', 'RESERVE', 'RESPECT', 'RESPOND', 'RESTORE', 'RETREAT', 'REVENUE', 'REVERSE', 'SATISFY', 'SCIENCE', 'SCRATCH', 'SCREEN', 'SECTION', 'SEGMENT', 'SELLING', 'SENATOR', 'SENDING', 'SERIOUS', 'SERVICE', 'SESSION', 'SETTING', 'SEVERAL', 'SHELTER', 'SHERIFF', 'SHORTLY', 'SHOWING', 'SILENCE', 'SIMILAR', 'SITTING', 'SIXTEEN', 'SMOKING', 'SOCIETY', 'SOMEHOW', 'SOMEONE', 'SPECIAL', 'STATION', 'STORAGE', 'STRANGE', 'STRETCH', 'STUDENT', 'SUBJECT', 'SUCCESS', 'SUGGEST', 'SUMMARY', 'SUNRISE', 'SUPPORT', 'SUPREME', 'SURFACE', 'SURGERY', 'SURPLUS', 'SURVIVE', 'SUSPECT', 'SUSTAIN', 'SWIMMER', 'SYMPTOM', 'TALKING', 'TEACHER', 'TELLING', 'TENSION', 'TESTING', 'TEXTURE', 'THERAPY', 'THEREBY', 'THOUGHT', 'THROUGH', 'TONIGHT', 'TOWARDS', 'TRADING', 'TRAFFIC', 'TRAINED', 'TRAINER', 'TRANSIT', 'TREASURE', 'TREATED', 'TROUBLE', 'TRUSTEE', 'TYPICAL', 'UNDERGO', 'UNKNOWN', 'UNUSUAL', 'UPGRADE', 'UTILITY', 'VACANCY', 'VARIETY', 'VEHICLE', 'VERSION', 'VICTORY', 'VIEWING', 'VILLAGE', 'VINTAGE', 'VIOLENT', 'VISIBLE', 'VISITOR', 'VOLTAGE', 'WAITING', 'WALKING', 'WARNING', 'WASHING', 'WEATHER', 'WEBSITE', 'WEDDING', 'WEEKEND', 'WELCOME', 'WELFARE', 'WESTERN', 'WHEREAS', 'WHISPER', 'WILLING', 'WINNING', 'WITHOUT', 'WITNESS', 'WORKING', 'WRITING', 'WRITTEN'],
  8: ['TOGETHER', 'CHILDREN', 'BUILDING', 'POSITION', 'BUSINESS', 'QUESTION', 'DECISION', 'NATIONAL', 'PERSONAL', 'AMERICAN', 'COMPLETE', 'CONTINUE', 'IMPORTANT', 'INTEREST', 'REMEMBER', 'POSSIBLE', 'COMPUTER', 'LANGUAGE', 'STANDARD', 'INDUSTRY', 'FOOTBALL', 'HOSPITAL', 'MINISTER', 'SECURITY', 'BIRTHDAY', 'YOURSELF', 'ENTRANCE', 'SANDWICH', 'CALENDAR', 'MAGAZINE', 'PRACTICE', 'STRENGTH', 'PLEASURE', 'DAUGHTER', 'SHOULDER', 'EXERCISE', 'REPUBLIC', 'APPROACH', 'FUNCTION', 'ACTIVITY', 'RESEARCH', 'NORTHERN', 'SOUTHERN', 'PAINTING', 'DIRECTOR', 'DISTANCE', 'PURCHASE', 'INSTANCE', 'ABSOLUTE', 'ACADEMIC', 'ACCIDENT', 'ACCURATE', 'ACHIEVED', 'ACTIVIST', 'ACTUALLY', 'ADEQUATE', 'ADJACENT', 'ADVANCED', 'ADVISORY', 'ADVOCATE', 'AIRPLANE', 'ALTHOUGH', 'ALUMINUM', 'ANALYSIS', 'ANNOUNCE', 'ANYTHING', 'ANYWHERE', 'APPARENT', 'ARGUMENT', 'ARTISTIC', 'ASSEMBLY', 'ASTEROID', 'ATHLETIC', 'ATTORNEY', 'AUDIENCE', 'BACTERIA', 'BALANCED', 'BASEBALL', 'BASEMENT', 'BATHROOM', 'BECOMING', 'BEHAVIOR', 'BENJAMIN', 'BIRTHDAY', 'BOUNDARY', 'BROTHERS', 'BUILDING', 'BUSINESS', 'CAMPAIGN', 'CAPACITY', 'CAPTURED', 'CATEGORY', 'CATHOLIC', 'CHAIRMAN', 'CHAMPION', 'CHARGING', 'CHEMICAL', 'CHILDREN', 'CHOOSING', 'CIRCULAR', 'CITIZENS', 'COLLAPSE', 'COLONIAL', 'COMBINED', 'COMMERCE', 'COMMONLY', 'COMPLETE', 'COMPOUND', 'COMPUTER', 'CONCLUDE', 'CONCRETE', 'CONGRESS', 'CONSIDER', 'CONSTANT', 'CONSUMER', 'CONTAINS', 'CONTINUE', 'CONTRACT', 'CONTRARY', 'CONTRAST', 'CONTROLS', 'CORRIDOR', 'COVERAGE', 'CREATION', 'CRIMINAL', 'CRITERIA', 'CRITICAL', 'CROSSING', 'CULTURAL', 'CUSTOMER', 'DATABASE', 'DAUGHTER', 'DECISION', 'DECREASE', 'DELIVERY', 'DEMOCRACY', 'DESCRIBE', 'DESIGNER', 'DETAILED', 'DETECTOR', 'DIABETES', 'DIALOGUE', 'DIAMETER', 'DIFFERENT', 'DIRECTLY', 'DIRECTOR', 'DISABLED', 'DISASTER', 'DISCOVER', 'DISEASES', 'DISTANCE', 'DISTINCT', 'DISTRICT', 'DIVIDEND', 'DOCUMENT', 'DOMESTIC', 'DOMINION', 'DRAMATIC', 'DURATION', 'EARNINGS', 'EDUCATOR', 'ELECTRIC', 'ELEPHANT', 'ELIGIBLE', 'EMPLOYEE', 'ENORMOUS', 'ENTIRELY', 'ENVELOPE', 'EQUATION', 'ESTIMATE', 'EVALUATE', 'EVENING', 'EVERYONE', 'EVIDENCE', 'EXCHANGE', 'EXCITING', 'EXERCISE', 'EXISTING', 'EXPANDED', 'EXPECTED', 'EXPLICIT', 'EXPOSURE', 'EXTERNAL', 'FACEBOOK', 'FACILITY', 'FAMILIAR', 'FEATURED', 'FEEDBACK', 'FESTIVAL', 'FIGHTING', 'FINISHED', 'FLOATING', 'FOOTBALL', 'FORECAST', 'FOREVER', 'FORMERLY', 'FRACTION', 'FRAME', 'FREQUENCY', 'FUNCTION', 'FUNDING', 'GATHERED', 'GENERATE', 'GENETICS', 'GEOMETRY', 'HARDWARE', 'HEADLINE', 'HERITAGE', 'HIGHWAYS', 'HISTORIC', 'HOLIDAYS', 'HOMELESS', 'HOMEWORK', 'HORRIBLE', 'HOSPITAL', 'HUMANITY', 'HUNDREDS', 'IDENTIFY', 'ILLNESS', 'IMAGINE', 'IMMUNTE', 'IMPERIAL', 'IMPLICIT', 'IMPROVED', 'INCREASE', 'INDICATE', 'INDIRECT', 'INDUSTRY', 'INFINITE', 'INFORMAL', 'INNOCENT', 'INSTANCE', 'INTEGRAL', 'INTENDED', 'INTERACT', 'INTEREST', 'INTERNAL', 'INTERNET', 'INTERVAL', 'INTIMATE', 'INVOLVED', 'ISOLATED', 'KEYBOARD', 'LANDMARK', 'LANGUAGE', 'LEARNING', 'LIKEWISE', 'LISTENER', 'LITERARY', 'LOCATION', 'MACHINES', 'MAGNETIC', 'MAINLAND', 'MAINTAIN', 'MAJORITY', 'MANAGING', 'MATERIAL', 'MAXIMIZE', 'MEANING', 'MEASURES', 'MEDICINE', 'MEMORIAL', 'MERCHANT', 'MESSAGES', 'MILITARY', 'MILLIONS', 'MINIMIZE', 'MINORITY', 'MODERATE', 'MODIFIED', 'MOLECULE', 'MOMENTUM', 'MORTGAGE', 'MOUNTAIN', 'MOVEMENT', 'MULTIPLE', 'MUTATION', 'NATIONAL', 'NEIGHBOR', 'NORTHERN', 'NOTEBOOK', 'NOVEMBER', 'NUMEROUS', 'OBSERVED', 'OCCASION', 'OCCUPIED', 'OFFERING', 'OFFICIAL', 'OPERATOR', 'OPTIONAL', 'ORDINARY', 'ORGANISM', 'ORGANIZE', 'ORIGINAL', 'OTHERWISE', 'OUTBREAK', 'OVERCOME', 'OVERLOOK', 'OVERSEAS', 'PAINTING', 'PARALLEL', 'PARAMETER', 'PARTICLE', 'PARTNERS', 'PASSWORD', 'PATIENCE', 'PATTERNS', 'PAVILION', 'PEACEFUL', 'PENTAGON', 'PERIODIC', 'PERSONAL', 'PETITION', 'PHYSICAL', 'PICTURES', 'PLANNING', 'PLATFORM', 'PLEASURE', 'POLICIES', 'POSITION', 'POSSIBLE', 'POWERFUL', 'PRACTICE', 'PREGNANT', 'PREPARED', 'PRESERVE', 'PRESSURE', 'PREVIOUS', 'PRINCESS', 'PRINTING', 'PRIORITY', 'PROBABLY', 'PROBLEMS', 'PRODUCTS', 'PROGRAMS', 'PROGRESS', 'PROMISED', 'PROPERTY', 'PROPOSAL', 'PROSPECT', 'PROTOCOL', 'PROVIDER', 'PROVINCE', 'PUBLICLY', 'PURCHASE', 'PURPOSES', 'PURSUANT', 'QUESTION', 'REACTION', 'REACHING', 'RECENTLY', 'RECEIVED', 'RECOVERY', 'REGIONAL', 'REGISTER', 'RELATION', 'RELATIVE', 'RELEVANT', 'RELIABLE', 'RELIGION', 'REMEMBER', 'REPEATED', 'REPORTER', 'REPUBLIC', 'REQUIRED', 'RESEARCH', 'RESERVED', 'RESIDENT', 'RESOURCE', 'RESPONSE', 'RETURNED', 'REVEALNG', 'REVENUES', 'SANDWICH', 'SANDWICH', 'SCHEDULE', 'SCIENCES', 'SCOTLAND', 'SCREENED', 'SEASONAL', 'SECURITY', 'SELECTED', 'SENTENCE', 'SEQUENCE', 'SERGEANT', 'SERVICES', 'SESSIONS', 'SETTINGS', 'SEXUALLY', 'SHOULDER', 'SHORTAGE', 'SHUTDOWN', 'SIDEWALK', 'SIGNED', 'SILENTLY', 'SIMPLIST', 'SLIGHTLY', 'SOFTWARE', 'SOLUTION', 'SOMEBODY', 'SOMEWHAT', 'SOUTHERN', 'SPEAKING', 'SPECIFIC', 'SPELLING', 'SPENDING', 'STANDING', 'STANDARD', 'STARTING', 'STATEMEN', 'STEERING', 'STIMULATE', 'STRAIGHT', 'STRATEGY', 'STRENGTH', 'STRICTLY', 'STRONGLY', 'STUDENTS', 'STUDYING', 'SUBJECTS', 'SUBURBAN', 'SUDDENLY', 'SUGGEST', 'SUNSHINE', 'SUPPLIES', 'SUPPORTS', 'SUPPOSED', 'SURPRISE', 'SURVIVAL', 'SUSPECT', 'SWIMMING', 'SYMBOLIC', 'SYMPTOMS', 'TEACHING', 'TERMINAL', 'THINKING', 'THOUSAND', 'TIMELINE', 'TOGETHER', 'TOMORROW', 'TRACKING', 'TRAINING', 'TRANSFER', 'TRANSMIT', 'TRAVELED', 'TREASURY', 'TREATING', 'TRIANGLE', 'TROPICAL', 'TROUBLES', 'TRUTHFUL', 'UMBRELLA', 'UNCOMMON', 'UNIVERSE','UNUSUAL', 'UPDATING', 'VACATION', 'VALUABLE', 'VETERANS', 'VIOLENCE', 'VIRGINIA', 'VISITORS', 'VOLATILE', 'WARNINGS', 'WEAKNESS', 'WEIGHTED', 'WHATEVER', 'WHEREVER', 'WILDLIFE', 'WITHDRAW', 'WORKFLOW', 'WORKSHOP', 'YOURSELF']
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
  
  // First, check all constraints
  for (let i = 0; i < guessData.length; i++) {
    const guess = guessData[i];
    
    if (!guess.letter) continue;
    
    switch (guess.state) {
      case 'correct':
        // Letter must be in this exact position
        if (wordLetters[i] !== guess.letter) {
          console.log(`Word ${word} rejected: letter ${guess.letter} not at position ${i}`);
          return false;
        }
        break;
        
      case 'present':
        // Letter must be in the word but not in this position
        if (wordLetters[i] === guess.letter) {
          console.log(`Word ${word} rejected: letter ${guess.letter} at wrong position ${i}`);
          return false;
        }
        if (!wordLetters.includes(guess.letter)) {
          console.log(`Word ${word} rejected: letter ${guess.letter} not in word`);
          return false;
        }
        break;
        
      case 'absent':
        // Letter must not be in the word at all, UNLESS it's marked as correct or present elsewhere
        const isLetterUsedElsewhere = guessData.some((otherGuess, otherIndex) => 
          otherIndex !== i && 
          otherGuess.letter === guess.letter && 
          (otherGuess.state === 'correct' || otherGuess.state === 'present')
        );
        
        if (!isLetterUsedElsewhere && wordLetters.includes(guess.letter)) {
          console.log(`Word ${word} rejected: absent letter ${guess.letter} found in word`);
          return false;
        }
        break;
    }
  }
  
  console.log(`Word ${word} passed all constraints`);
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
