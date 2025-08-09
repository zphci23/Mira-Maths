/**
 * Game controller for Mira Maths
 */

const Game = {
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
        
        // Get DOM elements
        this.timerBar = document.getElementById('timer-bar');
        this.questionElement = document.getElementById('question');
        this.answerInput = document.getElementById('answer-input');
        this.feedbackElement = document.getElementById('feedback');
        this.currentQuestionIndicator = document.getElementById('current-question');
        this.totalQuestionsIndicator = document.getElementById('total-questions');
        this.progressFill = document.querySelector('.progress-fill');
        
        // Generate questions
        this.questions = QuestionGenerator.generateQuestions(settings);
        
        // Initialize timer
        Timer.init(settings.timePerQuestion, this.timerBar, {
            onWarning: () => this.onTimerWarning(),
            onDanger: () => this.onTimerDanger(),
            onComplete: () => this.onTimerComplete()
        });
        
        // Update UI
        this.totalQuestionsIndicator.textContent = settings.questionCount;
        
        // Setup answer submission
        document.getElementById('submit-answer').addEventListener('click', () => this.submitAnswer());
        this.answerInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.submitAnswer();
            }
        });
        
        // Auto-check answer when correct
        this.answerInput.addEventListener('input', () => {
            const userAnswer = parseInt(this.answerInput.value);
            const currentQuestion = this.getCurrentQuestion();
            
            if (!isNaN(userAnswer) && userAnswer === currentQuestion.answer) {
                this.submitAnswer();
            }
        });
        
        // Show game screen
        Utils.showScreen('game-screen');
        
        // Start with first question
        this.showQuestion(0);
        
        // Flag game as in progress
        this.gameInProgress = true;
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
        
        // Display results list
        const resultsList = document.getElementById('results-list');
        resultsList.innerHTML = '';
        
        // Only show incorrect and unanswered questions
        const problemQuestions = this.questions.filter(q => !q.isCorrect);
        
        if (problemQuestions.length === 0) {
            // Perfect score!
            const perfectItem = document.createElement('div');
            perfectItem.className = 'result-item correct';
            perfectItem.textContent = 'Perfect score! All answers correct!';
            resultsList.appendChild(perfectItem);
        } else {
            // Add each problem question to the results list
            problemQuestions.forEach((q, index) => {
                const resultItem = document.createElement('div');
                resultItem.className = q.userAnswer === null ? 'result-item unanswered' : 'result-item incorrect';
                
                const questionText = QuestionGenerator.formatQuestion(q);
                const correctAnswer = q.answer;
                const userAnswer = q.userAnswer === null ? 'No answer' : q.userAnswer;
                
                resultItem.textContent = `${index + 1}. ${questionText} Correct: ${correctAnswer}, Your answer: ${userAnswer}`;
                
                resultsList.appendChild(resultItem);
            });
        }
        
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
