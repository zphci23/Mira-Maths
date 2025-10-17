/**
 * Question generator module for Mira Maths
 */

const QuestionGenerator = {
    // Constants
    REPEAT_MAX: 20,
    DIFFICULTY_LEVELS: 5,

    // Question history to avoid repetition
    questionHistory: [],

    // Current difficulty setting (will be set during question generation)
    currentDifficulty: 1,
    
    /**
     * Select a target difficulty level based on the game difficulty setting
     * @param {number} difficultyLevel - Game difficulty level (1-5)
     * @returns {number} - Target question level (1-3)
     */
    selectTargetLevel: function(difficultyLevel) {
        const rand = Math.random();

        switch(difficultyLevel) {
            case 1:
                // 50% level 3, 30% level 2, 20% level 1
                if (rand < 0.50) return 3;
                if (rand < 0.80) return 2;
                return 1;

            case 2:
                // 60% level 3, 30% level 2, 10% level 1
                if (rand < 0.60) return 3;
                if (rand < 0.90) return 2;
                return 1;

            case 3:
                // 75% level 3, 20% level 2, 5% level 1
                if (rand < 0.75) return 3;
                if (rand < 0.95) return 2;
                return 1;

            case 4:
                // 90% level 3, 9% level 2, 1% level 1
                if (rand < 0.90) return 3;
                if (rand < 0.99) return 2;
                return 1;

            case 5:
            default:
                // 100% level 3 (all hard questions)
                return 3;
        }
    },

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

        // Reset question history and store current difficulty
        this.questionHistory = [];
        this.currentDifficulty = difficultyLevel;

        // Calculate difficulty distribution based on difficulty level
        // difficulty 1: 50% level 3, 30% level 2, 20% level 1
        // difficulty 2: 60% level 3, 30% level 2, 10% level 1
        // difficulty 3: 75% level 3, 20% level 2, 5% level 1
        // difficulty 4: 90% level 3, 9% level 2, 1% level 1
        // difficulty 5: 100% level 3, 0% level 2, 0% level 1

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
                const targetLevel = this.selectTargetLevel(difficultyLevel);

                if (questionLevel !== targetLevel) {
                    continue;
                }

                // Check if this question is a duplicate
                const isDuplicate = this.questionHistory.some(q =>
                    q.num1 === candidateQuestion.num1 &&
                    q.num2 === candidateQuestion.num2 &&
                    q.operation === candidateQuestion.operation
                );

                if (isDuplicate) {
                    continue;
                }

                // Check if this question is too similar to the previous one
                // Avoid patterns like 3×9 followed by 3×8
                if (this.questionHistory.length > 0) {
                    const lastQuestion = this.questionHistory[this.questionHistory.length - 1];

                    // Check if same operation and shares an operand
                    if (lastQuestion.operation === candidateQuestion.operation) {
                        const shareOperand = (lastQuestion.num1 === candidateQuestion.num1 ||
                                            lastQuestion.num1 === candidateQuestion.num2 ||
                                            lastQuestion.num2 === candidateQuestion.num1 ||
                                            lastQuestion.num2 === candidateQuestion.num2);

                        if (shareOperand) {
                            continue;
                        }
                    }
                }

                question = candidateQuestion;
                this.questionHistory.push(question);
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

        function getOperands(maxNumber, difficulty, operation) {
            // For multiplication and division, cap operands at 10 (multiplication tables)
            const effectiveMax = (operation === 'multiplication' || operation === 'division')
                ? Math.min(maxNumber, 10)
                : maxNumber;

            // Difficulty 1-2: At least one operand < 10
            // Difficulty 3-4: Mix of easier and harder
            // Difficulty 5: Any combination allowed

            if (difficulty <= 2) {
                // Easy mode: one operand < 10
                if (Math.random() < 0.5) {
                    return [Utils.getRandomInt(1, 9), Utils.getRandomInt(1, effectiveMax)];
                } else {
                    return [Utils.getRandomInt(1, effectiveMax), Utils.getRandomInt(1, 9)];
                }
            } else if (difficulty <= 4) {
                // Medium mode: 70% chance both operands can be any value
                if (Math.random() < 0.7) {
                    return [Utils.getRandomInt(1, effectiveMax), Utils.getRandomInt(1, effectiveMax)];
                } else {
                    // 30% chance one operand < 10
                    if (Math.random() < 0.5) {
                        return [Utils.getRandomInt(1, 9), Utils.getRandomInt(1, effectiveMax)];
                    } else {
                        return [Utils.getRandomInt(1, effectiveMax), Utils.getRandomInt(1, 9)];
                    }
                }
            } else {
                // Hard mode: both operands can be any value
                return [Utils.getRandomInt(1, effectiveMax), Utils.getRandomInt(1, effectiveMax)];
            }
        }

        switch(operation) {
            case 'addition': {
                [num1, num2] = getOperands(maxNumber, this.currentDifficulty, operation);
                answer = num1 + num2;
                break;
            }
            case 'subtraction': {
                [num1, num2] = getOperands(maxNumber, this.currentDifficulty, operation);
                if (num2 > num1) {
                    [num1, num2] = [num2, num1];
                }
                answer = num1 - num2;
                break;
            }
            case 'multiplication': {
                [num1, num2] = getOperands(maxNumber, this.currentDifficulty, operation);
                answer = num1 * num2;
                break;
            }
            case 'division': {
                // For division, cap at multiplication table (1-10) like multiplication
                const divMax = Math.min(maxNumber, 10);

                // For division, ensure exact division and both operands <= divMax
                if (this.currentDifficulty <= 2) {
                    // Easy mode: one operand < 5
                    if (Math.random() < 0.5) {
                        num2 = Utils.getRandomInt(2, 5);
                        answer = Utils.getRandomInt(1, divMax);
                    } else {
                        num2 = Utils.getRandomInt(2, divMax);
                        answer = Utils.getRandomInt(1, 5);
                    }
                } else if (this.currentDifficulty <= 4) {
                    // Medium mode: 70% chance both can be larger
                    if (Math.random() < 0.7) {
                        num2 = Utils.getRandomInt(2, divMax);
                        answer = Utils.getRandomInt(1, divMax);
                    } else {
                        if (Math.random() < 0.5) {
                            num2 = Utils.getRandomInt(2, 5);
                            answer = Utils.getRandomInt(1, divMax);
                        } else {
                            num2 = Utils.getRandomInt(2, divMax);
                            answer = Utils.getRandomInt(1, 5);
                        }
                    }
                } else {
                    // Hard mode: both can be any value (within multiplication table range)
                    num2 = Utils.getRandomInt(2, divMax);
                    answer = Utils.getRandomInt(1, divMax);
                }
                num1 = num2 * answer;
                break;
            }
            default: {
                [num1, num2] = getOperands(maxNumber, this.currentDifficulty, 'addition');
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
        const { num1, num2, operation, answer } = question;

        // Special handling for multiplication
        if (operation === 'multiplication') {
            // Level 1 (Easy): Either number < 3 (1x, 2x tables)
            if (num1 < 3 || num2 < 3) {
                return 1;
            }

            // Level 2 (Medium): Either number < 6 (3x, 4x, 5x tables)
            if (num1 < 6 || num2 < 6) {
                return 2;
            }

            // Level 3 (Hard): Both numbers ≥ 6 (6x6 and above)
            return 3;
        }

        // For addition, subtraction, division:

        // Level 1 (Easy): Very simple questions
        // - Both numbers ≤ 3, OR
        // - Either number is 1 or 2
        if ((num1 <= 3 && num2 <= 3) || num1 <= 2 || num2 <= 2) {
            return 1;
        }

        // Level 2 (Medium): Questions that are easier due to patterns
        // - Both numbers are multiples of 10 (10+10, 20-10), OR
        // - Both numbers less than 6 (5+5, 4+3), OR
        // - Either number is a multiple of 10 (20-7, 10+9), OR
        // - Subtraction where numbers are very close (14-4, 15-5), OR
        // - Addition where answer is a multiple of 10 (19+11=30, 17+13=30), OR
        // - Addition where both ones digits are the same (16+6, 18+8, 13+3)
        if ((num1 % 10 === 0 && num2 % 10 === 0) || (num1 < 6 && num2 < 6)) {
            return 2;
        }

        // Easy patterns with multiples of 10
        if (num1 % 10 === 0 || num2 % 10 === 0) {
            return 2;
        }

        // Addition where the answer is a multiple of 10
        if (operation === 'addition' && answer % 10 === 0) {
            return 2;
        }

        // Addition where both ones digits are the same (16+6, 18+8, 13+3)
        if (operation === 'addition' && (num1 % 10 === num2 || num2 % 10 === num1)) {
            return 2;
        }

        // Subtraction where the second number matches the ones digit (14-4, 17-7)
        if (operation === 'subtraction' && num1 % 10 === num2) {
            return 2;
        }

        // Subtraction with small answers (easier to verify)
        if (operation === 'subtraction' && answer <= 5) {
            return 2;
        }

        // Subtraction where numbers are close together (18-13, 16-11, 19-14)
        if (operation === 'subtraction' && (num1 - num2) <= 10) {
            return 2;
        }

        // Level 3 (Hard): Everything else
        // This includes questions like 17-9, 25-8, 23-6, 20-7
        return 3;
    },
    
    /**
     * Format a question for display
     * @param {Object} question - Question object
     * @returns {string} - Formatted question
     */
    formatQuestion: function(question) {
        const symbol = Utils.getOperationSymbol(question.operation);
        return `${question.num1} ${symbol} ${question.num2} =`;
    }
};
