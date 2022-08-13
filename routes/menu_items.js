const express = require('express');
const router = express.Router();

module.exports = (db) => {

  const getAllMenuItems = function(db, res,req) {
    // ALL ITEMS QUERY
    db.query(`
      SELECT *
      FROM menu_items
      ORDER BY CASE
      WHEN menu_items.category = 'appetizer' THEN 1
      WHEN menu_items.category = 'main' THEN 2
      WHEN menu_items.category = 'dessert' THEN 3
      WHEN menu_items.category = 'drink' THEN 4
      END ASC, menu_items.name`
    )
      .then((data) => {
        const menu = { allItems: [] };

        for (const item of data.rows) {
          if (menu[item.category] === undefined) {
            menu[item.category] = [];
          }
          menu[item.category].push(item);
          menu.allItems.push(item);
        }

        res.render('index', { menu, user: req.session});

      })
      .catch((err) => {
        res
          .status(500)
          .json({ error: err.message });
      });
  };

  router.get('/', (req, res) =>{
    getAllMenuItems(db, res, req);
  });

  return router;
};
