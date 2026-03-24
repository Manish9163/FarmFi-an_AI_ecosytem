
USE farmfi;

-- ROLES
INSERT IGNORE INTO roles (id, role_name) VALUES
(1, 'Admin'),
(2, 'Farmer'),
(3, 'Worker');

-- ADMIN USER  
INSERT IGNORE INTO users (id, role_id, full_name, email, phone, password_hash) VALUES
(1, 1, 'System Admin', 'admin@farmfi.com', '0000000000',
 '$2b$12$V0TKW8jEpllZtMjnlRHDzeAosM2maeYkcPAxEmdJLTamavvo8Ufvy');

-- PESTICIDE SOLUTIONS
INSERT IGNORE INTO pesticide_solutions (disease_name, recommended_pesticide, dosage, safety_precautions, organic_alternative) VALUES
('Apple___Apple_scab',            'Captan 50WP',             '2g/L water, spray every 10 days', 'Wear gloves and mask. Avoid inhaling. Keep away from children.', 'Neem oil 2ml/L'),
('Apple___Black_rot',             'Mancozeb 75WP',           '2.5g/L water, 3 applications',    'Do not spray near water sources. Use PPE.',                       'Bordeaux mixture'),
('Apple___Cedar_apple_rust',      'Myclobutanil (Rally 40W)','1.5g/L water',                     'Keep out of reach of children. Avoid eye contact.',               'Sulfur dust'),
('Cherry_(including_sour)___Powdery_mildew', 'Sulfur WDG',  '3g/L, weekly spray',               'Avoid application in high temperatures >32°C.',                   'Potassium bicarbonate'),
('Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot', 'Azoxystrobin', '1ml/L water',            'Wear PPE. Restricted entry interval 4 hrs.',                      'Copper hydroxide'),
('Corn_(maize)___Common_rust_',   'Propiconazole 25EC',      '1ml/L water, 2 sprays',            'Avoid inhalation. Wash hands after use.',                         'Neem oil'),
('Corn_(maize)___Northern_Leaf_Blight', 'Mancozeb + Trifloxystrobin', '2g/L water',             'Use gloves. Do not eat/drink during application.',                'Copper oxychloride'),
('Grape___Black_rot',             'Captan + Mancozeb',       '2g/L each, preventive spray',      'Avoid contact with skin. Store in cool dry place.',               'Bordeaux mixture 1%'),
('Grape___Esca_(Black_Measles)',  'No effective chemical cure', 'Pruning + wound sealer',         'Proper vineyard sanitation.',                                     'Trichoderma bio-fungicide'),
('Grape___Leaf_blight_(Isariopsis_Leaf_Spot)', 'Copper-based fungicide', '3g/L water',          'Keep away from water bodies. Use PPE.',                           'Neem extract'),
('Orange___Haunglongbing_(Citrus_greening)', 'No cure – manage vector', 'Imidacloprid for psyllid', 'Apply only if psyllid present. Do not over-apply.',           'Yellow sticky traps'),
('Peach___Bacterial_spot',        'Copper hydroxide 77WP',   '3g/L water, spray weekly',         'Avoid spraying in rain. Use gloves and goggles.',                 'Copper soap 0.5%'),
('Pepper,_bell___Bacterial_spot', 'Copper oxychloride 50WP', '2.5g/L, 3-4 sprays',              'Wear full PPE. Avoid food crops nearby.',                         'Garlic extract spray'),
('Potato___Early_blight',         'Chlorothalonil 75WP',     '2g/L water, every 7-10 days',      'Avoid breathing dust. Wear respirator.',                          'Neem oil + baking soda'),
('Potato___Late_blight',          'Metalaxyl + Mancozeb',    '2.5g/L water, preventive spray',   'Highly toxic – wear full PPE. Keep from water.',                  'Copper-based fungicide'),
('Squash___Powdery_mildew',       'Potassium bicarbonate',   '5g/L water, spray weekly',         'Eco-friendly – follow label for food crops.',                     'Milk spray 10-20%'),
('Strawberry___Leaf_scorch',      'Captan 50WP',             '2g/L water',                       'Avoid during bloom. Use gloves.',                                 'Copper soap'),
('Tomato___Bacterial_spot',       'Copper hydroxide + Mancozeb', '2g+2g/L water',               'Use PPE. Avoid eye contact.',                                     'Copper sulfate 1%'),
('Tomato___Early_blight',         'Chlorothalonil 75WP',     '2g/L every 7 days',                'Avoid spray near harvest time. Wear mask.',                       'Neem oil 3ml/L'),
('Tomato___Late_blight',          'Metalaxyl 8% + Mancozeb', '2.5g/L, preventive spray',         'Highly toxic – full PPE required.',                               'Copper oxychloride 0.3%'),
('Tomato___Leaf_Mold',            'Chlorothalonil',          '2g/L water',                       'Ensure good ventilation during spray.',                           'Baking soda 1%'),
('Tomato___Septoria_leaf_spot',   'Mancozeb 75WP',           '2g/L every 10 days',               'Do not apply within 7 days of harvest.',                          'Copper soap spray'),
('Tomato___Spider_mites Two-spotted_spider_mite', 'Abamectin 1.8EC', '0.5ml/L water',           'Highly toxic to bees. Do not spray during bloom.',                'Predatory mites / neem oil'),
('Tomato___Target_Spot',          'Azoxystrobin + Difenoconazole', '1ml/L water',               'Wear PPE. Follow re-entry interval.',                             'Trichoderma viride'),
('Tomato___Tomato_Yellow_Leaf_Curl_Virus', 'No cure – vector control', 'Imidacloprid 0.3ml/L for whitefly', 'Use sparingly. IPM approach preferred.',              'Reflective mulch + yellow traps'),
('Tomato___Tomato_mosaic_virus',  'No chemical cure',        'Remove infected plants. Sanitize tools.', 'Practice crop rotation and seed treatment.',              'Use resistant varieties');

-- SAMPLE PRODUCTS
INSERT IGNORE INTO products (name, description, price, category, image_url) VALUES
-- Seeds
('Premium Tomato Seeds (50g)',        'High-yield hybrid tomato seeds, disease-resistant',                        299.00, 'Seeds',      'https://images.unsplash.com/photo-1592921870789-04563d55041c?w=400&h=300&fit=crop&q=80'),
('Hybrid Chilli Seeds (25g)',          'High-pungency hybrid variety',                                            199.00, 'Seeds',      'https://images.unsplash.com/photo-1518977676035-64ce2a0d7f0c?w=400&h=300&fit=crop&q=80'),
('Hybrid Rice Seeds (1kg)',            'High-yield short-duration rice variety, suitable for all seasons',        549.00, 'Seeds',      'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400&h=300&fit=crop&q=80'),
('Premium Wheat Seeds (2kg)',          'Disease-resistant wheat, ideal for Rabi season',                         299.00, 'Seeds',      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop&q=80'),
('Onion Seeds (50g)',                  'Early maturity onion variety with high pungency',                         149.00, 'Seeds',      'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&h=300&fit=crop&q=80'),
('Sweet Corn Seeds (250g)',            'Tender sweet corn variety, 75-day maturity',                              189.00, 'Seeds',      'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=300&fit=crop&q=80'),
('Brinjal Hybrid Seeds (25g)',         'Glossy purple brinjal, high yield & disease-tolerant',                   179.00, 'Seeds',      'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&h=300&fit=crop&q=80'),
('Spinach Seeds (100g)',               'Fast-growing, nutritious leafy green for kitchen gardens',                 99.00, 'Seeds',      'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=300&fit=crop&q=80'),
-- Fertilizer
('NPK Fertilizer 20-20-20 (5kg)',     'Balanced granular fertilizer for all crops',                              450.00, 'Fertilizer', 'https://images.unsplash.com/photo-1605840561516-5a70cee3e97b?w=400&h=300&fit=crop&q=80'),
('Vermicompost Organic (10kg)',        'Rich organic compost for soil health',                                    350.00, 'Fertilizer', 'https://images.unsplash.com/photo-1614798040700-534a7d7b524e?w=400&h=300&fit=crop&q=80'),
('DAP Fertilizer (5kg)',               'Di-ammonium phosphate – promotes root & early growth',                   620.00, 'Fertilizer', 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop&q=80'),
('Urea Fertilizer (5kg)',              'High-nitrogen granular fertilizer for rapid green growth',                410.00, 'Fertilizer', 'https://images.unsplash.com/photo-1605840561516-5a70cee3e97b?w=400&h=300&fit=crop&q=80'),
('Seaweed Liquid Fertilizer (1L)',     'Ocean-derived growth booster – improves stress tolerance',                390.00, 'Fertilizer', 'https://images.unsplash.com/photo-1559825481-12a05cc00344?w=400&h=300&fit=crop&q=80'),
('Micronutrient Mix (500g)',           'Zinc, Boron, Iron & Manganese blend for deficiency correction',           275.00, 'Fertilizer', 'https://images.unsplash.com/photo-1585687433141-efb2df3a63c7?w=400&h=300&fit=crop&q=80'),
-- Pesticide
('Neem Oil Pesticide (500ml)',         'Organic broad-spectrum pest control',                                     185.00, 'Pesticide',  'https://images.unsplash.com/photo-1609780447-bc1e0a0baf1?w=400&h=300&fit=crop&q=80'),
('Copper Oxychloride Fungicide 1kg',  'Controls bacterial and fungal diseases',                                  320.00, 'Pesticide',  'https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=400&h=300&fit=crop&q=80'),
('Cypermethrin Insecticide (250ml)',   'Broad-spectrum contact insecticide for sucking & chewing pests',          215.00, 'Pesticide',  'https://images.unsplash.com/photo-1584308972272-9e4e7685e80f?w=400&h=300&fit=crop&q=80'),
('Mancozeb Fungicide (200g)',          'Protective fungicide against early & late blight, rust',                 160.00, 'Pesticide',  'https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=400&h=300&fit=crop&q=80'),
('Pre-emergent Herbicide (1L)',        'Selective weed control before crop emergence',                            340.00, 'Pesticide',  'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=400&h=300&fit=crop&q=80'),
('Bio-Pesticide Trichoderma (1kg)',   'Beneficial fungus for soil-borne disease suppression',                    295.00, 'Pesticide',  'https://images.unsplash.com/photo-1609780447-bc1e0a0baf1?w=400&h=300&fit=crop&q=80'),
-- Tools
('Stainless Steel Hand Trowel',       'Ergonomic handle, rust-proof blade',                                       95.00, 'Tools',      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop&q=80'),
('Heavy-Duty Garden Hoe',              'Carbon steel blade with cushion-grip handle, ideal for weeding',          175.00, 'Tools',      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop&q=80'),
('Bypass Pruning Shears',              'Sharp SK5 steel blades, ergonomic spring-loaded grip',                   145.00, 'Tools',      'https://images.unsplash.com/photo-1585687441082-2d0a5c25b0e5?w=400&h=300&fit=crop&q=80'),
('Watering Can 10L',                   'Rust-proof galvanized steel can with detachable rose head',               320.00, 'Tools',      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop&q=80'),
('Manual Knapsack Sprayer 16L',        'Comfortable shoulder pads, adjustable nozzle, anti-drip valve',           650.00, 'Tools',      'https://images.unsplash.com/photo-1592921870789-04563d55041c?w=400&h=300&fit=crop&q=80'),
-- Equipment
('Drip Irrigation Starter Kit',       '50m micro-drip system for row crops',                                     880.00, 'Equipment',  'https://images.unsplash.com/photo-1464226184884-fa280b20ef4c?w=400&h=300&fit=crop&q=80'),
('Solar Water Pump (0.5HP)',           'DC solar pump for borewell & surface irrigation, no power bill',         4500.00, 'Equipment',  'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop&q=80'),
('Greenhouse Cover Film (100 sqm)',   'UV-stabilized 200-micron poly film for protected cultivation',            1850.00, 'Equipment',  'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=400&h=300&fit=crop&q=80'),
('Soil Testing Kit (20 tests)',        'Tests NPK, pH & moisture – instant colour-coded results',                 480.00, 'Equipment',  'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&h=300&fit=crop&q=80'),
('Mini Rotavator (Electric)',          'Corded electric tiller, 1000W, 30cm tilling width',                     3200.00, 'Equipment',  'https://images.unsplash.com/photo-1597074866923-dc0589150358?w=400&h=300&fit=crop&q=80');

-- INVENTORY for all products 
INSERT IGNORE INTO inventory (product_id, stock_quantity, reorder_level)
SELECT id, 100, 15 FROM products WHERE id NOT IN (SELECT product_id FROM inventory);
