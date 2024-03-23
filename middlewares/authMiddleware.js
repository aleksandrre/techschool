import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export function authenticateToken(req, res, next) {
  console.log(req.headers.cookie);
  const authCookie = req.headers.cookie
    ?.split(";")
    .find((c) => c.trim().startsWith("accessToken="));

  if (!authCookie) {
    return res
      .status(330)
      .send("Token is missing or not in the expected format");
  }

  const token = authCookie.split("=")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(331).send("Token verification failed");
    }

    req.user = user;
    console.log("authentication");
    next();
  });
}
