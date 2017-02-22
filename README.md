# Ember Meetup SLC - Ember Engine




### Resources

* [Ember Engines Guide](http://www.ember-engines.com/guide/creating-an-engine)
* [is-your-ember-app-too-big-split-it-up-with-ember-engines](https://www.bignerdranch.com/blog/is-your-ember-app-too-big-split-it-up-with-ember-engines/)
* [Engine training](https://github.com/trentmwillis/engine-training)
* [Ember Engines Live Coding](https://www.youtube.com/watch?v=JsbtTk-rMRU)

### Setup Current App

```
ember install ember-engines

```


### Create External Engine

Setup New Addon

In our case, we have wanting rock-spectrums as an external engine. But we can also create a generic engine and name it in the routes when we mount it. so lets do that.

```
ember addon spectrums
cd spectrums

```

Currently this installs an older version of Ember and Ember-CLI. Lets upgrade

[Ember CLI Releases](https://github.com/ember-cli/ember-cli/releases)


**Update CLI if needed**

```
npm uninstall -g ember-cli -- Remove old global ember-cli
npm cache clean -- Clear NPM cache
bower cache clean -- Clear Bower cache
npm install -g ember-cli@2.11.1 -- Install new global ember-cli
```
**Update Project**

```
rm -rf node_modules bower_components dist tmp -- Delete temporary development folders.
npm install --save-dev ember-cli@2.11.1 -- Update project's package.json to use latest version.
npm install -- Reinstall NPM dependencies.
bower install -- Reinstall bower dependencies.
ember init -- This runs the new project blueprint on your projects directory. Please follow the prompts, and review all changes (tip: you can see a diff by pressing d). The most common source of upgrade pain is missing changes in this step.
```

After we are all updated, we need to install Ember Engines into our addon

```
ember install ember-engines
```

According to the guides, we need to make sure that ember engines is set as a devDependency only to avoid issues with the comsuming application.

Now we need to make sure that htmlBars is listed as a dependency

```
// package.json
  "dependencies": {
    "ember-cli-babel": "^5.1.7",
    "ember-cli-htmlbars": "^1.1.1"
  }
```

Configure the engine

```
// index.js

/*jshint node:true*/
const EngineAddon = require('ember-engines/lib/engine-addon');

module.exports = EngineAddon.extend({
  name: 'spectrums'
});
```

```
// config/environment.js

/*jshint node:true*/
'use strict';

module.exports = function(environment) {
  const ENV = {
    modulePrefix: 'spectrums',
    environment: environment
  }

  return ENV;
};
```

Now we turn the addon into an actual engine.

Create an engine.js file in the addon dir. This is similar to the app.js file in a normal Ember App.

```
touch addon/engine.js
```

Then add this code

```
// addon/engine.js

import Engine from 'ember-engines/engine';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';

const { modulePrefix } = config;
const Eng = Engine.extend({
  modulePrefix,
  Resolver
});

loadInitializers(Eng, modulePrefix);

export default Eng;
```

***NOTE: If you are creating a Routless Engine, this is all you need**

### Create External Engine Routes

To have routes under your engine, we'll need to add a routes.js file to the addon dir.

```
touch addon/routes.js
```


The key note here is when you have routes in an Engine, the top level route it similar to the application route in an app. So you dont need to add it explicitly.

**Example**

In Parent App

```
// These will all become engines

Router.map(function() {
  this.route('pop-spectrums');
  this.route('trance-spectrums');

  this.route('rock-spectrums', { resetNamespace: true }, function () {
    this.route('rock-spectrum', { resetNamespace: true, path: ':id' }, function () {
      this.route('edit-rock-spectrum', { resetNamespace: true });
    });
  });

});
```
In our example, we're creating 'rock-spectrums' as an engine

So when we move the child routes to the engine, we exclude the 'rock-spectrums

In Rock Spectrums Engine

```
import buildRoutes from 'ember-engines/routes';

export default buildRoutes(function() {

	this.route('rock-spectrum', { resetNamespace: true, path: ':id' }, function () {
      this.route('edit-rock-spectrum', { resetNamespace: true });
    });

});
```
If your top level route in the Engine has a template. It becomes the application.hbs file in the Engine

```
mkdir addon/templates
touch addon/templates/application.hbs
```

**Lazy Loading**

One of the biggest reasons to use Engines is to lazy load portions of your app based on use. If a user doesnt enter a certain engine, you dont need to load the code for it.

***Note Lazy Loading only applies to routeable engines**

in your index.js file

```
module.exports = EngineAddon.extend({
  name: 'spectrums',
  lazyLoading: true
});
```
Also, To allow our app to reload when we are working in our dev env. Lets add a method **"isDevelopingAddon"** to do so in our index.js

```
const EngineAddon = require('ember-engines/lib/engine-addon');

module.exports = EngineAddon.extend({
  name: 'spectrums',
  lazyLoading: true,
  isDevelopingAddon: function() {
    return true;
  }
});
```
