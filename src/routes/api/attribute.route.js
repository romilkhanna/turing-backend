import { Router } from 'express';
import { validationResult, param } from 'express-validator/check';
import AttributeController from '../../controllers/attributes.controller';

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
  attribute_id: param('attribute_id')
    .exists()
    .isInt({ gt: 0, allow_leading_zeroes: true })
    .toInt()
    .withMessage('USR_02|The param attribute_id must be positive integer|attribute_id|400'),
  product_id: param('product_id')
    .exists()
    .isInt({ gt: 0, allow_leading_zeroes: true })
    .toInt()
    .withMessage('USR_02|The param product_id must be positive integer|product_id|400'),
};

const router = Router();
router.get('/attributes', AttributeController.getAllAttributes);
router.get(
  '/attributes/:attribute_id',
  [ruleSets.attribute_id],
  validateFields,
  AttributeController.getSingleAttribute
);
router.get(
  '/attributes/values/:attribute_id',
  [ruleSets.attribute_id],
  validateFields,
  AttributeController.getAttributeValues
);
router.get(
  '/attributes/inProduct/:product_id',
  [ruleSets.product_id],
  validateFields,
  AttributeController.getProductAttributes
);

export default router;
