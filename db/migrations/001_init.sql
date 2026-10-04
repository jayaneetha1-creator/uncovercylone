-- ====================================================================
-- UNCOVERCEYLON DATABASE MIGRATION 001_init.sql
-- Charset: utf8mb4, Collation: utf8mb4_unicode_ci (Full Sinhala Support)
-- ====================================================================

-- 1. USERS & AUTHENTICATION
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('owner', 'developer', 'uploader', 'user') NOT NULL DEFAULT 'user',
  name VARCHAR(255) NOT NULL,
  country VARCHAR(100) DEFAULT 'Sri Lanka',
  avatar VARCHAR(500) DEFAULT '',
  status ENUM('unverified', 'active', 'suspended') NOT NULL DEFAULT 'unverified',
  email_verified_at DATETIME NULL,
  must_change_password TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role (role),
  INDEX idx_users_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(128) PRIMARY KEY,
  user_id INT NOT NULL,
  expires_at DATETIME NOT NULL,
  ip_address VARCHAR(45) DEFAULT '',
  user_agent VARCHAR(500) DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sessions_user (user_id),
  INDEX idx_sessions_expires (expires_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS email_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(128) NOT NULL UNIQUE,
  type ENUM('verify_email', 'reset_password', 'change_email') NOT NULL,
  new_email VARCHAR(255) NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email_tokens_lookup (token, type),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS oauth_accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  provider VARCHAR(50) NOT NULL,
  provider_user_id VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_provider_account (provider, provider_user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. CATEGORIES & LOCATIONS (PLACES)
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(100) NOT NULL UNIQUE,
  name_en VARCHAR(255) NOT NULL,
  name_si VARCHAR(255) NOT NULL,
  icon VARCHAR(50) DEFAULT 'Compass',
  sort_order INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS locations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  name_si VARCHAR(255) DEFAULT '',
  description TEXT NOT NULL,
  description_si TEXT DEFAULT '',
  short_description TEXT NOT NULL,
  short_description_si TEXT DEFAULT '',
  location VARCHAR(255) NOT NULL,
  province VARCHAR(100) NOT NULL,
  district VARCHAR(100) DEFAULT '',
  category VARCHAR(100) NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  image_url VARCHAR(500) DEFAULT '',
  gallery JSON NULL,
  tips TEXT DEFAULT '',
  best_time VARCHAR(255) DEFAULT '',
  entry_fee VARCHAR(100) DEFAULT 'Free',
  entry_fee_lkr INT DEFAULT 0,
  entry_fee_usd INT DEFAULT 0,
  distance_km INT DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0.00,
  review_count INT DEFAULT 0,
  featured TINYINT(1) DEFAULT 0,
  status ENUM('draft', 'pending', 'published', 'archived') DEFAULT 'published',
  duration VARCHAR(100) DEFAULT '',
  difficulty VARCHAR(50) DEFAULT '',
  opening_hours VARCHAR(255) DEFAULT '',
  submitted_by INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_loc_category (category),
  INDEX idx_loc_province (province),
  INDEX idx_loc_status (status),
  INDEX idx_loc_coords (lat, lng),
  INDEX idx_loc_rating (rating),
  FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. SLIDES
CREATE TABLE IF NOT EXISTS hero_slides (
  id INT AUTO_INCREMENT PRIMARY KEY,
  image_url VARCHAR(500) NOT NULL,
  location VARCHAR(255) NOT NULL,
  province VARCHAR(100) NOT NULL,
  title_en VARCHAR(255) DEFAULT '',
  title_si VARCHAR(255) DEFAULT '',
  subtitle_en VARCHAR(255) DEFAULT '',
  subtitle_si VARCHAR(255) DEFAULT '',
  sort_order INT DEFAULT 0,
  enabled TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS region_slides (
  id INT AUTO_INCREMENT PRIMARY KEY,
  image_url VARCHAR(500) NOT NULL,
  title VARCHAR(255) NOT NULL,
  title_si VARCHAR(255) DEFAULT '',
  region VARCHAR(100) NOT NULL,
  sort_order INT DEFAULT 0,
  enabled TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. REVIEWS & COMMUNITY
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  place_id INT NOT NULL,
  user_id INT NULL,
  author VARCHAR(255) NOT NULL,
  rating INT NOT NULL,
  title VARCHAR(255) DEFAULT '',
  comment TEXT NOT NULL,
  trip_type VARCHAR(50) DEFAULT '',
  visit_date VARCHAR(50) DEFAULT '',
  scenery_rating INT NULL,
  accessibility_rating INT NULL,
  facilities_rating INT NULL,
  value_rating INT NULL,
  cleanliness_rating INT NULL,
  status ENUM('pending', 'approved', 'rejected', 'hidden') DEFAULT 'approved',
  helpful_count INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_reviews_place (place_id),
  INDEX idx_reviews_status (status),
  FOREIGN KEY (place_id) REFERENCES locations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS review_photos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  review_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  sort_order INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS review_replies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  review_id INT NOT NULL UNIQUE,
  author_id INT NOT NULL,
  reply_text TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS review_votes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  review_id INT NOT NULL,
  user_id INT NOT NULL,
  vote_type ENUM('helpful', 'report') NOT NULL DEFAULT 'helpful',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_review_user_vote (review_id, user_id, vote_type),
  FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS place_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  place_id INT NOT NULL,
  user_id INT NOT NULL,
  question TEXT NOT NULL,
  status ENUM('pending', 'approved', 'hidden') DEFAULT 'approved',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (place_id) REFERENCES locations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS place_answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT NOT NULL,
  user_id INT NOT NULL,
  answer TEXT NOT NULL,
  is_team TINYINT(1) DEFAULT 0,
  status ENUM('pending', 'approved', 'hidden') DEFAULT 'approved',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES place_questions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. SITE NODES (FOLDER MANAGER)
CREATE TABLE IF NOT EXISTS site_nodes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_id INT NULL,
  node_key VARCHAR(100) NOT NULL UNIQUE,
  type ENUM('page', 'section', 'block', 'item') NOT NULL,
  title_en VARCHAR(255) NOT NULL,
  title_si VARCHAR(255) NOT NULL,
  enabled TINYINT(1) DEFAULT 1,
  sort_order INT DEFAULT 0,
  default_open TINYINT(1) DEFAULT 1,
  priority INT DEFAULT 0,
  device_visibility ENUM('all', 'desktop_only', 'mobile_only') DEFAULT 'all',
  config JSON NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_nodes_parent (parent_id),
  INDEX idx_nodes_enabled (enabled),
  FOREIGN KEY (parent_id) REFERENCES site_nodes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. SETTINGS, SECRETS, THEMES
CREATE TABLE IF NOT EXISTS site_settings (
  key_name VARCHAR(100) PRIMARY KEY,
  value_text TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS secrets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  secret_key VARCHAR(100) NOT NULL UNIQUE,
  encrypted_value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS themes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  is_active TINYINT(1) DEFAULT 0,
  tokens JSON NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. ADS
CREATE TABLE IF NOT EXISTS ads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  placement ENUM('grid_card', 'home_banner', 'sidebar_partner', 'carousel_slot', 'footer_strip') NOT NULL,
  title_en VARCHAR(255) NOT NULL,
  title_si VARCHAR(255) DEFAULT '',
  description TEXT DEFAULT '',
  image_url VARCHAR(500) DEFAULT '',
  target_url VARCHAR(500) NOT NULL,
  start_date DATETIME NULL,
  end_date DATETIME NULL,
  device_target ENUM('all', 'mobile', 'desktop') DEFAULT 'all',
  enabled TINYINT(1) DEFAULT 1,
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. ANALYTICS & RECOMMENDATIONS
CREATE TABLE IF NOT EXISTS events (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  place_id INT NULL,
  user_id INT NULL,
  session_id VARCHAR(128) NOT NULL,
  event_type ENUM('view', 'click', 'save', 'directions', 'share', 'search') NOT NULL,
  source VARCHAR(100) DEFAULT '',
  dwell_time INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_events_place (place_id),
  INDEX idx_events_type (event_type),
  INDEX idx_events_created (created_at),
  FOREIGN KEY (place_id) REFERENCES locations(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS journeys (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  session_id VARCHAR(128) NOT NULL,
  path JSON NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_journeys_user (user_id),
  INDEX idx_journeys_session (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS place_transitions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  from_place_id INT NOT NULL,
  to_place_id INT NOT NULL,
  count INT DEFAULT 1,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_transitions (from_place_id, to_place_id),
  FOREIGN KEY (from_place_id) REFERENCES locations(id) ON DELETE CASCADE,
  FOREIGN KEY (to_place_id) REFERENCES locations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS recommendation_cache (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cache_key VARCHAR(100) NOT NULL UNIQUE,
  data JSON NOT NULL,
  expires_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. TRIPS (TRIP PLANNER)
CREATE TABLE IF NOT EXISTS trips (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  name VARCHAR(255) NOT NULL,
  start_date DATE NULL,
  end_date DATE NULL,
  is_ai_planned TINYINT(1) DEFAULT 0,
  is_public TINYINT(1) DEFAULT 0,
  share_token VARCHAR(64) NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_trips_user (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS trip_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  trip_id INT NOT NULL,
  place_id INT NULL,
  custom_title VARCHAR(255) DEFAULT '',
  notes TEXT DEFAULT '',
  sort_order INT DEFAULT 0,
  is_visited TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_trip_items_trip (trip_id),
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  FOREIGN KEY (place_id) REFERENCES locations(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. CUSTOMER & AI CHAT
CREATE TABLE IF NOT EXISTS chat_threads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  status ENUM('open', 'resolved', 'closed') DEFAULT 'open',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS chat_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  thread_id INT NOT NULL,
  sender_id INT NOT NULL,
  sender_role ENUM('user', 'staff') NOT NULL,
  message_text TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (thread_id) REFERENCES chat_threads(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ai_chat_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  session_id VARCHAR(128) NOT NULL,
  page_context VARCHAR(255) DEFAULT '',
  messages JSON NOT NULL,
  prompt_tokens INT DEFAULT 0,
  completion_tokens INT DEFAULT 0,
  helpful_vote TINYINT(1) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ai_prompts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  version INT NOT NULL,
  system_prompt TEXT NOT NULL,
  is_active TINYINT(1) DEFAULT 0,
  created_by INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. NEWS
CREATE TABLE IF NOT EXISTS news_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  summary TEXT NOT NULL,
  source_name VARCHAR(255) NOT NULL,
  source_url VARCHAR(500) NOT NULL,
  image_url VARCHAR(500) DEFAULT '',
  category VARCHAR(100) DEFAULT 'Tourism',
  related_place_id INT NULL,
  is_pinned TINYINT(1) DEFAULT 0,
  is_hidden TINYINT(1) DEFAULT 0,
  published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (related_place_id) REFERENCES locations(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS news_runs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  status ENUM('success', 'failed', 'empty') NOT NULL,
  items_found INT DEFAULT 0,
  items_published INT DEFAULT 0,
  error_message TEXT DEFAULT '',
  ran_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. ADMIN GOVERNANCE, REQUESTS, AUDIT & BACKUPS
CREATE TABLE IF NOT EXISTS change_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  action_type ENUM('delete', 'edit', 'publish') NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INT NOT NULL,
  reason TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  reviewed_by INT NULL,
  reviewed_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS trash (
  id INT AUTO_INCREMENT PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INT NOT NULL,
  entity_data JSON NOT NULL,
  deleted_by INT NOT NULL,
  deleted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS versions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INT NOT NULL,
  version_num INT NOT NULL,
  snapshot JSON NOT NULL,
  created_by INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  recipient_role ENUM('all_staff', 'owner', 'developer', 'uploader') NULL,
  type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  link VARCHAR(500) DEFAULT '',
  payload JSON NULL,
  is_read TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notif_user (user_id),
  INDEX idx_notif_read (is_read),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_log (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  user_email VARCHAR(255) DEFAULT '',
  user_role VARCHAR(50) DEFAULT '',
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(50) DEFAULT '',
  details TEXT NOT NULL,
  ip_address VARCHAR(45) DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_created (created_at),
  INDEX idx_audit_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS backups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  file_size BIGINT DEFAULT 0,
  backup_type ENUM('automatic', 'manual', 'pre_sql') DEFAULT 'automatic',
  status ENUM('success', 'failed') DEFAULT 'success',
  created_by INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
