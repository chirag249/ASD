// Sudoku puzzle generator and validator utilities

/**
 * Check if a number is valid in a given position
 */
export const isValidMove = (board, row, col, num) => {
    // Check row
    for (let x = 0; x < 9; x++) {
        if (board[row][x] === num) return false;
    }

    // Check column
    for (let x = 0; x < 9; x++) {
        if (board[x][col] === num) return false;
    }

    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[boxRow + i][boxCol + j] === num) return false;
        }
    }

    return true;
};

/**
 * Check if the board is completely filled
 */
export const isBoardFilled = (board) => {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (board[i][j] === 0) return false;
        }
    }
    return true;
};

/**
 * Check if the current board state is valid (no conflicts)
 */
export const isBoardValid = (board) => {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (board[i][j] !== 0) {
                const num = board[i][j];
                board[i][j] = 0; // Temporarily remove to check
                if (!isValidMove(board, i, j, num)) {
                    board[i][j] = num; // Restore
                    return false;
                }
                board[i][j] = num; // Restore
            }
        }
    }
    return true;
};

/**
 * Solve the Sudoku board using backtracking
 */
export const solveSudoku = (board) => {
    const findEmpty = (board) => {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (board[i][j] === 0) return [i, j];
            }
        }
        return null;
    };

    const empty = findEmpty(board);
    if (!empty) return true; // Solved

    const [row, col] = empty;

    for (let num = 1; num <= 9; num++) {
        if (isValidMove(board, row, col, num)) {
            board[row][col] = num;

            if (solveSudoku(board)) return true;

            board[row][col] = 0; // Backtrack
        }
    }

    return false;
};

/**
 * Get hint for the next move
 */
export const getHint = (board, solution) => {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (board[i][j] === 0 && solution[i][j] !== 0) {
                return { row: i, col: j, value: solution[i][j] };
            }
        }
    }
    return null;
};

/**
 * Pre-generated Sudoku puzzles (Easy, Medium, Hard)
 */
export const SUDOKU_PUZZLES = {
    easy: [
        [
            [5, 3, 0, 0, 7, 0, 0, 0, 0],
            [6, 0, 0, 1, 9, 5, 0, 0, 0],
            [0, 9, 8, 0, 0, 0, 0, 6, 0],
            [8, 0, 0, 0, 6, 0, 0, 0, 3],
            [4, 0, 0, 8, 0, 3, 0, 0, 1],
            [7, 0, 0, 0, 2, 0, 0, 0, 6],
            [0, 6, 0, 0, 0, 0, 2, 8, 0],
            [0, 0, 0, 4, 1, 9, 0, 0, 5],
            [0, 0, 0, 0, 8, 0, 0, 7, 9]
        ],
        [
            [0, 0, 0, 2, 6, 0, 7, 0, 1],
            [6, 8, 0, 0, 7, 0, 0, 9, 0],
            [1, 9, 0, 0, 0, 4, 5, 0, 0],
            [8, 2, 0, 1, 0, 0, 0, 4, 0],
            [0, 0, 4, 6, 0, 2, 9, 0, 0],
            [0, 5, 0, 0, 0, 3, 0, 2, 8],
            [0, 0, 9, 3, 0, 0, 0, 7, 4],
            [0, 4, 0, 0, 5, 0, 0, 3, 6],
            [7, 0, 3, 0, 1, 8, 0, 0, 0]
        ]
    ],
    medium: [
        [
            [0, 0, 0, 6, 0, 0, 4, 0, 0],
            [7, 0, 0, 0, 0, 3, 6, 0, 0],
            [0, 0, 0, 0, 9, 1, 0, 8, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 5, 0, 1, 8, 0, 0, 0, 3],
            [0, 0, 0, 3, 0, 6, 0, 4, 5],
            [0, 4, 0, 2, 0, 0, 0, 6, 0],
            [9, 0, 3, 0, 0, 0, 0, 0, 0],
            [0, 2, 0, 0, 0, 0, 1, 0, 0]
        ]
    ],
    hard: [
        [
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 3, 0, 8, 5],
            [0, 0, 1, 0, 2, 0, 0, 0, 0],
            [0, 0, 0, 5, 0, 7, 0, 0, 0],
            [0, 0, 4, 0, 0, 0, 1, 0, 0],
            [0, 9, 0, 0, 0, 0, 0, 0, 0],
            [5, 0, 0, 0, 0, 0, 0, 7, 3],
            [0, 0, 2, 0, 1, 0, 0, 0, 0],
            [0, 0, 0, 0, 4, 0, 0, 0, 9]
        ]
    ]
};

/**
 * Get a random puzzle of specified difficulty
 */
export const getRandomPuzzle = (difficulty = 'easy') => {
    const puzzles = SUDOKU_PUZZLES[difficulty];
    const randomIndex = Math.floor(Math.random() * puzzles.length);
    return JSON.parse(JSON.stringify(puzzles[randomIndex])); // Deep copy
};

/**
 * Fetch Sudoku puzzle from API
 */
export const fetchSudokuFromAPI = async (difficulty = 'easy') => {
    try {
        const difficultyMap = { easy: 'easy', medium: 'medium', hard: 'hard' };
        const response = await fetch(`https://sugoku.onrender.com/board?difficulty=${difficultyMap[difficulty]}`);
        const data = await response.json();

        if (data.board) {
            return data.board;
        }
        return getRandomPuzzle(difficulty);
    } catch (error) {
        console.error('Error fetching Sudoku from API:', error);
        return getRandomPuzzle(difficulty);
    }
};

/**
 * Create initial board state with fixed cells marked
 */
export const createInitialBoard = (puzzle) => {
    return puzzle.map(row =>
        row.map(cell => ({
            value: cell,
            isFixed: cell !== 0,
            isError: false
        }))
    );
};
