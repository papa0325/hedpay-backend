import * as dotenv from 'dotenv';

dotenv.config();

export default {
  server: {
    host: process.env.SERVER_HOST,
    port: process.env.SERVER_PORT
  }
};
