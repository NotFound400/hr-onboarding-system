package org.example.applicationservice.utils;

import lombok.Getter;

@Getter
public enum ApplicationType {
    ONBOARDING("Onboarding"),
    OPT("OPT");

    private final String value;

    ApplicationType(String value) {
        this.value = value;
    }

}