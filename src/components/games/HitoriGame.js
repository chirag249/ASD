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

const { width } = Dimensions.get('window');

// Pre-defined puzzles with solutions
const PUZZLES = {
    easy: [
        {
            size: 5,
            initial: [
                [2, 3, 2, 1, 4],
                [1, 2, 3, 2, 5],
                [3, 1, 2, 3, 1],
                [2, 3, 1, 2, 3],
                [4, 5, 3, 4, 2]
            ],
            solution: [
                [false, false, true, false, false],
                [false, false, false, true, false],
                [false, false, false, true, false],
                [true, false, false, false, false],
                [false, false, false, false, true]
            ]
        },
        {
            size: 5,
            initial: [
                [1, 2, 3, 2, 1],
                [2, 3, 1, 3, 2],
                [3, 1, 2, 1, 3],
                [2, 3, 1, 3, 2],
                [1, 2, 3, 2, 1]
            ],
            solution: [
                [false, false, false, true, false],
                [false, false, false, true, false],
                [false, false, false, true, false],
                [false, false, false, true, false],
                [false, false, false, true, false]
            ]
        }
    ],
    medium: [
        {
            size: 7,
            initial: [
                [1, 2, 3, 4, 5, 6, 7],
                [2, 3, 4, 5, 6, 7, 1],
                [3, 4, 5, 6, 7, 1, 2],
                [4, 5, 6, 7, 1, 2, 3],
                [5, 6, 7, 1, 2, 3, 4],
                [6, 7, 1, 2, 3, 4, 5],
                [7, 1, 2, 3, 4, 5, 6]
            ],
            solution: [
                [false, false, false, false, false, false, true],
                [false, false, false, false, false, true, false],
                [false, false, false, false, true, false, false],
                [false, false, false, true, false, false, false],
                [false, false, true, false, false, false, false],
                [false, true, false, false, false, false, false],
                [true, false, false, false, false, false, false]
            ]
        }
    ]
};

export default function HitoriGame({ onBack }) {
    const [difficulty, setDifficulty] = useState('easy');
    const [puzzle, setPuzzle] = useState(null);
    const [grid, setGrid] = useState([]);
    const [isComplete, setIsComplete] = useState(false);
    const [errors, setErrors] = useState({ duplicates: [], adjacent: [], connectivity: true });

    useEffect(() => {
        startNewGame(difficulty);
    }, []);

    useEffect(() => {
        if (grid.length > 0) {
            validatePuzzle();
        }
    }, [grid]);

    const startNewGame = (diff) => {
        const puzzles = PUZZLES[diff];
        const randomPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
        setPuzzle(randomPuzzle);
        setDifficulty(diff);
        setIsComplete(false);

        // Initialize grid
        const newGrid = randomPuzzle.initial.map(row =>
            row.map(value => ({
                value,
                isShaded: false
            }))
        );
        setGrid(newGrid);
    };

    const toggleCell = (row, col) => {
        const newGrid = grid.map(r => r.map(c => ({ ...c })));
        newGrid[row][col].isShaded = !newGrid[row][col].isShaded;
        setGrid(newGrid);
    };

    const checkDuplicates = () => {
        const errorCells = [];

        // Check rows
        for (let i = 0; i < grid.length; i++) {
            const seen = new Map();
            for (let j = 0; j < grid.length; j++) {
                if (!grid[i][j].isShaded) {
                    const value = grid[i][j].value;
                    if (seen.has(value)) {
                        errorCells.push([i, j]);
                        errorCells.push([i, seen.get(value)]);
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
                        errorCells.push([i, j]);
                        errorCells.push([seen.get(value), j]);
                    } else {
                        seen.set(value, i);
                    }
                }
            }
        }

        return errorCells;
    };

    const checkAdjacentShaded = () => {
        const errorCells = [];

        for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid.length; j++) {
                if (grid[i][j].isShaded) {
                    // Check right
                    if (j < grid.length - 1 && grid[i][j + 1].isShaded) {
                        errorCells.push([i, j]);
                        errorCells.push([i, j + 1]);
                    }
                    // Check down
                    if (i < grid.length - 1 && grid[i + 1][j].isShaded) {
                        errorCells.push([i, j]);
                        errorCells.push([i + 1, j]);
                    }
                }
            }
        }

        return errorCells;
    };

    const checkConnectivity = () => {
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

        // BFS from start
        const queue = [[startRow, startCol]];
        visited[startRow][startCol] = true;
        let unshadedCount = 1;

        while (queue.length > 0) {
            const [row, col] = queue.shift();

            // Check 4 neighbors (not diagonal)
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

    const validatePuzzle = () => {
        if (!puzzle || grid.length === 0) return;

        const duplicateErrors = checkDuplicates();
        const adjacentErrors = checkAdjacentShaded();
        const isConnected = checkConnectivity();

        setErrors({
            duplicates: duplicateErrors,
            adjacent: adjacentErrors,
            connectivity: isConnected
        });

        // Check if solved
        const hasDuplicates = duplicateErrors.length > 0;
        const hasAdjacent = adjacentErrors.length > 0;
        const isSolved = !hasDuplicates && !hasAdjacent && isConnected;

        if (isSolved && !isComplete) {
            // Verify against solution
            let matchesSolution = true;
            for (let i = 0; i < grid.length; i++) {
                for (let j = 0; j < grid.length; j++) {
                    if (grid[i][j].isShaded !== puzzle.solution[i][j]) {
                        matchesSolution = false;
                        break;
                    }
                }
                if (!matchesSolution) break;
            }

            if (matchesSolution) {
                setIsComplete(true);
                Alert.alert(
                    '🎉 Congratulations!',
                    'You solved the puzzle!',
                    [{ text: 'New Game', onPress: () => startNewGame(difficulty) }]
                );
            }
        }
    };

    const getHint = () => {
        if (!puzzle) return;

        for (let i = 0; i < puzzle.size; i++) {
            for (let j = 0; j < puzzle.size; j++) {
                if (grid[i][j].isShaded !== puzzle.solution[i][j]) {
                    const newGrid = grid.map(r => r.map(c => ({ ...c })));
                    newGrid[i][j].isShaded = puzzle.solution[i][j];
                    setGrid(newGrid);
                    return;
                }
            }
        }

        Alert.alert('No Hints', 'The puzzle is complete!');
    };

    const getCellSize = () => {
        if (!puzzle) return 40;
        const maxSize = (width - 80) / puzzle.size;
        return Math.min(maxSize, 50);
    };

    if (!puzzle) return null;

    const cellSize = getCellSize();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.title}>Hitori</Text>
                <View style={styles.placeholder} />
            </View>

            <View style={styles.difficultyContainer}>
                {['easy', 'medium'].map((diff) => (
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
                ))}</View>

            <View style={styles.statusContainer}>
                <View style={[styles.statusItem, errors.duplicates.length === 0 && styles.statusOk]}>
                    <Ionicons
                        name={errors.duplicates.length === 0 ? "checkmark-circle" : "close-circle"}
                        size={20}
                        color={errors.duplicates.length === 0 ? "#4CAF50" : "#FF5252"}
                    />
                    <Text style={styles.statusText}>No Duplicates</Text>
                </View>
                <View style={[styles.statusItem, errors.adjacent.length === 0 && styles.statusOk]}>
                    <Ionicons
                        name={errors.adjacent.length === 0 ? "checkmark-circle" : "close-circle"}
                        size={20}
                        color={errors.adjacent.length === 0 ? "#4CAF50" : "#FF5252"}
                    />
                    <Text style={styles.statusText}>No Adjacent</Text>
                </View>
                <View style={[styles.statusItem, errors.connectivity && styles.statusOk]}>
                    <Ionicons
                        name={errors.connectivity ? "checkmark-circle" : "close-circle"}
                        size={20}
                        color={errors.connectivity ? "#4CAF50" : "#FF5252"}
                    />
                    <Text style={styles.statusText}>Connected</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.gridContainer}>
                    {grid.map((row, rowIndex) => (
                        <View key={rowIndex} style={styles.row}>
                            {row.map((cell, colIndex) => {
                                const hasError = errors.duplicates.some(([r, c]) => r === rowIndex && c === colIndex) ||
                                    errors.adjacent.some(([r, c]) => r === rowIndex && c === colIndex);
                                return (
                                    <TouchableOpacity
                                        key={colIndex}
                                        style={[
                                            styles.cell,
                                            {
                                                width: cellSize,
                                                height: cellSize
                                            },
                                            cell.isShaded && styles.cellShaded,
                                            hasError && styles.cellError
                                        ]}
                                        onPress={() => toggleCell(rowIndex, colIndex)}
                                    >
                                        <Text style={[
                                            styles.cellText,
                                            cell.isShaded && styles.cellTextShaded
                                        ]}>
                                            {cell.value}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    ))}
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.actionBtn} onPress={getHint}>
                        <Ionicons name="bulb-outline" size={24} color="#FFD700" />
                        <Text style={styles.actionBtnText}>Hint</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => startNewGame(difficulty)}
                    >
                        <Ionicons name="refresh-outline" size={24} color="#007AFF" />
                        <Text style={styles.actionBtnText}>New</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.instructions}>
                    <Text style={styles.instructionTitle}>How to Play:</Text>
                    <Text style={styles.instructionText}>• Tap cells to shade/unshade them</Text>
                    <Text style={styles.instructionText}>• No duplicate numbers in rows/columns (unshaded)</Text>
                    <Text style={styles.instructionText}>• Shaded cells cannot touch (horizontally/vertically)</Text>
                    <Text style={styles.instructionText}>• All unshaded cells must connect</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        backgroundColor: '#00BCD4',
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
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#E0E0E0',
    },
    difficultyBtnActive: {
        backgroundColor: '#00BCD4',
    },
    difficultyText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    difficultyTextActive: {
        color: 'white',
    },
    statusContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 10,
        gap: 10,
    },
    statusItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 15,
        gap: 5,
        borderWidth: 2,
        borderColor: '#FF5252',
    },
    statusOk: {
        borderColor: '#4CAF50',
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#333',
    },
    scrollContent: {
        alignItems: 'center',
        paddingBottom: 20,
    },
    gridContainer: {
        backgroundColor: 'white',
        padding: 10,
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
        borderColor: '#999',
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cellShaded: {
        backgroundColor: '#333',
    },
    cellError: {
        backgroundColor: '#FFEBEE',
        borderColor: '#F44336',
        borderWidth: 2,
    },
    cellText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    cellTextShaded: {
        color: 'white',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
        paddingHorizontal: 40,
        gap: 20,
    },
    actionBtn: {
        alignItems: 'center',
        backgroundColor: 'white',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    actionBtnText: {
        marginTop: 5,
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
    },
    instructions: {
        marginTop: 20,
        padding: 15,
        backgroundColor: 'white',
        borderRadius: 10,
        marginHorizontal: 20,
    },
    instructionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    instructionText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
});
