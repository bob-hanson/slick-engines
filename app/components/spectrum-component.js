import Ember from 'ember';

const {
  Component,
  computed: { notEmpty },
  inject: { service }
} = Ember;

export default Component.extend({
  soundcloud: service(),
  visualizer: service(),
  uiUpdater: service(),

  spectrumTitle: "My Spectrum",
  initialTrack: null,
  hasInitialTrack: notEmpty('initialTrack'),

  didInsertElement() {
    this.get('soundcloud').initSoundCloudPlayer();
    this.get('uiUpdater').initUi();
    this.get('visualizer').initVisualizer();
    this.toggleControlPanel();
    this.checkForInitialTrack();
    window.addEventListener("keydown", this.keyControls.bind(this), false);
  },

  redraw() {
    this.get('visualizer').draw();
  },

  loadAndUpdate(trackUrl) {
    this.get('soundcloud').loadStream(trackUrl, this);
  },

  checkForInitialTrack() {
    if (this.get('hasInitialTrack')) {
      this.loadAndUpdate(this.get('initialTrack'));
    }
  },

  handlePlayerError() {
    this.get('uiUpdater').displayMessage("Error", "There was a problem loading the file");
  },

  updateUI() {
    this.get('uiUpdater').clearInfoPanel();
    this.get('uiUpdater').update();
    setTimeout(this.toggleControlPanel.bind(this), 3000);
  },

  keyControls(e) {
    if (e.keyCode === 32) {
      this.get('soundcloud').setPlayerState();
    }
  },

  toggleControlPanel() {
    this.get('uiUpdater').toggleControlPanel();
  },

  actions: {

    triggerLoadRequestedTrack(trackUrl) {
      this.loadAndUpdate(trackUrl);
    },

    triggerToggleControlPanel() {
      this.toggleControlPanel();
    }

  }

});
