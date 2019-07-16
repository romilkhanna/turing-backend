import { Router } from 'express';
import { validationResult, param } from 'express-validator/check';
import ShippingController from '../../controllers/shipping.controller';

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
  shipping_region_id: param('shipping_region_id')
    .exists()
    .isInt({ allow_leading_zeroes: true, gt: 0 })
    .toInt()
    .withMessage(
      'USR_02|The param shipping_region_id must be positive integer|shipping_region_id|400'
    ),
};

const router = Router();

router.get('^/shipping/regions$', ShippingController.getShippingRegions);
router.get(
  '/shipping/regions/:shipping_region_id(\\d+)',
  [ruleSets.shipping_region_id],
  validateFields,
  ShippingController.getShippingType
);

export default router;
