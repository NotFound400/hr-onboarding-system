package org.example.housingservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "house")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class House {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "landlord_id", nullable = false)
    private Landlord landlord;

    @Column(name = "address", nullable = false, length = 500)
    private String address;

    @Column(name = "max_occupant")
    private Integer maxOccupant;

    @OneToMany(mappedBy = "house", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Facility> facilities = new ArrayList<>();

    public void addFacility(Facility facility) {
        facilities.add(facility);
        facility.setHouse(this);
    }

    public void removeFacility(Facility facility) {
        facilities.remove(facility);
        facility.setHouse(null);
    }
}
