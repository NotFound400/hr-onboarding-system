package org.example.applicationservice.utils;

public enum ApplicationStatus {
    Open("Open"),         // 草稿/未提交
    Pending("Pending"),   // 已提交，待审核
    Rejected("Rejected"), // 已拒绝
    Approved("Approved"); // 已通过

    private final String value;

    ApplicationStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
