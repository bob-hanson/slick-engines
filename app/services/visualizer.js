import Ember from 'ember';
import chroma from 'chroma';

const {
  Service,
  computed
} = Ember;

export default Service.extend({
  fgRotation: 0.001,
  fgCanvas: null,
  fgCtx: null,
  chroma: null,
  audioContext: null,
  bins: null,
  sourcePlayer: null,
  player: null,
  sound: null,
  errorMessage: null,
  volume: 0,
  soundCloudDevId: "237d195ad90846f5e6294ade2e8cf87b",

  initAudioSetup() {
    this.setAudioContext();
    this.initSoundCloud();
  },

  initVisualizer() {
    this.setupPlayer();
    this.setAudioNodes();
    this.setVisualColors();
    this.setupForeground();
    this.resizeCanvas();

    window.addEventListener('resize', this.resizeCanvas.bind(this), false);
  },

  streamUrl: computed('sound', function () {
    return this.get('sound').stream_url + '?client_id=' + this.get('soundCloudDevId');
  }),

  setupPlayer() {
    var player = document.getElementById('player');
    player.crossOrigin = "anonymous";
    this.set('player', player);
  },

  initSoundCloud() {
    window.SC.initialize({
      client_id: this.get('soundCloudDevId'),
      redirect_uri: 'http://localhost:4200'
    });
  },

  setAudioContext() {
    if (!window.AudioContext) {
      if (! window.webkitAudioContext) {
          alert('no audiocontext found');
      }
      window.AudioContext = window.webkitAudioContext;
    }
    var ac = new window.AudioContext();
    this.set('audioContext', ac);
  },

  setAudioNodes() {
    this.buildAnalyser();
    this.buildSourceNode();
  },

  processVisualization() {
    var analyser = this.get('analyser'),
        sourcePlayer = this.get('sourcePlayer'),
        bins = new Uint8Array(analyser.frequencyBinCount);
    this.set('bins', bins);
    analyser.getByteFrequencyData(bins);
    this.displaySpectrum(bins);
  },

  buildAnalyser() {
    var context = this.get('audioContext'),
        analyser = context.createAnalyser();

    analyser.smoothingTimeConstant = 0;
    analyser.fftSize = 1024;
    this.set('analyser', analyser);
  },

  buildSourceNode() {
    var context = this.get('audioContext'),
        analyser = this.get('analyser'),
        processNode = this.get('processNode'),
        sourcePlayer = context.createMediaElementSource(this.get('player'));

    sourcePlayer.connect(analyser);
    analyser.connect(context.destination);
    this.set('sourcePlayer', sourcePlayer);
  },

  playStream() {
    var player = this.get('player');
    player.setAttribute('src', this.get('streamUrl'));
    player.play();
  },

  loadStream(trackUrl, spectrum) {
    window.SC.resolve(trackUrl)
             .then(this.handleSCResolve.bind(this, spectrum));
  },

  handleSCResolve(spectrum, resolvedTrack) {
    var context = this.get('audioContext');
    if (resolvedTrack.errors) {
      this.handlePlayerError();
    } else {
      this.set('sound', resolvedTrack);
      this.playStream();
      setInterval(this.processVisualization.bind(this), 20);
      spectrum.updateControlPanelAndSpectrum(resolvedTrack);
    }
  },

  setPlayerState() {
    var player = this.get('player');
    if (player.paused) {
      player.play();
    } else {
      player.pause();
    }
  },

  setVisualColors() {
    var hot = chroma.scale(['#000000', '#ff0000', '#ffff00', '#ffffff']);
    this.set('chroma', hot);
  },

  setupForeground() {
    var container = document.getElementById('visualizer'),
        fgCanvas = document.createElement('canvas');

    this.set('fgCanvas', fgCanvas);
    this.set('fgCtx', fgCanvas.getContext("2d"));
    // fgCanvas.setAttribute('style', 'position: absolute; z-index: 10');
    container.appendChild(fgCanvas);
  },

  resizeCanvas() {
    var fgCanvas = this.get('fgCanvas');

    if (fgCanvas) {
      this.resizeFgCanvas(fgCanvas);
    }
  },

  resizeFgCanvas(fgCanvas) {
    fgCanvas.width = window.innerWidth;
    fgCanvas.height = window.innerHeight;
    this.get('fgCtx').translate(fgCanvas.width/2,fgCanvas.height/2);
  },

  sampleAudioStream() {
    var analyser = this.get('analyser');
    analyser.getByteFrequencyData(this.get('bins'));
  },

  displaySpectrum(bins) {
    var canvas = this.get('fgCanvas'),
        analyser = this.get('analyser'),
        ctx = this.get('fgCtx');

    for (let i = 0; i < bins.length; i++) {
        ctx.fillStyle = chroma.random().hex();
        ctx.fillRect(canvas.width - 1, canvas.height - i, 1, 1);
    }
    // set translate on the canvas
    ctx.translate(-1, 0);
    // draw the copied image
    ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
    // reset the transformation matrix
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // window.requestAnimationFrame(this.displaySpectrum.bind(this));
  }

});
