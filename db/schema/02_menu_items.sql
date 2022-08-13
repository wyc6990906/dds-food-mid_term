DROP TABLE IF EXISTS menu_items CASCADE;
CREATE TABLE menu_items (
                            id SERIAL PRIMARY KEY NOT NULL,
                            name VARCHAR(255) NOT NULL,
                            description TEXT,
                            price INT NOT NULL,
                            image_url  VARCHAR(913),
                            category VARCHAR(255),
                            is_active BOOLEAN DEFAULT TRUE
);
