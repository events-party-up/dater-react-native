# Dater React Native Client


## Build Android APK without signing

Run commands:

`react-native bundle --dev false --platform android --entry-file index.js --bundle-output ./android/app/build/intermediates/assets/debug/index.android.bundle --assets-dest ./android/app/build/intermediates/res/merged/debug
cd android;`
`./gradlew assembleDebug`
`adb install -r app/build/outputs/apk/debug/app-debug.apk`

## Reset cache & reinstall packages:

`watchman watch-del-all && rm -rf $TMPDIR/react-* && rm -rf ~/.rncache ; rm -rf node_modules/  && rm package-lock.json; npm install && npm start -- --reset-cache;`

