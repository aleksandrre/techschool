// middleware/authorize.js
export const authorize = (roles) => {
  return (req, res, next) => {
    const userRole = req.user.role;

    if (roles.includes(userRole)) {
      console.log("autorize");
      next();
    } else {
      res.status(403).json({ message: "Forbidden" });
    }
  };
};
