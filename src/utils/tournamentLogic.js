// Base Stats defined by default Power Level tiers
const BASE_STAT_TIERS = {
    // SUPERIOR power class for Jinchurikis, key Kekkei Genkai, and Legendary Clans
    LEGENDARY_TIER: { attack: 150, defense: 140, speed: 150, intelligence: 150, chakra: 200 }, 
    ELITE_JONIN_TIER: { attack: 130, defense: 120, speed: 130, intelligence: 130, chakra: 150 },
    JONIN_TIER: { attack: 110, defense: 110, speed: 110, intelligence: 110, chakra: 130 },
    CHUNIN_TIER: { attack: 85, defense: 85, speed: 85, intelligence: 85, chakra: 100 },
    GENIN_TIER: { attack: 60, defense: 60, speed: 60, intelligence: 60, chakra: 80 },
};

// Manual EXCEPTION MAPPING Only for characters with a unique stat distribution, not general level increase
const LORE_STAT_EXCEPTIONS = {
    'shikamaru nara': { attack: 60, defense: 70, speed: 80, intelligence: 180, chakra: 90 },     // Extreme intelligence
    'rock lee': { attack: 120, defense: 80, speed: 150, intelligence: 60, chakra: 70 },          // Extreme speed and Taijutsu
};

// Clan Bonuses
const CLAN_BONUS_MULTIPLIERS = {
    'uchiha': 1.15,      
    'uzumaki': 1.15,     
    'hyuga': 1.1,       
    'senju': 1.5,       
};

// Nature and General Power Bonuses
const MULTI_NATURE_BONUS = 1.1; 

const POWER_MODIFIERS = {
    // Minimum randomness (0.95 to 1.05)
    RANDOM_MIN: 0.95, 
    RANDOM_RANGE: 0.1, 
    
    // Lore Bonuses 
    JINCHURIKI_BOOST: 2.5,      
    KEKKEI_GENKAI_BOOST: 1.7,   
    HIGH_CHAKRA_BOOST: 2.0,     
    ELITE_AFFILIATION_BONUS: 1.1, 
};

// --------------------------------------------------------------------------

/**
 * Creates a fighter object: Assigns BASE STATS and calculates API BONUSES.
 */
export const createFighterObject = (apiCharacter) => {
    const characterNameLower = apiCharacter.name.toLowerCase();
    const personalData = apiCharacter.personal || {};
    
    // 1. Assign Base Stats 
    let fighterStats = { ...BASE_STAT_TIERS.CHUNIN_TIER }; 
    let baseChakra = BASE_STAT_TIERS.CHUNIN_TIER.chakra;
    
    // 2. Check for Manual DISTRIBUTION Exceptions 
    const isStatException = LORE_STAT_EXCEPTIONS[characterNameLower];
    if (isStatException) {
        fighterStats = { 
            attack: isStatException.attack, 
            defense: isStatException.defense, 
            speed: isStatException.speed, 
            intelligence: isStatException.intelligence, 
            chakra: isStatException.chakra 
        };
        baseChakra = isStatException.chakra;
    }

    // 3. Get Bonuses and Elite Affiliation from the API data
    const affiliations = apiCharacter.affiliations?.map(affiliation => affiliation.toLowerCase()) || [];
    const clans = apiCharacter.clans?.map(clanName => clanName.toLowerCase()) || [];
    const natureTypes = personalData.natureType || []; 

    const isEliteAffiliate = affiliations.some(affiliation => affiliation.includes('kage') || affiliation.includes('akatsuki') || affiliation.includes('sannin'));
    const hasKekkeiGenkai = apiCharacter.kekkeiGenkai?.length > 0;
    const isJinchuriki = personalData.TailedBeast || personalData.jinchuriki;

    // Calculate Clan Bonus 
    let clanMultiplier = 1;
    let isLegendaryClan = false;
    for (const clanName of clans) {
        if (CLAN_BONUS_MULTIPLIERS[clanName]) {
            clanMultiplier = CLAN_BONUS_MULTIPLIERS[clanName];
            if (clanMultiplier > 1.1) {
                isLegendaryClan = true;
            }
            break; 
        }
    }
    
   
    if (!isStatException) { 

        // PART A: Protagonist Mapping ENSURES Naruto/Sasuke are always LEGENDARY
        if (characterNameLower.includes('naruto') || characterNameLower.includes('sasuke') || characterNameLower.includes('madara') || characterNameLower.includes('hashirama')) {
             fighterStats = { ...BASE_STAT_TIERS.LEGENDARY_TIER };
             baseChakra = BASE_STAT_TIERS.LEGENDARY_TIER.chakra;
        } 
        
        // PART B: Categorical Bonus Assignment For other characters
        else if (isJinchuriki || hasKekkeiGenkai || isLegendaryClan) {
            // Characters with large bonuses Itachi, Minato, Killer Bee
            fighterStats = { ...BASE_STAT_TIERS.LEGENDARY_TIER };
            baseChakra = BASE_STAT_TIERS.LEGENDARY_TIER.chakra;
        } 
        
        // PART C: Assignment for Elites without strong categorical bonuses 
        else if (isEliteAffiliate) {
            fighterStats = { ...BASE_STAT_TIERS.ELITE_JONIN_TIER };
            baseChakra = BASE_STAT_TIERS.ELITE_JONIN_TIER.chakra;
        } 
        
        // PART D: Default assignment
        else {
            fighterStats = { ...BASE_STAT_TIERS.JONIN_TIER };
            baseChakra = BASE_STAT_TIERS.JONIN_TIER.chakra;
        }
    } // End of the if 
    
    // Calculate Nature Bonus 
    const natureMasteryMultiplier = natureTypes.length >= 3 ? MULTI_NATURE_BONUS : 1;
    
    // 4. Return the Final Object
    return {
        id: apiCharacter.id,
        name: apiCharacter.name || 'Unknown Ninja', 
        image: apiCharacter.images?.[0] || "https://placehold.co/150/FF4500/FFFFFF?text=No+Image",
        stats: { ...fighterStats, chakra: baseChakra }, 
        
        // Combat Multiplier Properties 
        isJinchuriki: !!isJinchuriki,
        hasKekkeiGenkai: hasKekkeiGenkai,
        isEliteClass: isEliteAffiliate,
        hasHighChakra: baseChakra >= 150,

        // LORE MULTIPLIERS
        clanBonusMultiplier: clanMultiplier,
        natureMasteryMultiplier: natureMasteryMultiplier,
    };
};

// --------------------------------------------------------------------------

// Simulates a fight 
 
export const simulateFight = (fighterA, fighterB) => {
    // 1. Calculate base power with ADJUSTED LORE WEIGHTS
    const powerA_Base = (fighterA.stats.attack * 1.6) + (fighterA.stats.defense * 1.1) + (fighterA.stats.speed * 0.8) + (fighterA.stats.intelligence * 1.5);
    const powerB_Base = (fighterB.stats.attack * 1.6) + (fighterB.stats.defense * 1.1) + (fighterB.stats.speed * 0.8) + (fighterB.stats.intelligence * 1.5);
    
    let scoreA = powerA_Base;
    let scoreB = powerB_Base;
    
    // 2. Apply LORE Modifiers
    
    // Jinchuriki (The most decisive factor)
    if (fighterA.isJinchuriki) scoreA *= POWER_MODIFIERS.JINCHURIKI_BOOST; 
    if (fighterB.isJinchuriki) scoreB *= POWER_MODIFIERS.JINCHURIKI_BOOST;

    // High Chakra 
    if (fighterA.hasHighChakra && !fighterA.isJinchuriki) scoreA *= POWER_MODIFIERS.HIGH_CHAKRA_BOOST; 
    if (fighterB.hasHighChakra && !fighterB.isJinchuriki) scoreB *= POWER_MODIFIERS.HIGH_CHAKRA_BOOST;
    
    // Kekkei Genkai 
    if (fighterA.hasKekkeiGenkai) scoreA *= POWER_MODIFIERS.KEKKEI_GENKAI_BOOST;
    if (fighterB.hasKekkeiGenkai) scoreB *= POWER_MODIFIERS.KEKKEI_GENKAI_BOOST;

    // ADDITIONAL BONUSES Clan and Nature Mastery
    scoreA *= fighterA.clanBonusMultiplier;
    scoreB *= fighterB.clanBonusMultiplier;
    
    scoreA *= fighterA.natureMasteryMultiplier;
    scoreB *= fighterB.natureMasteryMultiplier;
    
    // Elite Affiliation Bonus 
    if (fighterA.isEliteClass) scoreA *= POWER_MODIFIERS.ELITE_AFFILIATION_BONUS;
    if (fighterB.isEliteClass) scoreB *= POWER_MODIFIERS.ELITE_AFFILIATION_BONUS;

    // 3. Minimum Randomness 
    const randomFactorA = POWER_MODIFIERS.RANDOM_MIN + POWER_MODIFIERS.RANDOM_RANGE * Math.random();
    const randomFactorB = POWER_MODIFIERS.RANDOM_MIN + POWER_MODIFIERS.RANDOM_RANGE * Math.random();
    
    scoreA *= randomFactorA; 
    scoreB *= randomFactorB;
    
    // Return the fighter with the highest final score
    return scoreA > scoreB ? fighterA : fighterB;
};