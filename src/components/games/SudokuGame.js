import { Ionicons } from '@expo/vector-icons';
import { useEffect, useReducer, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import {
    createInitialBoard,
    fetchSudokuFromAPI,
    getHint,
    isBoardFilled,
    isBoardValid,
    solveSudoku
} from '../../utils/sudokuUtils';

const { width } = Dimensions.get('window');
const CELL_SIZE = (width - 60) / 9;

const gameReducer = (state, action) => {
    switch (action.type) {
        case 'NEW_GAME':
            return {
                ...state,
                board: action.board,
                solution: action.solution,
                selectedCell: null,
                mistakes: 0,
                isComplete: false
            };
        case 'SELECT_CELL':
            return { ...state, selectedCell: action.cell };
        case 'SET_VALUE':
            const { row, col, value, isCorrect } = action;
            const newBoard = state.board.map((r, i) =>
                r.map((cell, j) => {
                    if (i === row && j === col && !cell.isFixed) {
                        return {
                            ...cell,
                            value: value,
                            isError: !isCorrect && value !== 0
                        };
                    }
                    return cell;
                })
            );
            return {
                ...state,
                board: newBoard,
                mistakes: !isCorrect && value !== 0 ? state.mistakes + 1 : state.mistakes
            };
        case 'CLEAR_CELL':
            const clearedBoard = state.board.map((r, i) =>
                r.map((cell, j) => {
                    if (i === action.row && j === action.col && !cell.isFixed) {
                        return { ...cell, value: 0, isError: false };
                    }
                    return cell;
                })
            );
            return { ...state, board: clearedBoard };
        case 'SHOW_HINT':
            const hintBoard = state.board.map((r, i) =>
                r.map((cell, j) => {
                    if (i === action.row && j === action.col) {
                        return { ...cell, value: action.value, isError: false };
                    }
                    return cell;
                })
            );
            return { ...state, board: hintBoard };
        case 'CHECK_COMPLETE':
            const boardValues = state.board.map(row => row.map(cell => cell.value));
            const filled = isBoardFilled(boardValues);
            const valid = isBoardValid(boardValues);
            return { ...state, isComplete: filled && valid };
        default:
            return state;
    }
};

export default function SudokuGame({ onBack }) {
    const [difficulty, setDifficulty] = useState('easy');
    const [loading, setLoading] = useState(false);
    const [state, dispatch] = useReducer(gameReducer, {
        board: [],
        solution: [],
        selectedCell: null,
        mistakes: 0,
        isComplete: false
    });

    useEffect(() => {
        startNewGame(difficulty);
    }, []);

    useEffect(() => {
        if (state.board.length > 0) {
            dispatch({ type: 'CHECK_COMPLETE' });
        }
    }, [state.board]);

    useEffect(() => {
        if (state.isComplete) {
            Alert.alert(
                '🎉 Congratulations!',
                `You solved the puzzle!\nMistakes: ${state.mistakes}`,
                [{ text: 'New Game', onPress: () => startNewGame(difficulty) }]
            );
        }
    }, [state.isComplete]);

    const startNewGame = async (diff) => {
        setLoading(true);
        try {
            const puzzle = await fetchSudokuFromAPI(diff);
            const solution = JSON.parse(JSON.stringify(puzzle));
            solveSudoku(solution);

            const board = createInitialBoard(puzzle);

            dispatch({ type: 'NEW_GAME', board, solution });
            setDifficulty(diff);
        } catch (error) {
            Alert.alert('Error', 'Failed to load puzzle. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCellPress = (row, col) => {
        if (!state.board[row][col].isFixed) {
            dispatch({ type: 'SELECT_CELL', cell: { row, col } });
        }
    };

    const handleNumberPress = (num) => {
        if (state.selectedCell) {
            const { row, col } = state.selectedCell;
            const isCorrect = state.solution[row][col] === num;
            dispatch({ type: 'SET_VALUE', row, col, value: num, isCorrect });
        }
    };

    const handleClear = () => {
        if (state.selectedCell) {
            dispatch({
                type: 'CLEAR_CELL',
                row: state.selectedCell.row,
                col: state.selectedCell.col
            });
        }
    };

    const handleHint = () => {
        const boardValues = state.board.map(row => row.map(cell => cell.value));
        const hint = getHint(boardValues, state.solution);

        if (hint) {
            dispatch({ type: 'SHOW_HINT', row: hint.row, col: hint.col, value: hint.value });
            dispatch({ type: 'SELECT_CELL', cell: { row: hint.row, col: hint.col } });
        } else {
            Alert.alert('No Hints', 'The board is complete!');
        }
    };

    const renderCell = (cell, row, col) => {
        const isSelected = state.selectedCell?.row === row && state.selectedCell?.col === col;
        const isInSameRow = state.selectedCell?.row === row;
        const isInSameCol = state.selectedCell?.col === col;
        const isInSameBox =
            state.selectedCell &&
            Math.floor(state.selectedCell.row / 3) === Math.floor(row / 3) &&
            Math.floor(state.selectedCell.col / 3) === Math.floor(col / 3);

        return (
            <TouchableOpacity
                key={`${row}-${col}`}
                style={[
                    styles.cell,
                    { width: CELL_SIZE, height: CELL_SIZE },
                    isSelected && styles.selectedCell,
                    (isInSameRow || isInSameCol || isInSameBox) && !isSelected && styles.highlightedCell,
                    cell.isFixed && styles.fixedCell,
                    cell.isError && styles.errorCell,
                    col % 3 === 2 && col !== 8 && styles.rightBorder,
                    row % 3 === 2 && row !== 8 && styles.bottomBorder
                ]}
                onPress={() => handleCellPress(row, col)}
            >
                <Text style={[
                    styles.cellText,
                    cell.isFixed && styles.fixedText,
                    cell.isError && styles.errorText
                ]}>
                    {cell.value !== 0 ? cell.value : ''}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.title}>Sudoku</Text>
                <View style={styles.stats}>
                    <View style={styles.statItem}>
                        <Ionicons name="alert-circle" size={20} color="#FF5252" />
                        <Text style={styles.statText}>{state.mistakes}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.difficultyContainer}>
                {['easy', 'medium', 'hard'].map((diff) => (
                    <TouchableOpacity
                        key={diff}
                        style={[
                            styles.difficultyBtn,
                            difficulty === diff && styles.difficultyBtnActive
                        ]}
                        onPress={() => startNewGame(diff)}
                        disabled={loading}
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

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Loading puzzle from API...</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.gridContainer}>
                        {state.board.map((row, rowIndex) => (
                            <View key={rowIndex} style={styles.row}>
                                {row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))}
                            </View>
                        ))}
                    </View>

                    <View style={styles.numberPad}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <TouchableOpacity
                                key={num}
                                style={styles.numberBtn}
                                onPress={() => handleNumberPress(num)}
                            >
                                <Text style={styles.numberText}>{num}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.actionButtons}>
                        <TouchableOpacity style={styles.actionBtn} onPress={handleClear}>
                            <Ionicons name="backspace-outline" size={24} color="#666" />
                            <Text style={styles.actionBtnText}>Clear</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionBtn} onPress={handleHint}>
                            <Ionicons name="bulb-outline" size={24} color="#FFD700" />
                            <Text style={styles.actionBtnText}>Hint</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionBtn} onPress={() => startNewGame(difficulty)}>
                            <Ionicons name="refresh-outline" size={24} color="#007AFF" />
                            <Text style={styles.actionBtnText}>New</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        backgroundColor: '#007AFF',
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
        backgroundColor: '#007AFF',
    },
    difficultyText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    difficultyTextActive: {
        color: 'white',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        color: '#666',
    },
    scrollContent: {
        alignItems: 'center',
        paddingBottom: 20,
    },
    gridContainer: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginVertical: 15,
    },
    row: {
        flexDirection: 'row',
    },
    cell: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0.5,
        borderColor: '#BDBDBD',
    },
    selectedCell: {
        backgroundColor: '#BBDEFB',
    },
    highlightedCell: {
        backgroundColor: '#E3F2FD',
    },
    fixedCell: {
        backgroundColor: '#F5F5F5',
    },
    errorCell: {
        backgroundColor: '#FFEBEE',
    },
    rightBorder: {
        borderRightWidth: 2,
        borderRightColor: '#333',
    },
    bottomBorder: {
        borderBottomWidth: 2,
        borderBottomColor: '#333',
    },
    cellText: {
        fontSize: 20,
        fontWeight: '500',
        color: '#007AFF',
    },
    fixedText: {
        color: '#333',
        fontWeight: 'bold',
    },
    errorText: {
        color: '#FF5252',
    },
    numberPad: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: 20,
        gap: 10,
    },
    numberBtn: {
        width: (width - 80) / 5,
        height: (width - 80) / 5,
        backgroundColor: 'white',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    numberText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
        paddingHorizontal: 20,
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
});
