package com.talent_tandem.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.context.annotation.PropertySources;

@Configuration
@PropertySources({
        @PropertySource(value = "file:.env", ignoreResourceNotFound = true),
        @PropertySource(value = "file:talent-tandem-backend/.env", ignoreResourceNotFound = true)
})
public class DotEnvConfig {
}