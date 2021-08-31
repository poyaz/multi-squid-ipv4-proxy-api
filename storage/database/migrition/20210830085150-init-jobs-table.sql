create table jobs
(
    id                 uuid primary key not null,
    data               text,
    status             varchar(100),
    total_record       int default 0,
    total_record_add   int default 0,
    total_record_exist int default 0,
    total_record_error int default 0,
    insert_date        timestamp without time zone,
    update_date        timestamp without time zone,
    delete_date        timestamp without time zone
);
