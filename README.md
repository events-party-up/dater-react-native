# Dater React Native Client


## Build Android APK without signing

### RUN Standalone APK in Debug mode:

From project root run command:

`npm run run:android:debug:standalone`

## Reset cache & reinstall packages:

`watchman watch-del-all && rm -rf $TMPDIR/react-* && rm -rf ~/.rncache ; rm -rf node_modules/  && rm package-lock.json; npm install && npm start -- --reset-cache;`


## Simulate locations

### Android Genymotion:

`python2 ./test/fake-coords/playback-gpx.py -i 1 "./test/fake-coords/city-run.gpx""`

## Production Builds

### Building iOS App for production:

1. Change Google Info plist file to production one
1. In XCode in Targets in DaterReactNative target Info tab 
Change URL Schemes to `com.googleusercontent.apps.713519465819-5ufqr6d3ns7q4aajco85lahv8m4titra`
1. Deploy firebase functions with `firebase deploy -P dater3-production`

### Building iOS App for development:
1. Change Google Info plist file to development one
1. In XCode in Targets in DaterReactNative target Info tab 
Change URL Schemes to `com.googleusercontent.apps.569828839948-ru1vmhhjd9m5tfmte2gpohckmh7ngr47`
1. Deploy firebase functions with `firebase deploy -P dater3-dev`
