-- =====================================================================
-- create_order(): atomically validates cart items against LIVE product
-- prices, then inserts orders + order_items + order_addresses (and
-- attaches any customer_uploads rows) in a single transaction.
--
-- This must only ever be called from your Next.js server using the
-- Supabase SERVICE ROLE client (lib/supabase/admin.ts). It is revoked
-- from anon/authenticated below so it can never be called directly
-- from the browser.
--
-- p_items shape (jsonb array), one entry per cart line:
-- [
--   {
--     "product_id": "uuid",
--     "quantity": 2,
--     "customization_type": "photo-personalized" | null,
--     "instructions": "text" | null,
--     "upload_id": "uuid" | null
--   }
-- ]
--
-- p_address shape (jsonb):
-- {
--   "full_name": "...", "phone": "...",
--   "address_line_1": "...", "address_line_2": "...",
--   "city": "...", "state": "...", "postal_code": "...", "country": "IN"
-- }
-- =====================================================================

create or replace function create_order(
  p_user_id      uuid,
  p_items        jsonb,
  p_address      jsonb,
  p_currency     text default 'INR',
  p_shipping_fee bigint default 0
)
returns table(order_id uuid, order_number text, total bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id      uuid;
  v_order_number  text;
  v_subtotal      bigint := 0;
  v_total         bigint := 0;
  v_item          jsonb;
  v_product       products%rowtype;
  v_quantity      integer;
  v_line_total    bigint;
  v_order_item_id uuid;
  v_upload_id     uuid;
begin
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Cart is empty';
  end if;

  -- 1. Validate every item against LIVE product data and compute subtotal.
  --    We never trust price/name/quantity sent from the browser.
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select * into v_product
    from products
    where id = (v_item ->> 'product_id')::uuid
      and status = 'active';

    if not found then
      raise exception 'Product % is not available', (v_item ->> 'product_id');
    end if;

    v_quantity := coalesce((v_item ->> 'quantity')::integer, 1);
    if v_quantity < 1 then
      raise exception 'Invalid quantity for product %', v_product.slug;
    end if;

    v_subtotal := v_subtotal + (v_product.price * v_quantity);
  end loop;

  v_total := v_subtotal + coalesce(p_shipping_fee, 0);

  -- 2. Create the order shell.
  v_order_number := generate_order_number();

  insert into orders (
    user_id, order_number, status, payment_status, fulfillment_status,
    subtotal, shipping_fee, discount, total, currency
  ) values (
    p_user_id, v_order_number, 'pending', 'unpaid', 'unfulfilled',
    v_subtotal, coalesce(p_shipping_fee, 0), 0, v_total, p_currency
  )
  returning id into v_order_id;

  -- 3. Insert order_items as immutable snapshots of the products.
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select * into v_product
    from products
    where id = (v_item ->> 'product_id')::uuid;

    v_quantity   := coalesce((v_item ->> 'quantity')::integer, 1);
    v_line_total := v_product.price * v_quantity;

    insert into order_items (
      order_id, product_id, product_name, product_slug,
      unit_price, quantity, line_total,
      customization_type, instructions
    ) values (
      v_order_id, v_product.id, v_product.name, v_product.slug,
      v_product.price, v_quantity, v_line_total,
      v_item ->> 'customization_type', v_item ->> 'instructions'
    )
    returning id into v_order_item_id;

    -- Attach a pre-uploaded customer photo (if any) to this order item.
    v_upload_id := nullif(v_item ->> 'upload_id', '')::uuid;
    if v_upload_id is not null then
      update customer_uploads
      set order_id = v_order_id,
          order_item_id = v_order_item_id,
          status = 'attached'
      where id = v_upload_id
        and (user_id = p_user_id or user_id is null);
    end if;
  end loop;

  -- 4. Snapshot the shipping address so it never changes retroactively.
  if p_address is not null then
    insert into order_addresses (
      order_id, address_type, full_name, phone,
      address_line_1, address_line_2, city, state, postal_code, country
    ) values (
      v_order_id, 'shipping',
      p_address ->> 'full_name', p_address ->> 'phone',
      p_address ->> 'address_line_1', p_address ->> 'address_line_2',
      p_address ->> 'city', p_address ->> 'state',
      p_address ->> 'postal_code', coalesce(p_address ->> 'country', 'IN')
    );
  end if;

  return query select v_order_id, v_order_number, v_total;
end;
$$;

-- Lock this down: only the server (service_role) may call it.
revoke execute on function create_order(uuid, jsonb, jsonb, text, bigint) from public;
revoke execute on function create_order(uuid, jsonb, jsonb, text, bigint) from anon;
revoke execute on function create_order(uuid, jsonb, jsonb, text, bigint) from authenticated;
grant execute on function create_order(uuid, jsonb, jsonb, text, bigint) to service_role;
