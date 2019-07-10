/**
 * The Product controller contains all static methods that handles product request
 * Some methods work fine, some needs to be implemented from scratch while others may contain one or two bugs
 * The static methods and their function include:
 *
 * - getAllProducts - Return a paginated list of products
 * - searchProducts - Returns a list of product that matches the search query string
 * - getProductsByCategory - Returns all products in a product category
 * - getProductsByDepartment - Returns a list of products in a particular department
 * - getProduct - Returns a single product with a matched id in the request params
 * - getAllDepartments - Returns a list of all product departments
 * - getDepartment - Returns a single department
 * - getAllCategories - Returns all categories
 * - getSingleCategory - Returns a single category
 * - getDepartmentCategories - Returns all categories in a department
 *
 *  NB: Check the BACKEND CHALLENGE TEMPLATE DOCUMENTATION in the readme of this repository to see our recommended
 *  endpoints, request body/param, and response object for each of these method
 */
import log from 'fancy-log';
import {
  Product,
  Department,
  AttributeValue,
  Attribute,
  Category,
  Sequelize,
} from '../database/models';

const { Op } = Sequelize;

/**
 *
 *
 * @class ProductController
 */
class ProductController {
  /**
   * get all products
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product data
   * @memberof ProductController
   */
  static async getAllProducts(req, res, next) {
    const { page, limit, offset } = req.query;
    const sqlQueryMap = {
      limit,
      offset,
    };
    const err = new Error('Product list does not exist');
    err.status = 400;
    try {
      const products = await Product.findAndCountAll(sqlQueryMap);
      return products ? res.json(products) : next(err);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * search all products
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product data
   * @memberof ProductController
   */
  static async searchProduct(req, res, next) {
    const { query_string, all_words = true || all_words, page, limit, length } = req.query;  // eslint-disable-line
    let err = new Error(`Product for query '${query_string}', does not exist`) // eslint-disable-line
    err.status = 400;
    try {
      const product = await Product.findAndCountAll({
        limit,
        where: {
          [Op.or]: [
            {
              name: {
                [Op.like]: all_words ? `%${query_string}%` : query_string, // eslint-disable-line
              },
            },
            {
              description: {
                [Op.like]: all_words ? `%${query_string}%` : query_string, // eslint-disable-line
              },
            },
          ],
        },
      });
      return product ? res.json(product) : next(err);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * get all products by caetgory
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product data
   * @memberof ProductController
   */
  static async getProductsByCategory(req, res, next) {
    const { category_id } = req.params; // eslint-disable-line
    const { page, limit, offset } = req.query;
    const err = new Error(`Products for category id ${category_id} does not exist`); // eslint-disable-line
    err.status = 400;
    try {
      const products = await Product.findAndCountAll({
        attributes: ['product_id', 'name', 'description', 'price', 'discounted_price', 'thumbnail'],
        include: [
          {
            model: Category,
            where: {
              category_id,
            },
            attributes: [],
          },
        ],
        limit,
        offset,
      });
      return products ? res.json(products) : next(err);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * get all products by department
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product data
   * @memberof ProductController
   */
  static async getProductsByDepartment(req, res, next) {
    // implement the method to get products by department
  }

  /**
   * get single product details
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product details
   * @memberof ProductController
   */
  static async getProduct(req, res, next) {
    const { product_id } = req.params; // eslint-disable-line
    try {
      const product = await Product.findByPk(product_id, {
        include: [
          {
            model: AttributeValue,
            as: 'attributes',
            attributes: ['value'],
            through: {
              attributes: [],
            },
            include: [
              {
                model: Attribute,
                as: 'attribute_type',
              },
            ],
          },
        ],
      });
      return res.json(product);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * get all departments
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and department list
   * @memberof ProductController
   */
  static async getAllDepartments(req, res, next) {
    let error = new Error('Could not get list of departments');
    error.status = 400;
    try {
      const departments = await Department.findAll();
      return departments ? res.json(departments) : next(error);
    } catch (err) {
      error = err;
      return next(error);
    }
  }

  /**
   * Get a single department
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async getDepartment(req, res, next) {
    const { department_id } = req.params; // eslint-disable-line
    let error = new Error(`Department with id ${department_id} does not exist`); // eslint-disable-line
    error.status = 400;
    try {
      const department = await Department.findByPk(department_id);
      return department ? res.json(department) : next(error);
    } catch (err) {
      error = err;
      return next(error);
    }
  }

  /**
   * This method should get all categories
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async getAllCategories(req, res, next) {
    let error = new Error('Could not get list of categories');
    error.status = 400;
    try {
      const categories = await Category.findAll();
      return categories ? res.json(categories) : next(error);
    } catch (err) {
      error = err;
      return next(error);
    }
  }

  /**
   * This method should get a single category using the categoryId
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async getSingleCategory(req, res, next) {
    const { category_id } = req.params;  // eslint-disable-line
    let error = new Error(`Category with id ${category_id} does not exist`); // eslint-disable-line
    error.status = 400;
    try {
      const category = await Category.findByPk(category_id);
      return category ? res.json(category) : next(error);
    } catch (err) {
      error = err;
      return next(error);
    }
  }

  /**
   * This method should get list of categories in a department
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async getDepartmentCategories(req, res, next) {
    const { department_id } = req.params;  // eslint-disable-line
    let error = new Error(`Categories for id ${department_id} does not exist`); // eslint-disable-line
    error.status = 400;
    try {
      const categories = await Category.findAll({
        where: {
          department_id,
        },
      });
      return categories ? res.json(categories) : next(error);
    } catch (err) {
      error = err;
      return next(error);
    }
  }
}

export default ProductController;
