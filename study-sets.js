
const DEFAULT_STUDY_SETS = {
    'mr-swamy-quiz-1': {
        name: 'Mr. Swamy Quiz #1',
        description: 'All 89 elements',
        elements: [
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
            11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
            22, 24, 25, 26, 27, 28, 29, 30, 31, 32,
            33, 34, 35, 36, 38, 42, 43, 54, 55, 56,
            57, 58, 59, 60, 61, 62, 63, 64, 65, 66,
            67, 68, 69, 70, 71, 72, 73, 74, 75, 76,
            77, 78, 79, 80, 81, 82, 83, 84, 85, 86,
            87, 88, 89, 90, 92, 94, 95, 99, 101,
        ],
    },
};

let studySets = { ...DEFAULT_STUDY_SETS };

function loadStudySets() {
    try {
        const saved = localStorage.getItem('studySets');
        if (saved) {
            const customSets = JSON.parse(saved);
            studySets = { ...DEFAULT_STUDY_SETS, ...customSets };
        }
    } catch (e) {
        console.warn('Could not load study sets from localStorage:', e);
    }
}

function saveStudySets() {
    try {
        const customSets = {};
        for (const [id, set] of Object.entries(studySets)) {
            if (!DEFAULT_STUDY_SETS[id]) customSets[id] = set;
        }
        localStorage.setItem('studySets', JSON.stringify(customSets));
    } catch (e) {
        console.warn('Could not save study sets to localStorage:', e);
    }
}

function parseElementRange(input) {
    const result = [];
    const parts = input.split(',');

    for (const part of parts) {
        const trimmed = part.trim();
        if (!trimmed) continue;

        if (trimmed.includes('-')) {
            const [rawStart, rawEnd] = trimmed.split('-');
            const start = parseInt(rawStart.trim(), 10);
            const end   = parseInt(rawEnd.trim(), 10);
            if (!isNaN(start) && !isNaN(end)) {
                const lo = Math.min(start, end);
                const hi = Math.max(start, end);
                for (let i = lo; i <= hi; i++) {
                    if (!result.includes(i)) result.push(i);
                }
            }
        } else {
            const num = parseInt(trimmed, 10);
            if (!isNaN(num) && !result.includes(num)) result.push(num);
        }
    }

    return result.sort((a, b) => a - b);
}

function getSetStats(elementIds) {
    let mastered = 0, learning = 0, newCount = 0;

    for (const id of elementIds) {
        const stat = elementStats[id];
        if (!stat || stat.attempts === 0) {
            newCount++;
        } else if (stat.consecutiveCorrect >= 2) {
            mastered++;
        } else {
            learning++;
        }
    }

    return { mastered, learning, new: newCount };
}
