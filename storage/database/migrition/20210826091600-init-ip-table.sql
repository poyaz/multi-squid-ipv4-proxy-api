create table bind_address
(
    id          uuid primary key not null,
    interface   varchar(100),
    ip          varchar(100),
    port        int,
    gateway     varchar(100),
    is_enable   boolean default false,
    insert_date timestamp without time zone,
    update_date timestamp without time zone,
    delete_date timestamp without time zone
);

create unique index bind_address_ip
    on bind_address using btree (ip) where delete_date isnull;
