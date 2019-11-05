const appRoot = $('#app-root');
const style = window.getComputedStyle(document.documentElement);
const defaultDancerHeight = parseInt(style.getPropertyValue('--dancer-height'));
const defaultDancerWidth = parseInt(style.getPropertyValue('--dancer-width'));

const sound = new Pizzicato.Sound(
  {
    source: 'file',
    options: { path: 'assets/equals_sign_8_reprise.mp3' },
  },
  () => {
    dancerColumn.appendChild(createDancer());
    dancerColumn.appendChild(createSoundbar());
  }
);

const delay = new Pizzicato.Effects.Delay({ time: 0, feedback: 0, mix: 0 });
const distortion = new Pizzicato.Effects.Distortion({ gain: 0 });
const filter = new Pizzicato.Effects.LowPassFilter({
  frequency: 22050,
  peak: 0,
});
const flanger = new Pizzicato.Effects.Flanger({
  time: 0,
  speed: 0,
  mix: 0,
  feedback: 0,
  depth: 0,
});
const analyzer = Pizzicato.context.createAnalyser();
analyzer.fftSize = 32;
const bufferLength = analyzer.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);
analyzer.getByteTimeDomainData(dataArray);

sound.addEffect(distortion);
sound.addEffect(flanger);
sound.addEffect(delay);
sound.addEffect(filter);
sound.connect(analyzer);

const effectsColumn = document.createElement('div');
const dancerColumn = document.createElement('div');

effectsColumn.classList.add('effects-column');
dancerColumn.classList.add('dancer-column');

appRoot.appendChild(effectsColumn);
appRoot.appendChild(dancerColumn);

effectsColumn.appendChild(
  ModBox({
    id: 'filter',
    name: 'Lowpass filter',
    onChange: ({ detail }) => {
      const { x, y } = detail;

      const freq = x * 22050;
      const Q = y * 10;

      filter.frequency = freq;
      filter.peak = Q;
    },
  })
);
effectsColumn.appendChild(
  ModBox({
    id: 'delay',
    name: 'Delay',
    onChange: ({ detail }) => {
      const { x, y } = detail;

      const time = x * 180;
      const feedback = y;

      delay.time = time;
      delay.feedback = feedback;
      delay.mix = feedback;
    },
  })
);
effectsColumn.appendChild(
  ModBox({
    id: 'dist',
    name: 'Distortion',
    onChange: ({ detail }) => {
      distortion.gain = detail.y;
    },
  })
);
effectsColumn.appendChild(
  ModBox({
    id: 'flanger',
    name: 'Flanger',
    onChange: ({ detail }) => {
      flanger.time = detail.x;
      flanger.speed = detail.x;
      flanger.depth = detail.y;
      flanger.feedback = detail.y;
      flanger.mix = detail.y;
    },
  })
);

const updateCssProperty = (variable, value, unit) => {
  const styles = getComputedStyle(document.documentElement);
  const propertyValue = styles.getPropertyValue(variable);

  const current = Number(propertyValue.replace(/deg|px/, ''));

  if (Number.isNaN(current) || Number.isNaN(value)) return;

  const val = Math.min(current + value * 10, 600);

  document.documentElement.style.setProperty(variable, `${val}${unit}`);
};

function danceCatDance() {
  requestAnimationFrame(danceCatDance);

  if (!sound.playing) return;

  analyzer.getByteTimeDomainData(dataArray);

  let bass = 0;
  let mid = 0;
  let treble = 0;
  let sum = 0;

  for (var i = 0; i < bufferLength; i++) {
    const value = dataArray[i]; // 128.0;
    sum += value;

    if (i < 6) {
      bass += value;
    } else if (i < 10) {
      mid += value;
    } else {
      treble += value;
    }
  }

  updateSoundbar(dataArray);

  updateCssProperty('--dancer-angle', 4 - treble / (sum / bufferLength), 'deg');
  updateCssProperty('--dancer-height', 6 - mid / (sum / bufferLength), 'px');
  updateCssProperty('--dancer-width', 6 - bass / (sum / bufferLength), 'px');
}

danceCatDance();

function updateSoundbar(values) {
  const soundbars = $(`.soundbar`);

  for (let i = 0; i < values.length; i++) {
    const value = values[i];

    if (soundbars) {
      soundbars.children[i].style.height = `${parseInt(
        400 * (value / 256) - 128
      )}px`;
    }
  }
}

function createSoundbar() {
  const soundbar = document.createElement('div');
  soundbar.classList.add('soundbar');

  for (let i = 0; i < bufferLength; i++) {
    const bar = document.createElement('div');
    bar.classList.add('soundbar__bar');
    soundbar.appendChild(bar);
  }

  return soundbar;
}

function createDancer() {
  const dancerContainer = document.createElement('div');
  dancerContainer.classList.add('dancer-container');
  const dancer = document.createElement('div');
  dancer.id = 'dancer';
  dancer.on('click', () => {
    if (sound.playing) {
      sound.stop();
    } else {
      sound.play();
    }
  });
  dancerContainer.appendChild(dancer);

  return dancerContainer;
}
