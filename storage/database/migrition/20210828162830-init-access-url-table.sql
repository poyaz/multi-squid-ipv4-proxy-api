create table access_url
(
    id          uuid primary key not null,
    user_id     uuid             not null,
    url         varchar(225),
    is_block    boolean,
    start_date  timestamp without time zone,
    end_date    timestamp without time zone,
    insert_date timestamp without time zone,
    update_date timestamp without time zone,
    delete_date timestamp without time zone
);

create unique index access_url_user_id_url_is_block
    on access_url using btree (user_id, url, is_block) where delete_date isnull;
