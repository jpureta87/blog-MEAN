const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  //Por convecion se le agrega Bearer al token, con esto rescatamos solo el token
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    //De esta forma en la request seteamos este nuevo cambo "userData". Esta info estara disponible en el request del middleware que venga a continuacion de "check-auth"
    req.userData = {email: decodedToken.email, userId: decodedToken.userId};
    next();
  } catch (err) {
    res.status(401).json({
      message: "You are not authenticated!",
    });
  }
};
