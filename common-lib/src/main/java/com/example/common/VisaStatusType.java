package com.example.common;

public enum VisaStatusType {
    OPT("OPT"),
    H1B("H1B"),
    L2("L2"),
    F1("F1");

    private final String value;

    VisaStatusType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

}