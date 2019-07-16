import { Router } from 'express';
import { validationResult, param } from 'express-validator/check';
import TaxController from '../../controllers/tax.controller';

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
  tax_id: param('tax_id')
    .exists({ checkFalsy: true, checkNull: true })
    .isInt({ allow_leading_zeroes: true, gt: 0 })
    .toInt()
    .withMessage('USR_02|The field tax_id must not be empty|tax_id|400'),
};

const router = Router();

router.get('^/tax$', TaxController.getAllTax);
router.get('/tax/:tax_id(\\d+)', [ruleSets.tax_id], validateFields, TaxController.getSingleTax);

export default router;
