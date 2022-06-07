create table sync
(
    id            uuid primary key not null,
    references_id uuid             not null,
    service_name  varchar(100),
    status        varchar(100),
    insert_date   timestamp without time zone,
    update_date   timestamp without time zone
);
