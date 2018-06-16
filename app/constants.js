import { Dimensions } from 'react-native';

// Screen
export const SCREEN_WIDTH = Dimensions.get('window').width;
export const SCREEN_HEIGHT = Dimensions.get('window').height;

export const SCREEN_ASPECT_RATIO = SCREEN_WIDTH / SCREEN_HEIGHT;
export const SCREEN_DIAGONAL = Math.sqrt((SCREEN_WIDTH * SCREEN_WIDTH) + (SCREEN_HEIGHT * SCREEN_HEIGHT));

// Map
export const MAP_BOX_ACCESS_TOKEN = 'pk.eyJ1Ijoib2xlZ3duIiwiYSI6ImNqZzZhZXRsaTFydjAzM21vZjR0Y290aG8ifQ.gsFXXecyedS9_eg8TGTu7A'; //eslint-disable-line
export const DEFAULT_LATITUDE_DELTA = 0.00322;
export const DEFAULT_LONGITUDE_DELTA = DEFAULT_LATITUDE_DELTA * SCREEN_ASPECT_RATIO;
export const DEFAULT_MAPVIEW_ANIMATION_DURATION = 500;
export const EARTH_RADIUS_M = 6371e3;
export const MAP_PLUS_MINUS_ZOOM_INCREMENT = 1;
export const MICRO_DATE_MAPMAKER_POSITIVE_THRESHOLD_ANGLE = 40;

// Geolocation
export const HEADING_UPDATE_ON_DEGREE_CHANGED = 10;

// Past locations history
export const MIN_DISTANCE_FROM_PREVIOUS_PAST_LOCATION = 20;
export const MAX_DISTANCE_FROM_PREVIOUS_PAST_LOCATION = 500;
export const MAX_VELOCITY_FROM_PREVIOUS_PAST_LOCATION = 50;
export const MAX_VISIBLE_PAST_LOCATIONS = 115; // TODO: put back 15
export const MINIMUM_ACCURACY_PAST_LOCATION = 40;

export const USERS_AROUND_SEARCH_RADIUS_KM = 25;
export const USERS_AROUND_SHOW_LAST_SEEN_HOURS_AGO = 12;

// Firebase
export const MICRO_DATES_COLLECTION = 'microDates';
export const GEO_POINTS_COLLECTION = 'geoPoints';
export const CURRENT_USER_COLLECTION = 'users';
export const PROFILE_PHOTOS_STORAGE_PATH = 'profilePhotos';

// Micro Dates
export const DISTANCE_TO_UPLOAD_SELFIE_THRESHOLD = 20;

// Users around
export const USERS_AROUND_PUBLIC_UPDATE_INTERVAL = 2000;
export const USERS_AROUND_MICRODATE_UPDATE_INTERVAL = 1000;

// Timeouts & Delays
export const SEND_SMS_TIMEOUT = 20000;
export const SEND_SMS_ARTIFICIAL_UI_DELAY = 2000;
export const VERIFY_SMS_CODE_TIMEOUT = 10000;
export const BUTTONS_ONPRESS_THROTTLE_THRESHOLD = 500;
export const APP_STATE_ACTIVATE_BACKGROUND_MODE_AFTER = 15000;

// Cloudinary
export const CLOUDINARY_ACCOUNT_NAME = 'dater';
