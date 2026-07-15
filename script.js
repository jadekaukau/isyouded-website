const audio = document.getElementById("ded-audio");
const toggle = document.getElementById("sound-toggle");

audio.volume = 0.35;

function updateButton() {
  const isPlaying = !audio.paused;

  toggle.textContent = isPlaying ? "♫ ON" : "♫ OFF";
  toggle.setAttribute(
    "aria-label",
    isPlaying ? "Pause soundtrack" : "Play soundtrack"
  );
}

toggle.addEventListener("click", async () => {
  if (audio.paused) {
    try {
      await audio.play();
    } catch (error) {
      console.error("Audio could not be played:", error);
    }
  } else {
    audio.pause();
  }

  updateButton();
});

audio.addEventListener("play", updateButton);
audio.addEventListener("pause", updateButton);
audio.addEventListener("ended", updateButton);

window.addEventListener("load", async () => {
  try {
    await audio.play();
  } catch (error) {
    // Autoplay may be blocked until the visitor clicks the button.
  }

  updateButton();
});

updateButton();
