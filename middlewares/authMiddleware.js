import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const accessToken = authHeader && authHeader.split(" ")[1]; // Extract the token from the Authorization header

  if (!accessToken) {
    return res
      .status(401)
      .send("Access token is missing or not in the expected format");
  }

  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(401).send("Token verification failed");
    }

    req.user = user;
    next();
  });
}

// export function authenticateToken(req, res, next) {
//   const authCookie = req.headers.cookie
//     ?.split(";")
//     .find((c) => c.trim().startsWith("accessToken="));
//   console.log(req.headers);
//   if (!authCookie) {
//     return res
//       .status(330)
//       .send("Token is missing or not in the expected format");
//   }

//   const token = authCookie.split("=")[1];

//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
//     if (err) {
//       return res.status(331).send("Token verification failed");
//     }

//     req.user = user;
//     next();
//   });
// }
