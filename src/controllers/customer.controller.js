/**
 * Customer controller handles all requests that has to do with customer
 * Some methods needs to be implemented from scratch while others may contain one or two bugs
 *
 * - create - allow customers to create a new account
 * - login - allow customers to login to their account
 * - getCustomerProfile - allow customers to view their profile info
 * - updateCustomerProfile - allow customers to update their profile info like name, email, password, day_phone, eve_phone and mob_phone
 * - updateCustomerAddress - allow customers to update their address info
 * - updateCreditCard - allow customers to update their credit card number
 *
 *  NB: Check the BACKEND CHALLENGE TEMPLATE DOCUMENTATION in the readme of this repository to see our recommended
 *  endpoints, request body/param, and response object for each of these method
 */
import { Customer } from '../database/models';

/**
 *
 *
 * @class CustomerController
 */
class CustomerController {
  /**
   * create a customer record
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, customer data and access token
   * @memberof CustomerController
   *
   * Tests:
POST http://localhost/turing/api/customers
content-type: application/x-www-form-urlencoded

name=romil&password=test&email=romilkhanna@outlook.com
   */
  static async create(req, res, next) {
    const { name, email, password } = req.body;

    try {
      const [customer, isCreated] = await Customer.findCreateFind({
        where: { email },
        defaults: { name, email, password },
      });

      if (!isCreated) {
        throw new Error('Customer already exists');
      }

      Object.keys(Customer.prototype.rawAttributes).forEach(attr => {
        customer.dataValues[attr] = customer.dataValues[attr] || null;
      });

      res.locals = {
        customer_id: customer.dataValues.customer_id,
        result: { customer: customer.getSafeDataValues() },
      };

      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * log in a customer
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, and access token
   * @memberof CustomerController
   *
   * Tests:
POST http://localhost/turing/api/customers/login
content-type: application/x-www-form-urlencoded

password=test&email=romilkhanna@outlook.com
   */
  static async login(req, res, next) {
    const { email, password } = req.body;

    try {
      const customer = await Customer.findOne({ where: { email } });

      if (!customer) throw new Error('Invalid email or password');

      const isValid = await customer.validatePassword(password);

      if (!isValid) throw new Error('Invalid email or password');

      Object.keys(Customer.prototype.rawAttributes).forEach(column => {
        customer.set(column, customer.get(column) || null);
      });

      res.locals = {
        customer_id: customer.dataValues.customer_id,
        result: { customer: customer.getSafeDataValues() },
      };

      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * get customer profile data
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status customer profile data
   * @memberof CustomerController
   *
   * Tests:
GET http://localhost/turing/api/customer
Content-Type: application/x-www-form-urlencoded
USER-KEY: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjozMywiaWF0IjoxNTYzMjI0OTkwLCJleHAiOjE1NjMzMTEzOTB9.VgEmZE3adTewg_6ot6ed6AM3_n6XyWqH-eVoIyFf7Mg
   */
  static async getCustomerProfile(req, res, next) {
    const { customer_id } = res.locals; // eslint-disable-line

    try {
      const customer = await Customer.findByPk(customer_id);

      res.locals = {
        status: customer !== (null && undefined),
        result: { customer: customer.getSafeDataValues() },
      };

      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * update customer profile data such as name, email, password, day_phone, eve_phone and mob_phone
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status customer profile data
   * @memberof CustomerController
   *
   * Tests:
PUT http://localhost/turing/api/customer
Content-Type: application/x-www-form-urlencoded
USER-KEY: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjozMywiaWF0IjoxNTYzMjI0OTkwLCJleHAiOjE1NjMzMTEzOTB9.VgEmZE3adTewg_6ot6ed6AM3_n6XyWqH-eVoIyFf7Mg

name=romil&email=romilkhanna@outlook.com&day_phone=1234567890
   */
  static async updateCustomerProfile(req, res, next) {
    const { name, email, password, day_phone, eve_phone, mob_phone } = req.body; // eslint-disable-line
    const { customer_id } = res.locals; // eslint-disable-line

    try {
      if (!name || !email) throw new Error("Fields 'name' and 'email' required");

      const customer = await Customer.findByPk(customer_id);
      await customer.update({
        name,
        email,
        password,
        day_phone,
        eve_phone,
        mob_phone,
      });

      res.locals = {
        status: customer !== (null && undefined),
        result: customer.getSafeDataValues(),
      };

      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * update customer profile data such as address_1, address_2, city, region, postal_code, country and shipping_region_id
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status customer profile data
   * @memberof CustomerController
   *
   * Tests:
PUT http://localhost/turing/api/customers/address
Content-Type: application/x-www-form-urlencoded
USER-KEY: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjozMywiaWF0IjoxNTYzMjI0OTkwLCJleHAiOjE1NjMzMTEzOTB9.VgEmZE3adTewg_6ot6ed6AM3_n6XyWqH-eVoIyFf7Mg

address_1=123%20Main%20St&city=Toronto&region=ontario&postal_code=123456&country=canada&shipping_region_id=1
   */
  static async updateCustomerAddress(req, res, next) {
    const {
      address_1, // eslint-disable-line
      address_2, // eslint-disable-line
      city,
      region,
      postal_code, // eslint-disable-line
      country,
      shipping_region_id, // eslint-disable-line
    } = req.body;
    const { customer_id } = res.locals; // eslint-disable-line

    try {
      if (!address_1 || !city || !region || !postal_code || !country || !shipping_region_id) // eslint-disable-line
        throw new Error(
          "Fields 'address_1', 'city', 'region', 'postal_code', 'country' and 'shipping_region_id' required"
        );

      const customer = await Customer.findByPk(customer_id);
      await customer.update({
        address_1,
        address_2: address_2 || null, // eslint-disable-line
        city,
        region,
        postal_code,
        country,
        shipping_region_id,
      });

      res.locals = {
        status: customer !== (null && undefined),
        result: customer.getSafeDataValues(),
      };

      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * update customer credit card
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status customer profile data
   * @memberof CustomerController
   *
   * Tests:
PUT http://localhost/turing/api/customers/creditCard
Content-Type: application/x-www-form-urlencoded
USER-KEY: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjozMywiaWF0IjoxNTYzMjI0OTkwLCJleHAiOjE1NjMzMTEzOTB9.VgEmZE3adTewg_6ot6ed6AM3_n6XyWqH-eVoIyFf7Mg

credit_card=12345678901234567890
   */
  static async updateCreditCard(req, res, next) {
    const { credit_card } = req.body; // eslint-disable-line
    const { customer_id } = res.locals; // eslint-disable-line

    try {
      if (!credit_card) throw new Error("Fields 'credit_card' required"); // eslint-disable-line

      const customer = await Customer.findByPk(customer_id);
      await customer.update({ credit_card });

      res.locals = {
        status: customer !== (null && undefined),
        result: customer.getSafeDataValues(),
      };

      next();
    } catch (error) {
      next(error);
    }
  }
}

export default CustomerController;
