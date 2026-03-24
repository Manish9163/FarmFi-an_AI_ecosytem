

CREATE DATABASE IF NOT EXISTS farmfi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE farmfi;

SET FOREIGN_KEY_CHECKS = 0;

-- 'Farmer' | 'Worker' | 'Admin'
CREATE TABLE IF NOT EXISTS roles (
    id        INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL  
);

CREATE TABLE IF NOT EXISTS users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    role_id       INT          NOT NULL,
    full_name     VARCHAR(100) NOT NULL,
    email         VARCHAR(150) UNIQUE NOT NULL,
    phone         VARCHAR(20)  UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active     BOOLEAN      DEFAULT TRUE,
    created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES roles(id),
    INDEX idx_users_email  (email),
    INDEX idx_users_role   (role_id)
);

--  PLANT DISEASE RECORDS
CREATE TABLE IF NOT EXISTS disease_records (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    user_id          INT          NOT NULL,
    image_url        VARCHAR(500),
    predicted_disease VARCHAR(150) NOT NULL,
    confidence_score DECIMAL(5,2) NOT NULL,
    severity_level   ENUM('Low','Medium','High') DEFAULT 'Medium',
    created_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dr_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_dr_user (user_id),
    INDEX idx_dr_created (created_at)
);

--  PESTICIDE SOLUTIONS  
CREATE TABLE IF NOT EXISTS pesticide_solutions (
    id                    INT AUTO_INCREMENT PRIMARY KEY,
    disease_name          VARCHAR(150) UNIQUE NOT NULL,
    recommended_pesticide VARCHAR(255),
    dosage                TEXT,
    safety_precautions    TEXT,
    organic_alternative   VARCHAR(255),
    created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



--  WEATHER LOGS
CREATE TABLE IF NOT EXISTS weather_logs (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT,
    location    VARCHAR(150),
    latitude    DECIMAL(9,6),
    longitude   DECIMAL(9,6),
    temperature DECIMAL(5,2),
    humidity    DECIMAL(5,2),
    rainfall    DECIMAL(6,2),
    wind_speed  DECIMAL(5,2),
    description VARCHAR(100),
    logged_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_wl_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_wl_location (location),
    INDEX idx_wl_logged   (logged_at)
);

--  DISEASE RISK PREDICTIONS
CREATE TABLE IF NOT EXISTS risk_predictions (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    user_id           INT NOT NULL,
    weather_log_id    INT,
    crop_type         VARCHAR(80),
    temperature       DECIMAL(5,2),
    humidity          DECIMAL(5,2),
    rainfall          DECIMAL(6,2),
    risk_level        ENUM('Low','Medium','High') NOT NULL,
    probability_score DECIMAL(5,2),
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rp_user    FOREIGN KEY (user_id)        REFERENCES users(id)        ON DELETE CASCADE,
    CONSTRAINT fk_rp_weather FOREIGN KEY (weather_log_id) REFERENCES weather_logs(id) ON DELETE SET NULL,
    INDEX idx_rp_user (user_id)
);

--  CROP SUITABILITY PREDICTIONS
CREATE TABLE IF NOT EXISTS crop_predictions (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    user_id           INT NOT NULL,
    soil_type         VARCHAR(80),
    season            VARCHAR(50),
    avg_temperature   DECIMAL(5,2),
    rainfall          DECIMAL(6,2),
    humidity          DECIMAL(5,2),
    recommended_crops JSON,
    suitability_score DECIMAL(5,2),
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_cp_user (user_id)
);

-- AGRO E-COMMERCE
CREATE TABLE IF NOT EXISTS products (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(200) NOT NULL,
    description TEXT,
    price       DECIMAL(10,2) NOT NULL,
    category    ENUM('Seeds','Fertilizer','Tools','Pesticide','Equipment','Other') NOT NULL,
    image_url   VARCHAR(500),
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_product_category (category)
);

CREATE TABLE IF NOT EXISTS inventory (
    product_id     INT PRIMARY KEY,
    stock_quantity INT       NOT NULL DEFAULT 0,
    reorder_level  INT       NOT NULL DEFAULT 10,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_inv_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS carts (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT NOT NULL,
    product_id INT NOT NULL,
    quantity   INT NOT NULL DEFAULT 1,
    added_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cart_user    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    CONSTRAINT fk_cart_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY uq_cart_item (user_id, product_id),
    INDEX idx_cart_user (user_id)
);

CREATE TABLE IF NOT EXISTS orders (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    farmer_id        INT           NOT NULL,
    total_amount     DECIMAL(10,2) NOT NULL,
    status           ENUM('Pending','Processing','Shipped','Delivered','Cancelled') DEFAULT 'Pending',
    payment_method   ENUM('Cash','Credit','Card') NOT NULL,
    delivery_address TEXT,
    notes            TEXT,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ord_farmer FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_orders_farmer (farmer_id),
    INDEX idx_orders_status (status)
);

CREATE TABLE IF NOT EXISTS order_items (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    order_id          INT           NOT NULL,
    product_id        INT           NOT NULL,
    quantity          INT           NOT NULL,
    price_at_purchase DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_oi_order   FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
    CONSTRAINT fk_oi_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    INDEX idx_oi_order (order_id)
);

--  CREDIT PURCHASE SYSTEM
CREATE TABLE IF NOT EXISTS credit_accounts (
    farmer_id    INT PRIMARY KEY,
    credit_limit DECIMAL(10,2) DEFAULT 5000.00,
    used_credit  DECIMAL(10,2) DEFAULT 0.00,
    due_amount   DECIMAL(10,2) DEFAULT 0.00,
    due_date     DATE,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ca_farmer FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_credit_valid CHECK (used_credit >= 0 AND credit_limit > 0)
);

CREATE TABLE IF NOT EXISTS credit_transactions (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    farmer_id        INT           NOT NULL,
    order_id         INT,
    amount           DECIMAL(10,2) NOT NULL,
    transaction_type ENUM('Charge','Repayment') NOT NULL,
    description      VARCHAR(255),
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ct_farmer FOREIGN KEY (farmer_id) REFERENCES users(id)  ON DELETE CASCADE,
    CONSTRAINT fk_ct_order  FOREIGN KEY (order_id)  REFERENCES orders(id) ON DELETE SET NULL,
    INDEX idx_ct_farmer (farmer_id)
);

--  WORKER JOB MATCHING
CREATE TABLE IF NOT EXISTS workers (
    worker_id    INT PRIMARY KEY,
    skills       TEXT          NOT NULL,
    daily_rate   DECIMAL(8,2)  NOT NULL,
    is_available BOOLEAN       DEFAULT TRUE,
    location     VARCHAR(150),
    bio          TEXT,
    rating       DECIMAL(3,2)  DEFAULT 0.00,
    created_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_worker_user FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_worker_available (is_available)
);

CREATE TABLE IF NOT EXISTS job_requests (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    farmer_id       INT  NOT NULL,
    worker_id       INT  NULL, 
    job_description TEXT NOT NULL,
    location        VARCHAR(150),
    expected_days   INT,
    agreed_rate     DECIMAL(8,2),
    status          ENUM('Pending','Accepted','Rejected','Completed') DEFAULT 'Pending',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_jr_farmer FOREIGN KEY (farmer_id) REFERENCES users(id)          ON DELETE CASCADE,
    CONSTRAINT fk_jr_worker FOREIGN KEY (worker_id) REFERENCES workers(worker_id) ON DELETE CASCADE,
    INDEX idx_jr_farmer (farmer_id),
    INDEX idx_jr_worker (worker_id),
    INDEX idx_jr_status (status)
);

CREATE TABLE IF NOT EXISTS job_status_logs (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    job_request_id INT          NOT NULL,
    changed_by     INT          NOT NULL,
    old_status     ENUM('Pending','Accepted','Rejected','Completed'),
    new_status     ENUM('Pending','Accepted','Rejected','Completed') NOT NULL,
    note           TEXT,
    changed_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_jsl_job  FOREIGN KEY (job_request_id) REFERENCES job_requests(id) ON DELETE CASCADE,
    CONSTRAINT fk_jsl_user FOREIGN KEY (changed_by)     REFERENCES users(id)        ON DELETE CASCADE
);

--  PREDICTION FEEDBACK  
CREATE TABLE IF NOT EXISTS prediction_feedback (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    user_id           INT          NOT NULL,
    prediction_id     INT          NOT NULL,
    predicted_disease VARCHAR(150) NOT NULL,
    actual_disease    VARCHAR(150),
    feedback_type     VARCHAR(20)  NOT NULL DEFAULT 'Correct' COMMENT 'Correct | Incorrect',
    is_correct        BOOLEAN      NOT NULL,
    comment           TEXT,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_pf_pred (prediction_id),
    INDEX idx_pf_type (feedback_type),
    CONSTRAINT chk_pf_type      CHECK (feedback_type IN ('Correct','Incorrect')),
    CONSTRAINT fk_pf_user       FOREIGN KEY (user_id)       REFERENCES users(id)           ON DELETE CASCADE,
    CONSTRAINT fk_pf_prediction FOREIGN KEY (prediction_id) REFERENCES disease_records(id) ON DELETE CASCADE
);


SET FOREIGN_KEY_CHECKS = 1;