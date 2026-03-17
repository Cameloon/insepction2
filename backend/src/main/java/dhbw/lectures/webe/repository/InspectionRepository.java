package dhbw.lectures.webe.repository;

import dhbw.lectures.webe.domain.Inspection;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InspectionRepository extends JpaRepository<Inspection, Long> {
}
