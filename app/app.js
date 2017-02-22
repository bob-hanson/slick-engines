import Ember from 'ember';
import Resolver from './resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';

let App;

Ember.MODEL_FACTORY_INJECTIONS = true;

App = Ember.Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver,

  engines: {
    spectrums: {
      dependencies: {
        services: [
          'visualizer',
          'uiUpdater',
          'trackLists'
        ]
      }
    },
    internalSpectrums: {
      dependencies: {
        services: [
          'visualizer',
          'uiUpdater',
          'trackLists'
        ]
      }
    }
  }
});

loadInitializers(App, config.modulePrefix);

export default App;
