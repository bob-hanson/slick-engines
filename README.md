# Ember Meetup SLC - Ember Engine




### Resources

* [Ember Engines Guide](http://www.ember-engines.com/guide/creating-an-engine)
* [is-your-ember-app-too-big-split-it-up-with-ember-engines](https://www.bignerdranch.com/blog/is-your-ember-app-too-big-split-it-up-with-ember-engines/)
* [Engine training](https://github.com/trentmwillis/engine-training)
* [Ember Engines Live Coding](https://www.youtube.com/watch?v=JsbtTk-rMRU)

### Setup Current App

install Ember Engines in your App.

```
ember install ember-engines

```


### Create External Engine

Setup New Addon

In our case, we have wanting rock-spectrums as an external engine. But we can also create a generic engine and name it in the routes when we mount it. so lets do that. This will allow us to use 1 Engines for multiple routes.

```
// in your code folder, outside your current app.

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

After we are all updated, we need to install Ember Engines into our Addon

```
ember install ember-engines
```

According to the guides, we need to make sure that ember engines is set as a devDependency only to avoid issues with the comsuming application.

Now we need to make sure that htmlBars is listed as a dependency in our Engine package.json

```
// {{MyEngine}}/package.json
  "dependencies": {
    "ember-cli-babel": "^5.1.7",
    "ember-cli-htmlbars": "^1.1.1"
  }
```

Configure the Engine by adding stuff to the {{MyEngine}}/index.js and {{MyEngine}}/config/environment.js

```
// {{MyEngine}}/index.js

/*jshint node:true*/
const EngineAddon = require('ember-engines/lib/engine-addon');

module.exports = EngineAddon.extend({
  name: 'spectrums'
});
```

```
// {{MyEngine}}/config/environment.js

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

Now we turn the Addon into an actual Engine.

Create an engine.js file in the {{MyEngine}}/addon dir. This is similar to the app.js file in a normal Ember App.

```
// {{MyEngine}}

touch addon/engine.js
```

Then add this code

```
// {{MyEngine}}/addon/engine.js

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

To have routes under your Engine, we'll need to add a routes.js file to the addon dir.

```
// {{MyEngine}}/addon

touch addon/routes.js
```

The key note here is when you have routes in an Engine, the top level route, in our case "rock-spectrums" becomes the "application" route in the Engine.

**Example**

In Parent App

```
// These will all become engines

Router.map(function() {
  this.route('pop-spectrums');
  this.route('trance-spectrums');

  this.route('rock-spectrums', { resetNamespace: true }, function () {
    this.route('rock-spectrum', { resetNamespace: true, path: ':id' }, function () {
      this.route('edit-rock-spectrum');
    });
  });

});
```
In our example, With 'rock-spectrums' becoming an engine we move the child routes to the engine and exclude the 'rock-spectrums' route since it becomes 'application'

In Rock Spectrums Engine

```
// {{MyEngine}}/addon/routes.js

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

in your {{MyEngine}}/index.js file

```
// {{MyEngine}}/index.js

module.exports = EngineAddon.extend({
  name: 'spectrums',
  lazyLoading: true
});
```
Also, to allow our app to reload when we are working in our dev env, lets add the method **"isDevelopingAddon"** to do so in our {{MyEngine}}/index.js. Just make sure to turn this off when moving to production.

```
// {{MyEngine}}/index.js

const EngineAddon = require('ember-engines/lib/engine-addon');

module.exports = EngineAddon.extend({
  name: 'spectrums',
  lazyLoading: true,
  isDevelopingAddon: function() {
    return true;
  }
});
```

### External Links in Engines

There are a few things to note about linking. Both internal to the engine and external to the parent.

When internal, since our top level route becomes **"application"** and if you have any top level nested scoped routes, they do not need the prefix.

**Internal**

In the case of our "rock-spectrums" route that is now an Engine.

```
{{link-to 'application'}} // will now link to the top level inside the engine.

```
If we had a "rock-spectrums.some-nested-non-namespace-reset-route"

```
{{link-to 'some-nested-non-namespace-reset-route' }} // notice we dont have the top level in the link path.

```
**External**

A few more things need to happen to wire up links that are external to an engine.

We need to declare the dependent routes were wanting to link to in the engine.js file

```
// {{MyEngine}}/addon/engine.js

export default Engine.extend({
  // ...
  dependencies: {
    externalRoutes: [
      'songs',
      'albums'
    ]
  }
});
```
And we also need to set these in the parent app in the app.js file

```
// {{EmberApp}}/app.js

const App = Ember.Application.extend({
  // ....
  engines: {
    superBlog: {
      dependencies: {
        externalRoutes: {
          songs: 'songs.index',
          albums: 'albums.index'
        }
      }
    }
  }

});
```
Then in your Engine, you would use {{link-to-external ... }} instead of {{link-to ... }}

```
{{link-to "rock-spectrum" spectrum }} // Internal
{{link-to-external "songs"}} // External
{{link-to-external "albums"}} // External

```

### Services in Engines

Using services is an Engine is a way to pass around state to your engines. Its pretty simple to allow service access in an Engine. It requires to registration points.

**In the Engine**

```
// {{MyEngine}}/addon/engine.js

export default Engine.extend({
  // ...
  dependencies: {
  	 services: [ 'store', 'session' ],
    externalRoutes: [
      'songs',
      'albums'
    ]
  }
});
```

**In the Parent**

```
// {{EmberApp}}/app.js

const App = Ember.Application.extend({
  // ....
  engines: {
    superBlog: {
      dependencies: {
      services: ['store', 'session'],
        externalRoutes: {
          songs: 'songs.index',
          albums: 'albums.index'
        }
      }
    }
  }

});
```

**Note:** You can namespace a service when defining in the parent by passing a object KV.

```
// {{EmberApp}}/app.js

services: [{ engineSessionService: 'parent-sesson-service']
```

### Using Components

Because Engines by default are isolated, Accessing parent compoents in an Engine cant happen by simply registering it.

To use a common component across engines, you'll need to move that component to an Addon and then include it in your engine.

You can add the addon to your devDependencies and then re-export it.

```
// {{MyEngine}}/package.json

devDependecies: {

  my-addon: '*'

}

```
Then in the addon dir, re-export it.

```
// {{MyEngine}}/addons/components/my-addon-component.js

export { default } from 'my-addon/components/my-addon-component';


```
**my-addon** is the name of the Node Addon Package

**components** is the components dir in the Node/addon

**my-addon-component** the name of the component to export.



Also, if you have the proper content in the {{MyEngine}}/index.js file, it will export all by default

```
// {{MyEngine}}/index.js

var EngineAddon = require('ember-engines/lib/engine-addon');
module.exports = EngineAddon.extend({
  name: 'my-engine'
});
```
