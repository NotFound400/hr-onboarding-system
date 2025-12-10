package com.example.common;

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