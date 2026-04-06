package com.formbuilder;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class FormBuilderApplication {

    public static void main(String[] args) {
        SpringApplication.run(FormBuilderApplication.class, args);
    }
}
