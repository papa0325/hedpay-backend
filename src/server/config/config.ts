import * as dotenv from 'dotenv';
import * as Path from 'path';

dotenv.config();

export default {
  db: {
    link: process.env.DB_LINK,
  },
  auth: {
    adminAccess: process.env.JWT_ADMIN_ACCESS_SECRET,
    jwt: {
      access: {
        secret: process.env.JWT_ACCESS_SECRET,
        lifetime: Number(process.env.JWT_ACCESS_LIFETIME),
      },
      refresh: {
        secret: process.env.JWT_REFRESH_SECRET,
        lifetime: Number(process.env.JWT_REFRESH_LIFETIME),
      },
    },
  },
  cors: {
    origins: JSON.parse(process.env.CORS_ORIGINS),
    methods: JSON.parse(process.env.CORS_METHODS),
  },
  chat: {
    adminBackendWSUrl: process.env.ADMIN_BACKEND_URL,
    adminBackendUsername: process.env.ADMIN_BACKEND_USERNAME,
    adminBackendPassword: process.env.ADMIN_BACKEND_PASSWORD,
    thisBackendUsername: process.env.BACKEND_THIS_USERNAME,
    thisBackendPassword: process.env.BACKEND_THIS_PASSWORD,
  },
  secure: {
    saltRounds: Number(process.env.SALT_ROUNDS),
  },
  email: {
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
  },
  files: {
    maxFilesSize: 1024 * 1024 * 15,
    maxFilesCount: 3,
    allowedExtensions: /(jpg|png|jpeg|docx|pdf)$/,
    filesDir: Path.join(__dirname, '..', '..', '..', 'data/image/'),
  },
  scheduler: {
    db: process.env.SCHEDULER_LINK,
    concurrency: Number(process.env.SCHEDULER_CONCURRENCY),
    interval: Number(process.env.SCHEDULER_INTERVAL),
  },
  path: {
    avatarURL: process.env.AVATAR_URL,
    serverURL: process.env.SERVER_URL,
    appURL: process.env.APP_URL,
    documentsFolder: Path.join(__dirname, '..', '..', '..', process.env.DOCUMENTS_FOLDER),
    tempFolder: Path.join(__dirname, '..', '..', '..', process.env.TEMP_UPLOADS_FOLDER),
    avatarFolder: Path.join(__dirname, '..', '..', '..', process.env.AVATAR_FOLDER),
  },
  gateway: {
    url: process.env.GATEWAY_URL,
    username: process.env.GATEWAY_USERNAME,
    password: process.env.GATEWAY_PASSWORD,
    key: process.env.GATEWAY_IPN,
    otp: process.env.GATEWAY_2FA_KEY,
    serverId: process.env.GATEWAY_SERVER_ID,
    serverPassword: process.env.GATEWAY_SERVER_PASSWORD,
  },
  rates: {
    apiKey: process.env.COIN_MARKET_API_KEY,
    precision: Number(process.env.RATES_PRECISION),
    hdpToEthRates: process.env.HDP_ETH_RATIO,
  },
  expire: {
    restorePassword: Number(process.env.RESTORE_PASSWORD_EXPIRE),
  },
  notification: {
    token: process.env.NOTIFICATION_REST_TOKEN,
    pushUrl: `${process.env.SERVER_URL}/api${process.env.NOTIFICATION_URL}/${process.env.NOTIFICATION_REST_TOKEN}/push`,
  },
  recaptcha: {
    secret: process.env.RECAPTCHA_SECRET,
    url: `https://www.google.com/recaptcha/api/siteverify`,
  },
  kyc: {
    url: process.env.KYC_URL,
    w2: {
      countries: process.env.PROVIDERS_W2_COUNTRIES,
    },
  },
  networkType: process.env.NETWORK_TYPE,
  dex: {
    url: process.env.DEX_URL,
    serverId: process.env.DEX_SERVER_ID,
    serverPassword: process.env.DEX_SERVER_PASSWORD,
  },
};
