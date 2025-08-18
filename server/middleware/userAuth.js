const jwt = require("jsonwebtoken");

const userAuth = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ success: false, message: "Not Authorized. Login Again" });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.userId) {
      return res.status(401).json({ success: false, message: "Not Authorized. Login Again" });
    }

    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Not Authorized. Login Again" });
  }
};

module.exports = userAuth;
