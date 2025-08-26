-- Ensure we don't record duplicate payment rows for the same external transaction
BEGIN;

CREATE UNIQUE INDEX IF NOT EXISTS payments_transaction_id_unique
  ON public.payments(transaction_id)
  WHERE transaction_id IS NOT NULL;

COMMIT;
