create table map_bind_address_package
(
    id              uuid primary key not null,
    bind_address_id uuid             not null,
    package_id      uuid             not null,
    delete_date     timestamp without time zone
);

create index map_user_package_bind_address_id_package_id
    on map_bind_address_package using btree (bind_address_id, package_id) where delete_date isnull;
