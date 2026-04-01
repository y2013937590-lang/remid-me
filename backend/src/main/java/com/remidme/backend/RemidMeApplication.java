package com.remidme.backend;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@MapperScan("com.remidme.backend.mapper")
@SpringBootApplication
public class RemidMeApplication {

    public static void main(String[] args) {
        SpringApplication.run(RemidMeApplication.class, args);
    }
}
