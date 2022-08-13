const e = require('express');
const express = require('express');
const router = express.Router();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const customerPhoneNumber = process.env.CUSTOMER_NUMBER;
const twilioPhoneNumber = process.env.TWILIO_NUMBER;

const twilioClient = require('twilio')(accountSid, authToken);



//Getting Order Specific to User
const getOrder = (db, customerId) => {
  const queryParams = [customerId];
  const query =
  `
  SELECT orders.id
  FROM orders
  JOIN users ON users.id = orders.customer_ID
  WHERE orders.customer_Id = $1
  `;
  return db.query(query, queryParams);

};

//Getting all open orders
const getOpenOrders = (db) => {
  const query =
  `
  SELECT orders.id
  FROM orders
  JOIN users ON users.id = orders.customer_ID
  WHERE orders.completed_at IS null
  `;
  return db.query(query);

};

//For the owner to clear an order from their side.
const markOrderAsCompleted = (db, orderId) => {
  params = [orderId];
  const query =
  `
   UPDATE orders
   SET completed_at = now()
   WHERE orders.id =$1
  `;

  return db.query(query,params);
};

//Get first name, last name, and phone number of customer
const getCustomerInfo = (db, orderId) => {
  const params = [orderId];
  const query =
  `
  SELECT users.first_name, users.last_name, users.phone_number
  FROM users
  JOIN orders ON orders.customer_id = users.id
  WHERE orders.id = $1
  `;
  return db.query(query, params);
};

// Get all items and quantity of items from an order.
const getOrderItems = (db, orderId) => {
  const params = [orderId];
  const query =
  `
  SELECT  menu_items.name as item,
          order_items.quantity as quantity
  FROM    order_items
  JOIN    orders ON orders.id = order_id
  JOIN    menu_items ON order_items.menu_item = menu_items.id
  WHERE   order_id = $1
  `;
  return db.query(query, params);
};

//Get total cost of all items of an order.
const getOrderTotal = (db, orderId) => {
  const queryParams = [orderId];
  const query =
  `
  SELECT SUM(menu_items.price * order_items.quantity)/100 as subtotal
  FROM order_items
  JOIN menu_items on menu_items.id = order_items.menu_item
  JOIN orders on orders.id = order_items.order_id
  WHERE orders.id = $1;
  `;
  return db.query(query, queryParams);
};

//Get the time the order was completed.
const getCompletedAtTime = (db, orderId) => {
  const queryParams = [orderId];
  const query =
  `
  SELECT orders.completed_at
  FROM orders
  WHERE orders.id = $1
  `;
  return db.query(query, queryParams);
};

// Get the time the order was created
const getCreatedAtTime = (db, orderId) => {
  const queryParams = [orderId];
  const query =
  `
  SELECT orders.created_at
  FROM orders
  WHERE orders.id = $1
  `;
  return db.query(query, queryParams);
};

//Get the picture of the first item of an order.
const getMenuPics = (db, orderId) =>{
  const queryParams = [orderId];
  const query =
  `
  SELECT menu_items.image_url as food_pic
  FROM menu_items
  JOIN order_items ON order_items.menu_item = menu_items.id
  JOIN orders ON orders.id = order_items.order_id
  WHERE orders.id = $1
  LIMIT 1
  `;
  return db.query(query, queryParams);
};

module.exports = (db) => {
  router.get("/",
    (req, res) => {



      //Some Variables
      let p1;
      let pageToRender;

      let orderNumbers = [];
      let orderPromises = [];

      //Session Id
      const customerId = req.session.uid;
      const is_owner = req.session.is_owner;

      //Assembling templateVars

      const templateVars = {orderNumbers};

      //Check whether Owner or Not to determine which page to render.
      if (is_owner) {
        p1 = getOpenOrders(db);
        pageToRender = "owners";
      } else {
        p1 = getOrder(db, customerId);
        pageToRender = "orders";
      }

      Promise.resolve(p1)
        .then((results)=>{
          for (const orderIds of results.rows) {
            const orderNumber = orderIds.id;
            orderNumbers.push(orderNumber);
          }
          //Determining Order of Promise Resolution
          console.log('Order Ids Retrieved');
        })
        .then(()=>{
          orderPromises = [];
          for (const orderId of orderNumbers) {
            customerQuery = getCustomerInfo(db,orderId);
            orderPromises.push(customerQuery);
          }
        })
        .then(()=>{
          results = Promise.all(orderPromises);
          return results;
        })
        .then((results)=>{
          const customers = [];
          for (const result of results) {
            const customer = result.rows[0];
            const customerFirstName = customer.first_name;
            const customerLastName = customer.last_name;
            const customerFullName = `${customerFirstName} ${customerLastName}`;
            const customerPhoneNumber = customer.phone_number;

            const customerObj = {customerFullName, customerPhoneNumber};
            customers.push(customerObj);
          }
          templateVars.customers = customers;
        })
        .then(()=>{
          orderPromises = [];
          for (const orderId of orderNumbers) {
            orderItems = getOrderItems(db,orderId);
            orderPromises.push(orderItems);
          }
        })
        .then(()=>{
          results = Promise.all(orderPromises);
          return results;
        })
        .then((results)=>{
          allOrdersItems = [];
          for (const result of results) {
            orderItems = [];
            for (item of result.rows) {
              orderItems.push(item);
            }
            allOrdersItems.push(orderItems);
          }
          templateVars.allOrdersItems = allOrdersItems;
        })
        .then(()=>{
          orderPromises = [];
          for (const orderId of orderNumbers) {
            totalPrices = getOrderTotal(db,orderId);
            orderPromises.push(totalPrices);
          }
        })
        .then(()=>{
          results = Promise.all(orderPromises);
          return results;
        })
        .then((results)=>{
          orderSubTotals = [];
          for (const result of results) {
            orderSubTotals.push(result.rows[0].subtotal);
          }
          templateVars.orderSubTotals = orderSubTotals;
        })
      //Completed At Time
        .then(()=>{
          orderPromises = [];
          for (const orderId of orderNumbers) {
            completedAtTimes = getCompletedAtTime(db, orderId);
            orderPromises.push(completedAtTimes);
          }
        })
        .then(()=>{
          results = Promise.all(orderPromises);
          return results;
        })
        .then((results)=>{
          orderCompleteTimes = [];
          for (const result of results) {
            orderCompleteTimes.push(result.rows[0].completed_at);
          }
          templateVars.orderCompleteTimes = orderCompleteTimes;
        })
      //Created At time
        .then(()=>{
          orderPromises = [];
          for (const orderId of orderNumbers) {
            const orderCreationTimes = getCreatedAtTime(db, orderId);
            orderPromises.push(orderCreationTimes);
          }
        })
        .then(()=>{
          results = Promise.all(orderPromises);
          return results;
        })
        .then((results)=>{
          const orderCreationTimes = [];
          for (const result of results) {
            orderCreationTimes.push(result.rows[0].created_at);
          }
          templateVars.orderCreationTimes = orderCreationTimes;
        })
      //Menu Pics
        .then(()=>{
          orderPromises = [];
          for (const orderId of orderNumbers) {
            const orderThumbnailPics = getMenuPics(db, orderId);
            orderPromises.push(orderThumbnailPics);
          }
        })
        .then(()=>{
          results = Promise.all(orderPromises);
          return results;
        })
        .then((results)=>{
          const orderMenuPics = [];
          for (const result of results) {
            orderMenuPics.push(result.rows[0].food_pic);
          }
          templateVars.orderMenuPics = orderMenuPics;
        })
        .then(()=>{
          res.render(pageToRender, {templateVars, user: req.session});
        });
    });


  router.post("/order-complete", (req,res)=>{
    orderId = req.body.hello;
    const orderCompleteMsg = "Thank you for ordering from Yukihira! Your order is now ready for pickup! See you soon!";
    Promise.resolve(markOrderAsCompleted(db,orderId));

    twilioClient.messages
      .create(
        {
          body: orderCompleteMsg,
          to: customerPhoneNumber,
          from: twilioPhoneNumber
        }
      )
      .then((message)=> console.log(message.sid))
      .then(()=>{
        res.redirect('/orders');
      });
  });

  router.post("/sendSMS",(req,res)=>{
    const time = Number(req.body.orderETA);
    const etaMsg = `Thank you for ordering from Yukihira! About ${time} minutes until your order is ready.`;
    twilioClient.messages
      .create(
        {
          body: etaMsg,
          to: customerPhoneNumber,
          from: twilioPhoneNumber
        }
      )
      .then((message)=> console.log(message.sid))
      .then(()=>{
        res.redirect('/orders');
      });




  });

  return router;
};


