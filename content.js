// content.js file
const fileSelectPage = document.getElementById('file-select-page');
const videoContainer = document.getElementById('video-container');
const videoPlayer = document.getElementById('video-player');
const subtitlesContainer = document.getElementById('subtitles-container');
const lastTimeCheck = document.getElementById('lastTime');
const startButton = document.getElementById('start-button');
const control_bar = document.getElementById('control-bar');
const controlBarElements = control_bar.getElementsByTagName("*");
const seekBar = document.getElementById('seek-bar');
const preview = document.getElementById('preview');
const time = document.getElementById('time');
const play_pause = document.getElementById('play-pause');
const handle = document.getElementById('handle');

let videoFile;
let subtitleFile;
let subtitleDelay = 0;
let fadeTemp;
let notiTimeout;
let controlVisible = false;

videoFile = document.getElementById('video-file');
videoFile.addEventListener('change', updateVideoLabel);
subtitleFile = document.getElementById('subtitle-file');
subtitleFile.addEventListener('change', updateSubtitleLabel);
startButton.addEventListener('click', startVideoPlayer);

function startVideoPlayer() {
  videoFile = document.getElementById('video-file').files[0];
  subtitleFile = document.getElementById('subtitle-file').files[0];
  main = document.getElementById('main');
  main.remove();

  if (!subtitleFile) {
    showNotification('Subtitle file not selected.', 7000);
  } else {
    fetchSubtitleFile(subtitleFile);
  }

  const videoURL = URL.createObjectURL(videoFile);
  videoPlayer.src = videoURL;
  preview.src = videoURL;

  fetchSubtitleFile(subtitleFile);

  updateTimeLabel();

  fileSelectPage.style.display = 'none';
  videoContainer.style.display = 'block';

  let lastPlayTime = localStorage.getItem(videoFile.name);
  console.log(lastTimeCheck.checked)
  if(lastPlayTime != null && lastTimeCheck.checked)
    video.currentTime = lastPlayTime;
}

function updateTimeLabel() {
  videoPlayer.addEventListener('timeupdate', () => {
    time.textContent = formatTime(video.currentTime) + ' / ' + formatTime(video.duration);
  });
}

function fetchSubtitleFile(subtitleFile) {
  if (!subtitleFile) {
    return;
  }
  const reader = new FileReader();

  reader.onload = function (event) {
    const subtitles = event.target.result;
    const subtitleLines = subtitles.trim().split('\n\r\n');
    const subtitleObjects = subtitleLines.map((subtitleLine) => {
      const [index, timing, ...text] = subtitleLine.split('\n');
      const [startTime, endTime] = timing.split(' --> ').map(convertSubtitleTime);
      return { startTime, endTime, text: text.join('<br>') };
    });
    let currentSubtitleIndex = -1;
    videoPlayer.addEventListener('timeupdate', () => {
      let currentTime = videoPlayer.currentTime - subtitleDelay/1000;
      const subtitleIndex = subtitleObjects.findIndex(
        (subtitle) => currentTime >= subtitle.startTime && currentTime <= subtitle.endTime
      );
      if (subtitleIndex !== currentSubtitleIndex) {
        currentSubtitleIndex = subtitleIndex;
        if (subtitleIndex !== -1) {
          subtitlesContainer.innerHTML = subtitleObjects[subtitleIndex].text;
        } else {
          subtitlesContainer.innerHTML = ' ';
        }
      }
    });
  };

  reader.onerror = function (event) {
    console.error('Failed to load subtitle file:', event.target.error);
  };

  reader.readAsText(subtitleFile);
}

function convertSubtitleTime(timeString) {
  const [hours, minutes, secondsAndMilliseconds] = timeString.split(':');
  const [seconds, milliseconds] = secondsAndMilliseconds.split(',');
  let totalMilliseconds =
    Number(hours) * 3600000 +
    Number(minutes) * 60000 +
    Number(seconds) * 1000 +
    Number(milliseconds);
  return totalMilliseconds / 1000;
}

videoPlayer.addEventListener('click', (event) => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
});

play_pause.addEventListener('click', function() {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
});

const video = document.getElementById('video-player');
let keysPressed = {};
document.addEventListener('keydown', (event) => {
  keysPressed[event.key] = true;
  console.log(keysPressed);

  if (event.code === 'Space') {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }
  
  else if (event.key == 'f' || event.key == 'F') {
    if (!document.fullscreenElement) {
      videoContainer.requestFullscreen();
    }
    else {
      console.log("Kya bhai")  
      document.exitFullscreen();
    }
  }

  else if(keysPressed['Control']){
    if (event.code === 'ArrowRight') {
      video.currentTime += 30;
      let message = 'Forward ' + 30 + ' s';
      showNotification(message, 3000);
      fadeInControlBar();
      controlVisible = true;
    } 
    else if (event.code === 'ArrowLeft') {
      video.currentTime -= 30;
      let message = 'Backward ' + 30 + ' s';
      showNotification(message, 3000);
      fadeInControlBar();
      controlVisible = true;
    } 
    
    else if (event.key === '.') {
      subtitleDelay += 1000;
      let message = 'Subtitle delay = ' + subtitleDelay + ' ms';
      showNotification(message, 3000);
      fetchSubtitleFile(subtitleFile);
    } 
    else if (event.key === ',') {
      subtitleDelay -= 1000;
      let message = 'Subtitle delay = ' + subtitleDelay + ' ms';
      showNotification(message, 3000);
    } 
  }

  else if (event.code === 'ArrowRight') {
    video.currentTime += 5;
    let message = 'Forward ' + 5 + ' s';
    showNotification(message, 3000);
    fadeInControlBar();
    controlVisible = true;
  } 
  else if (event.code === 'ArrowLeft') {
    video.currentTime -= 5;
    let message = 'Backward ' + 5 + ' s';
    showNotification(message, 3000);
    fadeInControlBar();
    controlVisible = true;
  } 
  
  else if (event.code === 'ArrowUp') {
    if(video.volume < 1)
      video.volume += 0.1;
    let vol = parseInt(video.volume*100);
    let message = 'Volume = ' + vol + ' %';
    showNotification(message, 3000);
  } 
  else if (event.code === 'ArrowDown') {
    if(video.volume > 0.1)
      video.volume -= 0.1;
    let vol = parseInt(video.volume*100);
    vol = vol == 1? 0 : vol;  
    let message = 'Volume = ' + vol + ' %';
    showNotification(message, 3000);
  } 
  
  else if (event.key === '.') {
    subtitleDelay += 100;
    let message = 'Subtitle delay = ' + subtitleDelay + ' ms';
    showNotification(message, 3000);
    fetchSubtitleFile(subtitleFile);
  } 
  else if (event.key === ',') {
    subtitleDelay -= 100;
    let message = 'Subtitle delay = ' + subtitleDelay + ' ms';
    showNotification(message, 3000);
  }
});

document.addEventListener('keyup', (event) => {
  delete keysPressed[event.key];
  if(controlVisible){
    if (fadeTemp) clearTimeout(fadeTemp);
    fadeTemp = setTimeout(function() {fadeOutControlBar();}, 3000);
  }
});

function showNotification(message, t) {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.style.animation = 'cFadeIn 1s Forwards';

  clearTimeout(notiTimeout);
  // Hide the notification after 7 seconds
  notiTimeout = setTimeout(hideNotification, t);
}

function hideNotification() {
  const notification = document.getElementById('notification');
  notification.style.animation = 'cFadeOut 2s Forwards';
}


function updateVideoLabel() {
  let labelText = document.getElementById('video-label-text');
  
  if (videoFile.files.length > 0) {
    labelText.textContent = videoFile.files[0].name;
  } else {
    labelText.textContent = 'Choose Video';
  }

  if(!videoFile.files[0])
    startButton.style.display = 'none';
  else
    startButton.style.display = 'inline-block';
}

function updateSubtitleLabel() {
  let fileInput = document.getElementById('subtitle-file');
  let labelText = document.getElementById('subtitle-label-text');
  
  if (fileInput.files.length > 0) {
    labelText.textContent = fileInput.files[0].name;
  } else {
    labelText.textContent = 'Choose Subtitle';
  }
}

function formatTime(seconds) {
  let hours = Math.floor(seconds / 3600);
  let minutes = Math.floor((seconds % 3600) / 60);
  let remainingSeconds = Math.floor(seconds % 60);

  let formattedTime = hours.toString().padStart(2, '0') + ':' +
                      minutes.toString().padStart(2, '0') + ':' +
                      remainingSeconds.toString().padStart(2, '0');

  return formattedTime;
}

video.addEventListener('timeupdate', function() {
  let ratio = (video.currentTime/video.duration)*100;
  handle.style.left = ratio + '%';
  timeSinceLastFadeIn++;
});

let pause = false;
video.addEventListener('pause', function() {
  console.log("paused");
  pause = true;
  play_pause.src = "play.png";
  fadeInControlBar();
});
video.addEventListener('play', function() {
  pause = false;
  console.log("play");
  play_pause.src = "pause.png";
  if (fadeTemp) clearTimeout(fadeTemp);
  fadeTemp = setTimeout(function() {fadeOutControlBar();}, 3000);
});

document.addEventListener("mousemove", (event) => {
  fadeInControlBar();
  if (fadeTemp) clearTimeout(fadeTemp);
  fadeTemp = setTimeout(function() {fadeOutControlBar();}, 3000);
});

function fadeOutControlBar() {
  if(!pause){
    console.log("Fade out called");
    control_bar.style.animation = 'cFadeOut 2s Forwards';
    for (let i = 0; i < controlBarElements.length; i++) {
      if(controlBarElements[i].id != 'preview')
        controlBarElements[i].style.animation = 'cFadeOut 2s Forwards';
    }
  }
}

function fadeInControlBar() {
  timeSinceLastFadeIn = 0;
  console.log("Fade in called");
  control_bar.style.animation = 'cFadeIn 1s Forwards';
  for (let i = 0; i < controlBarElements.length; i++) {
    if(controlBarElements[i].id != 'preview')
      controlBarElements[i].style.animation = 'cFadeIn 1s Forwards';
  }
}

let seekBarHeight = parseInt(window.getComputedStyle(seekBar).height);
seekBar.addEventListener("mousemove", (event) => {
  seekBar.style.height = (seekBarHeight + (seekBarHeight*0.5)) + 'px';

  let mouseX = event.clientX;
  let seekBarRect = seekBar.getBoundingClientRect();
  let hoverTime = (mouseX - seekBarRect.left)/seekBarRect.width;
  preview.currentTime = hoverTime*videoPlayer.duration;
  preview.style.left = mouseX + "px";
  preview.style.opacity = 1;

  seekBar.addEventListener("click", (event) => {
    video.currentTime = preview.currentTime;
  });

  hoverTime = formatTime(parseInt(hoverTime*videoPlayer.duration))
  showNotification(hoverTime, 3000);
});

seekBar.addEventListener("mouseout", (event) => {
  seekBar.style.height = seekBarHeight + 'px';
  preview.style.opacity = 0;
});

window.addEventListener('beforeunload', function(event) {
  localStorage.setItem(videoFile.name, video.currentTime);
});