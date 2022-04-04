create table logs
(
    id          uuid primary key not null,
    time        numeric,
    elapsed     int,
    remote_host varchar(100),
    status      varchar(100),
    bytes       numeric,
    method      varchar(20),
    url         text,
    username    varchar(100),
    insert_date timestamp without time zone
);
