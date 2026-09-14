-- Now that checkout requires a signed-in user, disallow guest orders
-- at the database level too, not just in application code.
alter table orders
  alter column user_id set not null;
