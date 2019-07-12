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
import { Product, Department, Category, Sequelize, sequelize } from '../database/models';

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
   *
   * Tests:
   *  http://localhost:5000/products -> 200 OK
   *  http://localhost:5000/products?description_length=1 -> 200 OK
   */
  static async getAllProducts(req, res, next) {
    let { page, limit, description_length } = req.query; // eslint-disable-line
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);
    description_length = parseInt(description_length, 10); // eslint-disable-line

    try {
      res.locals.data = await Product.findAndCountAll({
        offset: page && page > 0 ? page - 1 : 0,
        limit: limit && limit > 0 ? limit : 20,
      });

      res.locals.data.rows.forEach(row => {
        return row.setDataValue(
          'description',
          row
            .getDataValue('description')
            .substring(0, description_length && description_length > 0 ? description_length : 200) // eslint-disable-line
        );
      });

      next();
    } catch (error) {
      next(error);
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
   *
   * Tests:
   *  http://localhost:5000/products/search?query_string=Mercury -> 200 OK
   *  http://localhost:5000/products/search?query_string=Mercury&description_length=1 -> 200 OK
   *  http://localhost:5000/products/search?query_string=cucumber -> 200 OK
   */
  static async searchProduct(req, res, next) {
    let { query_string, all_words = all_words || true, page, limit, description_length } = req.query;  // eslint-disable-line
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);
    description_length = parseInt(description_length, 10); // eslint-disable-line

    try {
      res.locals.data = await Product.findAndCountAll({
        offset: page && page > 0 ? page - 1 : 0,
        limit: limit && limit > 0 ? limit : 20,
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

      res.locals.data.rows.forEach(row => {
        return row.setDataValue(
          'description',
          row
            .getDataValue('description')
            .substring(0, description_length && description_length > 0 ? description_length : 200) // eslint-disable-line
        );
      });

      next();
    } catch (error) {
      next(error);
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
   *
   * Tests:
   *  http://localhost:5000/products/inCategory/1 -> 200 OK
   */
  static async getProductsByCategory(req, res, next) {
    const { category_id } = req.params;
    let { page, limit, description_length } = req.query; // eslint-disable-line
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);
    description_length = parseInt(description_length, 10); // eslint-disable-line

    try {
      res.locals.data = await Product.findAndCountAll({
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
        offset: page && page > 0 ? page - 1 : 0,
        limit: limit && limit > 0 ? limit : 20,
      });

      res.locals.data.rows.forEach(row => {
        return row.setDataValue(
          'description',
          row
            .getDataValue('description')
            .substring(0, description_length && description_length > 0 ? description_length : 200) // eslint-disable-line
        );
      });

      next();
    } catch (error) {
      next(error);
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
   *
   * Tests:
   *  http://localhost:5000/products/inDepartment/1 -> 200 OK
   *  http://localhost:5000/products/inDepartment/a -> 404 Not Found
   */
  static async getProductsByDepartment(req, res, next) {
    const { department_id } = req.params; // eslint-disable-line
    let { page, limit, description_length } = req.query; // eslint-disable-line
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);
    description_length = parseInt(description_length, 10); // eslint-disable-line

    try {
      res.locals.data = await Category.findAndCountAll({
        where: {
          department_id,
        },
        include: [
          {
            model: Product,
            required: true,
          },
        ],
        offset: page && page > 0 ? page - 1 : 0,
        limit: limit && limit > 0 ? limit : 20,
      });

      res.locals.data.rows.forEach(row => {
        return row.setDataValue(
          'description',
          row
            .getDataValue('description')
            .substring(0, description_length && description_length > 0 ? description_length : 200) // eslint-disable-line
        );
      });

      next();
    } catch (error) {
      next(error);
    }
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
   *
   * Tests:
   *  http://localhost:5000/products/1 -> 200 OK
   *  http://localhost:5000/products/a -> 404 Not Found
   */
  static async getProduct(req, res, next) {
    const { product_id } = req.params; // eslint-disable-line

    try {
      // TODO: For some reason findByPk doesn't work
      res.locals.data = await Product.findAll({ where: { product_id } });

      next();
    } catch (error) {
      next(error);
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
   *
   * Tests:
   *  http://localhost:5000/departments -> 200 OK
   */
  static async getAllDepartments(req, res, next) {
    try {
      res.locals.data = await Department.findAll();
      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single department
   * @param {*} req
   * @param {*} res
   * @param {*} next
   *
   * Tests:
   *  http://localhost:5000/departments/1 -> 200 OK
   *  http://localhost:5000/departments/a -> 404 Not Found
   */
  static async getDepartment(req, res, next) {
    const { department_id } = req.params; // eslint-disable-line

    try {
      // TODO: For some reason findByPk doesn't work
      res.locals.data = await Department.findAll({ where: { department_id } });
      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * This method should get all categories
   * @param {*} req
   * @param {*} res
   * @param {*} next
   *
   * Tests:
   *  http://localhost:5000/categories -> 200 OK
   */
  static async getAllCategories(req, res, next) {
    let { order, page, limit } = req.query;
    order = sequelize.col(order || 'category_id');
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    try {
      res.locals.data = await Category.findAndCountAll({
        offset: page && page > 0 ? page - 1 : 0,
        limit: limit && limit > 0 ? limit : 20,
        order,
      });

      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * This method should get a single category using the categoryId
   * @param {*} req
   * @param {*} res
   * @param {*} next
   *
   * Tests:
   *  http://localhost:5000/categories/1 -> 200 OK
   *  http://localhost:5000/categories/a -> 404 Not Found
   */
  static async getSingleCategory(req, res, next) {
    const { category_id } = req.params;  // eslint-disable-line

    try {
      // TODO: For some reason findByPk doesn't work
      res.locals.data = await Category.findAll({ where: { category_id } });
      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * This method should get list of categories in a department
   * @param {*} req
   * @param {*} res
   * @param {*} next
   *
   * Tests:
   *  http://localhost:5000/categories/inDepartment/1 -> 200 OK
   *  http://localhost:5000/categories/inDepartment/a -> 404 Not Found
   */
  static async getDepartmentCategories(req, res, next) {
    const { department_id } = req.params;  // eslint-disable-line

    try {
      res.locals.data = await Category.findAll({ where: { department_id } });
      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * This method should get list of categories in a product
   * @param {*} req
   * @param {*} res
   * @param {*} next
   *
   * Tests:
   *  http://localhost:5000/categories/inProduct/1 -> 200 OK
   *  http://localhost:5000/categories/inProduct/a -> 404 Not Found
   */
  static async getProductCategories(req, res, next) {
    const { product_id } = req.params;  // eslint-disable-line

    try {
      const result = await Product.findByPk(product_id, {
        attributes: [],
        include: [
          {
            model: Category,
            through: { attributes: [] },
            required: true,
            attributes: ['category_id', 'department_id', 'name'],
          },
        ],
      });

      res.locals.data = result ? result.Categories : result;
      next();
    } catch (error) {
      next(error);
    }
  }
}

export default ProductController;
