package dhbw.lectures.webe.controller;

import dhbw.lectures.webe.domain.Checklist;
import dhbw.lectures.webe.domain.ChecklistStep;
import dhbw.lectures.webe.repository.ChecklistRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/checklists")
public class ChecklistController {

  private final ChecklistRepository checklistRepository;

  public ChecklistController(ChecklistRepository checklistRepository) {
    this.checklistRepository = checklistRepository;
  }

  @GetMapping
  public List<Checklist> getAllChecklists() {
    return checklistRepository.findAll();
  }

  @PostMapping
  public Checklist createChecklist(@RequestBody Checklist checklist) {
    applyChecklistCompatibilityFields(checklist);
    if (checklist.getSteps() != null) {
      checklist.getSteps().forEach(step -> {
        applyChecklistStepCompatibilityFields(step);
        step.setChecklist(checklist);
      });
    }
    return checklistRepository.save(checklist);
  }

  @PostMapping("/{id}/steps")
  public Checklist addStepToChecklist(@PathVariable Long id, @RequestBody ChecklistStep step) {
    return checklistRepository.findById(id).map(checklist -> {
      step.setChecklist(checklist);
      applyChecklistStepCompatibilityFields(step);
      checklist.getSteps().add(step);
      return checklistRepository.save(checklist);
    }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
  }

  @DeleteMapping("/{id}/steps/{stepId}")
  public Checklist removeStepFromChecklist(@PathVariable Long id, @PathVariable Long stepId) {
    return checklistRepository.findById(id).map(checklist -> {
      checklist.getSteps().removeIf(step -> step.getId().equals(stepId));
      return checklistRepository.save(checklist);
    }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
  }

  @PutMapping("/{id}/steps/{stepId}")
  public Checklist updateStepInChecklist(@PathVariable Long id, @PathVariable Long stepId,
      @RequestBody ChecklistStep updated) {
    return checklistRepository.findById(id).map(checklist -> {
      checklist.getSteps().stream()
          .filter(step -> step.getId().equals(stepId))
          .findFirst()
          .ifPresent(step -> {
            if (updated.getTitle() != null)
              step.setTitle(updated.getTitle());
            if (updated.getDescription() != null)
              step.setDescription(updated.getDescription());
            if (updated.getRequirement() != null)
              step.setRequirement(updated.getRequirement());
            if (updated.getDescription() != null || updated.getRequirement() != null)
              applyChecklistStepCompatibilityFields(step);
            if (updated.getOrderIndex() != null)
              step.setOrderIndex(updated.getOrderIndex());
          });
      return checklistRepository.save(checklist);
    }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
  }

  @PutMapping("/{id}")
  public ResponseEntity<Checklist> updateChecklist(@PathVariable Long id, @RequestBody Checklist updated) {
    return checklistRepository.findById(id).map(checklist -> {
      if (updated.getName() != null)
        checklist.setName(updated.getName());
      if (updated.getPlantName() != null)
        checklist.setPlantName(updated.getPlantName());
      if (updated.getDescription() != null)
        checklist.setDescription(updated.getDescription());
      if (updated.getRecommendations() != null)
        checklist.setRecommendations(updated.getRecommendations());
      applyChecklistCompatibilityFields(checklist);
      return ResponseEntity.ok(checklistRepository.save(checklist));
    }).orElse(ResponseEntity.notFound().build());
  }

  private void applyChecklistStepCompatibilityFields(ChecklistStep step) {
    if (step.getRequirement() == null && step.getDescription() != null) {
      step.setRequirement(step.getDescription());
    } else if (step.getDescription() == null && step.getRequirement() != null) {
      step.setDescription(step.getRequirement());
    }
  }

  private void applyChecklistCompatibilityFields(Checklist checklist) {
    if (checklist.getRecommendations() == null && checklist.getDescription() != null) {
      checklist.setRecommendations(checklist.getDescription());
    } else if (checklist.getDescription() == null && checklist.getRecommendations() != null) {
      checklist.setDescription(checklist.getRecommendations());
    }
  }
}
