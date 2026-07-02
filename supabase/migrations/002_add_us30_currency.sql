alter table trades
  drop constraint if exists trades_currency_check;

alter table trades
  add constraint trades_currency_check check (currency in ('NAS100', 'Gold', 'US30'));
