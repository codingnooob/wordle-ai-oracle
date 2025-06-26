
export function getFallbackWords(): string[] {
  // Massively expanded fallback word lists
  const wordsByLength: { [key: number]: string[] } = {
    3: [
      'THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER',
      'WAS', 'ONE', 'OUR', 'OUT', 'DAY', 'HAD', 'HAS', 'HIS', 'HOW', 'ITS',
      'MAY', 'NEW', 'NOW', 'OLD', 'SEE', 'TWO', 'WHO', 'BOY', 'DID', 'GET',
      'LET', 'MAN', 'RUN', 'SUN', 'TOP', 'WAY', 'WIN', 'YES', 'YET', 'AGO',
      'AIR', 'ART', 'ASK', 'BAD', 'BAG', 'BAR', 'BED', 'BIG', 'BIT', 'BOX',
      'CAR', 'CAT', 'CUT', 'DOG', 'EAR', 'EAT', 'END', 'EYE', 'FAR', 'FEW',
      'FUN', 'GOD', 'GOT', 'GUN', 'HAD', 'HIT', 'HOT', 'JOB', 'KEY', 'KID',
      'LAW', 'LAY', 'LEG', 'LIE', 'LOT', 'LOW', 'MAP', 'MOM', 'NET', 'OIL',
      'PAY', 'PET', 'PUT', 'RED', 'ROW', 'SAD', 'SAT', 'SAW', 'SAY', 'SEA',
      'SET', 'SIT', 'SIX', 'SKY', 'SON', 'TEN', 'TOO', 'TRY', 'USE', 'VAN',
      'WAR', 'WET', 'WHY', 'WON', 'ZOO'
    ],
    4: [
      'THAT', 'WITH', 'HAVE', 'THIS', 'WILL', 'YOUR', 'FROM', 'THEY', 'KNOW', 'WANT',
      'BEEN', 'GOOD', 'MUCH', 'SOME', 'TIME', 'VERY', 'WHEN', 'COME', 'HERE', 'JUST',
      'LIKE', 'LONG', 'MAKE', 'MANY', 'OVER', 'SUCH', 'TAKE', 'THAN', 'THEM', 'WELL',
      'BACK', 'CALL', 'CAME', 'EACH', 'FIND', 'GIVE', 'HAND', 'HIGH', 'KEEP', 'KIND',
      'LAST', 'LEFT', 'LIFE', 'LIVE', 'LOOK', 'MADE', 'MOST', 'MOVE', 'MUST', 'NAME',
      'NEAR', 'NEED', 'NEXT', 'OPEN', 'PART', 'PLAY', 'SAID', 'SAME', 'SEEM', 'SHOW',
      'SIDE', 'TELL', 'TURN', 'USED', 'WANT', 'WAYS', 'WEEK', 'WENT', 'WERE', 'WHAT',
      'WORK', 'YEAR', 'ABLE', 'AWAY', 'BOOK', 'CARE', 'CASE', 'CITY', 'COLD', 'DOOR',
      'DOWN', 'EASY', 'EVEN', 'EYES', 'FACE', 'FACT', 'FEEL', 'FIRE', 'FIVE', 'FOUR',
      'FREE', 'GAVE', 'GOES', 'HELP', 'HOME', 'HOPE', 'HOUR', 'IDEA', 'INTO', 'JOBS',
      'KIDS', 'KNEW', 'LATE', 'LESS', 'LINE', 'LOVE', 'MAIN', 'MIND', 'ONLY', 'ONCE',
      'REAL', 'ROOM', 'SAYS', 'SEEN', 'SUCH', 'SURE', 'TOWN', 'TRUE', 'WALK', 'WORD'
    ],
    5: [
      'WHICH', 'THEIR', 'WOULD', 'THERE', 'COULD', 'OTHER', 'AFTER', 'FIRST', 'NEVER', 'THESE',
      'THINK', 'WHERE', 'BEING', 'EVERY', 'GREAT', 'MIGHT', 'SHALL', 'STILL', 'THOSE', 'UNDER',
      'WHILE', 'ABOUT', 'AGAIN', 'HOUSE', 'RIGHT', 'SMALL', 'SOUND', 'PLACE', 'WORLD', 'YEARS',
      'YOUNG', 'ASKED', 'GOING', 'HEARD', 'LARGE', 'LIGHT', 'LIVED', 'MONEY', 'MUSIC', 'NIGHT',
      'OFTEN', 'ORDER', 'PAPER', 'PARTY', 'PHONE', 'POWER', 'QUITE', 'REMEMBER', 'SINCE', 'SPACE',
      'STATE', 'STORY', 'STUDY', 'THING', 'TODAY', 'TODAY', 'TOTAL', 'WATER', 'WHITE', 'WOMEN',
      'ABOVE', 'ALONE', 'ALONG', 'AMONG', 'BASED', 'BEACH', 'BEGAN', 'BELOW', 'BLOOD', 'BOARD',
      'BROWN', 'BUILD', 'BUILT', 'CHAIR', 'CHEAP', 'CHECK', 'CHILD', 'CHINA', 'CIVIL', 'CLASS',
      'CLEAN', 'CLEAR', 'CLIMB', 'CLOSE', 'COAST', 'COLOR', 'COMIC', 'COMES', 'COULD', 'COUNT',
      'COURT', 'COVER', 'CRASH', 'CRAZY', 'CRIME', 'CROSS', 'CROWD', 'DANCE', 'DEATH', 'DOING',
      'DRAMA', 'DREAM', 'DRESS', 'DRINK', 'DRIVE', 'DRIVE', 'EARLY', 'EARTH', 'ENJOY', 'ENTER',
      'EQUAL', 'ERROR', 'EVENT', 'EXTRA', 'FIELD', 'FINAL', 'FIVE', 'FIXED', 'FLOOR', 'FOCUS',
      'FORCE', 'FORMS', 'FRESH', 'FRONT', 'FULLY', 'FUNNY', 'GIRLS', 'GIVEN', 'GLASS', 'GOALS'
    ],
    6: [
      'SHOULD', 'AROUND', 'LITTLE', 'PEOPLE', 'BEFORE', 'MOTHER', 'THOUGH', 'SCHOOL', 'ALWAYS', 'REALLY',
      'ANSWER', 'APPEAR', 'DURING', 'FOLLOW', 'FRIEND', 'GROUND', 'HAPPEN', 'LETTER', 'LISTEN', 'MOMENT',
      'NUMBER', 'OBJECT', 'PLAYED', 'REASON', 'SECOND', 'SYSTEM', 'THINGS', 'TURNED', 'WALKED', 'WANTED',
      'ALMOST', 'ANIMAL', 'ANYONE', 'BETTER', 'BUDGET', 'CAMERA', 'CANNOT', 'CHANGE', 'CHOOSE', 'CLIENT',
      'COMING', 'COMMON', 'COUPLE', 'CREATE', 'CUSTOM', 'DEFEAT', 'DESIGN', 'DETAIL', 'DINNER', 'DOLLAR',
      'DOUBLE', 'EASILY', 'EFFORT', 'ENOUGH', 'ENTIRE', 'ESCAPE', 'EUROPE', 'EVENTS', 'EXCEPT', 'EXPERT',
      'FABRIC', 'FAMILY', 'FAMOUS', 'FATHER', 'FIGURE', 'FINGER', 'FINISH', 'FORGOT', 'FORMAT', 'FORMER',
      'FRANCE', 'FROZEN', 'FUTURE', 'GARDEN', 'GLOBAL', 'GROUND', 'GROWTH', 'HAPPEN', 'HEALTH', 'HIGHER',
      'HONEST', 'IMPACT', 'INCOME', 'INDEED', 'INSIDE', 'ITSELF', 'JOINED', 'KITCHEN', 'LADIES', 'LATEST',
      'LEADER', 'LEAGUE', 'LEAVES', 'LENGTH', 'LONDON', 'LOVELY', 'MANAGE', 'MANNER', 'MARKET', 'MASTER',
      'MATTER', 'MEMBER', 'MEMORY', 'MIDDLE', 'MINUTE', 'MODERN', 'MONDAY', 'NATION', 'NATURE', 'NORMAL'
    ],
    7: [
      'THROUGH', 'BETWEEN', 'ANOTHER', 'WITHOUT', 'BECAUSE', 'AGAINST', 'NOTHING', 'SOMEONE', 'TOWARDS', 'SEVERAL',
      'ALREADY', 'CHANGED', 'DECIDED', 'EVENING', 'FINALLY', 'GENERAL', 'HOWEVER', 'INSTEAD', 'KITCHEN', 'LEARNED',
      'MACHINE', 'NATURAL', 'PERHAPS', 'PRESENT', 'PROBLEM', 'QUICKLY', 'REACHED', 'STARTED', 'THOUGHT', 'VILLAGE',
      'ABILITY', 'ACCOUNT', 'ADDRESS', 'AIRPORT', 'AMAZING', 'AMERICA', 'ANCIENT', 'ANIMALS', 'APPLIED', 'ARTICLE',
      'BALANCE', 'BATTERY', 'BEDROOM', 'BELIEVE', 'BENEFIT', 'BICYCLE', 'BLANKET', 'BLOWING', 'BROTHER', 'BROWSER',
      'CABINET', 'CALCIUM', 'CALIBER', 'CALLING', 'CAPABLE', 'CAPTAIN', 'CAREFUL', 'CARRIER', 'CEILING', 'CENTRAL',
      'CENTURY', 'CERTAIN', 'CHANNEL', 'CHAPTER', 'CHARITY', 'CHICKEN', 'CIRCUIT', 'CITIZEN', 'CLIMATE', 'CLOTHES',
      'COMFORT', 'COMMAND', 'COMPANY', 'COMPARE', 'COMPETE', 'CONCEPT', 'CONCERN', 'CONNECT', 'CONTENT', 'CONTEST',
      'CONTROL', 'CORRECT', 'COUNTER', 'COUNTRY', 'COURAGE', 'COVERED', 'CREATED', 'CRYSTAL', 'CULTURE', 'CURRENT',
      'DEAL', 'DEFAULT', 'DELETED', 'DELIVER', 'DENSITY', 'DESKTOP', 'DETAILS', 'DIAMOND', 'DIGITAL', 'DISPLAY'
    ],
    8: [
      'BUSINESS', 'TOGETHER', 'CHILDREN', 'QUESTION', 'COMPLETE', 'YOURSELF', 'REMEMBER', 'ALTHOUGH', 'CONTINUE', 'POSSIBLE',
      'BIRTHDAY', 'BUILDING', 'COMPUTER', 'DISTANCE', 'EVERYONE', 'FOLLOWED', 'HAPPENED', 'INTEREST', 'LANGUAGE', 'MOUNTAIN',
      'NEIGHBOR', 'OPPOSITE', 'PICTURES', 'PROBABLY', 'STRENGTH', 'TROUBLE', 'UMBRELLA', 'VACATION', 'ACCEPTED', 'ACCIDENT',
      'ADVANCED', 'ANALYSIS', 'ANYWHERE', 'APPROACH', 'APPROVAL', 'ATTORNEY', 'AUDIENCE', 'BACHELOR', 'BALANCED', 'BASEBALL',
      'BATHROOM', 'BIRTHDAY', 'BLESSING', 'BOUNDARY', 'BROADWAY', 'BROTHERS', 'BUILDING', 'CALENDAR', 'CAPACITY', 'CATEGORY',
      'CHALLENGE', 'CHEMICAL', 'CHILDREN', 'CHRISTMAS', 'CIGARETTE', 'CIVILIAN', 'CLASSROOM', 'CLOTHING', 'COLLAPSE', 'COLONIAL',
      'COLORFUL', 'COMBINED', 'COMMONLY', 'COMPLETE', 'COMPOSED', 'COMPUTER', 'CONFUSED', 'CONGRESS', 'CONSIDER', 'CONSTANT',
      'CONTAINS', 'CONTINUE', 'CONTRACT', 'CONTRARY', 'CONTRAST', 'CONTROLS', 'CONVEYED', 'CORRIDOR', 'CREATING', 'CRIMINAL',
      'CULTURAL', 'CUSTOMER', 'DATABASE', 'DAUGHTER', 'DECISION', 'DECREASE', 'DEFEATED', 'DELIVERY', 'DEMOCRAT', 'DESCRIBE',
      'DESIGNED', 'DETAILED', 'DETECTOR', 'DIAMETER', 'DIALOGUE', 'DIRECTLY', 'DIRECTOR', 'DISABLED', 'DISASTER', 'DISCOUNT'
    ]
  };
  
  // Additional specialized word categories
  const additionalWords = [
    // Technology words
    'CODE', 'DATA', 'FILE', 'LINK', 'MENU', 'PAGE', 'SITE', 'USER', 'WIFI', 'ZOOM',
    'BACKUP', 'BROWSER', 'COOKIE', 'DELETE', 'DOMAIN', 'EMAIL', 'FOLDER', 'GOOGLE',
    'KEYBOARD', 'LAPTOP', 'MOBILE', 'ONLINE', 'PLUGIN', 'ROUTER', 'SCREEN', 'SERVER',
    
    // Science words
    'ATOM', 'CELL', 'GENE', 'HEAT', 'IRON', 'MASS', 'MOON', 'NOVA', 'OZONE', 'PHASE',
    'CARBON', 'ENERGY', 'FOSSIL', 'GALAXY', 'PLASMA', 'QUANTUM', 'SODIUM', 'THEORY',
    'BIOLOGY', 'CLIMATE', 'ECOSYSTEM', 'GRAVITY', 'HABITAT', 'MINERAL', 'NEUTRON', 'PHOTON',
    
    // Nature words
    'BARK', 'BIRD', 'CAVE', 'DEER', 'FISH', 'HAWK', 'LAKE', 'NEST', 'ROCK', 'TREE',
    'BEACH', 'CLOUD', 'FIELD', 'FLOWER', 'FOREST', 'GRASS', 'OCEAN', 'PLANT', 'RIVER', 'STONE',
    'BUTTERFLY', 'CANYON', 'DESERT', 'GLACIER', 'MEADOW', 'RAINBOW', 'SUNRISE', 'THUNDER', 'VALLEY', 'VOLCANO',
    
    // Food words
    'BEEF', 'CAKE', 'CORN', 'FISH', 'MEAT', 'MILK', 'RICE', 'SOUP', 'WINE', 'BREAD',
    'APPLE', 'BACON', 'BERRY', 'CANDY', 'CREAM', 'FRUIT', 'GRAPE', 'HONEY', 'LEMON', 'PASTA',
    'BANANA', 'BURGER', 'BUTTER', 'CARROT', 'CHEESE', 'COFFEE', 'COOKIE', 'DINNER', 'GARLIC', 'ORANGE',
    
    // Sports words
    'BALL', 'GAME', 'GOAL', 'RACE', 'TEAM', 'KICK', 'PLAY', 'SHOT', 'SWIM', 'YARD',
    'CATCH', 'COACH', 'FIELD', 'MATCH', 'PITCH', 'SCORE', 'SPORT', 'TIMER', 'TRACK', 'TRAIN',
    'ATHLETE', 'BOXING', 'CYCLING', 'DIVING', 'HOCKEY', 'RACING', 'RECORD', 'SOCCER', 'TENNIS', 'TROPHY'
  ];
  
  // Flatten all words into a single array
  const allWords: string[] = [];
  for (const lengthWords of Object.values(wordsByLength)) {
    allWords.push(...lengthWords);
  }
  allWords.push(...additionalWords);
  
  // Remove duplicates and return
  return [...new Set(allWords)];
}
