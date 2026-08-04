-- Migración para agregar campos ofreceLocal y ofreceDelivery a la tabla products
-- Ejecutar este script en la base de datos MySQL

ALTER TABLE `products` 
ADD COLUMN `ofreceLocal` TINYINT(1) DEFAULT 1 NOT NULL COMMENT 'Indica si el producto está disponible para pedidos locales',
ADD COLUMN `ofreceDelivery` TINYINT(1) DEFAULT 1 NOT NULL COMMENT 'Indica si el producto está disponible para pedidos delivery';
