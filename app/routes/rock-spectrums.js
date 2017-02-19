import Ember from 'ember';

const {
  Route
} = Ember;

export default Route.extend({

  setupController(controller, model) {
    this._super(controller, model);
    controller.set('spectrumTitle', "Rock Spectrums");
    controller.set('initialTrack', "https://soundcloud.com/rageagainstthemachineofficial/killing-in-the-name-demo")
  }

});
