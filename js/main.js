/**
 * Main application entry point for Mira Maths
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the app
    initApp();
    
    // Handle custom input fields
    setupCustomInputs();
    
    // Setup event listeners
    setupEventListeners();
    
    // Setup beforeunload warning
    setupBeforeUnloadWarning();
});

/**
 * Initialize the app with default values
 */
function initApp() {
    // Set default screen
    Utils.showScreen('settings-screen');
}

/**
 * Setup custom input fields to activate their radio buttons
 */
function setupCustomInputs() {
    // Max number custom input
    const customMaxNumber = document.getElementById('custom-max-number');
    const customMaxNumberRadio = document.getElementById('custom-max-number-radio');

    customMaxNumber.addEventListener('focus', () => {
        customMaxNumberRadio.checked = true;
    });

    customMaxNumber.addEventListener('input', () => {
        customMaxNumberRadio.checked = true;
    });

    // Question count custom input
    const customQuestionCount = document.getElementById('custom-question-count');
    const customQuestionCountRadio = document.getElementById('custom-question-count-radio');

    customQuestionCount.addEventListener('focus', () => {
        customQuestionCountRadio.checked = true;
    });

    customQuestionCount.addEventListener('input', () => {
        customQuestionCountRadio.checked = true;
    });

    // Time per question custom input
    const customTime = document.getElementById('custom-time');
    const customTimeRadio = document.getElementById('custom-time-radio');

    customTime.addEventListener('focus', () => {
        customTimeRadio.checked = true;
    });

    customTime.addEventListener('input', () => {
        customTimeRadio.checked = true;
    });
}

/**
 * Setup event listeners for buttons and user interactions
 */
function setupEventListeners() {
    // Start timed mode button
    document.getElementById('start-timed').addEventListener('click', () => {
        try {
            // Get settings from form
            const settings = Utils.getSettings();
            settings.practiceMode = 'timed';

            // Validate settings
            if (settings.operations.length === 0) {
                alert('Please select at least one operation.');
                return;
            }

            // Initialize and start the game
            Game.init(settings);
        } catch (error) {
            alert(error.message);
        }
    });

    // Start worksheet mode button
    document.getElementById('start-worksheet').addEventListener('click', () => {
        try {
            // Get settings from form
            const settings = Utils.getSettings();
            settings.practiceMode = 'all-at-once';
            settings.debugMode = false;

            // Validate settings
            if (settings.operations.length === 0) {
                alert('Please select at least one operation.');
                return;
            }

            // Initialize and start the game
            Game.init(settings);
        } catch (error) {
            alert(error.message);
        }
    });

    // Start debug mode button
    document.getElementById('start-debug').addEventListener('click', () => {
        try {
            // Get settings from form
            const settings = Utils.getSettings();
            settings.practiceMode = 'all-at-once';
            settings.debugMode = true;

            // Validate settings
            if (settings.operations.length === 0) {
                alert('Please select at least one operation.');
                return;
            }

            // Initialize and start the game
            Game.init(settings);
        } catch (error) {
            alert(error.message);
        }
    });
    
    // Retry button
    document.getElementById('retry-game').addEventListener('click', () => {
        try {
            // Get the same settings and start a new game with the same mode
            const settings = Utils.getSettings();
            // Use the last used mode (timed or all-at-once)
            settings.practiceMode = Game.lastUsedMode || 'timed';
            // Preserve debugMode if it was used
            settings.debugMode = Game.settings?.debugMode || false;
            Game.init(settings);
        } catch (error) {
            alert(error.message);
        }
    });
    
    // New game button (change settings)
    document.getElementById('new-game').addEventListener('click', () => {
        Utils.showScreen('settings-screen');
    });

    // Back button from quiz screen
    document.getElementById('back-from-quiz').addEventListener('click', () => {
        Utils.showScreen('settings-screen');
    });

    // Back button from worksheet screen
    document.getElementById('back-from-worksheet').addEventListener('click', () => {
        Utils.showScreen('settings-screen');
    });

    // Prevent form submission
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
        });
    });
}

/**
 * Setup warning before user navigates away during active game
 */
function setupBeforeUnloadWarning() {
    window.addEventListener('beforeunload', (e) => {
        if (Game.isGameInProgress()) {
            // Show a confirmation dialog if game is in progress
            e.preventDefault();
            e.returnValue = 'You have an active game in progress. Are you sure you want to leave?';
            return e.returnValue;
        }
    });
}
