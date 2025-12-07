# Troubleshooting Guide & Logic Puzzle Game Implementations

## Table of Contents
1. [Issue #1: Sudoku API Connectivity](#issue-1-sudoku-api-connectivity)
2. [Issue #2: 2048 Game Improvements](#issue-2-2048-game-improvements)
3. [Logic Puzzle Game Guides](#logic-puzzle-game-guides)
   - [Nonogram (Picross)](#nonogram-picross)
   - [Minesweeper](#minesweeper)
   - [Hitori](#hitori)

---

## Issue #1: Sudoku API Connectivity

### Problem Diagnosis

The Sudoku game is attempting to fetch puzzles from `https://sugoku.onrender.com/board?difficulty=easy` but failing. In React Native/Expo apps, this is typically caused by:

1. **Missing Internet Permissions (Android)**: Android requires explicit permission declaration
2. **Network Security Configuration**: Some Android versions block cleartext HTTP traffic
3. **API Availability**: The external API might be down or slow
4. **Expo Go Limitations**: Development builds may have network restrictions

### Solution: Add Internet Permissions

#### Step 1: Update `app.json` to Include Android Permissions

Add the following to your `app.json`:

```json
{
  "expo": {
    "android": {
      "permissions": [
        "INTERNET",
        "ACCESS_NETWORK_STATE"
      ],
      "adaptiveIcon": {
        // ... existing config
      }
    }
  }
}
```

#### Step 2: Create Custom Android Configuration (If Needed)

For production builds, you may need to create a custom `AndroidManifest.xml`. Create the file at:
`android/app/src/main/AndroidManifest.xml`

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Internet Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    
    <application
      android:usesCleartextTraffic="true">
      <!-- This allows HTTP traffic, not just HTTPS -->
    </application>
</manifest>
```

#### Step 3: Verify Network Connectivity in Code

The current implementation already has a fallback mechanism (lines 184-187 in `sudokuUtils.js`):

```javascript
} catch (error) {
    console.error('Error fetching Sudoku from API:', error);
    return getRandomPuzzle(difficulty);
}
```

This means if the API fails, it falls back to pre-generated puzzles. **This is good practice!**

#### Step 4: Test Network Connectivity

Add a network status check to help diagnose issues:

```javascript
import NetInfo from '@react-native-community/netinfo';

// Before fetching
const networkState = await NetInfo.fetch();
console.log('Network connected:', networkState.isConnected);
console.log('Internet reachable:', networkState.isInternetReachable);
```

**Note**: You'll need to install `@react-native-community/netinfo` first:
```bash
npx expo install @react-native-community/netinfo
```

#### Step 5: Alternative - Use HTTPS API

The current API uses HTTP. Consider switching to an HTTPS alternative:

```javascript
// Alternative Sudoku APIs:
// 1. https://sudoku-api.vercel.app/api/dosuku (Free, HTTPS)
// 2. https://sugoku2.herokuapp.com/board?difficulty=easy (HTTPS version)
```

### Best Practices for API Calls in React Native

1. **Always implement fallbacks**: ✅ Already done in your code
2. **Add timeout handling**: Set a reasonable timeout (5-10 seconds)
3. **Show loading states**: ✅ Already implemented
4. **Cache responses**: Consider storing fetched puzzles locally
5. **Handle offline mode**: Use AsyncStorage to cache puzzles

### Recommended Implementation Update

```javascript
export const fetchSudokuFromAPI = async (difficulty = 'easy', timeout = 5000) => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const difficultyMap = { easy: 'easy', medium: 'medium', hard: 'hard' };
        const response = await fetch(
            `https://sugoku.onrender.com/board?difficulty=${difficultyMap[difficulty]}`,
            { signal: controller.signal }
        );
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        if (data.board) {
            return data.board;
        }
        return getRandomPuzzle(difficulty);
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('Request timed out, using local puzzle');
        } else {
            console.error('Error fetching Sudoku from API:', error);
        }
        return getRandomPuzzle(difficulty);
    }
};
```

---

## Issue #2: 2048 Game Improvements

### Current Implementation Analysis

After reviewing `NumberPuzzleGame.js`, here are the issues and improvements needed:

### Problems Identified

1. **Grid Rotation Logic Bug** (Lines 98-100): The rotation restoration is incorrect
2. **No Swipe Gestures**: Only button controls, not touch-friendly
3. **No Animations**: Tiles appear/disappear instantly
4. **Limited Visual Feedback**: No tile merge animations
5. **Score Persistence**: Best score resets on app restart

### Issue #1: Fix Grid Rotation Logic

**Problem**: Line 98-100 has incorrect rotation restoration logic.

```javascript
// CURRENT (INCORRECT):
for (let i = 0; i < (4 - rotations) % 4; i++) {
    tempGrid = rotateGrid(movedGrid);
}
```

**Fixed Version**:

```javascript
// CORRECT:
let resultGrid = movedGrid;
for (let i = 0; i < (4 - rotations) % 4; i++) {
    resultGrid = rotateGrid(resultGrid);
}
return { grid: resultGrid, moved, score };
```

### Issue #2: Add Swipe Gesture Support

Install the gesture handler (should already be installed):

```javascript
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

// In component:
const swipeGesture = Gesture.Pan()
    .onEnd((event) => {
        const { translationX, translationY } = event;
        const absX = Math.abs(translationX);
        const absY = Math.abs(translationY);
        
        if (absX > absY) {
            // Horizontal swipe
            if (translationX > 0) handleMove('right');
            else handleMove('left');
        } else {
            // Vertical swipe
            if (translationY > 0) handleMove('down');
            else handleMove('up');
        }
    });

// Wrap grid:
<GestureDetector gesture={swipeGesture}>
    <View style={styles.gridContainer}>
        {/* grid content */}
    </View>
</GestureDetector>
```

### Issue #3: Add Tile Animations

Use `react-native-reanimated` (already in dependencies):

```javascript
import Animated, { 
    useAnimatedStyle, 
    withSpring, 
    withSequence 
} from 'react-native-reanimated';

// For new tiles:
const scaleAnim = useSharedValue(0);

useEffect(() => {
    if (value !== 0) {
        scaleAnim.value = withSpring(1);
    }
}, [value]);

const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }]
}));

// Replace View with Animated.View:
<Animated.View style={[styles.tile, animatedStyle, { backgroundColor: getTileColor(value) }]}>
    {/* tile content */}
</Animated.View>
```

### Issue #4: Persist Best Score

Use AsyncStorage:

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Load best score on mount:
useEffect(() => {
    loadBestScore();
}, []);

const loadBestScore = async () => {
    try {
        const saved = await AsyncStorage.getItem('2048_best_score');
        if (saved !== null) {
            setBestScore(parseInt(saved, 10));
        }
    } catch (error) {
        console.error('Error loading best score:', error);
    }
};

// Save when score updates:
useEffect(() => {
    if (score > bestScore) {
        setBestScore(score);
        AsyncStorage.setItem('2048_best_score', score.toString());
    }
}, [score]);
```

### Issue #5: Improve Game Mechanics

**Add Undo Feature**:

```javascript
const [history, setHistory] = useState([]);

const handleMove = (direction) => {
    // Save current state before move
    setHistory([...history, { grid: [...grid], score }]);
    
    // ... existing move logic
};

const handleUndo = () => {
    if (history.length > 0) {
        const previous = history[history.length - 1];
        setGrid(previous.grid);
        setScore(previous.score);
        setHistory(history.slice(0, -1));
    }
};
```

### Complete Improved 2048 Game Mechanics

Here's what makes a great 2048 game:

1. **Smooth Animations**: Tiles should slide and merge smoothly
2. **Swipe Gestures**: Primary input method on mobile
3. **Score Persistence**: Save best score across sessions
4. **Undo Feature**: Allow 1-3 undo moves
5. **Visual Feedback**: Highlight new tiles, show merge animations
6. **Sound Effects** (optional): Add satisfying merge sounds
7. **Haptic Feedback**: Vibrate on merges

---

## Logic Puzzle Game Guides

### Nonogram (Picross)

#### Game Overview

Nonogram is a logic puzzle where players reveal a hidden picture by filling in cells on a grid based on numerical clues. Each number indicates a consecutive group of filled cells in that row or column.

**Example:**
```
Clues: [3, 1]
Valid:   ■■■ □ ■
Invalid: ■■ □ ■■
Invalid: ■ ■■ ■
```

#### Core Gameplay Mechanics

1. **Grid Structure**:
   - Rectangular grid (typically 5x5 to 20x20)
   - Each cell can be: Empty, Filled, or Marked (X)
   - Row clues on the left, column clues on top

2. **Clue Interpretation**:
   - `[3]` = Three consecutive filled cells
   - `[2, 1]` = Two filled cells, gap, one filled cell
   - `[1, 1, 1]` = Three separate single cells

3. **Player Actions**:
   - Tap to fill a cell
   - Long press to mark as empty (X)
   - Tap filled/marked cell to clear

#### Implementation Requirements

##### 1. Data Structures

```javascript
// Puzzle definition
const puzzle = {
    width: 10,
    height: 10,
    rowClues: [[3, 1], [5], [1, 1], ...],
    colClues: [[2, 2], [4], [1, 3], ...],
    solution: [
        [1, 1, 1, 0, 1, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
        // ... (1 = filled, 0 = empty)
    ]
};

// Game state
const [grid, setGrid] = useState(
    Array(height).fill(null).map(() => 
        Array(width).fill(null).map(() => ({
            state: 'empty', // 'empty' | 'filled' | 'marked'
            isCorrect: null
        }))
    )
);
```

##### 2. Constraint Validation Logic

**Check if a row/column matches its clues:**

```javascript
const validateLine = (line, clues) => {
    // Extract filled cell groups
    const groups = [];
    let currentGroup = 0;
    
    for (let i = 0; i < line.length; i++) {
        if (line[i].state === 'filled') {
            currentGroup++;
        } else if (currentGroup > 0) {
            groups.push(currentGroup);
            currentGroup = 0;
        }
    }
    if (currentGroup > 0) groups.push(currentGroup);
    
    // Compare with clues
    if (groups.length !== clues.length) return false;
    
    for (let i = 0; i < groups.length; i++) {
        if (groups[i] !== clues[i]) return false;
    }
    
    return true;
};

// Check entire board
const checkPuzzleComplete = () => {
    // Check all rows
    for (let i = 0; i < height; i++) {
        if (!validateLine(grid[i], rowClues[i])) return false;
    }
    
    // Check all columns
    for (let j = 0; j < width; j++) {
        const column = grid.map(row => row[j]);
        if (!validateLine(column, colClues[j])) return false;
    }
    
    return true;
};
```

##### 3. Auto-Solving Hints

**Simple line solving algorithm:**

```javascript
const solveLine = (line, clues) => {
    const length = line.length;
    const minLength = clues.reduce((sum, c) => sum + c, 0) + clues.length - 1;
    
    if (minLength > length) return line; // Invalid
    
    // Find cells that MUST be filled
    const mustFill = Array(length).fill(false);
    
    // For each clue, find overlap region
    for (let i = 0; i < clues.length; i++) {
        const clue = clues[i];
        const offset = clues.slice(0, i).reduce((sum, c) => sum + c + 1, 0);
        const maxStart = length - minLength + offset;
        
        // Overlap region
        for (let pos = clue - 1; pos < clue; pos++) {
            if (offset + pos < maxStart + clue) {
                mustFill[offset + pos] = true;
            }
        }
    }
    
    // Apply to line
    return line.map((cell, i) => ({
        ...cell,
        state: mustFill[i] ? 'filled' : cell.state
    }));
};
```

##### 4. UI Components

```javascript
// Clue display
const ClueRow = ({ clues, isComplete }) => (
    <View style={styles.clueRow}>
        {clues.map((num, i) => (
            <Text key={i} style={[
                styles.clueText,
                isComplete && styles.clueComplete
            ]}>
                {num}
            </Text>
        ))}
    </View>
);

// Grid cell
const Cell = ({ state, onPress, onLongPress }) => (
    <TouchableOpacity
        style={[
            styles.cell,
            state === 'filled' && styles.cellFilled,
            state === 'marked' && styles.cellMarked
        ]}
        onPress={onPress}
        onLongPress={onLongPress}
    >
        {state === 'marked' && <Text>×</Text>}
    </TouchableOpacity>
);
```

##### 5. Puzzle Generation Algorithm

```javascript
const generatePuzzle = (width, height, density = 0.6) => {
    // 1. Create random solution
    const solution = Array(height).fill(null).map(() =>
        Array(width).fill(null).map(() => Math.random() < density ? 1 : 0)
    );
    
    // 2. Generate clues from solution
    const rowClues = solution.map(row => {
        const clues = [];
        let count = 0;
        for (let cell of row) {
            if (cell === 1) count++;
            else if (count > 0) {
                clues.push(count);
                count = 0;
            }
        }
        if (count > 0) clues.push(count);
        return clues.length > 0 ? clues : [0];
    });
    
    const colClues = Array(width).fill(null).map((_, col) => {
        const clues = [];
        let count = 0;
        for (let row = 0; row < height; row++) {
            if (solution[row][col] === 1) count++;
            else if (count > 0) {
                clues.push(count);
                count = 0;
            }
        }
        if (count > 0) clues.push(count);
        return clues.length > 0 ? clues : [0];
    });
    
    return { width, height, rowClues, colClues, solution };
};
```

---

### Minesweeper

#### Game Overview

Minesweeper is a logic puzzle where players uncover cells on a grid without hitting hidden mines. Numbers indicate how many mines are adjacent to that cell.

**Example 3x3 grid:**
```
? ? ?
? ? ?
? ? ?

After clicking center:
? ? ?
? 2 ?
? ? ?
(2 mines adjacent to center cell)
```

#### Core Gameplay Mechanics

1. **Grid Structure**:
   - Rectangular grid (e.g., 9x9 with 10 mines)
   - Each cell: Hidden, Revealed, Flagged, or Mine
   - First click is always safe

2. **Game Rules**:
   - Click to reveal a cell
   - Long press to flag suspected mines
   - Numbers show adjacent mine count (8 neighbors)
   - Revealing all non-mine cells wins
   - Revealing a mine loses

3. **Auto-Reveal**:
   - If a cell has 0 adjacent mines, auto-reveal all neighbors
   - Recursive flood-fill algorithm

#### Implementation Requirements

##### 1. Data Structures

```javascript
const [grid, setGrid] = useState([]);
const [gameState, setGameState] = useState('playing'); // 'playing' | 'won' | 'lost'
const [mineCount, setMineCount] = useState(10);
const [flagCount, setFlagCount] = useState(0);

// Cell structure
const cell = {
    isMine: false,
    isRevealed: false,
    isFlagged: false,
    adjacentMines: 0
};
```

##### 2. Board Generation

```javascript
const generateBoard = (rows, cols, mineCount, safeRow, safeCol) => {
    // Initialize empty grid
    const grid = Array(rows).fill(null).map(() =>
        Array(cols).fill(null).map(() => ({
            isMine: false,
            isRevealed: false,
            isFlagged: false,
            adjacentMines: 0
        }))
    );
    
    // Place mines randomly (avoiding safe cell)
    let minesPlaced = 0;
    while (minesPlaced < mineCount) {
        const row = Math.floor(Math.random() * rows);
        const col = Math.floor(Math.random() * cols);
        
        if (!grid[row][col].isMine && !(row === safeRow && col === safeCol)) {
            grid[row][col].isMine = true;
            minesPlaced++;
        }
    }
    
    // Calculate adjacent mine counts
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (!grid[i][j].isMine) {
                grid[i][j].adjacentMines = countAdjacentMines(grid, i, j);
            }
        }
    }
    
    return grid;
};
```

##### 3. Adjacency/Neighbor Counting

```javascript
const countAdjacentMines = (grid, row, col) => {
    const rows = grid.length;
    const cols = grid[0].length;
    let count = 0;
    
    // Check all 8 neighbors
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
    ];
    
    for (const [dr, dc] of directions) {
        const newRow = row + dr;
        const newCol = col + dc;
        
        // Check bounds
        if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
            if (grid[newRow][newCol].isMine) {
                count++;
            }
        }
    }
    
    return count;
};

const getNeighbors = (grid, row, col) => {
    const rows = grid.length;
    const cols = grid[0].length;
    const neighbors = [];
    
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
    ];
    
    for (const [dr, dc] of directions) {
        const newRow = row + dr;
        const newCol = col + dc;
        
        if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
            neighbors.push({ row: newRow, col: newCol });
        }
    }
    
    return neighbors;
};
```

##### 4. Recursive Uncovering (Flood Fill)

```javascript
const revealCell = (grid, row, col) => {
    const newGrid = grid.map(r => r.map(c => ({ ...c })));
    
    // Recursive flood fill
    const reveal = (r, c) => {
        // Bounds check
        if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length) {
            return;
        }
        
        const cell = newGrid[r][c];
        
        // Already revealed or flagged
        if (cell.isRevealed || cell.isFlagged) {
            return;
        }
        
        // Reveal this cell
        cell.isRevealed = true;
        
        // If it's a mine, game over
        if (cell.isMine) {
            setGameState('lost');
            revealAllMines(newGrid);
            return;
        }
        
        // If no adjacent mines, reveal neighbors recursively
        if (cell.adjacentMines === 0) {
            const neighbors = getNeighbors(newGrid, r, c);
            neighbors.forEach(({ row, col }) => reveal(row, col));
        }
    };
    
    reveal(row, col);
    return newGrid;
};

const revealAllMines = (grid) => {
    grid.forEach(row => {
        row.forEach(cell => {
            if (cell.isMine) {
                cell.isRevealed = true;
            }
        });
    });
};
```

##### 5. Win/Loss Detection

```javascript
const checkWin = (grid) => {
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[0].length; j++) {
            const cell = grid[i][j];
            // If any non-mine cell is not revealed, game not won
            if (!cell.isMine && !cell.isRevealed) {
                return false;
            }
        }
    }
    return true;
};

useEffect(() => {
    if (gameState === 'playing' && checkWin(grid)) {
        setGameState('won');
        Alert.alert('🎉 You Win!', 'All mines found!');
    }
}, [grid]);
```

##### 6. Flagging Mechanism

```javascript
const toggleFlag = (row, col) => {
    if (gameState !== 'playing') return;
    
    const newGrid = grid.map(r => r.map(c => ({ ...c })));
    const cell = newGrid[row][col];
    
    if (cell.isRevealed) return;
    
    if (cell.isFlagged) {
        cell.isFlagged = false;
        setFlagCount(flagCount - 1);
    } else if (flagCount < mineCount) {
        cell.isFlagged = true;
        setFlagCount(flagCount + 1);
    }
    
    setGrid(newGrid);
};
```

##### 7. UI Components

```javascript
const MinesweeperCell = ({ cell, onPress, onLongPress }) => {
    const getContent = () => {
        if (cell.isFlagged) return '🚩';
        if (!cell.isRevealed) return '';
        if (cell.isMine) return '💣';
        if (cell.adjacentMines === 0) return '';
        return cell.adjacentMines.toString();
    };
    
    const getColor = () => {
        const colors = ['', '#0000FF', '#008000', '#FF0000', '#000080', 
                       '#800000', '#008080', '#000000', '#808080'];
        return colors[cell.adjacentMines] || '#000';
    };
    
    return (
        <TouchableOpacity
            style={[
                styles.cell,
                cell.isRevealed && styles.cellRevealed,
                cell.isMine && cell.isRevealed && styles.cellMine
            ]}
            onPress={onPress}
            onLongPress={onLongPress}
        >
            <Text style={[styles.cellText, { color: getColor() }]}>
                {getContent()}
            </Text>
        </TouchableOpacity>
    );
};
```

##### 8. Difficulty Presets

```javascript
const DIFFICULTIES = {
    beginner: { rows: 9, cols: 9, mines: 10 },
    intermediate: { rows: 16, cols: 16, mines: 40 },
    expert: { rows: 16, cols: 30, mines: 99 }
};
```

---

### Hitori

#### Game Overview

Hitori is a logic puzzle where players shade cells so that:
1. No number appears more than once in any row or column (unshaded)
2. Shaded cells cannot touch horizontally or vertically
3. All unshaded cells must form one connected region

**Example:**
```
Initial:        Solution:
2 3 2 1         2 3 ■ 1
1 2 3 2         1 2 3 ■
3 1 2 3         3 1 2 ■
2 3 1 2         ■ 3 1 2
```

#### Core Gameplay Mechanics

1. **Grid Structure**:
   - Square grid with numbers (5x5 to 10x10)
   - Each cell: Unshaded or Shaded
   - Some cells may be pre-shaded

2. **Game Rules**:
   - Tap to shade/unshade a cell
   - No duplicate numbers in rows/columns (unshaded only)
   - Shaded cells can't be adjacent (orthogonally)
   - Unshaded cells must all connect

3. **Validation**:
   - Real-time feedback on rule violations
   - Win when all three rules satisfied

#### Implementation Requirements

##### 1. Data Structures

```javascript
const [grid, setGrid] = useState([
    [
        { value: 2, isShaded: false, isFixed: false, hasError: false },
        { value: 3, isShaded: false, isFixed: false, hasError: false },
        // ...
    ]
]);

const puzzle = {
    size: 5,
    initial: [
        [2, 3, 2, 1, 4],
        [1, 2, 3, 2, 5],
        // ...
    ],
    solution: [
        [false, false, true, false, false],
        [false, false, false, true, false],
        // ... (true = shaded)
    ]
};
```

##### 2. Duplicate Detection

```javascript
const checkDuplicates = (grid) => {
    const errors = Array(grid.length).fill(null).map(() => 
        Array(grid.length).fill(false)
    );
    
    // Check rows
    for (let i = 0; i < grid.length; i++) {
        const seen = new Map();
        for (let j = 0; j < grid.length; j++) {
            if (!grid[i][j].isShaded) {
                const value = grid[i][j].value;
                if (seen.has(value)) {
                    errors[i][j] = true;
                    errors[i][seen.get(value)] = true;
                } else {
                    seen.set(value, j);
                }
            }
        }
    }
    
    // Check columns
    for (let j = 0; j < grid.length; j++) {
        const seen = new Map();
        for (let i = 0; i < grid.length; i++) {
            if (!grid[i][j].isShaded) {
                const value = grid[i][j].value;
                if (seen.has(value)) {
                    errors[i][j] = true;
                    errors[seen.get(value)][j] = true;
                } else {
                    seen.set(value, i);
                }
            }
        }
    }
    
    return errors;
};
```

##### 3. Adjacent Shaded Cells Check

```javascript
const checkAdjacentShaded = (grid) => {
    const errors = Array(grid.length).fill(null).map(() => 
        Array(grid.length).fill(false)
    );
    
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid.length; j++) {
            if (grid[i][j].isShaded) {
                // Check right
                if (j < grid.length - 1 && grid[i][j + 1].isShaded) {
                    errors[i][j] = true;
                    errors[i][j + 1] = true;
                }
                // Check down
                if (i < grid.length - 1 && grid[i + 1][j].isShaded) {
                    errors[i][j] = true;
                    errors[i + 1][j] = true;
                }
            }
        }
    }
    
    return errors;
};
```

##### 4. Connected Region Check (Flood Fill)

```javascript
const checkConnectivity = (grid) => {
    const size = grid.length;
    const visited = Array(size).fill(null).map(() => Array(size).fill(false));
    
    // Find first unshaded cell
    let startRow = -1, startCol = -1;
    for (let i = 0; i < size && startRow === -1; i++) {
        for (let j = 0; j < size; j++) {
            if (!grid[i][j].isShaded) {
                startRow = i;
                startCol = j;
                break;
            }
        }
    }
    
    if (startRow === -1) return false; // All shaded
    
    // Flood fill from start
    const queue = [[startRow, startCol]];
    visited[startRow][startCol] = true;
    let unshadedCount = 1;
    
    while (queue.length > 0) {
        const [row, col] = queue.shift();
        
        // Check 4 neighbors
        const neighbors = [
            [row - 1, col], [row + 1, col],
            [row, col - 1], [row, col + 1]
        ];
        
        for (const [r, c] of neighbors) {
            if (r >= 0 && r < size && c >= 0 && c < size &&
                !visited[r][c] && !grid[r][c].isShaded) {
                visited[r][c] = true;
                queue.push([r, c]);
                unshadedCount++;
            }
        }
    }
    
    // Count total unshaded cells
    let totalUnshaded = 0;
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (!grid[i][j].isShaded) totalUnshaded++;
        }
    }
    
    return unshadedCount === totalUnshaded;
};
```

##### 5. Complete Validation

```javascript
const validatePuzzle = (grid) => {
    const duplicateErrors = checkDuplicates(grid);
    const adjacentErrors = checkAdjacentShaded(grid);
    const isConnected = checkConnectivity(grid);
    
    // Combine errors
    const newGrid = grid.map((row, i) =>
        row.map((cell, j) => ({
            ...cell,
            hasError: duplicateErrors[i][j] || adjacentErrors[i][j]
        }))
    );
    
    // Check if puzzle is solved
    const hasDuplicates = duplicateErrors.some(row => row.some(e => e));
    const hasAdjacent = adjacentErrors.some(row => row.some(e => e));
    const isSolved = !hasDuplicates && !hasAdjacent && isConnected;
    
    return { grid: newGrid, isSolved, isConnected };
};
```

##### 6. Cell Toggle Logic

```javascript
const toggleCell = (row, col) => {
    if (grid[row][col].isFixed) return;
    
    const newGrid = grid.map(r => r.map(c => ({ ...c })));
    newGrid[row][col].isShaded = !newGrid[row][col].isShaded;
    
    const { grid: validatedGrid, isSolved } = validatePuzzle(newGrid);
    setGrid(validatedGrid);
    
    if (isSolved) {
        Alert.alert('🎉 Congratulations!', 'Puzzle solved!');
    }
};
```

##### 7. Puzzle Generation

```javascript
const generateHitoriPuzzle = (size) => {
    // 1. Create a valid Latin square (no duplicates)
    const latinSquare = generateLatinSquare(size);
    
    // 2. Add strategic duplicates
    const puzzle = latinSquare.map(row => [...row]);
    const duplicatesToAdd = Math.floor(size * size * 0.3);
    
    for (let i = 0; i < duplicatesToAdd; i++) {
        const row = Math.floor(Math.random() * size);
        const col = Math.floor(Math.random() * size);
        const targetCol = Math.floor(Math.random() * size);
        
        if (col !== targetCol) {
            puzzle[row][targetCol] = puzzle[row][col];
        }
    }
    
    // 3. Solve to get solution
    const solution = solveHitori(puzzle);
    
    return { puzzle, solution };
};

const generateLatinSquare = (size) => {
    const square = Array(size).fill(null).map((_, i) =>
        Array(size).fill(null).map((_, j) => ((i + j) % size) + 1)
    );
    
    // Shuffle rows and columns
    for (let i = size - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [square[i], square[j]] = [square[j], square[i]];
    }
    
    return square;
};
```

##### 8. UI Components

```javascript
const HitoriCell = ({ cell, onPress }) => (
    <TouchableOpacity
        style={[
            styles.cell,
            cell.isShaded && styles.cellShaded,
            cell.hasError && styles.cellError,
            cell.isFixed && styles.cellFixed
        ]}
        onPress={onPress}
        disabled={cell.isFixed}
    >
        <Text style={[
            styles.cellText,
            cell.isShaded && styles.cellTextShaded
        ]}>
            {cell.value}
        </Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    cell: {
        width: 50,
        height: 50,
        borderWidth: 1,
        borderColor: '#999',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white'
    },
    cellShaded: {
        backgroundColor: '#333'
    },
    cellError: {
        backgroundColor: '#FFEBEE',
        borderColor: '#F44336'
    },
    cellText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333'
    },
    cellTextShaded: {
        color: 'white'
    }
});
```

##### 9. Hint System

```javascript
const getHint = (grid, solution) => {
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid.length; j++) {
            if (grid[i][j].isShaded !== solution[i][j]) {
                return { row: i, col: j, shouldBeShaded: solution[i][j] };
            }
        }
    }
    return null;
};

const applyHint = () => {
    const hint = getHint(grid, solution);
    if (hint) {
        const newGrid = grid.map(r => r.map(c => ({ ...c })));
        newGrid[hint.row][hint.col].isShaded = hint.shouldBeShaded;
        setGrid(newGrid);
    }
};
```

---

## Summary

### Issue #1: Sudoku API
- **Root Cause**: Missing Android internet permissions
- **Solution**: Add permissions to `app.json` and optionally create custom `AndroidManifest.xml`
- **Best Practice**: Always implement fallback mechanisms (already done!)

### Issue #2: 2048 Game
- **Problems**: Grid rotation bug, no swipe gestures, no animations, no score persistence
- **Solutions**: Fix rotation logic, add gesture handler, implement animations, use AsyncStorage
- **Enhancements**: Add undo feature, haptic feedback, better visual feedback

### Logic Puzzle Games
All three games share common patterns:
1. **Grid-based state management**
2. **Constraint validation logic**
3. **Recursive algorithms** (flood fill, backtracking)
4. **Real-time error detection**
5. **Hint systems**
6. **Puzzle generation algorithms**

Each game has unique challenges:
- **Nonogram**: Line-solving algorithms, clue validation
- **Minesweeper**: Neighbor counting, safe first click, flood fill
- **Hitori**: Connectivity checking, multiple constraint validation

All implementations should include:
- Smooth animations
- Touch-friendly UI
- Undo/redo functionality
- Difficulty levels
- Progress saving
- Hint system
