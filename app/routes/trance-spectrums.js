import Ember from 'ember';

const {
  Route
} = Ember;

export default Route.extend({

  setupController(controller, model) {
    this._super(controller, model);
    controller.set('spectrumTitle', "Trance Spectrums");
    controller.set('initialTrack', "https://soundcloud.com/douglas0900/dj-august-minimal-techno-mix-2014")
  }

});
