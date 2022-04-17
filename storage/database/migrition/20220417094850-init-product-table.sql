create table product
(
    id          uuid primary key not null,
    count       int,
    price       int,
    expire_day  int,
    is_enable   boolean,
    insert_date timestamp without time zone,
    update_date timestamp without time zone,
    delete_date timestamp without time zone
);
