/**
 * Question generator module for Mira Maths
 */

const QuestionGenerator = {
    // Constants
    REPEAT_MAX: 20,
    DIFFICULTY_LEVELS: 5,
    ONE_SINGLE_NUMBER: true,
    
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

        // if difficultyLevel is max, set ONE_SINGLE_NUMBER to false
        if (difficultyLevel === this.DIFFICULTY_LEVELS) {
            this.ONE_SINGLE_NUMBER = false;
        }

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
                const questionLevel = this.getDifficultyLevel(candidateQuestion, maxNumber);
                
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

        function getOperands(maxNumber, oneSingleNumber) {
            if (oneSingleNumber) {
                // At least one operand < 10
                if (Math.random() < 0.5) {
                    return [Utils.getRandomInt(1, 9), Utils.getRandomInt(1, maxNumber)];
                } else {
                    return [Utils.getRandomInt(1, maxNumber), Utils.getRandomInt(1, 9)];
                }
            } else {
                return [Utils.getRandomInt(1, maxNumber), Utils.getRandomInt(1, maxNumber)];
            }
        }

        switch(operation) {
            case 'addition': {
                [num1, num2] = getOperands(maxNumber, this.ONE_SINGLE_NUMBER);
                answer = num1 + num2;
                break;
            }
            case 'subtraction': {
                [num1, num2] = getOperands(maxNumber, this.ONE_SINGLE_NUMBER);
                if (num2 > num1) {
                    [num1, num2] = [num2, num1];
                }
                answer = num1 - num2;
                break;
            }
            case 'multiplication': {
                [num1, num2] = getOperands(maxNumber, this.ONE_SINGLE_NUMBER);
                answer = num1 * num2;
                break;
            }
            case 'division': {
                // For division, ensure exact division and both operands <= maxNumber
                if (this.ONE_SINGLE_NUMBER) {
                    if (Math.random() < 0.5) {
                        num2 = Utils.getRandomInt(1, 9);
                        answer = Utils.getRandomInt(1, maxNumber);
                    } else {
                        num2 = Utils.getRandomInt(1, maxNumber);
                        answer = Utils.getRandomInt(1, 9);
                    }
                } else {
                    num2 = Utils.getRandomInt(1, maxNumber);
                    answer = Utils.getRandomInt(1, maxNumber);
                }
                num1 = num2 * answer;
                if (num1 > maxNumber) {
                    num1 = maxNumber;
                    answer = Math.floor(num1 / num2);
                }
                break;
            }
            default: {
                [num1, num2] = getOperands(maxNumber, this.ONE_SINGLE_NUMBER);
                answer = num1 + num2;
                operation = 'addition';
            }
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
    getDifficultyLevel: function(question, maxNumber) {
        const { num1, num2, operation } = question;
        
        // If either number is less than 6, it's a level 1 question
        if (num1 < 6 || num2 < 6) {
            return 1;
        }

        // if operation is subtraction, and the answer is less than 3, it's a level 1 question
        if (operation === 'subtraction' && question.answer < 3) {
            return 1;
        }

        // If either number is a multiple of 5, it's a level 2 question
        if (num1 % 5 === 0 || num2 % 5 === 0) {
            return 2;
        }

        // if either maxNumber > 10 and one of the numbers is less than 10, it's a level 2 question
        if (maxNumber > 10 && (num1 < 10 || num2 < 10)) {
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
