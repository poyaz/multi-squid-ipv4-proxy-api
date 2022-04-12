alter table bind_address add column proxy_type varchar(10) default '-';

alter table bind_address add column country_code varchar(10) default '-';
