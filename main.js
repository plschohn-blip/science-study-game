
loadStudySets();

const voiceSelectEl    = document.getElementById('voiceSelect');
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
    document.getElementById('gameContainer').classList.add('hidden');
    document.getElementById('mainMenu').classList.remove('hidden');
    document.getElementById('completeScreen').classList.remove('show');
    currentStudySetId = null;
    studySetElements  = [];
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
