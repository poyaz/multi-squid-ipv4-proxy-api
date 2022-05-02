alter table users
    add column role varchar(100);

alter table users
    add column external_oauth_data jsonb default '{}';

update users
set role = 'user'
where role isnull;

update users
set role = '{}'
where external_oauth_data isnull;
