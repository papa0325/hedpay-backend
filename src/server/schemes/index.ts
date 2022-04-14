import * as Joi from '@hapi/joi';

export const dates = {
  createdAt: Joi.date(),
  updatedAt: Joi.date()
};

export const user = Joi.object({
  id: Joi.string().uuid(),

  email: Joi.string().email(),
  avatar: Joi.string().description('Avatar links'),

  firstName: Joi.string(),
  lastName: Joi.string(),
  gender: Joi.number().integer().description('0 - male, 1 - female'),

  phone: Joi.string(),
  address: Joi.object({
    country: Joi.string(),
    state: Joi.string(),
    street: Joi.string(),
    number: Joi.string().description('Building number'),
    postalCode: Joi.number().integer()
  }),
  status: Joi.number().integer().description('0 - created, 1 - email verified, 2 - documents verified'),
  ...dates
});

export const currency = Joi.object({
  id: Joi.string().description('Coin short title').example('btc'),
  symbol: Joi.string().description('Coin token name').example('BTC'),
  fullTitle: Joi.string().description('Coin full title').example('Bitcoin'),
  decimals: Joi.number().integer().description('How many digits after point to store'),
  currentRate: Joi.string().description('Current rate as string'),
  change: Joi.string().description('Change in 24h')
});

export const document = Joi.object({
  id: Joi.string().uuid(),
  type: Joi.number().integer(),
  userId: Joi.string().uuid(),
  documentNumber: Joi.number().integer(),
  documentSeries: Joi.number().integer(),
  expireDate: Joi.date(),
  photoFront: Joi.string(),
  photoSelfie: Joi.string(),
  ...dates
});

export const notification = Joi.object({
  id: Joi.string().uuid(),
  userId: Joi.string().uuid(),
  seen: Joi.boolean(),
  type: Joi.number().integer(),
  meta: Joi.object(),
  ...dates
});

export const package_ = Joi.object({
  id: Joi.string().uuid(),
  amount: Joi.number().integer(),
  months: Joi.number().integer(),
  percentage: Joi.number().integer(),

  leftAmount: Joi.number().integer(),
  ...dates
});

export const ratesHistory = Joi.object({
  id: Joi.string().uuid(),
  currencyId: Joi.string().description('Coin short title').example('BTC'),
  rate: Joi.string().description('Coin rate as string'),
  volume: Joi.string().description('Coin volume as string'),
  ...dates
});

export const transaction = Joi.object({
  id: Joi.string().uuid(),
  status: Joi.number().integer(),
  amount: Joi.string().regex(/^\d+$/),
  type: Joi.number().integer(),
  from: Joi.string(),
  to: Joi.string(),
  description: Joi.string(),
  currencyId: Joi.string().uuid(),
  walletId: Joi.string().uuid(),
  userId: Joi.string().uuid(),
  ...dates
});

export const wallet = Joi.object({
  id: Joi.string().uuid(),
  balance: Joi.string().example('123498.234'),
  userId: Joi.string().uuid(),
  currencyId: Joi.string().uuid(),
  address: Joi.string(),
  ...dates
});

export const outputOkSchema = (res: Joi.object): Joi.object => Joi.object({
  ok: Joi.boolean().example(true),
  result: res
});

export const outputErrorSchema = (code: number, msg: string, data: Joi.schema): Joi.schema => Joi.object({
  ok: Joi.boolean().example(false),
  code: Joi.number().integer().example(code),
  msg: Joi.string().example(msg),
  data
});

export const profileDocsFields = {
  birthDate: Joi.string(),
  birthPlace: Joi.string().min(3).max(50),
  identityDocument: Joi.string(),
  identityDocumentNumber: Joi.string(),
  identityDocumentRelDate: Joi.string(),
  identityDocumentExpDate: Joi.string(),
  state: Joi.string().min(3).max(50),
  city: Joi.string().min(3).max(50),
  // address:Joi.string().min(3).max(50).required(),
  streetType: Joi.string().min(3).max(50),
  streetName: Joi.string().min(3).max(50),
  buildingNum: Joi.number(),
  unitNumber: Joi.number(),
  zip: Joi.string(),
  telephone: Joi.string().min(10).max(20),
  // shipping address
  shippingState: Joi.string().min(3).max(50),
  shippingCity: Joi.string().min(3).max(50),
  shippingStreetType: Joi.string().min(3).max(50),
  shippingStreetName: Joi.string().min(3).max(50),
  shippingBuildingNum: Joi.number(),
  shippingUnitNumber: Joi.number(),
  shippingZip: Joi.string()
};

// ---------------------------------
export const personInfoSchema = Joi.object({
  firstName: Joi.string().required().example('Ivan'),
  lastName: Joi.string().required().example('Ivanov'),
  middleName: Joi.string().example('Ivanovich'),
  birthDate: Joi.string().required().isoDate().example('1970-01-01T00:00:00Z'),
  gender: Joi.string().example('M').allow('M', 'F').description('M - male, F - female')
  // birthPlace: Joi.string()
});

export const documentSchema = Joi.object({
  number: Joi.string().example('123456')
  // serie: Joi.string().example('1234'),
  // taxCode: Joi.string().example('BNGFPP40T05C390C'),
  // issueDate: Joi.string().isoDate().example('1970-01-01T00:00:00Z'),
  // expireDate: Joi.string().isoDate().example('1970-01-01T00:00:00Z'),
  // type: Joi.string().example('passport'),
  // country: Joi.string().example('Russia'),
  // driverLicenseNumber: Joi.string().example('F255-9215-0121-03')
});

export const communicationSchema = Joi.object({
  // email: Joi.string().email().example('me@example.com'),
  // ipAddress: Joi.string().ip().example('127.0.0.1'),
  phone: Joi.string().example('+79000000000')
});

export const locationSchema = Joi.object({
  state: Joi.string(),
  city: Joi.string(),
  // province: Joi.string(),
  // streetType: Joi.string(),
  streetName: Joi.string().required(),
  buildingNum: Joi.string().required(),
  // unitNumber: Joi.string(),
  // houseExtension: Joi.string(),
  zipCode: Joi.string().required()
});

export const profileSchema = Joi.object({
  profileIdentityVerification: Joi.object({
    person: personInfoSchema.required(),
    document: documentSchema,
    communication: communicationSchema,
    location: locationSchema,
    country: Joi.string().required()
  }),
  firstName: Joi.string(),
  lastName: Joi.string(),
  username: Joi.string(),
  avatar: Joi.string().description('Base64')
});
// ---------------------------------

export const profileMeValidation = Joi.object({
  ...{
    firstName: Joi.string(),
    lastName: Joi.string(),
    username: Joi.string(),
    avatar: Joi.string().description('Base64')
  },
  ...profileDocsFields
});
