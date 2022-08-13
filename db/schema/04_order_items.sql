DROP TABLE IF EXISTS order_items CASCADE;
CREATE TABLE order_items (
  order_id INT NOT NULL REFERENCES orders(id),
  menu_item INT NOT NULL REFERENCES menu_items(id),
  quantity INT DEFAULT 1
);
