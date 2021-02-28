const protect = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.status(401).json({
      error: "Unauthorized",
    });
  }
};

module.exports = {
  protect,
};
