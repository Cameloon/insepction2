package dhbw.lectures.webe.controller;

import dhbw.lectures.webe.domain.Inspection;
import dhbw.lectures.webe.domain.InspectionStep;
import dhbw.lectures.webe.repository.ChecklistRepository;
import dhbw.lectures.webe.repository.ChecklistStepRepository;
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
  private final ChecklistRepository checklistRepository;
  private final ChecklistStepRepository checklistStepRepository;

  public InspectionController(
      InspectionRepository inspectionRepository,
      ChecklistRepository checklistRepository,
      ChecklistStepRepository checklistStepRepository) {
    this.inspectionRepository = inspectionRepository;
    this.checklistRepository = checklistRepository;
    this.checklistStepRepository = checklistStepRepository;
  }

  @GetMapping
  public List<Inspection> getAllInspections() {
    return inspectionRepository.findAll();
  }

  @PostMapping
  public Inspection createInspection(@RequestBody Inspection inspection) {
    applyInspectionCompatibilityFields(inspection);
    attachChecklistTemplate(inspection);
    if (inspection.getSteps() != null) {
      inspection.getSteps().forEach(step -> {
        step.setInspection(inspection);
        attachChecklistStepReference(step);
      });
    }
    return inspectionRepository.save(inspection);
  }

  @PostMapping("/{id}/steps")
  public Inspection addStepToInspection(@PathVariable Long id, @RequestBody InspectionStep step) {
    return inspectionRepository.findById(id).map(inspection -> {
      step.setInspection(inspection);
      attachChecklistStepReference(step);
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
            if (updated.getStatus() != null)
              step.setStatus(updated.getStatus());
            if (updated.getComment() != null)
              step.setComment(updated.getComment());
            if (updated.getPhotoPath() != null)
              step.setPhotoPath(updated.getPhotoPath());
            if (updated.getChecklistStepId() != null)
              step.setChecklistStep(
                  checklistStepRepository.findById(updated.getChecklistStepId())
                      .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                          "Checklist step not found")));
          });
      return inspectionRepository.save(inspection);
    }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
  }

  @PutMapping("/{id}")
  public ResponseEntity<Inspection> updateInspection(@PathVariable Long id, @RequestBody Inspection updated) {
    return inspectionRepository.findById(id).map(inspection -> {
      if (updated.getTitle() != null)
        inspection.setTitle(updated.getTitle());
      if (updated.getPlantName() != null)
        inspection.setPlantName(updated.getPlantName());
      if (updated.getInspectionDate() != null)
        inspection.setInspectionDate(updated.getInspectionDate());
      if (updated.getGeneralComment() != null)
        inspection.setGeneralComment(updated.getGeneralComment());
      if (updated.getFacilityName() != null)
        inspection.setFacilityName(updated.getFacilityName());
      if (updated.getDate() != null)
        inspection.setDate(updated.getDate());
      if (updated.getResponsibleEmployee() != null)
        inspection.setResponsibleEmployee(updated.getResponsibleEmployee());
      if (updated.getStatus() != null)
        inspection.setStatus(updated.getStatus());
      if (updated.getChecklistTemplateId() != null) {
        inspection.setChecklistTemplate(
            checklistRepository.findById(updated.getChecklistTemplateId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Checklist template not found")));
      }
      applyInspectionCompatibilityFields(inspection);
      return ResponseEntity.ok(inspectionRepository.save(inspection));
    }).orElse(ResponseEntity.notFound().build());
  }

  private void attachChecklistTemplate(Inspection inspection) {
    if (inspection.getChecklistTemplateId() == null) {
      return;
    }
    inspection.setChecklistTemplate(
        checklistRepository.findById(inspection.getChecklistTemplateId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Checklist template not found")));
  }

  private void attachChecklistStepReference(InspectionStep step) {
    if (step.getChecklistStepId() == null) {
      return;
    }
    step.setChecklistStep(
        checklistStepRepository.findById(step.getChecklistStepId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Checklist step not found")));
  }

  private void applyInspectionCompatibilityFields(Inspection inspection) {
    if (inspection.getPlantName() == null && inspection.getFacilityName() != null) {
      inspection.setPlantName(inspection.getFacilityName());
    }
    if (inspection.getInspectionDate() == null && inspection.getDate() != null) {
      inspection.setInspectionDate(inspection.getDate().atStartOfDay());
    }
    if (inspection.getFacilityName() == null && inspection.getPlantName() != null) {
      inspection.setFacilityName(inspection.getPlantName());
    }
    if (inspection.getDate() == null && inspection.getInspectionDate() != null) {
      inspection.setDate(inspection.getInspectionDate().toLocalDate());
    }
  }
}
