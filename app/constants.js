import { Dimensions } from 'react-native';

// Screen
export const SCREEN_WIDTH = Dimensions.get('window').width;
export const SCREEN_HEIGHT = Dimensions.get('window').height;

export const SCREEN_ASPECT_RATIO = SCREEN_WIDTH / SCREEN_HEIGHT;
export const SCREEN_DIAGONAL = Math.sqrt((SCREEN_WIDTH * SCREEN_WIDTH) + (SCREEN_HEIGHT * SCREEN_HEIGHT));

// Map
export const DEFAULT_LATITUDE_DELTA = 0.00322;
export const DEFAULT_LONGITUDE_DELTA = DEFAULT_LATITUDE_DELTA * SCREEN_ASPECT_RATIO;
export const DEFAULT_MAPVIEW_ANIMATION_DURATION = 500;
export const EARTH_RADIUS_M = 6371e3;

// Past locations history
export const MIN_DISTANCE_FROM_PREVIOUS_PAST_LOCATION = 20;
export const MAX_DISTANCE_FROM_PREVIOUS_PAST_LOCATION = 500;
export const MAX_VELOCITY_FROM_PREVIOUS_PAST_LOCATION = 50;
export const MAX_PAST_LOCATIONS = 25;
export const MAX_VISIBLE_PAST_LOCATIONS = 15;
export const MINIMUM_ACCURACY_PAST_LOCATION = 40;

export const USERS_AROUND_SEARCH_RADIUS_KM = 25;
export const USERS_AROUND_SHOW_LAST_SEEN_HOURS_AGO = 12;

// Firebase
export const MICRO_DATES_COLLECTION = 'microDates';
export const GEO_POINTS_COLLECTION = 'geoPoints';

// Micro Dates
export const DISTANCE_TO_UPLOAD_SELFIE_THRESHOLD = 200000;

// Cloudinary

