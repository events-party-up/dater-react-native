import React, { Component } from 'react';
import { connect, Dispatch } from 'react-redux';

import {
  ScrollView,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';

import DaterTextInput from '../../components/ui-kit/atoms/dater-text-input';
import DaterModal from '../../components/ui-kit/dater-modal';
import DaterButton from '../../components/ui-kit/atoms/dater-button';
import { H2 } from '../../components/ui-kit/typography';

const nameIcon = require('../../assets/icons/name/name.png');

const mapStateToProps = (state) => ({
  name: state.currentUser.name,
});

type State = {
  isNameValid: boolean,
}

type Props = {
  navigation: any,
  dispatch: Dispatch,
  name: string,
};

class NameScreen extends Component<Props, State> {
  name: string;
  navigationFlowType: string;

  constructor(props) {
    super(props);

    this.state = {
      isNameValid: false,
    };
  }

  componentWillMount() {
    this.navigationFlowType = this.props.navigation.getParam('navigationFlowType');
  }

  onNameSubmit = () => {
    this.props.dispatch({ type: 'CURRENT_USER_SET_PROFILE_FIELDS', payload: { name: this.name } });
    if (this.navigationFlowType === 'editProfile') {
      this.props.navigation.goBack();
    } else {
      this.props.navigation.navigate({ key: 'RegisterBirthday', routeName: 'RegisterBirthday' });
    }
  }

  onInvalidNameSubmit = () => {
    if (this.navigationFlowType !== 'editProfile') {
      Alert.alert(
        'Будь внимательней!',
        'Введи свое настоящее имя, от 2х символов',
        [
          { text: 'Исправлюсь!' },
        ],
      );
    }
  }

  onChangeText = (name) => {
    this.name = name;
    this.setState({
      isNameValid: this.name && this.name.length >= 2,
    });
  }

  render() {
    return (
      <DaterModal
        fullscreen
        backButton
        backButtonPress={() => this.props.navigation.goBack()}
        style={styles.modal}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          scrollEnabled={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContainer}
        >
          <Image
            source={nameIcon}
            style={styles.topImage}
          />
          <H2 style={styles.header}>Твое имя?</H2>
          <DaterTextInput
            placeholder="Например: Андрей или Юля"
            returnKeyType="next"
            style={styles.input}
            onChangeText={this.onChangeText}
            maxLength={15}
            initialValue={this.props.name}
            autoFocus={this.navigationFlowType !== 'editProfile'}
          />
          <DaterButton
            onPress={this.onNameSubmit}
            disabled={!this.state.isNameValid}
            onDisabledPress={this.onInvalidNameSubmit}
          >
            {this.navigationFlowType === 'editProfile' ? 'Сохранить' : 'Далее'}
          </DaterButton>
        </ScrollView>
      </DaterModal>
    );
  }
}

const styles = StyleSheet.create({
  modal: {
  },
  scrollView: {
    alignSelf: 'center',
  },
  scrollViewContainer: {
    alignItems: 'center',
  },
  topImage: {
    marginTop: 64,
  },
  header: {
    textAlign: 'center',
    marginBottom: 8,
  },
  input: {
    textAlign: 'center',
    width: 300,
  },
});

export default connect(mapStateToProps)(NameScreen);
