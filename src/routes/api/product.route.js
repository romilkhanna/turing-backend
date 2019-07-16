import { Router } from 'express';
import { validationResult, param, query } from 'express-validator/check';
import log from 'fancy-log';
import ProductController from '../../controllers/product.controller';

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
  order: query('order')
    .optional()
    .isIn(['category_id', 'name'])
    .withMessage('USR_02|The query order must one of: "category_id" or "name"|order|400'),
  page: query('page')
    .optional()
    .toInt()
    .isInt({ allow_leading_zeroes: true, gt: 0 })
    .withMessage('USR_02|The query page must be positive integer|page|400'),
  limit: query('limit')
    .optional()
    .toInt()
    .isInt({ allow_leading_zeroes: true, gt: 0 })
    .withMessage('USR_02|The query limit must be positive integer|limit|400'),
  description_length: query('description_length')
    .optional()
    .toInt()
    .isInt({ allow_leading_zeroes: true, gt: 0 })
    .withMessage(
      'USR_02|The query description_length must be positive integer|description_length|400'
    ),
  query_string: query('query_string')
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage('USR_02|The query query_string must not be empty|query_string|400'),
  all_words: query('all_words')
    .optional()
    .isIn(['on', 'off'])
    .withMessage('USR_02|The query all_words must one of: "on" or "off"|all_words|400'),
  product_id: param('product_id')
    .exists()
    .isInt({ allow_leading_zeroes: true, gt: 0 })
    .toInt()
    .withMessage('USR_02|The param product_id must be positive integer|product_id|400'),
  category_id: param('category_id')
    .exists()
    .isInt({ allow_leading_zeroes: true, gt: 0 })
    .toInt()
    .withMessage('USR_02|The param category_id must be positive integer|category_id|400'),
  department_id: param('department_id')
    .exists()
    .isInt({ allow_leading_zeroes: true, gt: 0 })
    .toInt()
    .withMessage('USR_02|The param department_id must be positive integer|department_id|400'),
};

const router = Router();
router.get(
  /^\/products$/,
  [ruleSets.page, ruleSets.limit, ruleSets.description_length],
  validateFields,
  ProductController.getAllProducts
);
router.get(
  /^\/products\/search$/,
  [
    ruleSets.query_string,
    ruleSets.all_words,
    ruleSets.page,
    ruleSets.limit,
    ruleSets.description_length,
  ],
  validateFields,
  ProductController.searchProduct
);
router.get(
  '/products/inCategory/:category_id',
  [ruleSets.category_id, ruleSets.page, ruleSets.limit, ruleSets.description_length],
  validateFields,
  ProductController.getProductsByCategory
);
router.get(
  '/products/inDepartment/:department_id',
  [ruleSets.department_id, ruleSets.page, ruleSets.limit, ruleSets.description_length],
  validateFields,
  ProductController.getProductsByDepartment
);
router.get(
  '/products/:product_id',
  [ruleSets.product_id],
  validateFields,
  ProductController.getProduct
);
router.get('/departments', ProductController.getAllDepartments);
router.get(
  '/departments/:department_id',
  [ruleSets.department_id],
  validateFields,
  ProductController.getDepartment
);
router.get(
  '/categories',
  [ruleSets.order, ruleSets.page, ruleSets.limit],
  validateFields,
  ProductController.getAllCategories
);
router.get(
  '/categories/:category_id',
  [ruleSets.category_id],
  validateFields,
  ProductController.getSingleCategory
);
router.get(
  '/categories/inDepartment/:department_id',
  [ruleSets.department_id],
  validateFields,
  ProductController.getDepartmentCategories
);
router.get(
  '/categories/inProduct/:product_id',
  [ruleSets.product_id],
  validateFields,
  ProductController.getProductCategories
);

export default router;
