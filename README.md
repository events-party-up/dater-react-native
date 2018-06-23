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

### Building iOS App:

1. Make sure GoogleService-Info.plist files are in ios/Firebase directory by running `prepare:ios` in Dater Private Files rep
1. Do build in XCode choosing either Debug or Release
1. For development deploy firebase functions with `firebase deploy -P dater3-dev`
1. For production deploy firebase functions with `firebase deploy -P dater3-production`

## Watch Logs

### From iOS Simulator

`./scripts/watch-ios-logs.js`

### From Android Simulator

`adb logcat`


