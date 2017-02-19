import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('pop-spectrums');
  this.route('rock-spectrums');
  this.route('trance-spectrums');
});

export default Router;
