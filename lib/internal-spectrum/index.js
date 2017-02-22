/*jshint node:true*/
var EngineAddon = require('ember-engines/lib/engine-addon');
module.exports = EngineAddon.extend({
  name: 'internal-spectrum',
  lazyLoading: false,
  isDevelopingAddon: function() {
    return true;
  }
});
