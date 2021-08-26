create table packages
(
    id          uuid primary key not null,
    user_id     uuid             not null,
    expire_date timestamp without time zone,
    insert_date timestamp without time zone,
    update_date timestamp without time zone,
    delete_date timestamp without time zone
);

create index packages_user_id
    on packages using btree (user_id) where delete_date isnull;
