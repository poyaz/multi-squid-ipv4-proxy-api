create table external_store
(
    id          uuid primary key not null,
    product_id  uuid             not null,
    type        varchar(50)      not null,
    serial      varchar(200)     not null,
    insert_date timestamp without time zone,
    update_date timestamp without time zone,
    delete_date timestamp without time zone
);

create unique index external_store_serial
    on external_store using btree (type, serial) where delete_date isnull;
