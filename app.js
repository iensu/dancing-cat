const style = window.getComputedStyle(document.documentElement);
const defaultDancerHeight = parseInt(style.getPropertyValue('--dancer-height'));
const defaultDancerWidth = parseInt(style.getPropertyValue('--dancer-width'));

const sound = new Pizzicato.Sound({
  source: 'file',
  options: { path: 'http://localhost:3000/equals_sign_8_reprise.mp3' },
});

const delay = new Pizzicato.Effects.Delay();
const distortion = new Pizzicato.Effects.Distortion();
const filter = new Pizzicato.Effects.LowPassFilter();
const analyzer = Pizzicato.context.createAnalyser();
sound.addEffect(delay);
sound.addEffect(distortion);
sound.addEffect(filter);
sound.connect(analyzer);

analyzer.fftSize = 2048;
const bufferLength = analyzer.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);
analyzer.getByteTimeDomainData(dataArray);

const audioElem = $('audio');
const dancer = $('#dancer');

const track = audioContext.createMediaElementSource(audioElem);

track
  .connect(distortion)
  .connect(delay)
  .connect(filter)
  .connect(analyzer)
  .connect(audioContext.destination);

$('#delay').on('change', (e) => {
  delay.delayTime.setValueAtTime(
    Number(e.target.value),
    audioContext.currentTime
  );
});

$('body').appendChild(
  ModBox({
    id: 'filter',
    name: 'Lowpass filter',
    onChange: ({ detail }) => {
      const { x, y } = detail;

      const freq = x * 2000;
      const Q = y;

      filter.Q.setValueAtTime(Q, audioContext.currentTime);
      filter.frequency.setValueAtTime(freq, audioContext.currentTime);
    },
  })
);

$('body').appendChild(
  ModBox({
    id: 'delay',
    name: 'Delay',
    onChange: ({ detail }) => {
      const { x, y } = detail;

      const delayTime = delay.delayTime.maxValue * x;
      const feedback = y;

      delay.delayTime.setTargetAtTime(delayTime, audioContext.currentTime, 0.1);
      delayFeedback.gain.setTargetAtTime(
        feedback,
        audioContext.currentTime,
        0.1
      );
    },
  })
);

$('body').appendChild(
  ModBox({
    id: 'dist',
    name: 'Distortion',
    onChange: ({ detail }) => {
      distortion.curve = makeDistortionCurve(detail.y * 1000, detail.x * 44100);
    },
  })
);

const getOversample = (val) => {
  if (val < 0.2) return 'none';
  if (val > 0.7) return '4x';

  return '2x';
};

const getRgbString = (offset) => {
  const val = offset || 0;

  return `rgb(${val * 0.5}, ${val * 1.5}, ${val * 0.5})`;
};

const getSize = (offset, base) => {
  return `${base + offset / 2}px`;
};

function makeDistortionCurve(amount = 0, n_samples = 44100) {
  const k = amount;
  const curve = new Float32Array(n_samples);
  const deg = Math.PI / 180;
  let x;

  for (let i = 0; i < n_samples; ++i) {
    x = (i * 2) / n_samples - 1;
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

let previous;

function foo() {
  requestAnimationFrame(foo);

  analyzer.getByteTimeDomainData(dataArray);

  let result = 0;

  for (var i = 0; i < bufferLength; i++) {
    result += dataArray[i];
  }

  if (previous === result) return;

  const offset = (result - previous) / 80 || 0;
  previous = result;

  document.documentElement.style.setProperty(
    '--dancer-color',
    getRgbString(offset)
  );
  document.documentElement.style.setProperty(
    '--dancer-height',
    getSize(offset, defaultDancerHeight)
  );
  document.documentElement.style.setProperty(
    '--dancer-width',
    getSize(offset, defaultDancerWidth)
  );
}

foo();
