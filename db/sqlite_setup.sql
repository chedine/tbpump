
DROP TABLE bhav_copy_status;
DROP TABLE instruments;
DROP TABLE IF EXISTS "nfoexpiry";

CREATE TABLE "bhav_copy_status" (
  "id" INTEGER PRIMARY KEY,
  "file_name" varchar(255) NOT NULL UNIQUE,
  "processed_time" datetime NOT NULL,
  "status" tinyint NOT NULL,
  "type" tinyint NOT NULL 
) ;


CREATE TABLE "instruments" (
  "id" INTEGER PRIMARY KEY,
  "expiry" bigint DEFAULT NULL,
  "close" double NOT NULL,
  "high" double NOT NULL,
  "low" double NOT NULL,
  "open" double NOT NULL,
  "oi" INTEGER DEFAULT NULL,
  "trade_date" bigint NOT NULL,
  "underlying" varchar(100) NOT NULL,
  "volume" bigint(20) DEFAULT NULL,
  "strike" double DEFAULT NULL,
  "type" tinyint DEFAULT NULL,
  "name" varchar(200) NOT NULL,
   UNIQUE ("name","trade_date")
) ;



CREATE TABLE "nfoexpiry" (
  "id" INTEGER PRIMARY KEY,
  "expiry" date NOT NULL
);

CREATE TABLE "notebooks" (
  "id" INTEGER PRIMARY KEY,
  "name" varchar(255) NOT NULL,
  "processed_time" datetime not null,
   "file" text NOT NULL 
) ;