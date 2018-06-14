import React, { Component } from 'react';
import { connect, Dispatch } from 'react-redux';
import {
  ScrollView,
  StyleSheet,
  Image,
  DatePickerIOS,
  View,
} from 'react-native';

import DaterModal from '../../components/ui-kit/organisms/dater-modal';
import { H2, Body } from '../../components/ui-kit/atoms/typography';
import { calculateAgeFrom, ageWithTextPostfix } from '../../utils/date-utils';

const birthdayIcon = require('../../assets/icons/birthday/birthday.png');

const mapStateToProps = (state) => ({
  birthday: state.currentUser.birthday,
});

type Props = {
  navigation: any,
  dispatch: Dispatch,
  birthday: Date,
};

type State = {
  birthday: Date,
  birthdayKeyboardHeight: number,
};

class BirthdayScreen extends Component<Props, State> {
  setDate;
  initialDate = new Date(new Date().setFullYear(new Date().getFullYear() - 25));
  navigationFlowType: string;

  constructor(props) {
    super(props);

    this.state = {
      birthday: this.props.birthday || this.initialDate,
      birthdayKeyboardHeight: 0,
    };
    this.setDate = this.setDate.bind(this);
  }

  componentWillMount() {
    this.navigationFlowType = this.props.navigation.getParam('navigationFlowType');
  }

  setDate(newDate) {
    this.setState({ birthday: newDate });
  }

  onBirthdaySelected = () => {
    this.props.dispatch({ type: 'CURRENT_USER_SET_PROFILE_FIELDS', payload: { birthday: this.state.birthday } });
    if (this.navigationFlowType === 'editProfile') {
      this.props.navigation.goBack();
    } else {
      this.props.navigation.navigate({
        key: 'MakePhotoSelfieScreen',
        routeName: 'MakePhotoSelfieScreen',
        params: { photoType: 'profilePhoto' },
      });
    }
  }

  render() {
    return (
      <DaterModal
        fullscreen
        backButton
        backButtonPress={() => this.props.navigation.goBack()}
        confirmButtonPress={this.onBirthdaySelected}
        confirmButton={this.initialDate !== this.state.birthday && this.state.birthday !== this.props.birthday}
        bottomButtonsHeightOffset={this.state.birthdayKeyboardHeight}
        style={styles.modal}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          scrollEnabled={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContainer}
        >
          <Image
            source={birthdayIcon}
            style={styles.topImage}
          />
          <H2 style={styles.header}>Твоя дата рождения?</H2>
          {this.initialDate === this.state.birthday &&
            <Body style={styles.subHeader}>Сервис только для{'\n'}совершеннолетних</Body>
          }
          {this.initialDate !== this.state.birthday &&
            <Body style={styles.subHeader}>
            Тебе сейчас {ageWithTextPostfix(calculateAgeFrom(this.state.birthday), ['год', 'года', 'лет'])} {' '}
              {'\n'}Вход разрешен!
            </Body>
          }
        </ScrollView>
        <View
          onLayout={(event) => { this.setState({ birthdayKeyboardHeight: event.nativeEvent.layout.height }); }}
        >
          <DatePickerIOS
            maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 17))}
            minimumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 80))}
            mode="date"
            locale="ru"
            date={this.state.birthday}
            onDateChange={this.setDate}
          />
        </View>
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
  subHeader: {
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    textAlign: 'center',
  },
});

export default connect(mapStateToProps)(BirthdayScreen);
