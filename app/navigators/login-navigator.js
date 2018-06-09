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
    Login: {
      screen: LoginScreen,
    },
    PhoneNumber: {
      screen: PhoneNumberScreen,
    },
    SmsCode: {
      screen: SmsCodeScreen,
    },
    RegisterGender: {
      screen: GenderScreen,
    },
    RegisterName: {
      screen: NameScreen,
    },
    RegisterBirthday: {
      screen: BirthdayScreen,
    },
    RegisterUploadPhoto: {
      screen: UploadPhotoScreen,
    },
    RegisterMakePhotoSelfie: {
      screen: MakePhotoSelfieScreen,
    },
    RegisterProfile: {
      screen: ProfileScreen,
    },
  },
  {
    initialRouteName: 'Login',
    headerMode: 'none',
    header: null,
  },
);

export default LoginNavigator;
