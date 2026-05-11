

let elementStats = {};

let currentElement = null;

let totalAnswered = 0;

let sessionStartTime = Date.now();

let gameMode = 'study';

let studySetElements = [];

let currentStudySetId = null;

function getMasteryThreshold() {
    return gameMode === 'test' ? 1 : 2;
}

function initGame() {
    elementStats = {};

    const ids = studySetElements.length > 0
        ? studySetElements
        : Object.keys(ELEMENTS).map(Number);

    ids.forEach(id => {
        elementStats[id] = {
            attempts: 0,
            correct: 0,
            consecutiveCorrect: 0,
            lastSeen: 0,
            weight: 1.0,
        };
    });

    totalAnswered    = 0;
    sessionStartTime = Date.now();

    document.getElementById('gameScreen').style.display  = 'block';
    document.getElementById('completeScreen').classList.remove('show');

    loadNextElement();
}

function selectNextElement() {
    const threshold  = getMasteryThreshold();
    const unmastered = Object.keys(elementStats)
        .map(Number)
        .filter(id => elementStats[id].consecutiveCorrect < threshold);

    if (unmastered.length === 0) return null;

    const weighted = unmastered.map(id => {
        const stat = elementStats[id];
        let weight = 1.0;
        if (stat.attempts > 0) {
            const errorRate = 1 - stat.correct / stat.attempts;
            weight += errorRate * 3;
        }
        if (stat.attempts === 0) weight += 2;
        const msSinceLastSeen = Date.now() - stat.lastSeen;
        if (msSinceLastSeen < 30_000) weight *= 0.3;

        return { id, weight };
    });

    const totalWeight = weighted.reduce((sum, el) => sum + el.weight, 0);
    let random = Math.random() * totalWeight;

    for (const el of weighted) {
        random -= el.weight;
        if (random <= 0) return el.id;
    }

    return weighted[0].id;
}

function loadNextElement() {
    const nextId = selectNextElement();

    if (nextId === null) {
        showComplete();
        return;
    }

    currentElement = nextId;
    elementStats[nextId].lastSeen = Date.now();
    const nameInput   = document.getElementById('elementName');
    const symbolInput = document.getElementById('elementSymbol');

    nameInput.value   = '';
    symbolInput.value = '';
    nameInput.classList.remove('correct', 'incorrect');
    symbolInput.classList.remove('correct', 'incorrect');
    nameInput.disabled   = false;
    symbolInput.disabled = false;
    const feedbackEl = document.getElementById('feedback');
    feedbackEl.classList.remove('show', 'correct', 'incorrect', 'hint');
    document.getElementById('submitBtn').disabled     = false;
    document.getElementById('skipBtn').disabled       = false;
    document.getElementById('hintBtn').disabled       = false;
    document.getElementById('showAnswerBtn').disabled = false;

    updateStats();

    setTimeout(() => {
        speakElement();
        nameInput.focus();
    }, 300);
}

function lockControls() {
    document.getElementById('submitBtn').disabled     = true;
    document.getElementById('skipBtn').disabled       = true;
    document.getElementById('hintBtn').disabled       = true;
    document.getElementById('showAnswerBtn').disabled = true;
    document.getElementById('elementName').disabled   = true;
    document.getElementById('elementSymbol').disabled = true;
}

function checkAnswer() {
    const element   = ELEMENTS[currentElement];
    if (!element) { loadNextElement(); return; }

    const nameInput   = document.getElementById('elementName');
    const symbolInput = document.getElementById('elementSymbol');
    const feedbackEl  = document.getElementById('feedback');

    const nameCorrect   = nameInput.value.trim().toLowerCase() === element.name.toLowerCase();
    const symbolCorrect = symbolInput.value.trim() === element.symbol;
    const bothCorrect   = nameCorrect && symbolCorrect;
    elementStats[currentElement].attempts++;
    if (bothCorrect) {
        elementStats[currentElement].correct++;
        elementStats[currentElement].consecutiveCorrect++;
    } else {
        elementStats[currentElement].consecutiveCorrect = 0;
    }
    nameInput.classList.toggle('correct',   nameCorrect);
    nameInput.classList.toggle('incorrect', !nameCorrect);
    symbolInput.classList.toggle('correct',   symbolCorrect);
    symbolInput.classList.toggle('incorrect', !symbolCorrect);

    totalAnswered++;
    if (bothCorrect) {
        const consec    = elementStats[currentElement].consecutiveCorrect;
        const threshold = getMasteryThreshold();
        feedbackEl.textContent = consec >= threshold
            ? '✓ Mastered! 🎉'
            : `✓ Correct! (${consec}/${threshold} to master)`;
        feedbackEl.className = 'feedback show correct';
    } else {
        let message = '✗ ';
        if (!nameCorrect && !symbolCorrect) {
            message += `${element.name} (${element.symbol})`;
        } else if (!nameCorrect) {
            message += `Name: ${element.name}`;
        } else {
            message += `Symbol: ${element.symbol}`;
        }
        feedbackEl.textContent = message;
        feedbackEl.className   = 'feedback show incorrect';
    }

    lockControls();
    updateStats();

    setTimeout(loadNextElement, bothCorrect ? 800 : 2000);
}

function skipQuestion() {
    const element = ELEMENTS[currentElement];
    if (!element) { loadNextElement(); return; }

    elementStats[currentElement].attempts++;
    elementStats[currentElement].consecutiveCorrect = 0;
    totalAnswered++;

    const feedbackEl = document.getElementById('feedback');
    feedbackEl.textContent = `⊘ ${element.name} (${element.symbol})`;
    feedbackEl.className   = 'feedback show incorrect';

    lockControls();
    updateStats();

    setTimeout(loadNextElement, 2000);
}

function showHint() {
    const element    = ELEMENTS[currentElement];
    const symbolHint = element.symbol.length > 1
        ? element.symbol[0] + element.symbol[1]
        : element.symbol[0];

    const feedbackEl = document.getElementById('feedback');
    feedbackEl.textContent = `💡 Hint: Name starts with "${element.name[0]}" and symbol is "${symbolHint}"`;
    feedbackEl.className   = 'feedback show hint';

    document.getElementById('hintBtn').disabled = true;
}

function showAnswer() {
    const element     = ELEMENTS[currentElement];
    const nameInput   = document.getElementById('elementName');
    const symbolInput = document.getElementById('elementSymbol');
    const feedbackEl  = document.getElementById('feedback');

    nameInput.value   = element.name;
    symbolInput.value = element.symbol;
    nameInput.classList.add('correct');
    symbolInput.classList.add('correct');

    feedbackEl.textContent = `👁️ Answer: ${element.name} (${element.symbol})`;
    feedbackEl.className   = 'feedback show hint';

    elementStats[currentElement].attempts++;
    elementStats[currentElement].consecutiveCorrect = 0;
    totalAnswered++;

    lockControls();
    updateStats();

    setTimeout(loadNextElement, 2500);
}

function showComplete() {
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('completeScreen').classList.add('show');

    const totalAttempts = Object.values(elementStats).reduce((s, e) => s + e.attempts, 0);
    const totalCorrect  = Object.values(elementStats).reduce((s, e) => s + e.correct,  0);
    const accuracy      = totalAttempts > 0 ? Math.round(totalCorrect / totalAttempts * 100) : 0;
    const timeMin       = Math.round((Date.now() - sessionStartTime) / 60_000);

    document.getElementById('finalScore').textContent    = `${studySetElements.length} elements mastered • ${accuracy}% accuracy`;
    document.getElementById('finalAccuracy').textContent = `${timeMin} minutes`;
}

function updateStats() {
    const ids       = studySetElements.length > 0 ? studySetElements : Object.keys(ELEMENTS).map(Number);
    const threshold = getMasteryThreshold();
    const mastered  = ids.filter(id => elementStats[id]?.consecutiveCorrect >= threshold).length;
    const total     = ids.length;

    document.getElementById('currentNum').textContent = totalAnswered + 1;
    document.getElementById('correctNum').textContent = mastered;
    document.getElementById('totalNum').textContent   = total;
    document.getElementById('progressFill').style.width = `${(mastered / total) * 100}%`;
}
