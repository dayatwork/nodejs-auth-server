CREATE DATABASE nodeauth;

CREATE TABLE users (
  id SERIAL PRIMARY KEY NOT NULL,
  name VARCHAR(50) NULL,
  email VARCHAR(50) NOT NULL UNIQUE,
  image_identity VARCHAR NULL,
  username VARCHAR NULL UNIQUE,
  password VARCHAR NULL,
  registration_date timestamp(0) NULL
);