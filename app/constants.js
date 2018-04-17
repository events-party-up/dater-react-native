import { Dimensions } from 'react-native';

export const { width, height } = Dimensions.get('window');
export const SCREEN_ASPECT_RATIO = width / height;
export const DEFAULT_LATITUDE_DELTA = 0.00322;
export const DEFAULT_LONGITUDE_DELTA = DEFAULT_LATITUDE_DELTA * SCREEN_ASPECT_RATIO;
export const SCREEN_DIAGONAL = Math.sqrt((width * width) + (height * height));
export const DEFAULT_MAPVIEW_ANIMATION_DURATION = 500;
export const USERS_AROUND_SEARCH_RADIUS_KM = 5;
export const USERS_AROUND_SHOW_LAST_SEEN_HOURS_AGO = 12;
