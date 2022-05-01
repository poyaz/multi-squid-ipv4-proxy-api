create table orders
(
    id                   uuid primary key not null,
    user_id              uuid             not null,
    product_id           uuid             not null,
    package_id           uuid,
    serial               varchar(200),
    service_name         varchar(50),
    status               varchar(50),
    body                 text,
    package_count        numeric,
    package_proxy_day    numeric,
    package_proxy_type   varchar(10),
    package_country_code varchar(10),
    insert_date          timestamp without time zone,
    update_date          timestamp without time zone,
    delete_date          timestamp without time zone
);

create unique index orders_serial
    on orders using btree (serial) where serial notnull AND delete_date isnull;
