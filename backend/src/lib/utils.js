import jwt from "jsonwebtoken";

//to be able to generate a token, first we must have an env var which should be hard to retrieve in the prod
export const generateToken = (userId, res) => {

    //jwt.sign generates a token, first arg is payload, this helps us to determine which user belomngs to a particular token, 2nd is the token generated, 3rd is optional (object)
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d", //after 7days, the user has to login once again
  });

  //the jwt token generated is sent in cookies
  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // max age of the jwt token generate in milliseconds
    httpOnly: true, // prevent XSS attacks cross-site scripting attacks, this token is not accessible by JS
    sameSite: "strict", // CSRF attacks cross-site request forgery attacks
    secure: process.env.NODE_ENV !== "development", //in localhost, it is in http(not secure), in prod, it is https
  });

  return token;
};