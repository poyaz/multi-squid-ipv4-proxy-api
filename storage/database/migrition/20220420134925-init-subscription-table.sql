create table subscription
(
    id          uuid primary key not null,
    order_id    uuid             not null,
    serial      varchar(200),
    status      varchar(50),
    body        text,
    insert_date timestamp without time zone,
    update_date timestamp without time zone,
    delete_date timestamp without time zone
);
