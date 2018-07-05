import { Dimensions } from 'react-native';

// Screen
export const SCREEN_WIDTH = Dimensions.get('window').width;
export const SCREEN_HEIGHT = Dimensions.get('window').height;

export const SCREEN_ASPECT_RATIO = SCREEN_WIDTH / SCREEN_HEIGHT;
export const SCREEN_DIAGONAL = Math.sqrt((SCREEN_WIDTH * SCREEN_WIDTH) + (SCREEN_HEIGHT * SCREEN_HEIGHT));

// Map
export const MAP_BOX_ACCESS_TOKEN = 'pk.eyJ1Ijoib2xlZ3duIiwiYSI6ImNqZzZhZXRsaTFydjAzM21vZjR0Y290aG8ifQ.gsFXXecyedS9_eg8TGTu7A'; //eslint-disable-line
export const DEFAULT_MAPVIEW_ANIMATION_DURATION = 500;
export const EARTH_RADIUS_M = 6371e3;
export const MICRO_DATE_MAPMAKER_POSITIVE_THRESHOLD_ANGLE = 40;

export const MAP_PLUS_MINUS_ZOOM_INCREMENT = 1;
export const MAP_MIN_ZOOM_LEVEL = 9;
export const MAP_MAX_ZOOM_LEVEL = 18;

// Geolocation services
export const HEADING_UPDATE_ON_DEGREE_CHANGED = 10;
export const ACTIVATE_POOR_GPS_TIMEOUT = 10000;
export const ACTIVATE_GOOD_GPS_TIMEOUT = 2000;
export const GOOD_GPS_ACCURACY_GENERAL = 50000; // 500;
export const GOOD_GPS_ACCURACY_MICRODATE_MODE = 50000; // 40;

// Past locations history
export const MIN_DISTANCE_FROM_PREVIOUS_PAST_LOCATION = 20;
export const MAX_DISTANCE_FROM_PREVIOUS_PAST_LOCATION = 500;
export const MAX_VELOCITY_FROM_PREVIOUS_PAST_LOCATION = 50;
export const MAX_VISIBLE_PAST_LOCATIONS = 115; // TODO: put back 15

// Firebase
export const MICRO_DATES_COLLECTION = 'microDates';
export const GEO_POINTS_PAST_MICRO_DATES_COLLECTION = 'finishedMicroDates';
export const GEO_POINTS_COLLECTION = 'geoPoints';
export const CURRENT_USER_COLLECTION = 'users';
export const PROFILE_PHOTOS_STORAGE_PATH = 'profilePhotos';

// Micro Dates
export const DISTANCE_TO_UPLOAD_SELFIE_THRESHOLD = 20;
export const TIME_TO_RESPOND_TO_MICRO_DATE_REQUEST = 10 * 1000 * 60;
export const TIME_TO_FINISH_MICRO_DATE = 90 * 1000 * 60;

// Users around
export const USERS_AROUND_PUBLIC_UPDATE_INTERVAL = 2000;
export const USERS_AROUND_MICRODATE_UPDATE_INTERVAL = 1000;
export const USERS_AROUND_NEXT_MICRODATE_TIMEOUT_MS = 7 * 60 * 60 * 1000;
export const USERS_AROUND_SEARCH_RADIUS_KM = 25;
export const USERS_AROUND_SHOW_LAST_SEEN_HOURS_AGO = 1;

// Timeouts & Delays
export const SEND_SMS_TIMEOUT = 20000;
export const SEND_SMS_ARTIFICIAL_UI_DELAY = 2000;
export const VERIFY_SMS_CODE_TIMEOUT = 10000;
export const BUTTONS_ONPRESS_THROTTLE_THRESHOLD = 500;

// Cloudinary
export const CLOUDINARY_ACCOUNT_NAME = 'dater';
