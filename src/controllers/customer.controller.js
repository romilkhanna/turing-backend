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
import log from 'fancy-log';
import jwt from 'jsonwebtoken';
import { Customer, sequelize } from '../database/models';

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
POST http://localhost:5000/customers
content-type: application/x-www-form-urlencoded

name=romil&password=test&email=romilkhanna@outlook.com
   */
  static async create(req, res, next) {
    const { name, email, password } = req.body;

    try {
      const customer = await Customer.create({
        name,
        email,
        password,
      });

      const token = jwt.sign({ data: customer.customer_id }, process.env.JWT_KEY, {
        expiresIn: process.env.DEFAULT_TOKEN_EXPIRY_TIME,
      });

      Object.keys(Customer.prototype.rawAttributes).forEach(column => {
        customer.set(column, customer.get(column) || null);
      });

      res.locals.data = {
        customer: customer.getSafeDataValues(),
        accessToken: `Bearer ${token}`,
        expires_in: process.env.DEFAULT_TOKEN_EXPIRY_TIME,
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
POST http://localhost:5000/customers/login
content-type: application/x-www-form-urlencoded

password=test&email=romilkhanna@outlook.com
   */
  static async login(req, res, next) {
    const { email, password } = req.body;

    try {
      const customer = await Customer.findOne({ where: { email } });
      const isValid = await customer.validatePassword(password);

      if (!isValid) throw new Error('Invalid password');

      const token = jwt.sign({ data: customer.customer_id }, process.env.JWT_KEY, {
        expiresIn: process.env.DEFAULT_TOKEN_EXPIRY_TIME,
      });

      Object.keys(Customer.prototype.rawAttributes).forEach(column => {
        customer.set(column, customer.get(column) || null);
      });

      res.locals.data = {
        customer: customer.getSafeDataValues(),
        accessToken: `Bearer ${token}`,
        expires_in: process.env.DEFAULT_TOKEN_EXPIRY_TIME,
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
GET http://localhost:5000/customer
Content-Type: application/x-www-form-urlencoded
USER-KEY: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoyNiwiaWF0IjoxNTYyOTAyNjE4LCJleHAiOjE1NjI5ODkwMTh9.hJ8JrmBZ31lZLUiZMhfL_eIlfZ8buIRsQOjqduxUGVs
   */
  static async getCustomerProfile(req, res, next) {
    const tokenHeader = req.headers['user-key'];

    try {
      if (!tokenHeader.match(/^Bearer .+/)) throw new Error('Invalid token scheme');

      const token = tokenHeader.split(' ')[1];
      const customer_id = jwt.verify(token, process.env.JWT_KEY).data; // eslint-disable-line
      const customer = await Customer.findByPk(customer_id);

      res.locals.data = customer.getSafeDataValues();
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
PUT http://localhost:5000/customer
Content-Type: application/x-www-form-urlencoded
USER-KEY: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoyNiwiaWF0IjoxNTYyOTAyNjE4LCJleHAiOjE1NjI5ODkwMTh9.hJ8JrmBZ31lZLUiZMhfL_eIlfZ8buIRsQOjqduxUGVs

name=romil&email=romilkhanna@outlook.com&day_phone=1234567890
   */
  static async updateCustomerProfile(req, res, next) {
    const { name, email, password, day_phone, eve_phone, mob_phone } = req.body; // eslint-disable-line
    const tokenHeader = req.headers['user-key'];

    try {
      if (!tokenHeader.match(/^Bearer .+/)) throw new Error('Invalid token scheme');
      if (!name || !email) throw new Error("Fields 'name' and 'email' required");

      const token = tokenHeader.split(' ')[1];
      const customer_id = jwt.verify(token, process.env.JWT_KEY).data; // eslint-disable-line
      const customer = await Customer.findByPk(customer_id);
      await customer.update({
        name,
        email,
        password,
        day_phone,
        eve_phone,
        mob_phone,
      });

      res.locals.data = customer.getSafeDataValues();
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
PUT http://localhost:5000/customers/address
Content-Type: application/x-www-form-urlencoded
USER-KEY: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoyNiwiaWF0IjoxNTYyOTAyNjE4LCJleHAiOjE1NjI5ODkwMTh9.hJ8JrmBZ31lZLUiZMhfL_eIlfZ8buIRsQOjqduxUGVs

address_1=123%20Main%20St&city=Toronto&region=ontario&postal_code=123456&country=canada&shipping_region_id=1
   */
  static async updateCustomerAddress(req, res, next) {
    const {
      address_1,
      address_2,
      city,
      region,
      postal_code,
      country,
      shipping_region_id,
    } = req.body;
    const tokenHeader = req.headers['user-key'];

    try {
      if (!tokenHeader.match(/^Bearer .+/)) throw new Error('Invalid token scheme');
      if (!address_1 || !city || !region || !postal_code || !country || !shipping_region_id) // eslint-disable-line
        throw new Error(
          "Fields 'address_1', 'city', 'region', 'postal_code', 'country' and 'shipping_region_id' required"
        );

      const token = tokenHeader.split(' ')[1];
      const customer_id = jwt.verify(token, process.env.JWT_KEY).data; // eslint-disable-line
      const customer = await Customer.findByPk(customer_id);
      await customer.update({
        address_1,
        city,
        region,
        postal_code,
        country,
        shipping_region_id,
      });

      res.locals.data = customer.getSafeDataValues();
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
PUT http://localhost:5000/customers/creditCard
Content-Type: application/x-www-form-urlencoded
USER-KEY: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoyNiwiaWF0IjoxNTYyOTAyNjE4LCJleHAiOjE1NjI5ODkwMTh9.hJ8JrmBZ31lZLUiZMhfL_eIlfZ8buIRsQOjqduxUGVs

credit_card=12345678901234567890
   */
  static async updateCreditCard(req, res, next) {
    const { credit_card } = req.body; // eslint-disable-line
    const tokenHeader = req.headers['user-key'];

    try {
      if (!tokenHeader.match(/^Bearer .+/)) throw new Error('Invalid token scheme');
      if (!credit_card) throw new Error("Fields 'credit_card' required"); // eslint-disable-line

      const token = tokenHeader.split(' ')[1];
      const customer_id = jwt.verify(token, process.env.JWT_KEY).data; // eslint-disable-line
      const customer = await Customer.findByPk(customer_id);
      await customer.update({ credit_card });

      res.locals.data = customer.getSafeDataValues();
      next();
    } catch (error) {
      next(error);
    }
  }
}

export default CustomerController;
