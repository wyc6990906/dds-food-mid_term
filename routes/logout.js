const express = require("express");
const router = express.Router();


module.exports = () => {
  router.get("/", (req, res) => {
    req.session = null;
    const templateVars = {
      user: {},
    };
    res.redirect('login');
  });
  return router;
};
