import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

const { width } = Dimensions.get('window');

const DIFFICULTIES = {
    beginner: { rows: 8, cols: 8, mines: 10 },
    intermediate: { rows: 12, cols: 12, mines: 25 },
    expert: { rows: 14, cols: 14, mines: 40 }
};

export default function MinesweeperGame({ onBack }) {
    const theme = useTheme();
    const [difficulty, setDifficulty] = useState('beginner');
    const [grid, setGrid] = useState([]);
    const [gameState, setGameState] = useState('playing'); // 'playing' | 'won' | 'lost'
    const [mineCount, setMineCount] = useState(10);
    const [flagCount, setFlagCount] = useState(0);
    const [firstClick, setFirstClick] = useState(true);
    const [timer, setTimer] = useState(0);
    const [timerInterval, setTimerInterval] = useState(null);

    useEffect(() => {
        startNewGame(difficulty);
        return () => {
            if (timerInterval) clearInterval(timerInterval);
        };
    }, []);

    useEffect(() => {
        if (gameState === 'playing' && !firstClick && !timerInterval) {
            const interval = setInterval(() => {
                setTimer(t => t + 1);
            }, 1000);
            setTimerInterval(interval);
        } else if (gameState !== 'playing' && timerInterval) {
            clearInterval(timerInterval);
            setTimerInterval(null);
        }
    }, [gameState, firstClick, timerInterval]);

    const startNewGame = (diff) => {
        const config = DIFFICULTIES[diff];
        setDifficulty(diff);
        setGameState('playing');
        setMineCount(config.mines);
        setFlagCount(0);
        setFirstClick(true);
        setTimer(0);
        if (timerInterval) {
            clearInterval(timerInterval);
            setTimerInterval(null);
        }

        // Initialize empty grid
        const newGrid = Array(config.rows).fill(null).map(() =>
            Array(config.cols).fill(null).map(() => ({
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                adjacentMines: 0
            }))
        );
        setGrid(newGrid);
    };

    const generateBoard = (rows, cols, mineCount, safeRow, safeCol) => {
        const newGrid = Array(rows).fill(null).map(() =>
            Array(cols).fill(null).map(() => ({
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                adjacentMines: 0
            }))
        );

        // Place mines randomly (avoiding safe cell and its neighbors)
        let minesPlaced = 0;
        while (minesPlaced < mineCount) {
            const row = Math.floor(Math.random() * rows);
            const col = Math.floor(Math.random() * cols);

            // Check if it's the safe cell or adjacent to it
            const isSafeZone = Math.abs(row - safeRow) <= 1 && Math.abs(col - safeCol) <= 1;

            if (!newGrid[row][col].isMine && !isSafeZone) {
                newGrid[row][col].isMine = true;
                minesPlaced++;
            }
        }

        // Calculate adjacent mine counts
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (!newGrid[i][j].isMine) {
                    newGrid[i][j].adjacentMines = countAdjacentMines(newGrid, i, j);
                }
            }
        }

        return newGrid;
    };

    const countAdjacentMines = (grid, row, col) => {
        const rows = grid.length;
        const cols = grid[0].length;
        let count = 0;

        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];

        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;

            if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                if (grid[newRow][newCol].isMine) {
                    count++;
                }
            }
        }

        return count;
    };

    const getNeighbors = (row, col) => {
        const rows = grid.length;
        const cols = grid[0].length;
        const neighbors = [];

        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
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

    const revealCell = (row, col) => {
        if (gameState !== 'playing') return;

        // First click generates the board
        if (firstClick) {
            const config = DIFFICULTIES[difficulty];
            const newGrid = generateBoard(config.rows, config.cols, config.mines, row, col);
            setGrid(newGrid);
            setFirstClick(false);
            // Reveal the first cell after generating
            setTimeout(() => revealCellRecursive(newGrid, row, col), 0);
            return;
        }

        revealCellRecursive(grid, row, col);
    };

    const revealCellRecursive = (currentGrid, row, col) => {
        const newGrid = currentGrid.map(r => r.map(c => ({ ...c })));

        const reveal = (r, c) => {
            if (r < 0 || r >= newGrid.length || c < 0 || c >= newGrid[0].length) {
                return;
            }

            const cell = newGrid[r][c];

            if (cell.isRevealed || cell.isFlagged) {
                return;
            }

            cell.isRevealed = true;

            if (cell.isMine) {
                setGameState('lost');
                revealAllMines(newGrid);
                Alert.alert(
                    '💣 Game Over',
                    `You hit a mine!\nTime: ${timer}s`,
                    [{ text: 'New Game', onPress: () => startNewGame(difficulty) }]
                );
                return;
            }

            // If no adjacent mines, reveal neighbors recursively
            if (cell.adjacentMines === 0) {
                const neighbors = getNeighborsForGrid(newGrid, r, c);
                neighbors.forEach(({ row, col }) => reveal(row, col));
            }
        };

        reveal(row, col);
        setGrid(newGrid);

        // Check win condition
        checkWin(newGrid);
    };

    const getNeighborsForGrid = (grid, row, col) => {
        const rows = grid.length;
        const cols = grid[0].length;
        const neighbors = [];

        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
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

    const revealAllMines = (grid) => {
        grid.forEach(row => {
            row.forEach(cell => {
                if (cell.isMine) {
                    cell.isRevealed = true;
                }
            });
        });
    };

    const toggleFlag = (row, col) => {
        if (gameState !== 'playing' || firstClick) return;

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

    const checkWin = (currentGrid) => {
        for (let i = 0; i < currentGrid.length; i++) {
            for (let j = 0; j < currentGrid[0].length; j++) {
                const cell = currentGrid[i][j];
                if (!cell.isMine && !cell.isRevealed) {
                    return false;
                }
            }
        }

        setGameState('won');
        Alert.alert(
            '🎉 You Win!',
            `All mines found!\nTime: ${timer}s`,
            [{ text: 'New Game', onPress: () => startNewGame(difficulty) }]
        );
        return true;
    };

    const getCellSize = () => {
        if (grid.length === 0) return 30;
        const maxSize = (width - 60) / grid[0].length;
        return Math.min(maxSize, 35);
    };

    const getCellContent = (cell) => {
        if (cell.isFlagged) return '🚩';
        if (!cell.isRevealed) return '';
        if (cell.isMine) return '💣';
        if (cell.adjacentMines === 0) return '';
        return cell.adjacentMines.toString();
    };

    const getNumberColor = (num) => {
        const colors = ['', '#0000FF', '#008000', '#FF0000', '#000080',
            '#800000', '#008080', '#000000', '#808080'];
        return colors[num] || '#000';
    };

    if (grid.length === 0) return null;

    const cellSize = getCellSize();
    const styles = createStyles(theme);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.title}>Minesweeper</Text>
                <View style={styles.placeholder} />
            </View>

            <View style={styles.difficultyContainer}>
                {Object.keys(DIFFICULTIES).map((diff) => (
                    <TouchableOpacity
                        key={diff}
                        style={[
                            styles.difficultyBtn,
                            difficulty === diff && styles.difficultyBtnActive
                        ]}
                        onPress={() => startNewGame(diff)}
                    >
                        <Text style={[
                            styles.difficultyText,
                            difficulty === diff && styles.difficultyTextActive
                        ]}>
                            {diff.charAt(0).toUpperCase() + diff.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                    <Ionicons name="flag" size={20} color="#FF5252" />
                    <Text style={styles.statValue}>{flagCount}/{mineCount}</Text>
                </View>
                <View style={styles.statBox}>
                    <Ionicons name="time" size={20} color="#4CAF50" />
                    <Text style={styles.statValue}>{timer}s</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.gridContainer}>
                    {grid.map((row, rowIndex) => (
                        <View key={rowIndex} style={styles.row}>
                            {row.map((cell, colIndex) => (
                                <TouchableOpacity
                                    key={colIndex}
                                    style={[
                                        styles.cell,
                                        {
                                            width: cellSize,
                                            height: cellSize
                                        },
                                        cell.isRevealed && styles.cellRevealed,
                                        cell.isMine && cell.isRevealed && styles.cellMine
                                    ]}
                                    onPress={() => revealCell(rowIndex, colIndex)}
                                    onLongPress={() => toggleFlag(rowIndex, colIndex)}
                                >
                                    <Text style={[
                                        styles.cellText,
                                        { color: getNumberColor(cell.adjacentMines) }
                                    ]}>
                                        {getCellContent(cell)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ))}
                </View>

                <View style={styles.instructions}>
                    <Text style={styles.instructionTitle}>How to Play:</Text>
                    <Text style={styles.instructionText}>• Tap to reveal a cell</Text>
                    <Text style={styles.instructionText}>• Long press to flag a mine</Text>
                    <Text style={styles.instructionText}>• Numbers show adjacent mines</Text>
                    <Text style={styles.instructionText}>• Reveal all non-mine cells to win</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.default,
    },
    header: {
        backgroundColor: '#FF5722',
        padding: 20,
        paddingTop: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backBtn: {
        padding: 5,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
    },
    placeholder: {
        width: 34,
    },
    difficultyContainer: {
        flexDirection: 'row',
        padding: 15,
        justifyContent: 'center',
        gap: 10,
    },
    difficultyBtn: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: theme.isDarkMode ? theme.colors.neutral.gray300 : '#E0E0E0',
    },
    difficultyBtnActive: {
        backgroundColor: '#FF5722',
    },
    difficultyText: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.text.secondary,
    },
    difficultyTextActive: {
        color: 'white',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 10,
        gap: 20,
    },
    statBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background.paper,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 10,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
    },
    scrollContent: {
        alignItems: 'center',
        paddingBottom: 20,
    },
    gridContainer: {
        backgroundColor: theme.colors.background.paper,
        padding: 5,
        borderRadius: 10,
        marginVertical: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    row: {
        flexDirection: 'row',
    },
    cell: {
        borderWidth: 1,
        borderColor: theme.isDarkMode ? theme.colors.neutral.gray400 : '#BDBDBD',
        backgroundColor: theme.isDarkMode ? theme.colors.neutral.gray300 : '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cellRevealed: {
        backgroundColor: theme.colors.background.paper,
        borderColor: theme.colors.text.disabled,
    },
    cellMine: {
        backgroundColor: '#FF5252',
    },
    cellText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    instructions: {
        marginTop: 20,
        padding: 15,
        backgroundColor: theme.colors.background.paper,
        borderRadius: 10,
        marginHorizontal: 20,
    },
    instructionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        marginBottom: 10,
    },
    instructionText: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        marginBottom: 5,
    },
});
