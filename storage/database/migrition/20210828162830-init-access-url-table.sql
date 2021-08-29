create table access_url
(
    id          uuid primary key not null,
    user_id     uuid             not null,
    url_list    varchar(225)[],
    is_block    boolean,
    start_date  timestamp without time zone,
    end_date    timestamp without time zone,
    insert_date timestamp without time zone,
    update_date timestamp without time zone,
    delete_date timestamp without time zone
);

create index access_url_user_id
    on access_url using btree (user_id, start_date, end_date) where delete_date isnull;

create index access_url_url
    on access_url using gin (url_list) where delete_date isnull;
