## week 1: Hello, World

### 1. Let's Make Your Computer Talk! 

### Let's Make Your Computer Talk! 

🗣️Your task is to create a function called `create_greeting` that generates a personalized greeting message.## Function Requirements:

1. Take one parameter: `name` (a string)
2. Return a single string containing THREE lines:   

- First line: "Hello, Python!"   
- Second line: The provided name   
- Third line: "I'm ready to code!"

3. Each line should be separated by a newline character (`\n`)

## Example:

When you call:

> create_greeting("John")

It should return:

> "Hello, Python!\\nJohn\\nI'm ready to code!"

Which when displayed looks like:


> Hello, Python!JohnI'm ready to code!

## Week 2

### Task1: Student Information Card Generator 📚

Create a function called `create_student_card` that generates a formatted student information card.

## Function Requirements:
1. Take four parameters:
   -`name` (string): Student's name
   - `age` (integer): Student's age
   - `grade` (float): Student's grade average
   - `is_active` (boolean): Student's active status

2. Return a formatted string that displays:
   - A header line with '== STUDENT CARD =='
   - Student's name
   - Student's age (converted to string)
   - Student's grade with exactly one decimal place
   - Student's active status
   - A footer line with '================'

## Important Notes:
- Use proper variable types for each piece of information
- Convert numbers to strings when concatenating
- Format the grade to show exactly one decimal place
- Use string concatenation to build the card
- Make sure each piece of information is on its own line

## Tips:
- Remember to use str() for number conversions
- Use string formatting for the grade
- Pay attention to line breaks (\\n)

## Examples:

### Example 1:

Input:

> create_student_card('Alice Smith', 15, 92.5, True)

Output:

```
== STUDENT CARD ==
Name: Alice Smith
Age: 15
Grade: 92.5
Active: True
================
```

Explanation: Creates a properly formatted student card with all information

### Example 2:
Input:

```
create_student_card('Bob Jones', 14, 88.7, False)
```

Output:

```
== STUDENT CARD ==
Name: Bob Jones
Age: 14
Grade: 88.7
Active: False
================
```


### Task 2: Game Score Calculator 🎮

# Game Score Calculator 🎮

Create a function called `calculate_game_stats` that processes game scores and generates a statistics summary.

## Function Requirements:

1. Take three parameters:

- `player_name` (string): Name of the player
- `scores` (list of 3 integers): Three round scores   
- `bonus_multiplier` (float): Bonus point multiplier

2. Calculate and return a formatted string containing:

- Player's name
- Individual round scores
- Average score (as a float with 1 decimal place)
- Total score after applying bonus multiplier
- Whether the player achieved a high score (True if total > 100)

## Calculations:

- Average = sum of scores / number of scores
- Final total = average * bonus_multiplier
- High score = True if final total > 100

## Notes:

- Use appropriate variable types for calculations
- Format decimals to one place
- Convert numbers to strings for output
- Include all required information in output"

## Examples:

### Example 1:

Input:

> calculate_game_stats('Mario', [30, 45, 25], 1.5)


Output:
```
Player: Mario
Rounds: 30, 45, 25
Average: 33.3
Final Score: 50.0
High Score: False
```

Explanation: Shows calculation of game statistics with bonus multiplier

### Example 2:
Input:
```
calculate_game_stats('Luigi', [75, 80, 95], 1.2)
```

Output:
```
Player: Luigi
Rounds: 75, 80, 95
Average: 83.3
Final Score: 100.0
High Score: True
```