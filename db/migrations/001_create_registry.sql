-- Registry items and the purchases recorded against them.
-- quantity_purchased is denormalised onto items so a purchase can be checked and
-- applied in one atomic UPDATE (see api/_lib/registry.js).

CREATE TABLE items (
  id                 BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name               VARCHAR(120)  NOT NULL,
  description        VARCHAR(500),
  link               VARCHAR(2048),
  price              NUMERIC(10, 2) CHECK (price >= 0),
  category           VARCHAR(60),
  priority           VARCHAR(6)    NOT NULL DEFAULT 'medium'
                       CHECK (priority IN ('high', 'medium', 'low')),
  quantity_wanted    INTEGER       NOT NULL DEFAULT 1 CHECK (quantity_wanted BETWEEN 1 AND 99),
  quantity_purchased INTEGER       NOT NULL DEFAULT 0 CHECK (quantity_purchased >= 0),
  created_at         TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ   NOT NULL DEFAULT now(),
  CHECK (quantity_purchased <= quantity_wanted)
);

CREATE TABLE purchases (
  id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  item_id        BIGINT       NOT NULL REFERENCES items (id) ON DELETE CASCADE,
  quantity       INTEGER      NOT NULL CHECK (quantity BETWEEN 1 AND 99),
  purchaser_id   VARCHAR(64)  NOT NULL,
  purchaser_name VARCHAR(120) NOT NULL,
  note           VARCHAR(200),
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX purchases_item_id_idx ON purchases (item_id);
CREATE INDEX purchases_purchaser_id_idx ON purchases (purchaser_id);
