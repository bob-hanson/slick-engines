import Ember from 'ember';
import $ from 'jquery';

const {
  Service
} = Ember;

export default Service.extend({
  controlPanel: null,
  trackInfoPanel: null,
  infoImage: null,
  infoArtist: null,
  infoTrack: null,
  messageBox: null,

  initUi() {
    this.setUIElements();
  },

  setUIElements() {
    this.setProperties({
      controlPanel: document.getElementById('controlPanel'),
      trackInfoPanel: document.getElementById('trackInfoPanel'),
      infoImage: document.getElementById('infoImage'),
      infoArtist: document.getElementById('infoArtist'),
      infoTrack: document.getElementById('infoTrack'),
      messageBox: document.getElementById('messageBox'),
      sound: this.get('soundcloud.sound')
    });
  },

  clearInfoPanel() {
    this.get('infoArtist').innerHTML = "";
    this.get('infoTrack').innerHTML = "";
    this.get('trackInfoPanel').className = 'hidden';
  },

  update(currentTrack) {
    var artistLink = document.createElement('a'),
        trackLink = document.createElement('a'),
        infoImage = this.get('infoImage'),
        infoArtist = this.get('infoArtist'),
        infoTrack = this.get('infoTrack'),
        trackInfoPanel = this.get('trackInfoPanel'),
        user = currentTrack.user,
        username = user.username,
        permalink_url = user.permalink_url,
        image = currentTrack.artwork_url ? currentTrack.artwork_url : currentTrack.user.avatar_url;

    artistLink.setAttribute('href', permalink_url);
    artistLink.innerHTML = username;
    trackLink.setAttribute('href', permalink_url);
    trackLink.innerHTML = currentTrack.title;
    infoImage.setAttribute('src', image);
    infoArtist.innerHTML = '';
    infoArtist.appendChild(artistLink);
    infoTrack.innerHTML = '';
    infoTrack.appendChild(trackLink);
    trackInfoPanel.className = '';
  },

  toggleControlPanel() {
    var controlPanel = this.get('controlPanel');

    if ($(controlPanel).hasClass('hidden')) {
      $(controlPanel).removeClass('hidden');
    } else {
      $(controlPanel).addClass('hidden');
    }
  },

  displayMessage(title, message) {
    var messageBox = this.get('messageBox'),
        titleElement = document.createElement('h3'),
        messageElement = document.createElement('p'),
        closeButton = document.createElement('a');

    messageBox.innerHTML = '';
    titleElement.innerHTML = title;
    messageElement.innerHTML = message;
    closeButton.setAttribute('href', '#');
    closeButton.innerHTML = 'close';
    closeButton.addEventListener('click', function(e) {
      e.preventDefault();
      messageBox.className = 'hidden';
    });

    messageBox.className = '';
    messageBox.appendChild(titleElement);
    messageBox.appendChild(messageElement);
    messageBox.appendChild(closeButton);
  }

});
