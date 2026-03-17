package dhbw.lectures.webe.controller;

import dhbw.lectures.webe.domain.Inspection;
import dhbw.lectures.webe.domain.InspectionStep;
import dhbw.lectures.webe.repository.InspectionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/inspections")
public class InspectionController {

  private final InspectionRepository inspectionRepository;

  public InspectionController(InspectionRepository inspectionRepository) {
    this.inspectionRepository = inspectionRepository;
  }

  @GetMapping
  public List<Inspection> getAllInspections() {
    return inspectionRepository.findAll();
  }

  @PostMapping
  public Inspection createInspection(@RequestBody Inspection inspection) {
    if (inspection.getSteps() != null) {
      inspection.getSteps().forEach(step -> step.setInspection(inspection));
    }
    return inspectionRepository.save(inspection);
  }

  @PostMapping("/{id}/steps")
  public Inspection addStepToInspection(@PathVariable Long id, @RequestBody InspectionStep step) {
    return inspectionRepository.findById(id).map(inspection -> {
      step.setInspection(inspection);
      inspection.getSteps().add(step);
      return inspectionRepository.save(inspection);
    }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
  }

  @DeleteMapping("/{id}/steps/{stepId}")
  public Inspection removeStepFromInspection(@PathVariable Long id, @PathVariable Long stepId) {
    return inspectionRepository.findById(id).map(inspection -> {
      inspection.getSteps().removeIf(step -> step.getId().equals(stepId));
      return inspectionRepository.save(inspection);
    }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
  }

  @PutMapping("/{id}/steps/{stepId}")
  public Inspection updateStepInInspection(@PathVariable Long id, @PathVariable Long stepId,
      @RequestBody InspectionStep updated) {
    return inspectionRepository.findById(id).map(inspection -> {
      inspection.getSteps().stream()
          .filter(step -> step.getId().equals(stepId))
          .findFirst()
          .ifPresent(step -> {
            if (updated.getTitle() != null)
              step.setTitle(updated.getTitle());
            if (updated.getDescription() != null)
              step.setDescription(updated.getDescription());
            if (updated.getResult() != null)
              step.setResult(updated.getResult());
            if (updated.getComment() != null)
              step.setComment(updated.getComment());
            if (updated.getPhotoUrl() != null)
              step.setPhotoUrl(updated.getPhotoUrl());
          });
      return inspectionRepository.save(inspection);
    }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
  }

  @PutMapping("/{id}")
  public ResponseEntity<Inspection> updateInspection(@PathVariable Long id, @RequestBody Inspection updated) {
    return inspectionRepository.findById(id).map(inspection -> {
      if (updated.getFacilityName() != null)
        inspection.setFacilityName(updated.getFacilityName());
      if (updated.getDate() != null)
        inspection.setDate(updated.getDate());
      if (updated.getResponsibleEmployee() != null)
        inspection.setResponsibleEmployee(updated.getResponsibleEmployee());
      if (updated.getStatus() != null)
        inspection.setStatus(updated.getStatus());
      return ResponseEntity.ok(inspectionRepository.save(inspection));
    }).orElse(ResponseEntity.notFound().build());
  }
}
