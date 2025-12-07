# Testing Guide for ASD App

## Overview
This guide covers unit testing, component testing, and debugging strategies for the ASD (All-in-one Super Deluxe) app.

---

## 1. Unit Testing (Logic)

### Setup
```bash
# Jest is already included with React Native
# Install additional testing utilities
npm install --save-dev @testing-library/react-native @testing-library/jest-native
```

### Test Structure
```
__tests__/
├── utils/
│   ├── sudokuUtils.test.js
│   ├── expenseCalculations.test.js
│   └── dateHelpers.test.js
├── games/
│   ├── nonogram.test.js
│   ├── minesweeper.test.js
│   └── hitori.test.js
└── store/
    └── zustand.test.js
```

---

## 2. Game Logic Tests

### Sudoku Tests
**File**: `__tests__/utils/sudokuUtils.test.js`

```javascript
import {
    isValidMove,
    isBoardFilled,
    isBoardValid,
    solveSudoku
} from '../../src/utils/sudokuUtils';

describe('Sudoku Utils', () => {
    describe('isValidMove', () => {
        it('should return true for valid move', () => {
            const board = [
                [5, 3, 0, 0, 7, 0, 0, 0, 0],
                // ... rest of board
            ];
            expect(isValidMove(board, 0, 2, 4)).toBe(true);
        });

        it('should return false for duplicate in row', () => {
            const board = [
                [5, 3, 0, 0, 7, 0, 0, 0, 0],
                // ... rest of board
            ];
            expect(isValidMove(board, 0, 2, 5)).toBe(false);
        });

        it('should return false for duplicate in column', () => {
            const board = [
                [5, 3, 0, 0, 7, 0, 0, 0, 0],
                [6, 0, 0, 1, 9, 5, 0, 0, 0],
                // ... rest of board
            ];
            expect(isValidMove(board, 1, 1, 3)).toBe(false);
        });

        it('should return false for duplicate in 3x3 box', () => {
            const board = [
                [5, 3, 0, 0, 7, 0, 0, 0, 0],
                [6, 0, 0, 1, 9, 5, 0, 0, 0],
                [0, 9, 8, 0, 0, 0, 0, 6, 0],
                // ... rest of board
            ];
            expect(isValidMove(board, 0, 2, 6)).toBe(false);
        });
    });

    describe('isBoardFilled', () => {
        it('should return true for completely filled board', () => {
            const board = Array(9).fill(null).map(() => Array(9).fill(1));
            expect(isBoardFilled(board)).toBe(true);
        });

        it('should return false for incomplete board', () => {
            const board = [
                [5, 3, 0, 0, 7, 0, 0, 0, 0],
                // ... rest of board
            ];
            expect(isBoardFilled(board)).toBe(false);
        });
    });

    describe('solveSudoku', () => {
        it('should solve a valid sudoku puzzle', () => {
            const board = [
                [5, 3, 0, 0, 7, 0, 0, 0, 0],
                [6, 0, 0, 1, 9, 5, 0, 0, 0],
                // ... rest of puzzle
            ];
            expect(solveSudoku(board)).toBe(true);
            expect(isBoardFilled(board)).toBe(true);
            expect(isBoardValid(board)).toBe(true);
        });
    });
});
```

### Minesweeper Tests
**File**: `__tests__/games/minesweeper.test.js`

```javascript
describe('Minesweeper Logic', () => {
    describe('countAdjacentMines', () => {
        it('should count mines in all 8 directions', () => {
            const grid = [
                [{ isMine: true }, { isMine: false }, { isMine: true }],
                [{ isMine: false }, { isMine: false }, { isMine: false }],
                [{ isMine: true }, { isMine: false }, { isMine: true }],
            ];
            const count = countAdjacentMines(grid, 1, 1);
            expect(count).toBe(4);
        });

        it('should handle edge cells correctly', () => {
            const grid = [
                [{ isMine: false }, { isMine: true }],
                [{ isMine: true }, { isMine: false }],
            ];
            const count = countAdjacentMines(grid, 0, 0);
            expect(count).toBe(2);
        });

        it('should return 0 for no adjacent mines', () => {
            const grid = Array(3).fill(null).map(() =>
                Array(3).fill({ isMine: false })
            );
            const count = countAdjacentMines(grid, 1, 1);
            expect(count).toBe(0);
        });
    });

    describe('checkWin', () => {
        it('should return true when all non-mine cells revealed', () => {
            const grid = [
                [{ isMine: false, isRevealed: true }, { isMine: true, isRevealed: false }],
                [{ isMine: false, isRevealed: true }, { isMine: false, isRevealed: true }],
            ];
            expect(checkWin(grid)).toBe(true);
        });

        it('should return false when non-mine cells remain hidden', () => {
            const grid = [
                [{ isMine: false, isRevealed: false }, { isMine: true, isRevealed: false }],
                [{ isMine: false, isRevealed: true }, { isMine: false, isRevealed: true }],
            ];
            expect(checkWin(grid)).toBe(false);
        });
    });
});
```

### Hitori Tests
**File**: `__tests__/games/hitori.test.js`

```javascript
describe('Hitori Logic', () => {
    describe('checkDuplicates', () => {
        it('should detect duplicates in rows', () => {
            const grid = [
                [{ value: 1, isShaded: false }, { value: 2, isShaded: false }, { value: 1, isShaded: false }],
            ];
            const errors = checkDuplicates(grid);
            expect(errors.length).toBeGreaterThan(0);
        });

        it('should ignore shaded cells', () => {
            const grid = [
                [{ value: 1, isShaded: false }, { value: 2, isShaded: false }, { value: 1, isShaded: true }],
            ];
            const errors = checkDuplicates(grid);
            expect(errors.length).toBe(0);
        });

        it('should detect duplicates in columns', () => {
            const grid = [
                [{ value: 1, isShaded: false }],
                [{ value: 2, isShaded: false }],
                [{ value: 1, isShaded: false }],
            ];
            const errors = checkDuplicates(grid);
            expect(errors.length).toBeGreaterThan(0);
        });
    });

    describe('checkAdjacentShaded', () => {
        it('should detect horizontally adjacent shaded cells', () => {
            const grid = [
                [{ isShaded: true }, { isShaded: true }, { isShaded: false }],
            ];
            const errors = checkAdjacentShaded(grid);
            expect(errors.length).toBeGreaterThan(0);
        });

        it('should detect vertically adjacent shaded cells', () => {
            const grid = [
                [{ isShaded: true }],
                [{ isShaded: true }],
                [{ isShaded: false }],
            ];
            const errors = checkAdjacentShaded(grid);
            expect(errors.length).toBeGreaterThan(0);
        });

        it('should return no errors for non-adjacent shaded cells', () => {
            const grid = [
                [{ isShaded: true }, { isShaded: false }, { isShaded: true }],
            ];
            const errors = checkAdjacentShaded(grid);
            expect(errors.length).toBe(0);
        });
    });

    describe('checkConnectivity', () => {
        it('should return true for all connected unshaded cells', () => {
            const grid = [
                [{ isShaded: false }, { isShaded: false }],
                [{ isShaded: false }, { isShaded: true }],
            ];
            expect(checkConnectivity(grid)).toBe(true);
        });

        it('should return false for disconnected unshaded cells', () => {
            const grid = [
                [{ isShaded: false }, { isShaded: true }, { isShaded: false }],
                [{ isShaded: true }, { isShaded: true }, { isShaded: true }],
            ];
            expect(checkConnectivity(grid)).toBe(false);
        });
    });
});
```

---

## 3. Utility Function Tests

### Expense Calculations
**File**: `__tests__/utils/expenseCalculations.test.js`

```javascript
describe('Expense Calculations', () => {
    const mockExpenses = [
        { amount: 100, category: 'Food' },
        { amount: 50, category: 'Transport' },
        { amount: 75, category: 'Food' },
        { amount: 200, category: 'Entertainment' },
    ];

    describe('calculateTotal', () => {
        it('should calculate total for all expenses', () => {
            const total = calculateTotal(mockExpenses);
            expect(total).toBe(425);
        });

        it('should calculate total for specific category', () => {
            const total = calculateTotal(mockExpenses, 'Food');
            expect(total).toBe(175);
        });

        it('should return 0 for empty array', () => {
            const total = calculateTotal([]);
            expect(total).toBe(0);
        });
    });

    describe('groupByCategory', () => {
        it('should group expenses by category', () => {
            const grouped = groupByCategory(mockExpenses);
            expect(grouped.Food).toHaveLength(2);
            expect(grouped.Transport).toHaveLength(1);
            expect(grouped.Entertainment).toHaveLength(1);
        });
    });

    describe('calculateCategoryPercentages', () => {
        it('should calculate correct percentages', () => {
            const percentages = calculateCategoryPercentages(mockExpenses);
            expect(percentages.Food).toBeCloseTo(41.18, 2);
            expect(percentages.Transport).toBeCloseTo(11.76, 2);
            expect(percentages.Entertainment).toBeCloseTo(47.06, 2);
        });
    });
});
```

---

## 4. Component Testing

### Task Component Test
**File**: `__tests__/components/TaskItem.test.js`

```javascript
import { render, fireEvent } from '@testing-library/react-native';
import TaskItem from '../../src/components/TaskItem';

describe('TaskItem Component', () => {
    const mockTask = {
        id: '1',
        title: 'Test Task',
        completed: false,
    };

    const mockOnToggle = jest.fn();
    const mockOnDelete = jest.fn();

    it('should render task title', () => {
        const { getByText } = render(
            <TaskItem task={mockTask} onToggle={mockOnToggle} onDelete={mockOnDelete} />
        );
        expect(getByText('Test Task')).toBeTruthy();
    });

    it('should call onToggle when pressed', () => {
        const { getByTestId } = render(
            <TaskItem task={mockTask} onToggle={mockOnToggle} onDelete={mockOnDelete} />
        );
        fireEvent.press(getByTestId('task-toggle'));
        expect(mockOnToggle).toHaveBeenCalledWith('1');
    });

    it('should call onDelete when delete button pressed', () => {
        const { getByTestId } = render(
            <TaskItem task={mockTask} onToggle={mockOnToggle} onDelete={mockOnDelete} />
        );
        fireEvent.press(getByTestId('task-delete'));
        expect(mockOnDelete).toHaveBeenCalledWith('1');
    });

    it('should show completed styling when task is completed', () => {
        const completedTask = { ...mockTask, completed: true };
        const { getByText } = render(
            <TaskItem task={completedTask} onToggle={mockOnToggle} onDelete={mockOnDelete} />
        );
        const title = getByText('Test Task');
        expect(title.props.style).toContainEqual(
            expect.objectContaining({ textDecorationLine: 'line-through' })
        );
    });
});
```

---

## 5. Zustand Store Tests

**File**: `__tests__/store/taskStore.test.js`

```javascript
import { act, renderHook } from '@testing-library/react-hooks';
import { useTaskStore } from '../../src/store/taskStore';

describe('Task Store', () => {
    beforeEach(() => {
        // Reset store before each test
        const { result } = renderHook(() => useTaskStore());
        act(() => {
            result.current.clearAll();
        });
    });

    it('should add a task', () => {
        const { result } = renderHook(() => useTaskStore());
        
        act(() => {
            result.current.addTask({ title: 'New Task', completed: false });
        });

        expect(result.current.tasks).toHaveLength(1);
        expect(result.current.tasks[0].title).toBe('New Task');
    });

    it('should toggle task completion', () => {
        const { result } = renderHook(() => useTaskStore());
        
        let taskId;
        act(() => {
            taskId = result.current.addTask({ title: 'Test', completed: false });
        });

        act(() => {
            result.current.toggleTask(taskId);
        });

        expect(result.current.tasks[0].completed).toBe(true);
    });

    it('should delete a task', () => {
        const { result } = renderHook(() => useTaskStore());
        
        let taskId;
        act(() => {
            taskId = result.current.addTask({ title: 'Test', completed: false });
        });

        act(() => {
            result.current.deleteTask(taskId);
        });

        expect(result.current.tasks).toHaveLength(0);
    });
});
```

---

## 6. Running Tests

### Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test sudokuUtils.test.js

# Run tests matching pattern
npm test -- --testNamePattern="Sudoku"
```

### Coverage Goals
- **Unit Tests**: >80% coverage
- **Game Logic**: >90% coverage
- **Utilities**: >85% coverage
- **Components**: >70% coverage

---

## 7. Debugging Strategies

### React Native Debugger
1. Install React Native Debugger
2. Enable Debug Mode in app
3. Inspect Redux/Zustand state
4. Monitor network requests
5. Check component tree

### Flipper
1. Install Flipper
2. Enable Flipper in app
3. Use plugins:
   - Layout Inspector
   - Network Inspector
   - Databases
   - Crash Reporter

### Console Logging
```javascript
// Structured logging
console.log('[TaskStore] Adding task:', task);
console.error('[API] Failed to fetch:', error);
console.warn('[Performance] Slow render detected');

// Conditional logging
if (__DEV__) {
    console.log('Development only log');
}
```

### Performance Profiling
```javascript
// Measure render time
import { unstable_trace as trace } from 'scheduler/tracing';

trace('TaskList render', performance.now(), () => {
    // Component render logic
});

// Check for unnecessary re-renders
import { whyDidYouRender } from '@welldone-software/why-did-you-render';
whyDidYouRender(React);
```

---

## 8. Common Issues and Solutions

### Issue: FlatList Performance
**Solution**: Use proper keyExtractor and avoid inline functions
```javascript
<FlatList
    data={tasks}
    keyExtractor={(item) => item.id}
    renderItem={renderTaskItem} // Not inline
    removeClippedSubviews={true}
    maxToRenderPerBatch={10}
    windowSize={10}
/>
```

### Issue: Memory Leaks
**Solution**: Clean up subscriptions and timers
```javascript
useEffect(() => {
    const subscription = someObservable.subscribe();
    return () => subscription.unsubscribe();
}, []);
```

### Issue: Slow Database Queries
**Solution**: Add indexes to frequently queried fields
```javascript
// In schema
@index('created_at')
@index('category')
```

---

## 9. Accessibility Testing

### Checklist
- [ ] All interactive elements have `accessibilityLabel`
- [ ] Minimum touch target size: 44x44
- [ ] Sufficient color contrast (WCAG AA: 4.5:1)
- [ ] Screen reader compatible
- [ ] Keyboard navigation support

### Testing Tools
```bash
# Install accessibility testing
npm install --save-dev @testing-library/jest-native

# Test example
expect(button).toHaveAccessibilityLabel('Add Task');
expect(button).toBeAccessible();
```

---

## 10. Continuous Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test -- --coverage
      - run: npm run lint
```

---

## Summary

✅ **Unit Tests**: Game logic, utilities, calculations  
✅ **Component Tests**: UI interactions, rendering  
✅ **Integration Tests**: Store actions, database  
✅ **Debugging**: Debugger, Flipper, logging  
✅ **Performance**: Profiling, optimization  
✅ **Accessibility**: WCAG compliance  
✅ **CI/CD**: Automated testing  

**Target Coverage**: 80%+ overall
