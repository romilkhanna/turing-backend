import { Router } from 'express';
import { validationResult, header, body } from 'express-validator/check';
import CustomerController from '../../controllers/customer.controller';
import TokenController from '../../controllers/token.controller';

const validateFields = async (req, res, next) => {
  const errors = validationResult(req).array();
  if (errors.length) {
    const errorParts = errors[0].msg.split('|');
    const error = {
      code: errorParts[0],
      message: errorParts[1],
      field: errorParts[2],
      status: errorParts[3],
    };

    return res.status(error.status).json(error);
  }
  return next();
};

const ruleSets = {
  auth: header('user-key')
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage('AUT_01|Authorization code is empty|user-key|401'),
  auth2: header('user-key')
    .custom(value => value.match(/^Bearer .+/))
    .withMessage('AUT_02|Access Unauthorized|user-key|401'),
  name: body('name')
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage('USR_02|The field name must not be empty|name|400'),
  email: body('email')
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage('USR_02|The field email must not be empty|email|400'),
  password_req: body('password')
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage('USR_02|The field password must not be empty|password|400'),
  password_opt: body('password')
    .optional({ checkFalsy: true, nullable: true })
    .not()
    .isEmpty()
    .withMessage('USR_02|The field password must not be empty|password|400'),
  dphone: body('day_phone')
    .optional({ checkFalsy: true, nullable: true })
    .not()
    .isEmpty()
    .isMobilePhone()
    .withMessage('USR_02|The field day_phone must be of format xxx-xxx-xxxx|day_phone|400'),
  ephone: body('eve_phone')
    .optional({ checkFalsy: true, nullable: true })
    .not()
    .isEmpty()
    .isMobilePhone()
    .withMessage('USR_02|The field eve_phone must be of format xxx-xxx-xxxx|eve_phone|400'),
  mphone: body('mob_phone')
    .optional({ checkFalsy: true, nullable: true })
    .not()
    .isEmpty()
    .isMobilePhone()
    .withMessage('USR_02|The field mob_phone must be of format xxx-xxx-xxxx|mob_phone|400'),
  addr1: body('address_1')
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage('USR_02|The field address_1 must not be empty|address_1|400'),
  addr2: body('address_2')
    .optional({ checkFalsy: true, nullable: true })
    .not()
    .isEmpty()
    .withMessage('USR_02|The field address_2 must not be empty|address_2|400'),
  city: body('city')
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage('USR_02|The field city must not be empty|city|400'),
  region: body('region')
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage('USR_02|The field region must not be empty|region|400'),
  postal: body('postal_code')
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage('USR_02|The field postal_code must not be empty|postal_code|400'),
  country: body('country')
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage('USR_02|The field country must not be empty|country|400'),
  shipping_region_id: body('shipping_region_id')
    .exists({ checkFalsy: true, checkNull: true })
    .isInt({ allow_leading_zeroes: true, gt: 0 })
    .toInt()
    .withMessage(
      'USR_02|The param shipping_region_id must be positive integer|shipping_region_id|400'
    ),
  credit: body('credit_card')
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage('USR_02|The field credit_card must not be empty|credit_card|400'),
};

const router = Router();
router.post(
  '/customers',
  [ruleSets.name, ruleSets.email, ruleSets.password_req],
  validateFields,
  CustomerController.create,
  TokenController.createToken
);
router.post(
  '/customers/login',
  [ruleSets.email, ruleSets.password_req],
  validateFields,
  CustomerController.login,
  TokenController.createToken
);
router.get(
  '/customer',
  [ruleSets.auth, ruleSets.auth2],
  validateFields,
  TokenController.validateToken,
  CustomerController.getCustomerProfile
);
router.put(
  '/customer',
  [
    ruleSets.auth,
    ruleSets.auth2,
    ruleSets.name,
    ruleSets.email,
    ruleSets.password_opt,
    ruleSets.dphone,
    ruleSets.ephone,
    ruleSets.mphone,
  ],
  validateFields,
  TokenController.validateToken,
  CustomerController.updateCustomerProfile
);
router.put(
  '/customers/address',
  [
    ruleSets.auth,
    ruleSets.auth2,
    ruleSets.addr1,
    ruleSets.addr2,
    ruleSets.city,
    ruleSets.region,
    ruleSets.postal,
    ruleSets.country,
    ruleSets.shipping_region_id,
  ],
  validateFields,
  TokenController.validateToken,
  CustomerController.updateCustomerAddress
);
router.put(
  '/customers/creditCard',
  [ruleSets.auth, ruleSets.auth2, ruleSets.credit],
  validateFields,
  TokenController.validateToken,
  CustomerController.updateCreditCard
);

export default router;
