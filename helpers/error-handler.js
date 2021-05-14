function errorHandler (err, req, res, next) {
  if (err.name === 'unauthorizedError') {
    //jwt authentication error.
    res.status (401).json ({message: 'The user is not authorized'});
  }
  if (err.name === 'ValidationError') {
    //validation error.
    res.status (401).json ({message: 'err'});
  }
  //default to 500 server error.
  return res.status (500).json ({message: err});
}
module.exports = errorHandler;
