import jwt from 'jsonwebtoken';

class TokenController {
  static async createToken(req, res, next) {
    const { customer_id } = res.locals; // eslint-disable-line

    const token = jwt.sign({ data: customer_id }, process.env.JWT_KEY, {
      expiresIn: `${process.env.DEFAULT_TOKEN_EXPIRY_TIME}`,
    });

    res.locals.result = Object.assign(res.locals.result, {
      accessToken: `Bearer ${token}`,
      expires_in: process.env.DEFAULT_TOKEN_EXPIRY_TIME,
    });

    res.locals.status = true;

    next();
  }

  static async validateToken(req, res, next) {
    const tokenHeader = req.headers['user-key'];

    try {
      const token = tokenHeader.split(' ')[1];
      const customer_id = jwt.verify(token, process.env.JWT_KEY).data; // eslint-disable-line
      if (!customer_id) throw new Error('Invalid token'); // eslint-disable-line

      res.locals.customer_id = customer_id; // eslint-disable-line

      next();
    } catch (error) {
      next(error);
    }
  }
}

export default TokenController;
