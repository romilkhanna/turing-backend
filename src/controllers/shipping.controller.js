/**
 * The Shipping Controller contains all the static methods that handles all shipping request
 * This piece of code work fine, but you can test and debug any detected issue
 *
 * - getShippingRegions - Returns a list of all shipping region
 * - getShippingType - Returns a list of shipping type in a specific shipping region
 *
 */
import { ShippingRegion, Shipping } from '../database/models';

class ShippingController {
  /**
   * get all shipping regions
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and shipping regions data
   * @memberof ShippingController
   *
   * Tests:
GET http://localhost/turing/api/shipping/regions
   */
  static async getShippingRegions(req, res, next) {
    try {
      const shippingRegions = await ShippingRegion.findAll();
      res.locals = { status: shippingRegions !== (null && undefined), result: shippingRegions };
      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * get get shipping region shipping types
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and shipping types data
   * @memberof ShippingController
   *
   * Tests:
GET http://localhost/turing/api/shipping/regions/2
   */
  static async getShippingType(req, res, next) {
    const { shipping_region_id } = req.params; // eslint-disable-line

    try {
      const shippingTypes = await Shipping.findAll({ where: { shipping_region_id } });
      res.locals = { status: shippingTypes !== (null && undefined), result: shippingTypes }
      next()
    } catch (error) {
      next(error);
    }
  }
}

export default ShippingController;
