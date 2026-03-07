export const isAdmin = (req, res, next) => {
  // Check if user exists (from auth middleware)
  if (!req.user) {
    return res.status(401).json({ msg: "Authentication required" });
  }
  
  // Check if user role is admin
  if (req.user. role !== "admin") {
    return res.status(403).json({ msg: "Access denied.  Admin only." });
  }
  
  next();
};