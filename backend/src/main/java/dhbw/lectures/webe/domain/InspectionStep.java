package dhbw.lectures.webe.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
public class InspectionStep {

  public enum StepStatus {
    PASSED, FAILED, NOT_APPLICABLE, FULFILLED, NOT_FULFILLED, NA, PENDING
  }

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String title;
  private String description;

  @Enumerated(EnumType.STRING)
  private StepStatus status = StepStatus.PENDING;

  @Column(length = 2000)
  private String comment;

  private String photoPath;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "checklist_step_id")
  @JsonIgnore
  private ChecklistStep checklistStep;

  @Transient
  private Long checklistStepId;

  @ManyToOne(fetch = FetchType.LAZY)
  @com.fasterxml.jackson.annotation.JsonIgnore
  private Inspection inspection;

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

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public StepStatus getStatus() {
    return status;
  }

  public void setStatus(StepStatus status) {
    this.status = status;
  }

  public String getComment() {
    return comment;
  }

  public void setComment(String comment) {
    this.comment = comment;
  }

  public String getPhotoPath() {
    return photoPath;
  }

  public void setPhotoPath(String photoPath) {
    this.photoPath = photoPath;
  }

  public StepStatus getResult() {
    return status;
  }

  public void setResult(StepStatus result) {
    this.status = result;
  }

  public String getPhotoUrl() {
    return photoPath;
  }

  public void setPhotoUrl(String photoUrl) {
    this.photoPath = photoUrl;
  }

  public ChecklistStep getChecklistStep() {
    return checklistStep;
  }

  public void setChecklistStep(ChecklistStep checklistStep) {
    this.checklistStep = checklistStep;
  }

  public Long getChecklistStepId() {
    if (checklistStep != null) {
      return checklistStep.getId();
    }
    return checklistStepId;
  }

  public void setChecklistStepId(Long checklistStepId) {
    this.checklistStepId = checklistStepId;
  }

  public Inspection getInspection() {
    return inspection;
  }

  public void setInspection(Inspection inspection) {
    this.inspection = inspection;
  }
}
