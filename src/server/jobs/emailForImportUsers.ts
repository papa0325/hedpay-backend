import config from '../config/config';
import { User } from '../models/User';
import { addJob } from '../utils/helpers';

export default async () => {
  const users = await User.findAll({
    where: {
      status: -1
    }
  });

  for (const user of users) {
    addJob('sendEmail', {
      email: user.email,
      subject: 'HEdpAY | Restore your account',
      html: `<html xmlns="http://www.w3.org/1999/html">
        <body>
        <p>Dear Mr. ${user.lastName}, your Hedpay account at
        <a href="https://hedpay.com" target="_blank">
          www.hedpay.com
        </a>
        being updated along with your data, in order to access the account you need to click on a link and go through the password change procedure.</p>

        <a href="https://main.hedpay.com/reset" target="_blank">
          Reset your password
        </a>
        </body>
      </html>`
    });
  }
};
