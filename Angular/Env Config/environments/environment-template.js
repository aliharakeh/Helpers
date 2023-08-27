export const envTemplate = {
    PRODUCTION: false,
    APP_NAME: 'Env Template',
    APP_TITLE: 'Trinov Mobile App',
    BASE_URL: '',
    API_ENDPOINTS: {
        API_BASE_URL: '/dwd_web/suivi',
        API_SPEC_URL: '/api/rte',
        API_SSO_URL: '/api/sso',
        API_DASHBOARD: '/api/tdb',
        API_USER: '/api/user',
        API_DWD_URL: '/dwd_web/dwd',
        API_REPORTS_URL: '/api/report',
        API_REQUETEUR: '/api/requeteur',
        API_NOTIFICATION_URL: '/api/notification'
    },
    AUTHENTICATION_STORAGE: {
        ACCESS_TOKEN: 'ACCESS_TOKEN',
        REFRESH_TOKEN: 'REFRESH_TOKEN',
        SSO_REFRESH_TOKEN: 'SSO_REFRESH_TOKEN',
        CURRENT_SITE_IDS: 'currentSiteIds',
        CURRENT_SITE_STATUS: 'currentSiteStatus',
        CURRENT_USER_INFO: 'currentUserInfo',
        CURRENT_USER_LOGIN: 'currentUserLogin',
        IS_SSO: 'isSSO'
    },
    APP_STORAGE: {
        PREFERENCES: 'preferences',
        NOTIFICATIONS: 'notifications'
    },
    COLLECTION_VALIDATION: {
        IMAGES_LIMIT: 3,
        QUALITY: 80,
        WIDTH: 640,
        HEIGHT: 480
    },
    CACHE: {
        TTL: {
            SECONDS: 0,
            MINUTES: 0,
            HOURS: 6
        },
        KEY: '_CACHE_'
    },
    GEOLOCATION_OPTIONS: {
        enableHighAccuracy: true,  // use GPS
        maximumAge: 30000, // current position cache time (in milliseconds)
        timeout: 30000  // max allowed request result time (in milliseconds)
    },
    GOOGLE_MAPS_API: 'AIzaSyDPhm3Giaai4x8K-dtKALk6ksfyId0wlXg',
    PUBLIC_APP_ANDROID_LINK: 'https://storage.googleapis.com/trinov-android-app/trinov-app.apk',
    PUBLIC_APP_IOS_LINK: 'https://storage.googleapis.com/trinov-android-app/trinov-app.apk',
    VERSION: '1.0.3',
    SENTRY_DSN: '',
    SSO: null
};
