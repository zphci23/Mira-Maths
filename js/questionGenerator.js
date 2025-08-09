/**
 * Question generator module for Mira Maths
 */

const QuestionGenerator = {
    // Constants
    REPEAT_MAX: 20,
    DIFFICULTY_LEVELS: 5,
    
    // Question history to avoid repetition
    questionHistory: [],
    
    /**
     * Generate a set of questions based on settings
     * @param {Object} settings - Game settings
     * @returns {Array} - Array of question objects
     */
    generateQuestions: function(settings) {
        const { operations, maxNumber, questionCount, difficultyLevel } = settings;
        
        if (operations.length === 0) {
            throw new Error('Please select at least one operation');
        }
        
        // Reset question history
        this.questionHistory = [];
        
        // Calculate the percentage of level 3 questions based on difficulty
        // difficulty 1 (easiest) -> 50% level 3 questions
        // difficulty 5 (hardest) -> 100% level 3 questions
        const level3Percentage = 0.5 + (difficultyLevel - 1) * 0.125;
        
        const questions = [];
        
        for (let i = 0; i < questionCount; i++) {
            let attempts = 0;
            let question = null;
            
            // Try to generate a unique question
            while (question === null && attempts < this.REPEAT_MAX) {
                attempts++;
                
                // Choose a random operation from the selected ones
                const operation = operations[Math.floor(Math.random() * operations.length)];
                
                // Generate a candidate question
                const candidateQuestion = this.generateSingleQuestion(operation, maxNumber);
                
                // Determine the difficulty level of the generated question
                const questionLevel = this.getDifficultyLevel(candidateQuestion);
                
                // Check if this question meets our difficulty criteria
                const targetLevel = Math.random() < level3Percentage ? 3 : Math.floor(Math.random() * 3) + 1;
                
                if (questionLevel !== targetLevel) {
                    continue;
                }
                
                // Check if this question is a duplicate
                const isDuplicate = this.questionHistory.some(q => 
                    q.num1 === candidateQuestion.num1 && 
                    q.num2 === candidateQuestion.num2 && 
                    q.operation === candidateQuestion.operation
                );
                
                if (!isDuplicate) {
                    question = candidateQuestion;
                    this.questionHistory.push(question);
                }
            }
            
            // If we couldn't generate a unique question after max attempts, just use the last candidate
            if (question === null) {
                const operation = operations[Math.floor(Math.random() * operations.length)];
                question = this.generateSingleQuestion(operation, maxNumber);
                this.questionHistory.push(question);
            }
            
            questions.push(question);
        }
        
        return questions;
    },
    
    /**
     * Generate a single question
     * @param {string} operation - Type of operation
     * @param {number} maxNumber - Maximum number to use
     * @returns {Object} - Question object
     */
    generateSingleQuestion: function(operation, maxNumber) {
        let num1, num2, answer;
        
        switch(operation) {
            case 'addition':
                // For addition, make sure sum is <= maxNumber
                num2 = Utils.getRandomInt(1, maxNumber - 1);
                num1 = Utils.getRandomInt(1, maxNumber - num2);
                answer = num1 + num2;
                break;
                
            case 'subtraction':
                // For subtraction, make sure result is positive
                num1 = Utils.getRandomInt(2, maxNumber);
                num2 = Utils.getRandomInt(1, num1 - 1);
                answer = num1 - num2;
                break;
                
            case 'multiplication':
                // For multiplication, make sure product is <= maxNumber
                if (maxNumber < 4) {
                    num1 = 1;
                    num2 = 1;
                } else {
                    // Find two factors that multiply to <= maxNumber
                    const maxFactor = Math.floor(Math.sqrt(maxNumber));
                    num1 = Utils.getRandomInt(1, maxFactor);
                    // Ensure num2 * num1 <= maxNumber
                    const maxNum2 = Math.floor(maxNumber / num1);
                    num2 = Utils.getRandomInt(1, maxNum2);
                }
                answer = num1 * num2;
                break;
                
            case 'division':
                // For division, ensure it's an exact division (no remainder)
                // First pick the answer (within range)
                answer = Utils.getRandomInt(1, Math.min(10, maxNumber));
                // Then pick the second number (multiplier)
                num2 = Utils.getRandomInt(1, Math.floor(maxNumber / answer));
                // Calculate first number
                num1 = answer * num2;
                break;
                
            default:
                num1 = Utils.getRandomInt(1, Math.floor(maxNumber / 2));
                num2 = Utils.getRandomInt(1, Math.floor(maxNumber / 2));
                answer = num1 + num2;
                operation = 'addition';
        }
        
        return {
            num1,
            num2,
            operation,
            answer,
            userAnswer: null,
            isCorrect: null,
            timeElapsed: 0
        };
    },
    
    /**
     * Get difficulty level of a question
     * @param {Object} question - Question object
     * @returns {number} - Difficulty level (1-3)
     */
    getDifficultyLevel: function(question) {
        const { num1, num2, operation } = question;
        
        // If either number is less than 6, it's a level 1 question
        if (num1 < 6 || num2 < 6) {
            return 1;
        }

        // if operation is subtraction, and the answer is less than 3
        if (operation === 'subtraction' && question.answer < 3) {
            return 1;
        }

        // If either number is a multiple of 5, it's a level 2 question
        if (num1 % 5 === 0 || num2 % 5 === 0) {
            return 2;
        }
        
        // Otherwise it's a level 3 question
        return 3;
    },
    
    /**
     * Format a question for display
     * @param {Object} question - Question object
     * @returns {string} - Formatted question
     */
    formatQuestion: function(question) {
        const symbol = Utils.getOperationSymbol(question.operation);
        return `${question.num1} ${symbol} ${question.num2} = ?`;
    }
};
