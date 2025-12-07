import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 80) / 4;

const ICONS = [
    'heart', 'star', 'moon', 'sunny', 'flash', 'leaf',
    'flower', 'water', 'flame', 'snow', 'cloud', 'umbrella'
];

const createDeck = (pairCount = 8) => {
    const selectedIcons = ICONS.slice(0, pairCount);
    const pairs = [...selectedIcons, ...selectedIcons];
    return pairs
        .map((icon, index) => ({ id: index, icon, flipped: false, matched: false }))
        .sort(() => Math.random() - 0.5);
};

export default function MemoryGame({ onBack }) {
    const [cards, setCards] = useState([]);
    const [flippedIndices, setFlippedIndices] = useState([]);
    const [moves, setMoves] = useState(0);
    const [matches, setMatches] = useState(0);
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
        startNewGame();
    }, []);

    useEffect(() => {
        if (matches === 8) {
            setTimeout(() => {
                Alert.alert(
                    '🎉 Congratulations!',
                    `You won in ${moves} moves!`,
                    [{ text: 'New Game', onPress: startNewGame }]
                );
            }, 500);
        }
    }, [matches]);

    const startNewGame = () => {
        setCards(createDeck());
        setFlippedIndices([]);
        setMoves(0);
        setMatches(0);
        setIsChecking(false);
    };

    const handleCardPress = (index) => {
        if (isChecking || flippedIndices.length >= 2 || cards[index].flipped || cards[index].matched) {
            return;
        }

        const newFlipped = [...flippedIndices, index];
        setFlippedIndices(newFlipped);

        const newCards = [...cards];
        newCards[index].flipped = true;
        setCards(newCards);

        if (newFlipped.length === 2) {
            setMoves(moves + 1);
            setIsChecking(true);

            const [first, second] = newFlipped;
            if (cards[first].icon === cards[second].icon) {
                // Match found
                setTimeout(() => {
                    const matchedCards = [...cards];
                    matchedCards[first].matched = true;
                    matchedCards[second].matched = true;
                    setCards(matchedCards);
                    setFlippedIndices([]);
                    setMatches(matches + 1);
                    setIsChecking(false);
                }, 600);
            } else {
                // No match
                setTimeout(() => {
                    const resetCards = [...cards];
                    resetCards[first].flipped = false;
                    resetCards[second].flipped = false;
                    setCards(resetCards);
                    setFlippedIndices([]);
                    setIsChecking(false);
                }, 1000);
            }
        }
    };

    const renderCard = (card, index) => (
        <TouchableOpacity
            key={card.id}
            style={[
                styles.card,
                card.matched && styles.matchedCard
            ]}
            onPress={() => handleCardPress(index)}
            disabled={card.matched}
        >
            {card.flipped || card.matched ? (
                <Ionicons
                    name={card.icon}
                    size={40}
                    color={card.matched ? '#4CAF50' : '#007AFF'}
                />
            ) : (
                <Ionicons name="help" size={40} color="#999" />
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.title}>Memory Match</Text>
                <View style={styles.placeholder} />
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Moves</Text>
                    <Text style={styles.statValue}>{moves}</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Matches</Text>
                    <Text style={styles.statValue}>{matches}/8</Text>
                </View>
            </View>

            <View style={styles.gridContainer}>
                {cards.map((card, index) => renderCard(card, index))}
            </View>

            <TouchableOpacity style={styles.newGameBtn} onPress={startNewGame}>
                <Ionicons name="refresh-outline" size={24} color="white" />
                <Text style={styles.newGameText}>New Game</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        backgroundColor: '#FF6B6B',
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
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 20,
    },
    statBox: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 15,
        alignItems: 'center',
        minWidth: 120,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FF6B6B',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        padding: 20,
        gap: 10,
    },
    card: {
        width: CARD_SIZE,
        height: CARD_SIZE,
        backgroundColor: 'white',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    matchedCard: {
        backgroundColor: '#E8F5E9',
        opacity: 0.7,
    },
    newGameBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FF6B6B',
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
