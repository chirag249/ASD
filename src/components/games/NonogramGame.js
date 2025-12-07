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
            rowClues: [[2], [1, 1], [5], [1], [3]],
            colClues: [[1], [2], [5], [2], [2]],
            solution: [
                [0, 1, 1, 0, 0],
                [1, 0, 1, 0, 0],
                [1, 1, 1, 1, 1],
                [0, 0, 1, 0, 0],
                [0, 1, 1, 1, 0]
            ]
        },
        {
            size: 5,
            rowClues: [[3], [1, 1], [1, 1], [1, 1], [3]],
            colClues: [[1, 1], [1, 1], [5], [1, 1], [1, 1]],
            solution: [
                [0, 1, 1, 1, 0],
                [1, 0, 1, 0, 1],
                [1, 0, 1, 0, 1],
                [1, 0, 1, 0, 1],
                [0, 1, 1, 1, 0]
            ]
        }
    ],
    medium: [
        {
            size: 8,
            rowClues: [[3], [5], [7], [8], [7], [5], [3], [1]],
            colClues: [[1], [2], [3], [8], [8], [3], [2], [1]],
            solution: [
                [0, 0, 1, 1, 1, 0, 0, 0],
                [0, 1, 1, 1, 1, 1, 0, 0],
                [1, 1, 1, 1, 1, 1, 1, 0],
                [1, 1, 1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 0],
                [0, 1, 1, 1, 1, 1, 0, 0],
                [0, 0, 1, 1, 1, 0, 0, 0],
                [0, 0, 0, 1, 0, 0, 0, 0]
            ]
        }
    ]
};

export default function NonogramGame({ onBack }) {
    const [difficulty, setDifficulty] = useState('easy');
    const [puzzle, setPuzzle] = useState(null);
    const [grid, setGrid] = useState([]);
    const [selectedCell, setSelectedCell] = useState(null);
    const [isComplete, setIsComplete] = useState(false);
    const [mistakes, setMistakes] = useState(0);

    useEffect(() => {
        startNewGame(difficulty);
    }, []);

    useEffect(() => {
        if (grid.length > 0) {
            checkCompletion();
        }
    }, [grid]);

    const startNewGame = (diff) => {
        const puzzles = PUZZLES[diff];
        const randomPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
        setPuzzle(randomPuzzle);
        setDifficulty(diff);
        setMistakes(0);
        setIsComplete(false);

        // Initialize grid with empty cells
        const newGrid = Array(randomPuzzle.size).fill(null).map(() =>
            Array(randomPuzzle.size).fill(null).map(() => ({
                state: 'empty', // 'empty' | 'filled' | 'marked'
                isCorrect: null
            }))
        );
        setGrid(newGrid);
    };

    const handleCellPress = (row, col) => {
        const newGrid = [...grid.map(r => [...r.map(c => ({ ...c }))])];
        const cell = newGrid[row][col];

        // Cycle through states: empty -> filled -> marked -> empty
        if (cell.state === 'empty') {
            cell.state = 'filled';
            // Check if correct
            if (puzzle.solution[row][col] === 0) {
                setMistakes(mistakes + 1);
            }
        } else if (cell.state === 'filled') {
            cell.state = 'marked';
        } else {
            cell.state = 'empty';
        }

        setGrid(newGrid);
    };

    const handleCellLongPress = (row, col) => {
        const newGrid = [...grid.map(r => [...r.map(c => ({ ...c }))])];
        const cell = newGrid[row][col];

        // Long press toggles marked state
        if (cell.state === 'marked') {
            cell.state = 'empty';
        } else {
            cell.state = 'marked';
        }

        setGrid(newGrid);
    };

    const validateLine = (line, clues) => {
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

        if (groups.length !== clues.length) return false;

        for (let i = 0; i < groups.length; i++) {
            if (groups[i] !== clues[i]) return false;
        }

        return true;
    };

    const checkCompletion = () => {
        if (!puzzle) return;

        // Check all rows
        for (let i = 0; i < puzzle.size; i++) {
            if (!validateLine(grid[i], puzzle.rowClues[i])) return;
        }

        // Check all columns
        for (let j = 0; j < puzzle.size; j++) {
            const column = grid.map(row => row[j]);
            if (!validateLine(column, puzzle.colClues[j])) return;
        }

        // Check against solution
        let allCorrect = true;
        for (let i = 0; i < puzzle.size; i++) {
            for (let j = 0; j < puzzle.size; j++) {
                const shouldBeFilled = puzzle.solution[i][j] === 1;
                const isFilled = grid[i][j].state === 'filled';
                if (shouldBeFilled !== isFilled) {
                    allCorrect = false;
                    break;
                }
            }
            if (!allCorrect) break;
        }

        if (allCorrect) {
            setIsComplete(true);
            Alert.alert(
                '🎉 Congratulations!',
                `You solved the puzzle!\nMistakes: ${mistakes}`,
                [{ text: 'New Game', onPress: () => startNewGame(difficulty) }]
            );
        }
    };

    const getHint = () => {
        if (!puzzle) return;

        for (let i = 0; i < puzzle.size; i++) {
            for (let j = 0; j < puzzle.size; j++) {
                const shouldBeFilled = puzzle.solution[i][j] === 1;
                const currentState = grid[i][j].state;

                if (shouldBeFilled && currentState !== 'filled') {
                    const newGrid = [...grid.map(r => [...r.map(c => ({ ...c }))])];
                    newGrid[i][j].state = 'filled';
                    setGrid(newGrid);
                    return;
                }
            }
        }

        Alert.alert('No Hints', 'The puzzle is complete!');
    };

    const getCellSize = () => {
        if (!puzzle) return 30;
        const maxSize = (width - 100) / puzzle.size;
        return Math.min(maxSize, 40);
    };

    const renderClueNumber = (num, index, isComplete) => (
        <Text
            key={index}
            style={[
                styles.clueNumber,
                isComplete && styles.clueComplete
            ]}
        >
            {num}
        </Text>
    );

    if (!puzzle) return null;

    const cellSize = getCellSize();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.title}>Nonogram</Text>
                <View style={styles.stats}>
                    <View style={styles.statItem}>
                        <Ionicons name="close-circle" size={20} color="#FF5252" />
                        <Text style={styles.statText}>{mistakes}</Text>
                    </View>
                </View>
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
                ))}
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.gameContainer}>
                    {/* Column clues */}
                    <View style={styles.columnCluesContainer}>
                        <View style={{ width: cellSize * 2, height: cellSize * 3 }} />
                        {puzzle.colClues.map((clues, colIndex) => (
                            <View
                                key={colIndex}
                                style={[styles.columnClue, { width: cellSize }]}
                            >
                                {clues.map((num, i) => renderClueNumber(num, i, false))}
                            </View>
                        ))}
                    </View>

                    {/* Grid with row clues */}
                    {grid.map((row, rowIndex) => (
                        <View key={rowIndex} style={styles.gridRow}>
                            {/* Row clue */}
                            <View style={[styles.rowClue, { width: cellSize * 2 }]}>
                                {puzzle.rowClues[rowIndex].map((num, i) =>
                                    renderClueNumber(num, i, false)
                                )}
                            </View>

                            {/* Grid cells */}
                            {row.map((cell, colIndex) => (
                                <TouchableOpacity
                                    key={colIndex}
                                    style={[
                                        styles.cell,
                                        {
                                            width: cellSize,
                                            height: cellSize
                                        },
                                        cell.state === 'filled' && styles.cellFilled,
                                        cell.state === 'marked' && styles.cellMarked
                                    ]}
                                    onPress={() => handleCellPress(rowIndex, colIndex)}
                                    onLongPress={() => handleCellLongPress(rowIndex, colIndex)}
                                >
                                    {cell.state === 'marked' && (
                                        <Text style={styles.markText}>×</Text>
                                    )}
                                </TouchableOpacity>
                            ))}
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
                    <Text style={styles.instructionText}>• Tap to fill a cell</Text>
                    <Text style={styles.instructionText}>• Tap again to mark as empty (×)</Text>
                    <Text style={styles.instructionText}>• Tap once more to clear</Text>
                    <Text style={styles.instructionText}>• Numbers show consecutive filled cells</Text>
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
        backgroundColor: '#9C27B0',
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
    stats: {
        flexDirection: 'row',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    statText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 5,
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
        backgroundColor: '#9C27B0',
    },
    difficultyText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    difficultyTextActive: {
        color: 'white',
    },
    scrollContent: {
        alignItems: 'center',
        paddingBottom: 20,
    },
    gameContainer: {
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
    columnCluesContainer: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    columnClue: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: 5,
    },
    gridRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rowClue: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingRight: 5,
    },
    clueNumber: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#666',
        marginHorizontal: 2,
    },
    clueComplete: {
        color: '#4CAF50',
    },
    cell: {
        borderWidth: 1,
        borderColor: '#BDBDBD',
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cellFilled: {
        backgroundColor: '#9C27B0',
    },
    cellMarked: {
        backgroundColor: '#E0E0E0',
    },
    markText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#666',
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
