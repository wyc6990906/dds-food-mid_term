DROP TABLE IF EXISTS orders CASCADE;
CREATE TABLE orders
(
    id             SERIAL PRIMARY KEY NOT NULL,
    customer_id    INT                NOT NULL REFERENCES users (id),
    created_at     TIMESTAMP          NOT NULL DEFAULT now(),
    accepted_at    TIMESTAMP                   DEFAULT NULL,
    completed_at   TIMESTAMP                   DEFAULT NULL,
    estimated_time INT
);
