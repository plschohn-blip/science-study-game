
loadStudySets();

// Only wire game controls on pages that include them.
const voiceSelectEl = document.getElementById('voiceSelect');
if (voiceSelectEl) {
    const elementNameInput = document.getElementById('elementName');
    const elementSymbolInput = document.getElementById('elementSymbol');

    voiceSelectEl.addEventListener('change', function () {
        onVoiceSelectChange(this);
    });

    document.getElementById('submitBtn').addEventListener('click', checkAnswer);
    document.getElementById('skipBtn').addEventListener('click', skipQuestion);
    document.getElementById('hintBtn').addEventListener('click', showHint);
    document.getElementById('showAnswerBtn').addEventListener('click', showAnswer);
    document.getElementById('playAudio').addEventListener('click', speakElement);

    document.getElementById('restartBtn').addEventListener('click', () => {
        // Restart game back to study page
        if (document.getElementById('gameContainer')) document.getElementById('gameContainer').classList.add('hidden');
        if (document.getElementById('completeScreen')) document.getElementById('completeScreen').classList.remove('show');
        currentStudySetId = null;
        studySetElements  = [];
        window.location.href = './study.html';
    });

    elementNameInput.addEventListener('keypress', e => {
        if (e.key === 'Enter' && !elementSymbolInput.disabled) {
            elementSymbolInput.focus();
        }
    });

    elementSymbolInput.addEventListener('keypress', e => {
        if (e.key === 'Enter' && !document.getElementById('submitBtn').disabled) {
            checkAnswer();
        }
    });
}

