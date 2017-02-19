/**
* Inspired by michaelbromley/soundcloud-visualizer.
*/

import Ember from 'ember';

const {
  Service,
  computed
} = Ember;

export default Service.extend({
  player: null,
  sound: null,
  streamData: null,
  errorMessage: null,
  volume: 0,
  soundCloudDevId: "237d195ad90846f5e6294ade2e8cf87b",

  streamUrl: computed('sound', function () {
    return this.get('sound').stream_url + '?client_id=' + this.get('soundCloudDevId');
  }),

  initSoundCloudPlayer() {
    this.setupPlayer();
  },

  setupPlayer(player) {
    var player = document.getElementById('player');
    player.crossOrigin = "anonymous";
    this.set('streamData', new Uint8Array(128));
    this.set('player', player);
    window.SC.initialize({
      client_id: this.get('soundCloudDevId'),
      redirect_uri: 'http://localhost:4200'
    });
  },

  setAudioSource() {
    var audioCtx = new (window.AudioContext || window.webkitAudioContext),
        analyser = audioCtx.createAnalyser(),
        source = audioCtx.createMediaElementSource(this.get('player'));

    analyser.fftSize = 256;
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    setInterval(this.sampleAudioStream.bind(this), 20);
  },

  playStream() {
    var player = this.get('player');
    player.setAttribute('src', this.get('streamUrl'));
    player.play();
  },

  sampleAudioStream(analyser) {
    var streamData = this.get('streamData');
    analyser.getByteFrequencyData(streamData);
    this.set('volume', this.buildVolumeIncrements(streamData));
  },

  buildVolumeIncrements(streamData) {
    var total = 0;
    for (let i = 0; i < 80; i++) {
      total += streamData[i];
    }
    return total;
  },

  loadStream(trackUrl, spectrum) {
    window.SC.resolve(trackUrl)
             .then(this.handleSCResolve.bind(this, spectrum));
  },

  handleSCResolve(spectrum, resolvedTrack) {
    if (resolvedTrack.errors) {
      this.handlePlayerError();
    } else {
      this.set('sound', resolvedTrack);
      this.playStream(this.get('streamUrl'));
      spectrum.updateUI();
    }
  },

  setPlayerState() {
    var player = this.get('player');
    if (player.paused) {
      player.play();
    } else {
      player.pause();
    }
  }

});
