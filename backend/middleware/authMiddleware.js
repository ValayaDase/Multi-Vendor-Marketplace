import jwt from "jsonwebtoken";


export default function (req, res, next) {
  const token = req.headers.authorization;

  if (!token) return res.status(401).json({ msg: "No token provided" });

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.user = data;
    next();
  } catch {
    res.status(401).json({ msg: "Invalid token" });
  }
};
