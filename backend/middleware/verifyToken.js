import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized- No token" });
  }

  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized- Invalid token" });
  }
};
