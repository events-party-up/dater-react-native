import DeviceInfo from 'react-native-device-info';
// Device models https://github.com/rebeccahughes/react-native-device-info/blob/master/ios/RNDeviceInfo/RNDeviceInfo.m

const isiPhoneX = () => (
  DeviceInfo.getModel() === 'iPhone X'
);

const isOfiPhone5Size = () => (
  /iPhone 5/.test(DeviceInfo.getModel()) || /iPhone SE/.test(DeviceInfo.getModel())
);

const isOfiPhonePlusSize = () => (
  /iPhone.*Plus/.test(DeviceInfo.getModel())
);

const isOfiPhone6ExcludingPlusSize = () => (
  /^iPhone 6((?!Plus).)*$/.test(DeviceInfo.getModel()) ||
  /^iPhone 7((?!Plus).)*$/.test(DeviceInfo.getModel()) ||
  /^iPhone 8((?!Plus).)*$/.test(DeviceInfo.getModel())
);

const DeviceUtils = {
  isiPhoneX,
  isOfiPhone5Size,
  isOfiPhonePlusSize,
  isOfiPhone6ExcludingPlusSize,
};

export default DeviceUtils;
