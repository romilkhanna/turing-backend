import { Router } from 'express';
import { validationResult, param, header, body } from 'express-validator/check';
import ShoppingCartController from '../../controllers/shoppingCart.controller';
import TokenController from '../../controllers/token.controller';

const validateFields = async (req, res, next) => {
  const errors = validationResult(req).array();
  if (!errors.length) {
    return next();
  }

  const errorParts = errors[0].msg.split('|');
  const error = {
    code: errorParts[0],
    message: errorParts[1],
    field: errorParts[2],
    status: errorParts[3],
  };

  return res.status(error.status).json(error);
};

const ruleSets = {
  auth: header('user-key')
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage('AUT_01|Authorization code is empty|user-key|401'),
  auth2: header('user-key')
    .custom(value => value.match(/^Bearer .+/))
    .withMessage('AUT_02|Access Unauthorized|user-key|401'),
  cart_id_param: param('cart_id')
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage('USR_02|The field cart_id must not be empty|cart_id|400'),
  cart_id_body: param('cart_id')
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage('USR_02|The field cart_id must not be empty|cart_id|400'),
  product_id: body('product_id')
    .exists({ checkFalsy: true, checkNull: true })
    .isInt({ allow_leading_zeroes: true, gt: 0 })
    .toInt()
    .withMessage('USR_02|The field product_id must not be empty|product_id|400'),
  attributes: body('attributes')
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage('USR_02|The field attributes must not be empty|attributes|400'),
  item_id: param('item_id')
    .exists({ checkFalsy: true, checkNull: true })
    .isInt({ allow_leading_zeroes: true, gt: 0 })
    .toInt()
    .withMessage('USR_02|The field item_id must not be empty|item_id|400'),
  quantity: body('quantity')
    .exists({ checkFalsy: true, checkNull: true })
    .isInt({ allow_leading_zeroes: true, gt: 0 })
    .toInt()
    .withMessage('USR_02|The field quantity must not be empty|quantity|400'),
  shipping_id: body('shipping_id')
    .exists({ checkFalsy: true, checkNull: true })
    .isInt({ allow_leading_zeroes: true, gt: 0 })
    .toInt()
    .withMessage('USR_02|The field shipping_id must not be empty|shipping_id|400'),
  tax_id: body('tax_id')
    .exists({ checkFalsy: true, checkNull: true })
    .isInt({ allow_leading_zeroes: true, gt: 0 })
    .toInt()
    .withMessage('USR_02|The field tax_id must not be empty|tax_id|400'),
  order_id: param('order_id')
    .exists({ checkFalsy: true, checkNull: true })
    .isInt({ allow_leading_zeroes: true, gt: 0 })
    .toInt()
    .withMessage('USR_02|The field order_id must not be empty|order_id|400'),
};

const router = Router();
router.get('/shoppingcart/generateUniqueId', ShoppingCartController.generateUniqueCart);
router.post(
  '/shoppingcart/add',
  [ruleSets.cart_id_body, ruleSets.product_id, ruleSets.attributes],
  validateFields,
  ShoppingCartController.addItemToCart
);
router.get(
  '/shoppingcart/:cart_id',
  [ruleSets.cart_id_param],
  validateFields,
  ShoppingCartController.getCart
);
router.put(
  '/shoppingcart/update/:item_id',
  [ruleSets.item_id, ruleSets.quantity],
  validateFields,
  ShoppingCartController.updateCartItem
);
router.delete(
  '/shoppingcart/empty/:cart_id',
  [ruleSets.cart_id_param],
  validateFields,
  ShoppingCartController.emptyCart
);
router.delete(
  '/shoppingcart/removeProduct/:item_id',
  [ruleSets.item_id],
  validateFields,
  ShoppingCartController.removeItemFromCart
);
router.post(
  '/orders',
  [ruleSets.auth, ruleSets.auth2, ruleSets.cart_id_body, ruleSets.shipping_id, ruleSets.tax_id],
  validateFields,
  TokenController.validateToken,
  ShoppingCartController.createOrder
);
router.get(
  '/orders/inCustomer',
  [ruleSets.auth, ruleSets.auth2],
  validateFields,
  TokenController.validateToken,
  ShoppingCartController.getCustomerOrders
);
router.get(
  '/orders/:order_id(\\d+)',
  TokenController.validateToken,
  [ruleSets.auth, ruleSets.auth2, ruleSets.order_id],
  validateFields,
  ShoppingCartController.getOrderSummary
);
router.post(
  '/stripe/charge',
  TokenController.validateToken,
  ShoppingCartController.processStripePayment
);

export default router;
