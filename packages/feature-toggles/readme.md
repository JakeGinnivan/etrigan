# Etrigan feature toggles

The feature toggling support in etrigan is designed to work ontop of a clustering approach like https://github.com/JakeGinnivan/gru.

The master will create the feature-updater, this process takes care of trying to connect to launch darkly (though with not too much effort it could be pluggable) then fetch the initial state.

It will then write those features to a feature state file, which is used in the event launch darkly cannot be contacted during service start.

When the worker starts it will read it's state from the feature file. Whenever the master updates it's state (due to a config change in launch darkly) it will send a message to all workers telling them to update their features.

## Features

### Master/Worker support

Rather than all the workers fetching their own toggle state, the master subscribes to launch darkly and tells the workers to update whenever the feature state changes.

### Express middleware

Features will never change during a request, instead will take effect from the next request after they change.

### Last known good configuration fallback

By writing the last known feature state to a file, if your service restarts/crashes and it cannot contact LaunchDarkly for any reason, your service can still start.

## Usage

```ts
import { gru } from 'node-gru'
import {
    createFeatureUpdater,
    createFeatureReceiver,
    createFeatureStateMiddleware,
    isFeatureEnabled,
} from '@etrigan/feature-toggles'

gru({
    master: async () => {
        // In the master process we subscribe to toggle changes
        // and they will be written to the feature state file.
        await createFeatureUpdater(logger, {
            featureStateFile: './test-features.json',
            launchDarklySdkKey: 'SDK-KEY',
        })
    },
    start: async () => {
        // Create express app

        app.use(
            createFeatureStateMiddleware(
                await createFeatureReceiver(logger, config.featureStateFile),
            ),
        )

        app.use(req => {
            if (isFeatureEnabled(req.features, 'my-feature')) {
            }
        })
    },
})
```
