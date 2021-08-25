create table users
(
    id          uuid primary key not null,
    username    varchar(100),
    is_enable   boolean,
    insert_date timestamp without time zone,
    update_date timestamp without time zone,
    delete_date timestamp without time zone
);

create unique index users_username on users using btree (username) where delete_date isnull;
