/**
 * Check each method in the shopping cart controller and add code to implement
 * the functionality or fix any bug.
 * The static methods and their function include:
 *
 * - generateUniqueCart - To generate a unique cart id
 * - addItemToCart - To add new product to the cart
 * - getCart - method to get list of items in a cart
 * - updateCartItem - Update the quantity of a product in the shopping cart
 * - emptyCart - should be able to clear shopping cart
 * - removeItemFromCart - should delete a product from the shopping cart
 * - createOrder - Create an order
 * - getCustomerOrders - get all orders of a customer
 * - getOrderSummary - get the details of an order
 * - processStripePayment - process stripe payment
 *
 *  NB: Check the BACKEND CHALLENGE TEMPLATE DOCUMENTATION in the readme of this repository to see our recommended
 *  endpoints, request body/param, and response object for each of these method
 */
import uuid from 'uuid/v4';
import { Product, ShoppingCart, sequelize, Order, OrderDetail } from '../database/models';

/**
 *
 *
 * @class shoppingCartController
 */
class ShoppingCartController {
  /**
   * generate random unique id for cart identifier
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with cart_id
   * @memberof shoppingCartController
   *
   * Tests:
   *  http://localhost/turing/api/shoppingcart/generateUniqueId
   */
  static generateUniqueCart(req, res, next) {
    try {
      const id = uuid().replace(/-/g, '');
      res.locals = { status: true, result: id };
      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * adds item to a cart with cart_id
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with cart
   * @memberof ShoppingCartController
   *
   * Tests:
POST http://localhost/turing/api/shoppingcart/add
Content-Type: application/x-www-form-urlencoded

cart_id=4c5d41e8c9714e8bb6fdbd3271365f40&product_id=1&attributes=Size,M
   */
  static async addItemToCart(req, res, next) {
    const { cart_id, product_id, attributes } = req.body; // eslint-disable-line

    try {
      const [cartItem, isCreated] = await ShoppingCart.findCreateFind({
        where: { cart_id, product_id, attributes },
        defaults: { cart_id, product_id, attributes, quantity: 1 },
        include: [{ model: Product, required: true, where: { product_id } }],
      });

      if (cartItem && !isCreated) {
        cartItem.set('quantity', cartItem.get('quantity') + 1);
        cartItem.save();
      }

      cartItem.dataValues.subtotal =
        cartItem.dataValues.quantity * cartItem.dataValues.Product.price;

      res.locals = {
        status: cartItem !== (null && undefined),
        result: {
          item_id: cartItem.dataValues.item_id,
          name: cartItem.dataValues.Product.name,
          attributes: cartItem.dataValues.attributes,
          product_id: cartItem.dataValues.product_id,
          image: cartItem.dataValues.Product.image,
          price: cartItem.dataValues.Product.price,
          quantity: cartItem.dataValues.quantity,
          subtotal: cartItem.dataValues.subtotal,
        },
      };

      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * get shopping cart using the cart_id
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with cart
   * @memberof ShoppingCartController
   *
   * Tests:
   *  http://localhost/turing/api/shoppingcart/4c5d41e8c9714e8bb6fdbd3271365f40
   */
  static async getCart(req, res, next) {
    const { cart_id } = req.params; // eslint-disable-line

    try {
      const cart = await ShoppingCart.findAll({
        where: { cart_id },
        include: [{ model: Product, required: true, attributes: [] }],
        attributes: [
          'item_id',
          [sequelize.col('Product.name'), 'name'],
          'attributes',
          'product_id',
          [sequelize.col('Product.price'), 'price'],
          'quantity',
          [sequelize.col('Product.image'), 'image'],
          [sequelize.literal('quantity * price'), 'subtotal'],
        ],
      });

      res.locals = { status: cart !== (null && undefined), result: cart };

      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * update cart item quantity using the item_id in the request param
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with cart
   * @memberof ShoppingCartController
   *
   * Tests:
PUT http://localhost/turing/api/shoppingcart/update/1
Content-Type: application/x-www-form-urlencoded

quantity=10
   */
  static async updateCartItem(req, res, next) {
    const { item_id } = req.params // eslint-disable-line
    const { quantity } = req.body;

    try {
      const cartItem = await ShoppingCart.findByPk(item_id, {
        include: [
          {
            model: Product,
            required: true,
            attributes: [],
          },
        ],
        attributes: [
          'item_id',
          [sequelize.col('Product.name'), 'name'],
          'attributes',
          'product_id',
          [sequelize.col('Product.price'), 'price'],
          'quantity',
          [sequelize.literal('quantity * price'), 'subtotal'],
        ],
      });

      if (!cartItem) throw new Error('Cart item not found');

      cartItem.update({ quantity });
      cartItem.save();
      cartItem.dataValues.subtotal = cartItem.get('quantity') * cartItem.get('price');

      res.locals = { status: true, result: cartItem };

      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * removes all items in a cart
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with cart
   * @memberof ShoppingCartController
   *
   * Tests:
DELETE http://localhost/turing/api/shoppingcart/empty/4c5d41e8c9714e8bb6fdbd3271365f40
   */
  static async emptyCart(req, res, next) {
    const { cart_id } = req.params; // eslint-disable-line

    try {
      const cart = await ShoppingCart.findOne({ where: { cart_id } });
      if (cart) {
        cart.destroy();
      }

      res.locals = { status: true, result: [] };

      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * remove single item from cart
   * cart id is obtained from current session
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with message
   * @memberof ShoppingCartController
   *
   * Tests:
DELETE http://localhost/turing/api/shoppingcart/removeProduct/12
   */
  static async removeItemFromCart(req, res, next) {
    const { item_id } = req.params; // eslint-disable-line

    try {
      const cartItem = await ShoppingCart.findByPk(item_id);
      if (cartItem) {
        cartItem.destroy();
      }

      res.locals = { status: true, result: [] };

      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * create an order from a cart
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with created order
   * @memberof ShoppingCartController
   *
   * Tests:
POST http://localhost/turing/api/orders
Content-Type: application/x-www-form-urlencoded
USER-KEY: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjozMywiaWF0IjoxNTYzMDY5NzYyLCJleHAiOjE1NjMxNTYxNjJ9.6ywm-Zt-cJcZNJHjrYQmY7bIugStylZZY_CIqexGzgA

cart_id=4c5d41e8c9714e8bb6fdbd3271365f40&shipping_id=1&tax_id=1
   */
  static async createOrder(req, res, next) {
    const { cart_id, shipping_id, tax_id } = req.body; // eslint-disable-line
    const { customer_id } = res.locals; // eslint-disable-line

    try {
      const cart = await ShoppingCart.findAll({
        where: { cart_id },
        include: [{ model: Product, required: true, attributes: [] }],
        attributes: [
          'item_id',
          [sequelize.col('Product.name'), 'name'],
          'attributes',
          'product_id',
          [sequelize.col('Product.price'), 'price'],
          'quantity',
          [sequelize.col('Product.image'), 'image'],
          [sequelize.literal('quantity * price'), 'subtotal'],
        ],
      });

      if (!cart) throw new Error('Cart not found');

      const total_amount = cart.reduce((total, cartItem) => { // eslint-disable-line
        return (total += parseFloat(cartItem.dataValues.subtotal)); // eslint-disable-line
      }, 0);

      let order = new Order();
      order.set('total_amount', total_amount);
      order.set('customer_id', customer_id);
      order.set('shipping_id', shipping_id);
      order.set('tax_id', tax_id);
      order = await order.save();

      cart.forEach(async cartItem => {
        const orderDetail = new OrderDetail();
        orderDetail.set('order_id', order.get('order_id'));
        orderDetail.set('product_id', cartItem.get('product_id'));
        orderDetail.set('attributes', cartItem.get('attributes'));
        orderDetail.set('product_name', cartItem.get('name'));
        orderDetail.set('quantity', cartItem.get('quantity'));
        orderDetail.set('unit_cost', cartItem.get('price'));
        await orderDetail.save();
      });

      res.locals = { status: true, result: { order_id: order.get('order_id') } };

      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   *
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with customer's orders
   * @memberof ShoppingCartController
   *
   * Tests:
GET http://localhost/turing/api/orders/inCustomer
USER-KEY: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjozMywiaWF0IjoxNTYzMDY5NzYyLCJleHAiOjE1NjMxNTYxNjJ9.6ywm-Zt-cJcZNJHjrYQmY7bIugStylZZY_CIqexGzgA
   */
  static async getCustomerOrders(req, res, next) {
    const { customer_id } = res.locals;  // eslint-disable-line

    try {
      const orders = await Order.findAll({ where: { customer_id } });
      res.locals = { status: orders !== (null && undefined), result: orders };
      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   *
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with order summary
   * @memberof ShoppingCartController
   *
   * Tests:
GET http://localhost/turing/api/orders/10
USER-KEY: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjozMywiaWF0IjoxNTYzMDY5NzYyLCJleHAiOjE1NjMxNTYxNjJ9.6ywm-Zt-cJcZNJHjrYQmY7bIugStylZZY_CIqexGzgA
   */
  static async getOrderSummary(req, res, next) {
    const { order_id } = req.params;  // eslint-disable-line
    const { customer_id } = res.locals;   // eslint-disable-line
    try {
      const order = await OrderDetail.findAll({
        where: { order_id },
        include: [{ model: Order, required: true, where: { customer_id }, attributes: [] }],
        attributes: {
          exclude: 'item_id',
          include: [[sequelize.literal('quantity * unit_cost'), 'subtotal']],
        },
      });

      res.locals = { status: order !== (null && undefined), result: order };

      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async processStripePayment(req, res, next) {
    const { email, stripeToken, order_id } = req.body; // eslint-disable-line
    const { customer_id } = req;  // eslint-disable-line
    try {
      // implement code to process payment and send order confirmation email here
    } catch (error) {
      return next(error);
    }
  }
}

export default ShoppingCartController;
