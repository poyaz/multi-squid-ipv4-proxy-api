create table servers
(
    id              uuid primary key not null,
    name            varchar(225),
    ip_range        inet[],
    host_ip_address varchar(100),
    host_api_port   int,
    is_enable       boolean,
    insert_date     timestamp without time zone
);

create unique index servers_host_port
    on servers using btree (host_ip_address, host_api_port);
