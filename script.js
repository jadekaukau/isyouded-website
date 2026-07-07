const year = document.getElementById('year');
if (year) {
  year.textContent = new Date().getFullYear();
}

const audio = document.getElementById('ded-audio');
const toggle = document.getElementById('sound-toggle');

let isPlaying = false;

function updateSoundButton() {
  toggle.textContent = isPlaying ? 'Pause sound' : 'Play sound';
  toggle.setAttribute('aria-label', isPlaying ? 'Pause soundtrack' : 'Play soundtrack');
}

async function playSound() {
  try {
    audio.volume = 0.35;
    audio.muted = false;
    await audio.play();
    isPlaying = true;
  } catch (error) {
    isPlaying = false;
  }
  updateSoundButton();
}

toggle.addEventListener('click', async () => {
  if (audio.paused) {
    await playSound();
  } else {
    audio.pause();
    isPlaying = false;
    updateSoundButton();
  }
});

// Attempt autoplay on page load.
// Note: Chrome, Safari and most mobile browsers may block autoplay with sound until the user interacts.
window.addEventListener('load', () => {
  playSound();
});

// If autoplay was blocked, this starts the soundtrack on the user's first interaction.
document.addEventListener('pointerdown', () => {
  if (audio.paused) {
    playSound();
  }
}, { once: true });

updateSoundButton();
