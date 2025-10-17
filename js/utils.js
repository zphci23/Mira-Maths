/**
 * Utility functions for the Mira Maths app
 */

const Utils = {
    /**
     * Get a random integer between min and max (inclusive)
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} - Random integer
     */
    getRandomInt: function(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    /**
     * Shuffles an array using Fisher-Yates algorithm
     * @param {Array} array - Array to shuffle
     * @returns {Array} - Shuffled array
     */
    shuffleArray: function(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },
    
    /**
     * Format a math operation symbol
     * @param {string} operation - Operation name
     * @returns {string} - Operation symbol
     */
    getOperationSymbol: function(operation) {
        switch(operation) {
            case 'addition': return '+';
            case 'subtraction': return '-';
            case 'multiplication': return '×';
            case 'division': return '÷';
            default: return '+';
        }
    },
    
    /**
     * Check if two objects are equal in content
     * @param {Object} obj1 - First object
     * @param {Object} obj2 - Second object
     * @returns {boolean} - True if objects are equal
     */
    objectsEqual: function(obj1, obj2) {
        return JSON.stringify(obj1) === JSON.stringify(obj2);
    },
    
    /**
     * Get settings from form inputs
     * @returns {Object} - Settings object
     */
    getSettings: function() {
        // Get selected operations
        const operations = [];
        document.querySelectorAll('input[name="operation"]:checked').forEach(checkbox => {
            operations.push(checkbox.value);
        });

        // Get max number
        let maxNumber = 20;
        const maxNumberRadio = document.querySelector('input[name="max-number"]:checked');
        if (maxNumberRadio.value === 'custom') {
            maxNumber = parseInt(document.getElementById('custom-max-number').value) || 20;
        } else {
            maxNumber = parseInt(maxNumberRadio.value);
        }

        // Get question count
        let questionCount = 10;
        const questionCountRadio = document.querySelector('input[name="question-count"]:checked');
        if (questionCountRadio.value === 'custom') {
            questionCount = parseInt(document.getElementById('custom-question-count').value) || 10;
        } else {
            questionCount = parseInt(questionCountRadio.value);
        }

        // Get time per question
        let timePerQuestion = 10;
        const timeRadio = document.querySelector('input[name="time-per-question"]:checked');
        if (timeRadio) {
            if (timeRadio.value === 'custom') {
                timePerQuestion = parseInt(document.getElementById('custom-time').value) || 10;
            } else {
                timePerQuestion = parseInt(timeRadio.value);
            }
        }

        // Get difficulty level
        const difficultyLevel = parseInt(document.getElementById('difficulty-slider').value);

        return {
            operations,
            maxNumber,
            questionCount,
            timePerQuestion,
            difficultyLevel
        };
    },
    
    /**
     * Show a specific screen and hide others
     * @param {string} screenId - ID of screen to show
     */
    showScreen: function(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }
};
