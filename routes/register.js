const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
router.use(express.urlencoded({extended: true}));

module.exports = (db) => {
  router.get("/", (req, res) => {
    //if user already login cannot show register page
    // console.log(req.session['uid'])
    if (req.session['uid']) {
      res.redirect('/');
    }
    const templateVars = {
      user: {},
      errMsg: 'Please fill out all the information...'
    };
    res.render("register", templateVars);
  });
  //  register
  router.post("/", (req, res) => {
    console.log('register~~~~~~');
    const {email, firstName, lastName, password, phoneNumber} = req.body;
    //hash password 10 is salt
    const hashPassword = bcrypt.hashSync(password, 10);
    if (!email) {
      const errMsg = 'You have to enter your email...';
      const templateVars = {
        user: {},
        errMsg
      };
      res.render("register", templateVars);
      return;
    }

    return db.query(`
      SELECT *
      FROM users
      WHERE email = $1
    `, [email.trim()])

      .then(result => {
        if (result.rows.length !== 0) {
          const errMsg = 'Email already exists...';
          const templateVars = {
            user: {},
            errMsg
          };
          res.render("register", templateVars);
          return;
        }
        return db.query(`
          INSERT INTO users(first_name, last_name, password, email, phone_number)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `, [firstName, lastName, hashPassword, email, phoneNumber])
          .then((result) => {
            const newUser = result.rows[0];
            console.log('NewUser=================', newUser);
            req.session["uid"] = newUser.id;
            req.session["email"] = newUser.email;
            req.session["first_name"] = newUser['first_name'];
            req.session["last_name"] = newUser['last_name'];
            req.session["phone_number"] = newUser['phone_number'];
            req.session["is_owner"] = newUser['is_owner'];
            const templateVars = {
              user: newUser
            };
            res.redirect('/menu');
          })
          .catch(err => {
            console.log(err.message);
          });
      });

  });

  return router;
};


