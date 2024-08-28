let isScrolling = false;
const playPauseButton = document.getElementById('playPause');
const speedControl = document.getElementById('speedControl');
const speedValue = document.getElementById('speedValue');

playPauseButton.addEventListener('click', toggleScrolling);
speedControl.addEventListener('input', updateSpeed);

document.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    event.preventDefault();
    toggleScrolling();
  }
});

function toggleScrolling() {
  isScrolling = !isScrolling;
  playPauseButton.textContent = isScrolling ? 'Pause' : 'Play';
  playPauseButton.style.backgroundColor = isScrolling ? '#f44336' : '#4CAF50';

  chrome.runtime.sendMessage({
    action: isScrolling ? "startScrolling" : "stopScrolling",
    speed: speedControl.value
  });
}

function updateSpeed() {
  speedValue.textContent = `Speed: ${speedControl.value}`;
  if (isScrolling) {
    chrome.runtime.sendMessage({
      action: "updateSpeed",
      speed: speedControl.value
    });
  }
}