import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    PanResponder,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');
const TILE_SIZE = (width - 100) / 4;

const COLORS = {
    0: '#CDC1B4',
    2: '#EEE4DA',
    4: '#EDE0C8',
    8: '#F2B179',
    16: '#F59563',
    32: '#F67C5F',
    64: '#F65E3B',
    128: '#EDCF72',
    256: '#EDCC61',
    512: '#EDC850',
    1024: '#EDC53F',
    2048: '#EDC22E',
};

const initializeGrid = () => {
    const grid = Array(4).fill(null).map(() => Array(4).fill(0));
    addRandomTile(grid);
    addRandomTile(grid);
    return grid;
};

const addRandomTile = (grid) => {
    const emptyCells = [];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (grid[i][j] === 0) {
                emptyCells.push({ row: i, col: j });
            }
        }
    }
    if (emptyCells.length > 0) {
        const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        grid[row][col] = Math.random() < 0.9 ? 2 : 4;
    }
};

const moveLeft = (grid) => {
    let moved = false;
    let score = 0;
    const newGrid = grid.map(row => {
        const filtered = row.filter(val => val !== 0);
        const merged = [];
        let i = 0;
        while (i < filtered.length) {
            if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
                merged.push(filtered[i] * 2);
                score += filtered[i] * 2;
                i += 2;
                moved = true;
            } else {
                merged.push(filtered[i]);
                i++;
            }
        }
        while (merged.length < 4) {
            merged.push(0);
        }
        if (JSON.stringify(row) !== JSON.stringify(merged)) {
            moved = true;
        }
        return merged;
    });
    return { grid: newGrid, moved, score };
};

const rotateGrid = (grid) => {
    return grid[0].map((_, i) => grid.map(row => row[i]).reverse());
};

const move = (grid, direction) => {
    let rotations = 0;
    if (direction === 'up') rotations = 3;
    else if (direction === 'right') rotations = 2;
    else if (direction === 'down') rotations = 1;

    let tempGrid = [...grid.map(row => [...row])];
    for (let i = 0; i < rotations; i++) {
        tempGrid = rotateGrid(tempGrid);
    }

    const { grid: movedGrid, moved, score } = moveLeft(tempGrid);

    // Fix: Properly restore the grid rotation
    let resultGrid = movedGrid;
    for (let i = 0; i < (4 - rotations) % 4; i++) {
        resultGrid = rotateGrid(resultGrid);
    }

    return { grid: resultGrid, moved, score };
};

const checkGameOver = (grid) => {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (grid[i][j] === 0) return false;
            if (j < 3 && grid[i][j] === grid[i][j + 1]) return false;
            if (i < 3 && grid[i][j] === grid[i + 1][j]) return false;
        }
    }
    return true;
};

export default function NumberPuzzleGame({ onBack }) {
    const [grid, setGrid] = useState(initializeGrid());
    const [score, setScore] = useState(0);
    const [bestScore, setBestScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    // Load best score on mount
    useEffect(() => {
        loadBestScore();
    }, []);

    useEffect(() => {
        checkWinOrLose();
    }, [grid]);

    // Save best score when it updates
    useEffect(() => {
        if (score > bestScore) {
            setBestScore(score);
            saveBestScore(score);
        }
    }, [score]);

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

    const saveBestScore = async (newBest) => {
        try {
            await AsyncStorage.setItem('2048_best_score', newBest.toString());
        } catch (error) {
            console.error('Error saving best score:', error);
        }
    };

    const checkWinOrLose = () => {
        const hasWon = grid.some(row => row.includes(2048));
        if (hasWon && !gameOver) {
            Alert.alert(
                '🎉 You Win!',
                'You reached 2048!',
                [
                    { text: 'Continue', style: 'cancel' },
                    { text: 'New Game', onPress: resetGame }
                ]
            );
        }

        if (checkGameOver(grid)) {
            setGameOver(true);
            Alert.alert(
                '😢 Game Over',
                `Final Score: ${score}`,
                [{ text: 'New Game', onPress: resetGame }]
            );
        }
    };

    const handleMove = (direction) => {
        if (gameOver) return;

        const { grid: newGrid, moved, score: moveScore } = move(grid, direction);

        if (moved) {
            addRandomTile(newGrid);
            setGrid(newGrid);
            setScore(score + moveScore);
        }
    };

    // Swipe gesture handler
    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderRelease: (evt, gestureState) => {
            const { dx, dy } = gestureState;
            const absX = Math.abs(dx);
            const absY = Math.abs(dy);
            const threshold = 30;

            if (absX < threshold && absY < threshold) return;

            if (absX > absY) {
                if (dx > 0) handleMove('right');
                else handleMove('left');
            } else {
                if (dy > 0) handleMove('down');
                else handleMove('up');
            }
        }
    });

    const resetGame = () => {
        setGrid(initializeGrid());
        setScore(0);
        setGameOver(false);
    };

    const getTileColor = (value) => COLORS[value] || '#3C3A32';
    const getTextColor = (value) => value <= 4 ? '#776E65' : '#F9F6F2';

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.title}>2048</Text>
                <View style={styles.placeholder} />
            </View>

            <View style={styles.scoreContainer}>
                <View style={styles.scoreBox}>
                    <Text style={styles.scoreLabel}>SCORE</Text>
                    <Text style={styles.scoreValue}>{score}</Text>
                </View>
                <View style={styles.scoreBox}>
                    <Text style={styles.scoreLabel}>BEST</Text>
                    <Text style={styles.scoreValue}>{bestScore}</Text>
                </View>
            </View>

            <View style={styles.gridContainer} {...panResponder.panHandlers}>
                {grid.map((row, i) => (
                    <View key={i} style={styles.row}>
                        {row.map((value, j) => (
                            <View
                                key={`${i}-${j}`}
                                style={[
                                    styles.tile,
                                    { backgroundColor: getTileColor(value) }
                                ]}
                            >
                                {value !== 0 && (
                                    <Text style={[
                                        styles.tileText,
                                        { color: getTextColor(value) },
                                        value >= 128 && styles.smallText,
                                        value >= 1024 && styles.tinyText
                                    ]}>
                                        {value}
                                    </Text>
                                )}
                            </View>
                        ))}
                    </View>
                ))}
            </View>

            <View style={styles.controls}>
                <View style={styles.controlRow}>
                    <View style={styles.placeholder2} />
                    <TouchableOpacity
                        style={styles.controlBtn}
                        onPress={() => handleMove('up')}
                    >
                        <Ionicons name="arrow-up" size={32} color="white" />
                    </TouchableOpacity>
                    <View style={styles.placeholder2} />
                </View>
                <View style={styles.controlRow}>
                    <TouchableOpacity
                        style={styles.controlBtn}
                        onPress={() => handleMove('left')}
                    >
                        <Ionicons name="arrow-back" size={32} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.controlBtn}
                        onPress={() => handleMove('down')}
                    >
                        <Ionicons name="arrow-down" size={32} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.controlBtn}
                        onPress={() => handleMove('right')}
                    >
                        <Ionicons name="arrow-forward" size={32} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity style={styles.newGameBtn} onPress={resetGame}>
                <Ionicons name="refresh-outline" size={24} color="white" />
                <Text style={styles.newGameText}>New Game</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAF8EF',
    },
    header: {
        backgroundColor: '#4ECDC4',
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
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
    },
    placeholder: {
        width: 34,
    },
    placeholder2: {
        width: 70,
    },
    scoreContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 20,
        gap: 15,
    },
    scoreBox: {
        backgroundColor: '#BBADA0',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        minWidth: 100,
    },
    scoreLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#EEE4DA',
        marginBottom: 5,
    },
    scoreValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    gridContainer: {
        backgroundColor: '#BBADA0',
        padding: 10,
        borderRadius: 10,
        marginHorizontal: 30,
        marginTop: 20,
    },
    row: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 10,
    },
    tile: {
        width: TILE_SIZE,
        height: TILE_SIZE,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tileText: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    smallText: {
        fontSize: 24,
    },
    tinyText: {
        fontSize: 20,
    },
    controls: {
        marginTop: 30,
        alignItems: 'center',
    },
    controlRow: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 15,
    },
    controlBtn: {
        width: 70,
        height: 70,
        backgroundColor: '#4ECDC4',
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    newGameBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4ECDC4',
        marginHorizontal: 40,
        marginTop: 20,
        padding: 15,
        borderRadius: 15,
        gap: 10,
    },
    newGameText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
