import jwt from "jsonwebtoken";

export const generateTokenandSetCookie = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });

  res.cookie("jwt", token, {
    maxAge: 15 * 24 * 60 * 60 * 1000,
    httpOnly: true, // prevents attacks cross-site scripting attacks
    samesite: "strict", // CRSF attacks cross site request forgery attackts
    secure: process.env.NODE_ENV !== "development",
  });
};
