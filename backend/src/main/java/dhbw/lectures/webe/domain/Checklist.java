package dhbw.lectures.webe.domain;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Checklist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String plantName;

    @Column(length = 2000)
    private String recommendations;

    @Column(length = 2000)
    private String description;

    @OneToMany(mappedBy = "checklist", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChecklistStep> steps = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPlantName() { return plantName; }
    public void setPlantName(String plantName) { this.plantName = plantName; }

    public String getRecommendations() { return recommendations; }
    public void setRecommendations(String recommendations) { this.recommendations = recommendations; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<ChecklistStep> getSteps() { return steps; }
    public void setSteps(List<ChecklistStep> steps) { this.steps = steps; }
}
