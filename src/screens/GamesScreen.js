import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import HitoriGame from '../components/games/HitoriGame';
import MemoryGame from '../components/games/MemoryGame';
import MinesweeperGame from '../components/games/MinesweeperGame';
import NonogramGame from '../components/games/NonogramGame';
import NumberPuzzleGame from '../components/games/NumberPuzzleGame';
import SudokuGame from '../components/games/SudokuGame';

const { width } = Dimensions.get('window');

const GAMES = [
    {
        id: 'sudoku',
        name: 'Sudoku',
        icon: 'grid',
        color: '#007AFF',
        description: 'Classic number puzzle'
    },
    {
        id: 'memory',
        name: 'Memory Match',
        icon: 'albums',
        color: '#FF6B6B',
        description: 'Match pairs of cards'
    },
    {
        id: 'number-puzzle',
        name: '2048',
        icon: 'calculator',
        color: '#4ECDC4',
        description: 'Combine numbers to reach 2048'
    },
    {
        id: 'nonogram',
        name: 'Nonogram',
        icon: 'square-outline',
        color: '#9C27B0',
        description: 'Reveal pictures with number clues'
    },
    {
        id: 'minesweeper',
        name: 'Minesweeper',
        icon: 'flag',
        color: '#FF5722',
        description: 'Find mines using number hints'
    },
    {
        id: 'hitori',
        name: 'Hitori',
        icon: 'contrast',
        color: '#00BCD4',
        description: 'Shade cells to eliminate duplicates'
    }
];

export default function GamesScreen() {
    const [selectedGame, setSelectedGame] = useState(null);

    if (selectedGame) {
        const renderGame = () => {
            switch (selectedGame) {
                case 'sudoku':
                    return <SudokuGame onBack={() => setSelectedGame(null)} />;
                case 'memory':
                    return <MemoryGame onBack={() => setSelectedGame(null)} />;
                case 'number-puzzle':
                    return <NumberPuzzleGame onBack={() => setSelectedGame(null)} />;
                case 'nonogram':
                    return <NonogramGame onBack={() => setSelectedGame(null)} />;
                case 'minesweeper':
                    return <MinesweeperGame onBack={() => setSelectedGame(null)} />;
                case 'hitori':
                    return <HitoriGame onBack={() => setSelectedGame(null)} />;
                default:
                    return null;
            }
        };

        return renderGame();
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Games</Text>
                <Text style={styles.subtitle}>Choose a game to play</Text>
            </View>

            {/* Game Selection */}
            <ScrollView contentContainerStyle={styles.gameList}>
                {GAMES.map((game) => (
                    <TouchableOpacity
                        key={game.id}
                        style={[styles.gameCard, { borderLeftColor: game.color }]}
                        onPress={() => setSelectedGame(game.id)}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: game.color }]}>
                            <Ionicons name={game.icon} size={32} color="white" />
                        </View>
                        <View style={styles.gameInfo}>
                            <Text style={styles.gameName}>{game.name}</Text>
                            <Text style={styles.gameDescription}>{game.description}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#999" />
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Footer Info */}
            <View style={styles.footer}>
                <Ionicons name="game-controller-outline" size={20} color="#999" />
                <Text style={styles.footerText}>6 puzzle games to challenge your mind!</Text>
            </View>
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
        padding: 30,
        paddingTop: 50,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
    },
    gameList: {
        padding: 20,
    },
    gameCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 20,
        marginBottom: 15,
        borderLeftWidth: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    gameInfo: {
        flex: 1,
    },
    gameName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    gameDescription: {
        fontSize: 14,
        color: '#666',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        gap: 10,
    },
    footerText: {
        fontSize: 14,
        color: '#999',
    },
});
