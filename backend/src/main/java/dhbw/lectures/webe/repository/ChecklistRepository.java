package dhbw.lectures.webe.repository;

import dhbw.lectures.webe.domain.Checklist;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChecklistRepository extends JpaRepository<Checklist, Long> {
}
