package org.example.authenticationservice.client;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HouseAvailabilityResponse {

    private Long houseId;
    private String address;
    private Integer maxOccupant;
    private Integer currentOccupants;
    private Boolean available;

    /**
     * Get available spots in the house
     */
    public Integer getAvailableSpots() {
        if (maxOccupant != null && currentOccupants != null) {
            return maxOccupant - currentOccupants;
        }
        return 0;
    }

    /**
     * Alias for available (for consistency with other code)
     */
    public Boolean getHasAvailability() {
        return available;
    }
}