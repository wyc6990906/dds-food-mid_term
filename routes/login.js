const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
router.use(express.urlencoded({extended: true}));

module.exports = (db) => {
  //  login
  router.get('/', (req, res) => {
    //if user already login cannot show login page
    if (req.session['uid']) {
      res.redirect('/');
    }
    const errMsg = 'Please login first...';
    const templateVars = {
      user: {},
      errMsg
    };
    res.render("login", templateVars);
  });

  router.post("/", (req, res) => {
    const {email, password} = req.body;
    if (!email) {
      const errMsg = 'You have to enter your email...';
      const templateVars = {
        user: {},
        errMsg
      };
      res.render('login', templateVars);
      return;
    }
    return db.query(`
      SELECT *
      FROM users
      WHERE email = $1
    `, [email.trim()])
      .then(result => {
        if (!result.rows[0]) {
          const errMsg = 'Authentication failed...';
          const templateVars = {
            user: {},
            errMsg
          };
          res.render('login', templateVars);
          return;
        }
        const hashedPassword = result.rows[0].password;
        // console.log('hashedPassword ====', hashedPassword)
        // console.log(bcrypt.compareSync(password.trim(), hashedPassword))
        if (!bcrypt.compareSync(password.trim(), hashedPassword)) {
          const errMsg = 'Authentication failed...';
          const templateVars = {
            user: {},
            errMsg
          };
          res.render('login', templateVars);
          return;
        }
        //  login success
        console.log('login success!');
        const user = result.rows[0];
        console.log(user);
        req.session["uid"] = user.id;
        req.session["email"] = user.email;
        req.session["first_name"] = user['first_name'];
        req.session["last_name"] = user['last_name'];
        req.session["phone_number"] = user['phone_number'];
        req.session["is_owner"] = user['is_owner'];
        const templateVars = {
          user
        };
        // res.render('index', templateVars)
        res.redirect('/menu');
        return;
      })
      .catch(err => console.error(err));
  });
  return router;
};


