package dhbw.lectures.webe.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Inspection {

  public enum Status {
    PLANNED, IN_PROGRESS, COMPLETED
  }

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  private String title;
  private String plantName;
  private LocalDateTime inspectionDate;
  @Column(length = 2000)
  private String generalComment;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "checklist_template_id")
  @JsonIgnore
  private Checklist checklistTemplate;

  @Transient
  private Long checklistTemplateId;

  private String facilityName;
  private LocalDate date;
  private String responsibleEmployee;

  @Enumerated(EnumType.STRING)
  private Status status = Status.PLANNED;

  @OneToMany(mappedBy = "inspection", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<InspectionStep> steps = new ArrayList<>();

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public String getPlantName() {
    return plantName;
  }

  public void setPlantName(String plantName) {
    this.plantName = plantName;
  }

  public LocalDateTime getInspectionDate() {
    return inspectionDate;
  }

  public void setInspectionDate(LocalDateTime inspectionDate) {
    this.inspectionDate = inspectionDate;
  }

  public String getGeneralComment() {
    return generalComment;
  }

  public void setGeneralComment(String generalComment) {
    this.generalComment = generalComment;
  }

  public Checklist getChecklistTemplate() {
    return checklistTemplate;
  }

  public void setChecklistTemplate(Checklist checklistTemplate) {
    this.checklistTemplate = checklistTemplate;
  }

  public Long getChecklistTemplateId() {
    if (checklistTemplate != null) {
      return checklistTemplate.getId();
    }
    return checklistTemplateId;
  }

  public void setChecklistTemplateId(Long checklistTemplateId) {
    this.checklistTemplateId = checklistTemplateId;
  }

  public String getFacilityName() {
    return facilityName;
  }

  public void setFacilityName(String facilityName) {
    this.facilityName = facilityName;
  }

  public LocalDate getDate() {
    return date;
  }

  public void setDate(LocalDate date) {
    this.date = date;
  }

  public String getResponsibleEmployee() {
    return responsibleEmployee;
  }

  public void setResponsibleEmployee(String responsibleEmployee) {
    this.responsibleEmployee = responsibleEmployee;
  }

  public Status getStatus() {
    return status;
  }

  public void setStatus(Status status) {
    this.status = status;
  }

  public List<InspectionStep> getSteps() {
    return steps;
  }

  public void setSteps(List<InspectionStep> steps) {
    this.steps = steps;
  }
}
