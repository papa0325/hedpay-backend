import { error, output } from '../../utils';
import { ComingSoonSubscribers } from '../../models/ComingSoonSubscribers';
import { recaptchaValidate } from '../../utils/auth';
import { addJob } from '../../utils/helpers';

export const subscribe = async (r) => {
  try {
    if (!await recaptchaValidate(r.payload.recaptcha)) {
      return error(400000, 'Recaptcha validation fail', { field: 'recaptcha', reason: 'fail' });
    }

    if (await ComingSoonSubscribers.findByPk(r.payload.email)) {
      return error(400000, 'You are already subscribed', {});
    }

    await ComingSoonSubscribers.create({ email: r.payload.email });
    const text = `Hello!\n
        You've registered your email successfully on HEdpAY.com.\n
        we'll notify you further on The Wallet launch and Other updates.\n
        Thank you!`;
    await addJob('sendEmail', {
      // text,
      email: r.payload.email,
      subject: 'HEdpAY | Subscription',
      html: `<p>Hello!<br>You've registered your email successfully on <a href="http://hedpay.com/" target="_blank">HEdpAY.com</a>.<br>
                   we'll notify you further on The Wallet launch and Other updates.<br> 
                   Thank you!
                    </p>`
    });
    return output({ success: true });
  }
  catch (e) {
    console.log(e);
  }
};
