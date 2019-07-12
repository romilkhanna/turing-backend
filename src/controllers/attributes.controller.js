/**
 * The controller defined below is the attribute controller, highlighted below are the functions of each static method
 * in the controller
 *  Some methods needs to be implemented from scratch while others may contain one or two bugs
 *
 * - getAllAttributes - This method should return an array of all attributes
 * - getSingleAttribute - This method should return a single attribute using the attribute_id in the request parameter
 * - getAttributeValues - This method should return an array of all attribute values of a single attribute using the attribute id
 * - getProductAttributes - This method should return an array of all the product attributes
 * NB: Check the BACKEND CHALLENGE TEMPLATE DOCUMENTATION in the readme of this repository to see our recommended
 *  endpoints, request body/param, and response object for each of these method
 */
import { Attribute, AttributeValue, Product, Sequelize } from '../database/models';

class AttributeController {
  /**
   * This method get all attributes
   * @param {*} req
   * @param {*} res
   * @param {*} next
   *
   * Tests:
   *  http://localhost:5000/attributes -> 200 OK
   */
  static async getAllAttributes(req, res, next) {
    try {
      res.locals.data = await Attribute.findAll();
      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * This method gets a single attribute using the attribute id
   * @param {*} req
   * @param {*} res
   * @param {*} next
   *
   * Tests:
   *  http://localhost:5000/attributes/1 -> 200 OK
   *  http://localhost:5000/attributes/a -> 404 Not Found
   */
  static async getSingleAttribute(req, res, next) {
    const { attribute_id } = req.params; // eslint-disable-line
    try {
      res.locals.data = await Attribute.findByPk(attribute_id);
      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * This method gets a list attribute values in an attribute using the attribute id
   * @param {*} req
   * @param {*} res
   * @param {*} next
   *
   * Tests:
   *  http://localhost:5000/attributes/values/1 -> 200 OK
   *  http://localhost:5000/attributes/values/a -> 404 Not Found
   */
  static async getAttributeValues(req, res, next) {
    const { attribute_id } = req.params; // eslint-disable-line
    try {
      const result = await Attribute.findByPk(attribute_id, {
        include: [
          {
            model: AttributeValue,
            required: true,
          },
        ],
      });
      res.locals.data = result ? result.AttributeValues : result;
      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * This method gets a list attribute values in a product using the product id
   * @param {*} req
   * @param {*} res
   * @param {*} next
   *
   * Tests:
   *  http://localhost:5000/attributes/inProduct/1 -> 200 OK
   *  http://localhost:5000/attributes/inProduct/a -> 404 Not Found
   */
  static async getProductAttributes(req, res, next) {
    const { product_id } = req.params; // eslint-disable-line
    try {
      res.locals.data = await AttributeValue.findAll({
        attributes: [
          'attribute_value_id',
          ['value', 'attribute_value'],
          [Sequelize.literal('attribute_type.name'), 'attribute_name'],
        ],
        include: [
          {
            model: Product,
            through: { where: { product_id } },
            required: true,
            attributes: [],
          },
          {
            model: Attribute,
            as: 'attribute_type',
            required: true,
            attributes: [],
          },
        ],
      });
      next();
    } catch (error) {
      next(error);
    }
  }
}

export default AttributeController;
