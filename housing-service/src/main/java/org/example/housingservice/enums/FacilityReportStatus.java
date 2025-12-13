package org.example.housingservice.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

import java.util.Arrays;

public enum FacilityReportStatus {

    Open("Open", "待处理"),

    InProgress("In Progress", "处理中"),

    Closed("Closed", "已关闭");

    private final String displayName;
    private final String chineseName;

    FacilityReportStatus(String displayName, String chineseName) {
        this.displayName = displayName;
        this.chineseName = chineseName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getChineseName() {
        return chineseName;
    }

    public static boolean contains(String status) {
        if (status == null) return false;

        return Arrays.stream(values())
                .anyMatch(e ->
                        e.name().equalsIgnoreCase(status) || // 匹配 InProgress (忽略大小写)
                                e.getDisplayName().equalsIgnoreCase(status) // 匹配 In Progress (忽略大小写)
                );
    }

    @JsonCreator
    public static FacilityReportStatus fromString(String text) {
        if (text == null || text.trim().isEmpty()) {
            throw new IllegalArgumentException("Facility Report Status Can not be null or empty");
        }

        String search = text.trim();

        for (FacilityReportStatus status : values()) {
            if (status.name().equalsIgnoreCase(search)) {
                return status;
            }

            if (status.getDisplayName().equalsIgnoreCase(search)) {
                return status;
            }

            if (status.getDisplayName().replace(" ", "").equalsIgnoreCase(search.replace(" ", ""))) {
                return status;
            }
        }

        throw new IllegalArgumentException("Unknown Status type: " + text);
    }
}
