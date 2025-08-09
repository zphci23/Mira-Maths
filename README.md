# Mira Maths - Flash Practice

A responsive web application for primary school students to practice basic arithmetic operations in a fun, engaging environment.

## Features

- Practice addition, subtraction, multiplication, and division
- Customizable difficulty settings:
  - Maximum number (10, 20, 50, 100, or custom)
  - Number of questions (10, 20, 30, or custom)
  - Time per question (3s, 5s, 10s, or custom)
  - Difficulty level slider (from easy to hard)
- Timed questions with visual feedback
- End-of-game results with star rating system
- Review of incorrect and missed questions
- Mobile-friendly, responsive design

## Usage

1. Select the operation(s) you want to practice
2. Set the maximum number for questions
3. Choose how many questions you want to answer
4. Set the time limit per question
5. Adjust difficulty level using the slider
6. Click "Start Practice" to begin

During the game, a countdown timer will show how much time you have left for each question. The background color changes from green to yellow to red as time runs out.

Type your answer in the input box. If your answer is correct, it will automatically move to the next question. You can also click the "Check" button or press Enter to submit your answer.

## Game Logic

- Questions are randomly generated based on your settings
- Difficulty levels:
  - Level 1: Any number less than 6
  - Level 2: Numbers that are multiples of 5
  - Level 3: Other numbers
- The difficulty slider controls the percentage of Level 3 questions
- No repeated questions will appear in a session
- All results will be less than or equal to your maximum number setting

## Technical Details

This application is built using:
- HTML5
- CSS3 with CSS variables for theming
- Vanilla JavaScript (no frameworks)

The code is organized into modules:
- `utils.js`: Utility functions
- `questionGenerator.js`: Logic for generating math questions
- `timer.js`: Timer functionality
- `game.js`: Game controller
- `main.js`: Application initialization

## Future Enhancements

- User accounts and saved scores
- Additional puzzle types
- Different subjects
- More customization options
- Accessibility improvements

## License

All rights reserved.
