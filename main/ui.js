
// Multi-page UI
// Pages include: menu.html, study.html, reports.html.
// Logic here should only touch elements that exist on the current page.

function hasId(id) {
    return document.getElementById(id) !== null;
}

function showReports() {
    if (!hasId('reportContent')) return;

    let html = '<div style="display: flex; flex-direction: column; gap: 20px;">';

    for (const [, setData] of Object.entries(studySets)) {
        const ids = setData.elements;
        const snap = {};
        ids.forEach(id => {
            snap[id] = elementStats[id] || { attempts: 0, correct: 0, consecutiveCorrect: 0 };
        });

        const totalAttempts = Object.values(snap).reduce((s, e) => s + e.attempts, 0);
        const totalCorrect  = Object.values(snap).reduce((s, e) => s + e.correct,  0);
        const mastered      = Object.values(snap).filter(e => e.consecutiveCorrect >= 2).length;
        const learning      = Object.values(snap).filter(e => e.attempts > 0 && e.consecutiveCorrect < 2).length;
        const newEl         = Object.values(snap).filter(e => e.attempts === 0).length;

        const accuracy  = totalAttempts > 0 ? Math.round(totalCorrect / totalAttempts * 100) : 0;
        const readiness = ids.length > 0    ? Math.round(mastered / ids.length * 100) : 0;
        const readinessStatus = readiness >= 80 ? '🚢 Ready!' : readiness >= 50 ? '🛬 Getting there…' : '☔ Keep studying';

        html += `
            <div style="background: white; padding: 20px; border-radius: 10px; border-top: 4px solid #667eea;">
                <h3 style="color: #667eea; margin-bottom: 15px; font-size: 1.1em;">${setData.name}</h3>
                <div class="report-grid">
                    <div style="padding: 0;">
                        <div class="report-stat-title">Mastered</div>
                        <div class="report-stat-value" style="color: #28a745;">${mastered}/${ids.length}</div>
                    </div>
                    <div style="padding: 0;">
                        <div class="report-stat-title">Accuracy</div>
                        <div class="report-stat-value" style="color: #667eea;">${accuracy}%</div>
                    </div>
                    <div style="padding: 0;">
                        <div class="report-stat-title">Learning</div>
                        <div class="report-stat-value" style="color: #ffc107;">${learning}</div>
                    </div>
                    <div style="padding: 0;">
                        <div class="report-stat-title">Not Started</div>
                        <div class="report-stat-value" style="color: #6c757d;">${newEl}</div>
                    </div>
                </div>
                <div class="readiness-meter">
                    <div class="readiness-fill" style="width: ${readiness}%">
                        ${readiness > 10 ? readiness + '%' : ''}
                    </div>
                </div>
                <div class="readiness-label">${readinessStatus}</div>
            </div>
        `;
    }

    html += '</div>';
    document.getElementById('reportContent').innerHTML = html;
}

function backToMenu() {
    window.location.href = './menu.html';
}

function backFromModeSelector() {}

function backFromGame() {
    currentStudySetId = null;
    studySetElements = [];
    // keep on same page; user can start again
    const modeSelector = document.getElementById('modeSelector');
    if (modeSelector) modeSelector.classList.remove('hidden');
    const gameContainer = document.getElementById('gameContainer');
    if (gameContainer) gameContainer.classList.add('hidden');
}

function showStudySets() {
    // study.html is already the study sets page
    renderStudySets();
}

function renderStudySets() {
    const container = document.getElementById('studySetsContainer');
    container.innerHTML = '';

    for (const [setId, setData] of Object.entries(studySets)) {
        const stats            = getSetStats(setData.elements);
        const progressPercent  = setData.elements.length > 0
            ? Math.round(stats.mastered / setData.elements.length * 100)
            : 0;
        const isCustom = setId.startsWith('custom-');

        const card       = document.createElement('div');
        card.className   = 'study-set-card';
        card.onclick     = () => selectStudySet(setId);
        card.innerHTML   = `
            ${isCustom ? `<button class="delete-set-btn" onclick="event.stopPropagation(); deleteStudySet('${setId}')">×</button>` : ''}
            <h3>${setData.name}</h3>
            <div class="study-set-info">
                <span>${setData.elements.length} elements</span>
                <span style="color: #667eea; font-weight: 600;">${progressPercent}% complete</span>
            </div>
            <div class="study-set-progress">
                <div class="progress-item">
                    <div class="progress-dot mastered"></div>
                    <span>${stats.mastered} mastered</span>
                </div>
                <div class="progress-item">
                    <div class="progress-dot learning"></div>
                    <span>${stats.learning} learning</span>
                </div>
                <div class="progress-item">
                    <div class="progress-dot new"></div>
                    <span>${stats.new} new</span>
                </div>
            </div>
        `;
        container.appendChild(card);
    }
}

function showAddSetModal() {
    document.getElementById('addSetModal').classList.remove('hidden');
    document.getElementById('setNameInput').focus();
}

function closeAddSetModal() {
    document.getElementById('addSetModal').classList.add('hidden');
    document.getElementById('setNameInput').value   = '';
    document.getElementById('setDescInput').value   = '';
    document.getElementById('setElementsInput').value = '';
}

function createNewSet() {
    const name        = document.getElementById('setNameInput').value.trim();
    const description = document.getElementById('setDescInput').value.trim();
    const elementsStr = document.getElementById('setElementsInput').value.trim();

    if (!name)        { alert('Please enter a set name.');              return; }
    if (!elementsStr) { alert('Please enter element numbers.');         return; }

    const elementArray = parseElementRange(elementsStr);
    if (elementArray.length === 0) {
        alert('Please enter valid element numbers or ranges.');
        return;
    }

    const setId = 'custom-' + Date.now();
    studySets[setId] = {
        name,
        description: description || `${elementArray.length} elements`,
        elements: elementArray,
    };

    saveStudySets();
    closeAddSetModal();
    renderStudySets();
}

function deleteStudySet(setId) {
    if (!confirm('Delete this study set? This cannot be undone.')) return;
    delete studySets[setId];
    saveStudySets();
    renderStudySets();
}

function selectStudySet(setId) {
    currentStudySetId = setId;
    studySetElements  = [...studySets[setId].elements];

    document.getElementById('selectedSetName').textContent = studySets[setId].name;
    showOnly('modeSelector');
}

function startMode(mode) {
    gameMode = mode;
    showOnly('gameContainer');

    const badge = document.getElementById('modeBadge');
    if (mode === 'study') {
        badge.textContent = '📚 Study Mode';
        badge.classList.remove('test');
        document.getElementById('studyButtons').style.display = 'flex';
    } else {
        badge.textContent = '✅ Test Mode';
        badge.classList.add('test');
        document.getElementById('studyButtons').style.display = 'none';
    }

    initGame();
}

function showReports() {
    showOnly('reportScreen');

    let html = '<div style="display: flex; flex-direction: column; gap: 20px;">';

    for (const [, setData] of Object.entries(studySets)) {
        const ids = setData.elements;
        const snap = {};
        ids.forEach(id => {
            snap[id] = elementStats[id] || { attempts: 0, correct: 0, consecutiveCorrect: 0 };
        });

        const totalAttempts = Object.values(snap).reduce((s, e) => s + e.attempts, 0);
        const totalCorrect  = Object.values(snap).reduce((s, e) => s + e.correct,  0);
        const mastered      = Object.values(snap).filter(e => e.consecutiveCorrect >= 2).length;
        const learning      = Object.values(snap).filter(e => e.attempts > 0 && e.consecutiveCorrect < 2).length;
        const newEl         = Object.values(snap).filter(e => e.attempts === 0).length;

        const accuracy  = totalAttempts > 0 ? Math.round(totalCorrect / totalAttempts * 100) : 0;
        const readiness = ids.length > 0    ? Math.round(mastered / ids.length * 100) : 0;
        const readinessStatus = readiness >= 80 ? '🟢 Ready!' : readiness >= 50 ? '🟡 Getting there…' : '🔴 Keep studying';

        html += `
            <div style="background: white; padding: 20px; border-radius: 10px; border-top: 4px solid #667eea;">
                <h3 style="color: #667eea; margin-bottom: 15px; font-size: 1.1em;">${setData.name}</h3>
                <div class="report-grid">
                    <div style="padding: 0;">
                        <div class="report-stat-title">Mastered</div>
                        <div class="report-stat-value" style="color: #28a745;">${mastered}/${ids.length}</div>
                    </div>
                    <div style="padding: 0;">
                        <div class="report-stat-title">Accuracy</div>
                        <div class="report-stat-value" style="color: #667eea;">${accuracy}%</div>
                    </div>
                    <div style="padding: 0;">
                        <div class="report-stat-title">Learning</div>
                        <div class="report-stat-value" style="color: #ffc107;">${learning}</div>
                    </div>
                    <div style="padding: 0;">
                        <div class="report-stat-title">Not Started</div>
                        <div class="report-stat-value" style="color: #6c757d;">${newEl}</div>
                    </div>
                </div>
                <div class="readiness-meter">
                    <div class="readiness-fill" style="width: ${readiness}%">
                        ${readiness > 10 ? readiness + '%' : ''}
                    </div>
                </div>
                <div class="readiness-label">${readinessStatus}</div>
            </div>
        `;
    }

    html += '</div>';
    document.getElementById('reportContent').innerHTML = html;
}
