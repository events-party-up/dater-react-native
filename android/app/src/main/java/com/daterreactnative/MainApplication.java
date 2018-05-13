package com.daterreactnative;

import android.app.Application;

import com.facebook.react.ReactApplication;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import com.wix.interactable.Interactable;
import com.transistorsoft.rnbackgroundgeolocation.*;
import com.transistorsoft.rnbackgroundfetch.RNBackgroundFetchPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.joshblour.reactnativeheading.ReactNativeHeadingPackage;

// Firebase packages
import io.invertase.firebase.RNFirebasePackage;
import io.invertase.firebase.fabric.crashlytics.RNFirebaseCrashlyticsPackage;
import io.invertase.firebase.analytics.RNFirebaseAnalyticsPackage;
import io.invertase.firebase.auth.RNFirebaseAuthPackage;
import io.invertase.firebase.firestore.RNFirebaseFirestorePackage;
import io.invertase.firebase.config.RNFirebaseRemoteConfigPackage;
import io.invertase.firebase.perf.RNFirebasePerformancePackage;

import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

// MapBox
import com.mapbox.rctmgl.RCTMGLPackage;
import com.BV.LinearGradient.LinearGradientPackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
          new SplashScreenReactPackage(),
          new Interactable(),
          new RNBackgroundGeolocation(),
          new RNBackgroundFetchPackage(),
          new RNDeviceInfo(),
          new RNFirebasePackage(),
          new RNFirebaseAnalyticsPackage(),
          new RNFirebaseAuthPackage(),
          new RNFirebaseCrashlyticsPackage(),
          new RNFirebaseFirestorePackage(),
          new RNFirebaseRemoteConfigPackage(),
          new RNFirebasePerformancePackage(),
          new ReactNativeHeadingPackage(),
          new RCTMGLPackage(),
          new LinearGradientPackage()
        );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
