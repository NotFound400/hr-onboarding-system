package org.example.housingservice.enums;

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
}
