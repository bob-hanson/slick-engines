import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.mount('spectrums', { as: 'trance-spectrums', path: '/trance-spectrums' });
  this.mount('spectrums', { as: 'rock-spectrums', path: '/rock-spectrums' });
  this.mount('spectrums', { as: 'pop-spectrums', path: '/pop-spectrums' });
});

export default Router;
