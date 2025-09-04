// Utility functions for managing game progress

export const saveGameProgress = (gameId, progress) => {
    try {
        const savedGames = getSavedGames();
        savedGames[gameId] = {
            ...progress,
            timestamp: Date.now()
        };
        localStorage.setItem('gameProgress', JSON.stringify(savedGames));
    } catch (error) {
        console.error('Error saving game progress:', error);
    }
};

export const getGameProgress = (gameId) => {
    try {
        const savedGames = getSavedGames();
        return savedGames[gameId] || null;
    } catch (error) {
        console.error('Error getting game progress:', error);
        return null;
    }
};

export const clearGameProgress = (gameId) => {
    try {
        const savedGames = getSavedGames();
        delete savedGames[gameId];
        localStorage.setItem('gameProgress', JSON.stringify(savedGames));
    } catch (error) {
        console.error('Error clearing game progress:', error);
    }
};

export const getSavedGames = () => {
    try {
        const saved = localStorage.getItem('gameProgress');
        return saved ? JSON.parse(saved) : {};
    } catch (error) {
        console.error('Error getting saved games:', error);
        return {};
    }
};

export const hasGameProgress = (gameId) => {
    const progress = getGameProgress(gameId);
    return progress !== null;
};

// Game ID mapping for consistency
export const GAME_IDS = {
    WHAT_DOESNT_BELONG: 'what-doesnt-belong',
    NAME_THE_CATEGORY: 'name-the-category',
    MATCHING: 'matching',
    COMPARE_CONTRAST: 'compare-contrast',
    GUESS_THE_MISSING: 'guess-the-missing',
    SORT_INTO_CATEGORIES: 'sort-into-categories',
    VOCABULARY: 'vocabulary',
    DIAMOND: 'diamond',
    SCENE_CARD: 'scene-card'
};
