import { Dimensions } from 'react-native';

export const { width, height } = Dimensions.get('window');
export const SCREEN_ASPECT_RATIO = width / height;
export const DEFAULT_LATITUDE_DELTA = 0.00322;
export const DEFAULT_LONGITUDE_DELTA = DEFAULT_LATITUDE_DELTA * SCREEN_ASPECT_RATIO;
export const SCREEN_DIAGONAL = Math.sqrt((width * width) + (height * height));
export const DEFAULT_MAPVIEW_ANIMATION_DURATION = 500;
