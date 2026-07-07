const year = document.getElementById('year');
if (year) {
  year.textContent = new Date().getFullYear();
}

const audio = document.getElementById('ded-audio');
const toggle = document.getElementById('sound-toggle');

let soundOn = true;

function updateSoundButton() {
  toggle.textContent = soundOn ? 'Sound on' : 'Sound off';
  toggle.setAttribute('aria-label', soundOn ? 'Pause soundtrack' : 'Play soundtrack');
}

async function tryStartAudio() {
  try {
    audio.volume = 0.35;
    await audio.play();
    soundOn = true;
  } catch (error) {
    soundOn = false;
  }

  updateSoundButton();
}

toggle.addEventListener('click', async () => {
  if (audio.paused) {
    audio.volume = 0.35;
    await audio.play();
    soundOn = true;
  } else {
    audio.pause();
    soundOn = false;
  }

  updateSoundButton();
});

document.addEventListener('click', () => {
  if (audio.paused && !soundOn) {
    tryStartAudio();
  }
}, { once: true });

tryStartAudio();
