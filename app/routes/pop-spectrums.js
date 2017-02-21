import Ember from 'ember';

const {
  Route
} = Ember;

export default Route.extend({

  setupController(controller, model) {
    this._super(controller, model);
    controller.set('spectrumTitle', "Pop Spectrums");
    controller.set('initialTrack', "https://soundcloud.com/supersofar/thursday");
  }

});
