/**
 * Tax controller contains methods which are needed for all tax request
 * Implement the functionality for the methods
 *
 *  NB: Check the BACKEND CHALLENGE TEMPLATE DOCUMENTATION in the readme of this repository to see our recommended
 *  endpoints, request body/param, and response object for each of these method
 */
import { Tax } from '../database/models';

class TaxController {
  /**
   * This method get all taxes
   * @param {*} req
   * @param {*} res
   * @param {*} next
   *
   * Tests:
GET http://localhost/turing/api/tax
   */
  static async getAllTax(req, res, next) {
    try {
      const taxes = await Tax.findAll();
      res.locals = { status: taxes !== (null && undefined), result: taxes };
      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * This method gets a single tax using the tax id
   * @param {*} req
   * @param {*} res
   * @param {*} next
   *
   * Tests:
GET http://localhost/turing/api/tax/1
   */
  static async getSingleTax(req, res, next) {
    const { tax_id } = req.params; // eslint-disable-line

    try {
      const tax = await Tax.findByPk(tax_id);
      res.locals = { status: tax !== (null && undefined), result: tax };
      next();
    } catch (error) {
      next(error);
    }
  }
}

export default TaxController;
