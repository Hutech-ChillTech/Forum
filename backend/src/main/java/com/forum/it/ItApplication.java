package com.forum.it;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableCaching
@EnableScheduling
public class ItApplication {

	public static void main(String[] args) {
		SpringApplication.run(ItApplication.class, args);
	}

	@Bean
	public CommandLineRunner fixDatabase(JdbcTemplate jdbcTemplate) {
		return args -> {
			try {
				jdbcTemplate.execute("ALTER TABLE posts ADD COLUMN IF NOT EXISTS count_like INTEGER DEFAULT 0");
				System.out.println("DEBUG: Database schema updated successfully (count_like column checked)");

				// Fix shares platform check constraint
				try {
					jdbcTemplate.execute("ALTER TABLE shares DROP CONSTRAINT IF EXISTS shares_platform_check");
					System.out.println("DEBUG: shares_platform_check dropped successfully");
				} catch (Exception e) {
					System.err.println("DEBUG: Failed to drop shares_platform_check: " + e.getMessage());
				}
			} catch (Exception e) {
				System.err.println("DEBUG: Failed to update database schema: " + e.getMessage());
			}
		};
	}
}
