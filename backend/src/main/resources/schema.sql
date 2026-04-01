CREATE TABLE knowledge_item (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
