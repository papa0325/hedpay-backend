import * as ws from '../api/ws';
import { outputOkSchema, user } from '../schemes';

export default [
  {
    path: '/notifications/{id}',
    // onSubscribe: ws.onSubscribe,
    options: {
      filter: (path, message, options) => (message.updater !== options.credentials.username)
    }
  }
];
