package dhbw.lectures.webe.domain;

import jakarta.persistence.*;

@Entity
public class InspectionStep {

  public enum Result {
    FULFILLED, NOT_FULFILLED, NA, PENDING
  }

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String title;
  private String description;

  @Enumerated(EnumType.STRING)
  private Result result = Result.PENDING;

  @Column(length = 2000)
  private String comment;

  private String photoUrl;

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

  public Result getResult() {
    return result;
  }

  public void setResult(Result result) {
    this.result = result;
  }

  public String getComment() {
    return comment;
  }

  public void setComment(String comment) {
    this.comment = comment;
  }

  public String getPhotoUrl() {
    return photoUrl;
  }

  public void setPhotoUrl(String photoUrl) {
    this.photoUrl = photoUrl;
  }

  public Inspection getInspection() {
    return inspection;
  }

  public void setInspection(Inspection inspection) {
    this.inspection = inspection;
  }
}
