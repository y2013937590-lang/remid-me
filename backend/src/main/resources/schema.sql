CREATE TABLE knowledge_item (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  tags VARCHAR(500),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tag (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE knowledge_item_tag (
  item_id BIGINT NOT NULL,
  tag_id BIGINT NOT NULL,
  PRIMARY KEY (item_id, tag_id),
  FOREIGN KEY (item_id) REFERENCES knowledge_item(id),
  FOREIGN KEY (tag_id) REFERENCES tag(id)
);

CREATE TABLE review_plan (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  item_id BIGINT NOT NULL,
  scheduled_date DATE NOT NULL,
  status ENUM('pending', 'completed') DEFAULT 'pending',
  completed_at DATETIME NULL,
  study_note TEXT NULL,
  FOREIGN KEY (item_id) REFERENCES knowledge_item(id)
);
