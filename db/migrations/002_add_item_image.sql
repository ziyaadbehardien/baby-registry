-- Product photo for each item (an https URL, usually the shop's og:image).
ALTER TABLE items ADD COLUMN image_url VARCHAR(2048);
