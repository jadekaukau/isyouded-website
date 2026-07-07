const audio = document.getElementById('ded-audio');
const toggle = document.getElementById('sound-toggle');

let isPlaying = false;

function updateButton() {
  toggle.textContent = isPlaying ? '♫ ON' : '♫ OFF';
  toggle.setAttribute('aria-label', isPlaying ? 'Pause soundtrack' : 'Play soundtrack');
}

async function startAudio() {
  try {
    audio.volume = 0.35;
    audio.muted = false;
    await audio.play();
    isPlaying = true;
  } catch (error) {
    isPlaying = false;
  }

  updateButton();
}

toggle.addEventListener('click', async () => {
  if (audio.paused) {
    await startAudio();
  } else {
    audio.pause();
    isPlaying = false;
    updateButton();
  }
});

window.addEventListener('load', startAudio);

document.addEventListener('pointerdown', () => {
  if (audio.paused) startAudio();
}, { once: true });

document.addEventListener('touchstart', () => {
  if (audio.paused) startAudio();
}, { once: true });

updateButton();
