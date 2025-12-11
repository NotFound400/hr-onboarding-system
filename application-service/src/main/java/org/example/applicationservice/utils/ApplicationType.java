package org.example.applicationservice.utils;

public enum ApplicationType {
    ONBOARDING("Onboarding"),
    OPT("OPT");

    private final String value;

    ApplicationType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}