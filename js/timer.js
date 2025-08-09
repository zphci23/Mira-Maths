/**
 * Timer module for Mira Maths
 */

const Timer = {
    // Timer properties
    timeRemaining: 0,
    totalTime: 0,
    timerId: null,
    timerElement: null,
    callbacks: {},
    
    /**
     * Initialize the timer
     * @param {number} seconds - Time in seconds
     * @param {HTMLElement} element - Timer bar element
     * @param {Object} callbacks - Callback functions
     */
    init: function(seconds, element, callbacks = {}) {
        this.timeRemaining = seconds * 1000; // Convert to milliseconds
        this.totalTime = seconds * 1000;
        this.timerElement = element;
        this.callbacks = callbacks;
        
        // Reset timer state
        this.stop();
        this.updateTimerBar();
    },
    
    /**
     * Start the timer
     */
    start: function() {
        if (this.timerId) {
            return;
        }
        
        const tickRate = 100; // Update every 100ms for smooth animation
        const startTime = Date.now();
        let elapsed = 0;
        
        this.timerId = setInterval(() => {
            // Calculate actual elapsed time to prevent drift
            const currentElapsed = Date.now() - startTime;
            const deltaTime = currentElapsed - elapsed;
            elapsed = currentElapsed;
            
            this.timeRemaining -= deltaTime;
            
            // Update the timer bar
            this.updateTimerBar();
            
            // Check if timer reached warning threshold
            const warningThreshold = this.totalTime * 0.5; // 50% time remaining
            const dangerThreshold = this.totalTime * 0.25; // 25% time remaining
            
            // Remove existing classes
            this.timerElement.classList.remove('warning', 'danger');
            
            // Add appropriate class based on time remaining
            if (this.timeRemaining <= dangerThreshold) {
                this.timerElement.classList.add('danger');
                if (this.callbacks.onDanger && !this.dangerTriggered) {
                    this.callbacks.onDanger();
                    this.dangerTriggered = true;
                }
            } else if (this.timeRemaining <= warningThreshold) {
                this.timerElement.classList.add('warning');
                if (this.callbacks.onWarning && !this.warningTriggered) {
                    this.callbacks.onWarning();
                    this.warningTriggered = true;
                }
            }
            
            // Check if timer has expired
            if (this.timeRemaining <= 0) {
                this.timeRemaining = 0;
                this.stop();
                if (this.callbacks.onComplete) {
                    this.callbacks.onComplete();
                }
            }
        }, tickRate);
    },
    
    /**
     * Stop the timer
     */
    stop: function() {
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
        this.warningTriggered = false;
        this.dangerTriggered = false;
    },
    
    /**
     * Reset the timer
     * @param {number} seconds - New time in seconds (optional)
     */
    reset: function(seconds = null) {
        this.stop();
        
        if (seconds !== null) {
            this.totalTime = seconds * 1000;
        }
        
        this.timeRemaining = this.totalTime;
        this.updateTimerBar();
        
        // Reset timer bar classes
        if (this.timerElement) {
            this.timerElement.classList.remove('warning', 'danger');
        }
    },
    
    /**
     * Update the timer bar visually
     */
    updateTimerBar: function() {
        if (!this.timerElement) return;
        
        const percentRemaining = (this.timeRemaining / this.totalTime) * 100;
        this.timerElement.style.width = `${percentRemaining}%`;
    },
    
    /**
     * Get remaining time in seconds
     * @returns {number} - Time remaining in seconds
     */
    getRemainingSeconds: function() {
        return Math.ceil(this.timeRemaining / 1000);
    },
    
    /**
     * Check if timer is running
     * @returns {boolean} - True if timer is running
     */
    isRunning: function() {
        return this.timerId !== null;
    }
};
