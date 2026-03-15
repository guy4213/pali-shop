-- PALI Seed Data

-- Sample Products
INSERT INTO products (name, slug, description, price, image_url, commission_amount, is_visible) VALUES
(
  'ספר "הדרך להצלחה"',
  'sefer-haderech',
  'ספר רב-מכר שיוביל אותך לשינוי אמיתי בחיים. מכיל 300 עמודים של ידע מעשי ועצות ממשיות מאנשי עסקים מובילים.',
  89.00,
  '/images/book.jpg',
  20.00,
  true
),
(
  'קורס דיגיטלי – שיווק ברשתות',
  'kurs-shiuk',
  'קורס מקיף ל-12 שבועות הכולל 48 שיעורים מוקלטים, גישה לקהילה סגורה וליווי אישי.',
  497.00,
  '/images/course.jpg',
  100.00,
  false
),
(
  'חבילת פרימיום – ייעוץ עסקי',
  'yiuts-isk',
  'פגישות ייעוץ אישיות עם מומחים בתחום, כולל תכנית עבודה מפורטת והמלצות.',
  1200.00,
  '/images/consulting.jpg',
  200.00,
  false
);

-- Gift Items
INSERT INTO gift_items (name, image_url, stock_count) VALUES
('חולצת פרימיום PALI', '/images/gift-shirt.jpg', 500),
('כובע PALI מעוצב', '/images/gift-hat.jpg', 300),
('ספל PALI ממותג', '/images/gift-mug.jpg', 400);
