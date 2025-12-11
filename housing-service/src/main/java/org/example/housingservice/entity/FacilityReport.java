package org.example.housingservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.example.housingservice.enums.FacilityReportStatus;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "facility_report")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FacilityReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "facility_id", nullable = false)
    private Facility facility;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @CreatedDate
    @Column(name = "create_date", nullable = false, updatable = false)
    private LocalDateTime createDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private FacilityReportStatus status = FacilityReportStatus.Open;

    @OneToMany(mappedBy = "facilityReport", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<FacilityReportDetail> comments = new ArrayList<>();

    public void addComment(FacilityReportDetail comment) {
        comments.add(comment);
        comment.setFacilityReport(this);
    }
}
