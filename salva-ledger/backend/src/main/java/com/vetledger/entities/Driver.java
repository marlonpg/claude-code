package com.vetledger.entities;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "drivers")
public class Driver {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "name")
    private String name;

    @Column(name = "default_fee", precision = 10, scale = 2)
    private BigDecimal defaultFee;

    @Column(name = "active")
    private Boolean active;

    // Constructors
    public Driver() {}

    public Driver(UUID id) {
        this.id = id;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getDefaultFee() {
        return defaultFee;
    }

    public void setDefaultFee(BigDecimal defaultFee) {
        this.defaultFee = defaultFee;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}