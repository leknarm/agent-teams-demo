package com.formbuilder.enums;

public enum FieldType {
    TEXT,
    TEXTAREA,
    NUMBER,
    EMAIL,
    URL,
    PHONE,
    DATE,
    TIME,
    DATETIME,
    SELECT,
    MULTI_SELECT,
    RADIO,
    CHECKBOX,
    FILE,
    RATING,
    SCALE,
    SECTION,
    CONTENT,
    HIDDEN;

    public boolean isDisplayOnly() {
        return this == SECTION || this == CONTENT;
    }

    public boolean supportsAnalytics() {
        return this == SELECT || this == MULTI_SELECT || this == RADIO
                || this == CHECKBOX || this == RATING || this == SCALE;
    }

    public boolean isNumeric() {
        return this == RATING || this == SCALE || this == NUMBER;
    }
}
