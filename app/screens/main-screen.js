import React, { Component } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import { connect } from 'react-redux';

import DaterMapView from '../components/dater-map-view';
import MapPanelComponent from '../components/map-panel/map-panel-component';

// import DaterButton from '../components/ui-kit/atoms/dater-button';
// import FirebaseSetup from '../components/firebase-setup';

const mapStateToProps = (state) => ({
  auth: state.auth,
});

type Props = {
  navigation: any,
};

class MainScreen extends Component<Props> {
  render() {
    return (
      <View style={styles.mainContainer}>
        {/* <FirebaseSetup /> */}
        <MapPanelComponent
          navigation={this.props.navigation}
        />
        <DaterMapView />
        {/* <View style={styles.buttons}>
          <DaterButton
            style={styles.button}
            onPress={() => this.props.navigation.navigate('FloatingNavigator')}
            type="secondary"
          >
            Floating Screen
          </DaterButton>
          <DaterButton
            style={styles.button}
            onPress={() => this.props.navigation.navigate('UIKitNavigator')}
          >
            UI Kit
          </DaterButton>
        </View> */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: '#ede5dd',
    opacity: 1,
    alignSelf: 'stretch',
    flex: 1,
  },
  buttons: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  button: {
  },
  debugText: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    zIndex: 2,
    opacity: 0.8,
  },
});

export default connect(mapStateToProps)(MainScreen);
