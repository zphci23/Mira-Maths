/**
 * Game controller for Mira Maths
 */

const Game = {
    // Event handler references for cleanup
    _answerInputHandler: null,
    _answerKeydownHandler: null,
    _submitBtnHandler: null,
    // Game state
    settings: null,
    questions: [],
    currentQuestionIndex: 0,
    score: 0,
    gameInProgress: false,
    
    // DOM elements
    timerBar: null,
    questionElement: null,
    answerInput: null,
    feedbackElement: null,
    currentQuestionIndicator: null,
    totalQuestionsIndicator: null,
    progressFill: null,
    
    /**
     * Initialize the game with settings
     * @param {Object} settings - Game settings
     */
    init: function(settings) {
        // Store settings
        this.settings = settings;

        // Reset game state
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;

        // Generate questions
        this.questions = QuestionGenerator.generateQuestions(settings);

        // Flag game as in progress
        this.gameInProgress = true;

        // Check practice mode
        if (settings.practiceMode === 'all-at-once') {
            this.initAllAtOnceMode();
        } else {
            this.initTimedMode();
        }
    },

    /**
     * Initialize timed mode (one-by-one questions)
     */
    initTimedMode: function() {
        // Get DOM elements
        this.timerBar = document.getElementById('timer-bar');
        this.questionElement = document.getElementById('question');
        this.answerInput = document.getElementById('answer-input');
        this.feedbackElement = document.getElementById('feedback');
        this.currentQuestionIndicator = document.getElementById('current-question');
        this.totalQuestionsIndicator = document.getElementById('total-questions');
        this.progressFill = document.querySelector('.progress-fill');

        // Initialize timer
        Timer.init(this.settings.timePerQuestion, this.timerBar, {
            onWarning: () => this.onTimerWarning(),
            onDanger: () => this.onTimerDanger(),
            onComplete: () => this.onTimerComplete()
        });

        // Update UI
        this.totalQuestionsIndicator.textContent = this.settings.questionCount;

        // Remove previous listeners if they exist
        if (this._submitBtnHandler) {
            document.getElementById('submit-answer').removeEventListener('click', this._submitBtnHandler);
        }
        if (this._answerKeydownHandler) {
            this.answerInput.removeEventListener('keydown', this._answerKeydownHandler);
        }
        if (this._answerInputHandler) {
            this.answerInput.removeEventListener('input', this._answerInputHandler);
        }

        // Define named handler functions
        this._submitBtnHandler = () => this.submitAnswer();
        this._answerKeydownHandler = (e) => {
            if (e.key === 'Enter') {
                this.submitAnswer();
            }
        };
        this._answerInputHandler = () => {
            const userAnswer = parseInt(this.answerInput.value);
            const currentQuestion = this.getCurrentQuestion();
            if (!isNaN(userAnswer) && userAnswer === currentQuestion.answer) {
                this.submitAnswer();
            }
        };

        // Add listeners
        document.getElementById('submit-answer').addEventListener('click', this._submitBtnHandler);
        this.answerInput.addEventListener('keydown', this._answerKeydownHandler);
        this.answerInput.addEventListener('input', this._answerInputHandler);

        // Show game screen
        Utils.showScreen('game-screen');

        // Start with first question
        this.showQuestion(0);
    },

    /**
     * Initialize all-at-once mode (all questions on one page)
     */
    initAllAtOnceMode: function() {
        // Get container
        const container = document.getElementById('all-questions-container');
        container.innerHTML = '';

        // Check if debug mode is enabled
        const isDebugMode = this.settings.debugMode || false;

        // Update header text if debug mode
        const headerText = document.querySelector('#all-at-once-screen .all-at-once-header p');
        if (headerText) {
            headerText.textContent = isDebugMode
                ? 'Debug Mode: Difficulty levels shown'
                : 'Take your time and answer all questions below';
        }

        // Group questions into columns of 10
        const questionsPerColumn = 10;
        const numColumns = Math.ceil(this.questions.length / questionsPerColumn);

        for (let col = 0; col < numColumns; col++) {
            // Create column box
            const columnBox = document.createElement('div');
            columnBox.className = 'question-column';

            // Get questions for this column
            const startIdx = col * questionsPerColumn;
            const endIdx = Math.min(startIdx + questionsPerColumn, this.questions.length);

            for (let i = startIdx; i < endIdx; i++) {
                const question = this.questions[i];

                const questionDiv = document.createElement('div');
                questionDiv.className = 'question-item';

                const questionNumber = document.createElement('span');
                questionNumber.className = 'question-number';
                questionNumber.textContent = `${i + 1}.`;

                const questionText = document.createElement('span');
                questionText.className = 'question-text';
                questionText.textContent = QuestionGenerator.formatQuestion(question);

                const answerInput = document.createElement('input');
                answerInput.type = 'number';
                answerInput.className = 'question-answer-input';
                answerInput.id = `answer-${i}`;
                answerInput.placeholder = '?';

                questionDiv.appendChild(questionNumber);
                questionDiv.appendChild(questionText);
                questionDiv.appendChild(answerInput);

                // Add difficulty badge in debug mode
                if (isDebugMode) {
                    const difficultyLevel = QuestionGenerator.getDifficultyLevel(question, this.settings.maxNumber);
                    const badge = document.createElement('span');
                    badge.className = `difficulty-badge difficulty-${difficultyLevel}`;
                    badge.textContent = `L${difficultyLevel}`;
                    questionDiv.appendChild(badge);
                }

                columnBox.appendChild(questionDiv);
            }

            container.appendChild(columnBox);
        }

        // Setup submit button
        const submitBtn = document.getElementById('submit-all-answers');
        submitBtn.onclick = () => this.submitAllAnswers();

        // Show all-at-once screen
        Utils.showScreen('all-at-once-screen');

        // Focus on first input
        const firstInput = document.getElementById('answer-0');
        if (firstInput) {
            firstInput.focus();
        }
    },

    /**
     * Submit all answers in all-at-once mode
     */
    submitAllAnswers: function() {
        // Collect all answers
        this.questions.forEach((question, index) => {
            const input = document.getElementById(`answer-${index}`);
            const userAnswer = parseInt(input.value);

            question.userAnswer = isNaN(userAnswer) ? null : userAnswer;
            question.isCorrect = question.userAnswer === question.answer;
            question.timeElapsed = 0; // No timer in all-at-once mode

            if (question.isCorrect) {
                this.score++;
            }
        });

        // End game and show results
        this.endGame();
    },
    
    /**
     * Show a specific question
     * @param {number} index - Question index
     */
    showQuestion: function(index) {
        if (index >= this.questions.length) {
            this.endGame();
            return;
        }
        
        // Update current question index
        this.currentQuestionIndex = index;
        
        // Update UI elements
        this.currentQuestionIndicator.textContent = index + 1;
        this.updateProgressBar();
        
        // Get current question and display
        const question = this.questions[index];
        this.questionElement.textContent = QuestionGenerator.formatQuestion(question);
        
        // Clear previous answer and feedback
        this.answerInput.value = '';
        this.feedbackElement.textContent = '';
        this.feedbackElement.className = 'feedback';
        
        // Reset and start timer
        Timer.reset();
        Timer.start();
        
        // Focus on answer input
        this.answerInput.focus();
    },
    
    /**
     * Get the current question object
     * @returns {Object} - Current question
     */
    getCurrentQuestion: function() {
        return this.questions[this.currentQuestionIndex];
    },
    
    /**
     * Submit current answer and move to next question
     */
    submitAnswer: function() {
        // Stop timer
        Timer.stop();
        
        // Get current question and user's answer
        const question = this.getCurrentQuestion();
        const userAnswer = parseInt(this.answerInput.value);
        
        // Record answer and check correctness
        question.userAnswer = isNaN(userAnswer) ? null : userAnswer;
        question.isCorrect = question.userAnswer === question.answer;
        question.timeElapsed = this.settings.timePerQuestion - Timer.getRemainingSeconds();
        
        // Update score
        if (question.isCorrect) {
            this.score++;
            this.showFeedback('Correct!', 'correct');
        } else {
            this.showFeedback(question.userAnswer === null ? 'Time\'s up!' : 'Incorrect!', 'incorrect');
        }
        
        // Move to next question after short delay
        setTimeout(() => {
            this.showQuestion(this.currentQuestionIndex + 1);
        }, 1000);
    },
    
    /**
     * Show feedback to user
     * @param {string} message - Feedback message
     * @param {string} type - Feedback type ('correct' or 'incorrect')
     */
    showFeedback: function(message, type) {
        this.feedbackElement.textContent = message;
        this.feedbackElement.className = `feedback ${type}`;
    },
    
    /**
     * Update progress bar
     */
    updateProgressBar: function() {
        const progress = ((this.currentQuestionIndex) / this.questions.length) * 100;
        this.progressFill.style.width = `${progress}%`;
    },
    
    /**
     * Handle timer warning event
     */
    onTimerWarning: function() {
        // Optional: Add sound or visual cue
    },
    
    /**
     * Handle timer danger event
     */
    onTimerDanger: function() {
        // Optional: Add sound or visual cue
    },
    
    /**
     * Handle timer completion
     */
    onTimerComplete: function() {
        this.submitAnswer();
    },
    
    /**
     * End the game and show results
     */
    endGame: function() {
        // Flag game as not in progress
        this.gameInProgress = false;
        
        // Update score display
        document.getElementById('score').textContent = this.score;
        document.getElementById('score-total').textContent = this.questions.length;
        
        // Count results by type
        const correctCount = this.questions.filter(q => q.isCorrect).length;
        const incorrectCount = this.questions.filter(q => q.isCorrect === false && q.userAnswer !== null).length;
        const unansweredCount = this.questions.filter(q => q.userAnswer === null).length;
        
        // Update stats
        document.getElementById('correct-count').textContent = correctCount;
        document.getElementById('incorrect-count').textContent = incorrectCount;
        document.getElementById('unanswered-count').textContent = unansweredCount;
        
        // Calculate percentage score
        const percentage = (this.score / this.questions.length) * 100;
        
        // Set star rating
        let stars = '';
        if (percentage === 100) {
            stars = '⭐⭐⭐';
        } else if (percentage >= 75) {
            stars = '⭐⭐';
        } else if (percentage >= 50) {
            stars = '⭐';
        }
        document.getElementById('stars').textContent = stars;
        
        // Display results list - show ALL questions with color coding
        const resultsList = document.getElementById('results-list');
        resultsList.innerHTML = '';

        // Add all questions to the results list
        this.questions.forEach((q, index) => {
            const resultItem = document.createElement('div');

            // Determine class based on result
            if (q.isCorrect) {
                resultItem.className = 'result-item correct';
            } else if (q.userAnswer === null) {
                resultItem.className = 'result-item unanswered';
            } else {
                resultItem.className = 'result-item incorrect';
            }

            const questionText = QuestionGenerator.formatQuestion(q);
            const correctAnswer = q.answer;

            if (q.isCorrect) {
                resultItem.textContent = `${index + 1}. ${questionText} ${correctAnswer} ✓`;
            } else {
                const userAnswer = q.userAnswer === null ? 'No answer' : q.userAnswer;
                resultItem.textContent = `${index + 1}. ${questionText} Correct: ${correctAnswer}, Your answer: ${userAnswer}`;
            }

            resultsList.appendChild(resultItem);
        });
        
        // Show results screen
        Utils.showScreen('results-screen');
    },
    
    /**
     * Check if the game is currently in progress
     * @returns {boolean} - True if game is in progress
     */
    isGameInProgress: function() {
        return this.gameInProgress;
    }
};
