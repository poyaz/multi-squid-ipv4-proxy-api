create table external_product_price
(
    id                uuid primary key not null,
    external_store_id uuid             not null,
    price             float,
    unit              varchar(50),
    country           varchar(50),
    insert_date       timestamp without time zone,
    update_date       timestamp without time zone,
    delete_date       timestamp without time zone
);

create unique index external_product_price_product_id_unit
    on external_product_price using btree (external_store_id, unit, country) where delete_date isnull;
