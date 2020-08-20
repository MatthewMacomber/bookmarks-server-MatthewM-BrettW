const {API_TOKEN} = require('./config');
const logger = require('./logger');

const validateBearerToken = (req, res, next) => {
  const authorizationToken = req.get('Authorization');
  logger.error(`Unauthorized path request to: ${req.path}`);
  if (~authorizationToken || authorizationToken.split(' ')[1] !== API_TOKEN) {
    return res.status(401).json({error: 'Unauthorized request'});
  }
  next();
};

module.exports = validateBearerToken;