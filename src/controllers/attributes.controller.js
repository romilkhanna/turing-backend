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
import { Attribute, AttributeValue, ProductAttribute } from '../database/models';

class AttributeController {
  /**
   * This method get all attributes
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async getAllAttributes(req, res, next) {
    try {
      const attributes = await Attribute.findAll();
      return res.status(200).json({
        status: true,
        data: attributes,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * This method gets a single attribute using the attribute id
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async getSingleAttribute(req, res, next) {
    const { attribute_id } = req.params;
    try {
      const attribute = await Attribute.findByPk(attribute_id);
      return res.status(200).json({
        status: true,
        data: attribute,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * This method gets a list attribute values in an attribute using the attribute id
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async getAttributeValues(req, res, next) {
    try {
      const attributeValues = await AttributeValue.findAll({
        where: {
          attribute_id: req.params.attribute_id,
        },
      });
      return res.status(200).json({
        status: true,
        data: attributeValues,
      });
    } catch (error) {
      return next();
    }
  }

  /**
   * This method gets a list attribute values in a product using the product id
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async getProductAttributes(req, res, next) {
    try {
      const attributes = await ProductAttribute.findAll({
        where: {
          product_id: req.params.product_id,
        },
      });
      return res.status(200).json({
        status: true,
        data: attributes,
      });
    } catch (error) {
      return next(error);
    }
  }
}

export default AttributeController;
