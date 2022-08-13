const express = require('express');
const router = express.Router();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const ownerNumber = process.env.OWNER_NUMBER;
const twilioPhoneNumber = process.env.TWILIO_NUMBER;

const twilioClient = require('twilio')(accountSid, authToken);

module.exports = (db) => {

  const getCartItems = function(db, res, req) {

    // Check right away if cart is empty, and don't even go any further if it is
    if (req.cookies.cart === '' || req.cookies.cart === undefined) {
      res.render('cart', { user: req.session, cartItems: [] });
      return;
    }

    // Parsing cart cookie to use in menu_items query
    const itemsAndQuantity = {};
    const placeholders = [];
    let cart = req.cookies.cart;
    cart = cart.split(',');

    // Populating itemsAndQuantity and the placeholders to use in query below
    for (let i = 0; i < cart.length; i++) {
      cart[i] = cart[i].split('x');
      itemsAndQuantity[cart[i][1]] = cart[i][0];
      placeholders.push('$' + (i + 1));
    }

    db.query(`
    SELECT id, name, price, image_url
    FROM menu_items
    WHERE id IN (${placeholders.join(', ')});
    `, Object.keys(itemsAndQuantity))
      .then((data) => {
        // Attaching quantities to each returned queried item to use in cart.ejs
        for (const item of data.rows) {
          item.quantity = itemsAndQuantity[item.id];
        }
        res.render('cart', { user: req.session, cartItems: data.rows });
      });

  };

  router.get('/', (req, res) => {
    getCartItems(db, res, req);
  });



  //Submit Order

  const submitOrder = (db, customerId) => {
    const params = [customerId];
    const query =
    `
    INSERT INTO orders(customer_id, created_at)
    VALUES($1, now())
    RETURNING id as new_order
    `;
    return db.query(query, params);
  };
  const submitOrderItems = (db, orderId, quantity, menuItem) =>{
    const params = [orderId, quantity, menuItem];
    const query =
    `
    INSERT INTO order_items(order_id, quantity, menu_item)
    VALUES ($1, $2, $3)
    `;
    return db.query(query, params);
  };
  const getCustomerInfo = (db, orderId)=>{
    const params = [orderId];
    const query =
    `
    SELECT  users.first_name as firstName,
            users.last_name as lastName,
            users.phone_number as phoneNumber,
            orders.id as orderId
    FROM users
    JOIN orders ON orders.customer_Id = users.id
    WHERE orders.id = $1
    `

    return db.query(query,params)
  }

  const getOrderItems = (db, orderId)=>{
    const params = [orderId];
    const query =
    `
    SELECT order_items.quantity as quantity, menu_items.name as item
    FROM order_items
    JOIN menu_items ON order_items.menu_item = menu_items.id
    WHERE order_items.order_id = $1
    `

    return db.query(query, params)
  }




  router.post('/submit-order-now', (req, res) => {
    const newOrderMsgHeaderPortion = `INCOMING NEW ORDER: \n`
    let customerInfoMsgPortion;
    let itemsAndQuantityMsgPortion = 'Order: \n';
    const placeholders = [];
    let cart = req.cookies.cart;
    cart = cart.split(',');
    const userId = req.session.uid;
    let newOrderId
    Promise.resolve(submitOrder(db, userId))
      .then((results)=>{
        newOrderId = results.rows[0].new_order;
      })
      .then(()=>{
        const promises = [];
        for (item of cart) {
          const something = item.split('x');
          const quantity = something[0];
          const menu_item = something[1];
          promises.push(submitOrderItems(db, newOrderId, quantity, menu_item));
        }
        return promises;
      })
      .then((promises)=>{
        return Promise.all(promises); //This is going through the list of items and adding it to that table. But no longer has access to customer info. no it's lost.
      })
      .then(()=>{
        const items = getOrderItems(db, newOrderId)
        return items
      })
      .then((items)=>{
        for(item of items.rows){
          itemsAndQuantityMsgPortion += `${item.quantity}x ${item.item}\n`
        }
      })
      .then(()=>{
        const customerInfo = getCustomerInfo(db, newOrderId)
        return customerInfo
      })
      .then((customerInfo)=>{
        const customer = customerInfo.rows[0]
        const customerFirstName = customer.firstname;
        const customerLastName = customer.lastname;
        const customerPhoneNumber = customer.phonenumber;
        customerInfoMsgPortion =
        `Customer:\n${customerFirstName} ${customerLastName}\n${customerPhoneNumber}`
      })
      .then(()=>{
        const newOrderAlert =`${newOrderMsgHeaderPortion}Order Number: ${newOrderId}\n${customerInfoMsgPortion}\n${itemsAndQuantityMsgPortion}`
        return newOrderAlert
      })
      .then((msg)=>{
        twilioClient.messages
          .create(
            {
              body: msg,
              to: ownerNumber,
              from: twilioPhoneNumber
            }
          )
      })
      .then(()=>{
        res.redirect('/orders');
      });



  });

  return router;
};
