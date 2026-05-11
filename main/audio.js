

let availableVoices = [];
let selectedVoice   = null;

function getVoiceQualityScore(voice) {
    let score = 0;
    const name = voice.name.toLowerCase();
    if (name.includes('samantha')) score += 100;
    if (name.includes('alex'))     score += 90;
    if (name.includes('allison'))  score += 85;
    if (name.includes('ava'))      score += 85;
    if (name.includes('susan'))    score += 80;
    if (name.includes('karen'))    score += 75;
    if (name.includes('google'))   score += 70;
    if (name.includes('zira'))     score += 60;
    if (name.includes('david'))    score += 60;
    if (name.includes('premium'))  score += 50;
    if (name.includes('enhanced')) score += 40;
    if (name.includes('natural'))  score += 30;
    if (voice.lang === 'en-US')    score += 20;
    if (voice.localService)        score += 10;

    return score;
}

function getSortedEnglishVoices() {
    const english = speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));
    return english.sort((a, b) => getVoiceQualityScore(b) - getVoiceQualityScore(a));
}

function loadVoices() {
    const sorted = getSortedEnglishVoices();
    if (sorted.length === 0) return;

    const voiceSelect = document.getElementById('voiceSelect');
    voiceSelect.innerHTML = '';

    sorted.forEach((voice, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${voice.name} (${voice.lang})`;
        voiceSelect.appendChild(option);
    });

    voiceSelect.value = 0;
    selectedVoice = sorted[0];
}

function onVoiceSelectChange(selectEl) {
    const sorted = getSortedEnglishVoices();
    selectedVoice = sorted[parseInt(selectEl.value, 10)] || null;
}

function speakElement() {
    if (!('speechSynthesis' in window)) {
        alert('Speech synthesis is not supported in this browser.');
        return;
    }

    const element = ELEMENTS[currentElement];
    if (!element) {
        console.error('speakElement: unknown element id', currentElement);
        return;
    }

    speechSynthesis.cancel();

    const utterance       = new SpeechSynthesisUtterance(element.name);
    utterance.rate        = 0.6;
    utterance.pitch       = 1.0;
    utterance.volume      = 1.0;
    utterance.lang        = 'en-US';

    if (selectedVoice) utterance.voice = selectedVoice;

    speechSynthesis.speak(utterance);
}
if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadVoices;
}
loadVoices();
