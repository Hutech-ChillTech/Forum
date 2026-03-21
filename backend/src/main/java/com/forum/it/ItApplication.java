package com.forum.it;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class ItApplication {

	public static void main(String[] args) {
		SpringApplication.run(ItApplication.class, args);
	}

}
