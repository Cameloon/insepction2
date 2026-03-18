package dhbw.lectures.webe.repository;

import dhbw.lectures.webe.domain.ChecklistStep;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChecklistStepRepository extends JpaRepository<ChecklistStep, Long> {
}
