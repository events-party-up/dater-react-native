import { StackNavigator } from 'react-navigation';
import LoginScreen from '../screens/login/login-screen';
import PhoneNumberScreen from '../screens/login/phone-number-screen';
import SmsCodeScreen from '../screens/login/sms-code-screen';
import GenderScreen from '../screens/profile/gender-screen';
import NameScreen from '../screens/profile/name-screen';
import BirthdayScreen from '../screens/profile/birthday-screen';
import UploadPhotoScreen from '../screens/profile/upload-photo-screen';
import MakePhotoSelfieScreen from '../screens/make-photo-selfie-screen';
import ProfileScreen from '../screens/profile/profile-screen';

const LoginNavigator = StackNavigator(
  {
    LoginScreen: {
      screen: LoginScreen,
    },
    PhoneNumberScreen: {
      screen: PhoneNumberScreen,
    },
    SmsCodeScreen: {
      screen: SmsCodeScreen,
    },
    GenderScreen: {
      screen: GenderScreen,
    },
    NameScreen: {
      screen: NameScreen,
    },
    BirthdayScreen: {
      screen: BirthdayScreen,
    },
    UploadPhotoScreen: {
      screen: UploadPhotoScreen,
    },
    MakePhotoSelfieScreen: {
      screen: MakePhotoSelfieScreen,
    },
    ProfileScreen: {
      screen: ProfileScreen,
    },
  },
  {
    initialRouteName: 'LoginScreen',
    headerMode: 'none',
    header: null,
  },
);

export default LoginNavigator;
