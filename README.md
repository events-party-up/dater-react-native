# Dater React Native Client


## Build Android APK without signing

### RUN Standalone APK in Debug mode:

From project root run command:

`npm run run:android:debug:standalone`

## Reset cache & reinstall packages:

`watchman watch-del-all && rm -rf $TMPDIR/react-* && rm -rf ~/.rncache ; rm -rf node_modules/  && rm package-lock.json; npm install && npm start -- --reset-cache;`

