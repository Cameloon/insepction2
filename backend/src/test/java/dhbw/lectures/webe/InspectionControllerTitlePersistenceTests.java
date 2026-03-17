package dhbw.lectures.webe;

import dhbw.lectures.webe.domain.Inspection;
import dhbw.lectures.webe.repository.InspectionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class InspectionControllerTitlePersistenceTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private InspectionRepository inspectionRepository;

    @BeforeEach
    void clearRepository() {
        inspectionRepository.deleteAll();
    }

    @Test
    void createInspectionPersistsTitle() throws Exception {
        mockMvc.perform(post("/api/inspections")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "title": "Quarterly Fire Safety Check",
                          "facilityName": "Plant A",
                          "date": "2026-03-17",
                          "responsibleEmployee": "Alex",
                          "status": "PLANNED",
                          "steps": []
                        }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Quarterly Fire Safety Check"));

        Inspection created = inspectionRepository.findAll().get(0);
        assertThat(created.getTitle()).isEqualTo("Quarterly Fire Safety Check");
    }

    @Test
    void updateInspectionPersistsTitle() throws Exception {
        Inspection inspection = new Inspection();
        inspection.setTitle("Old Title");
        inspection.setFacilityName("Plant B");
        inspection.setDate(LocalDate.of(2026, 3, 17));
        inspection.setResponsibleEmployee("Sam");
        inspection.setStatus(Inspection.Status.PLANNED);
        Inspection saved = inspectionRepository.save(inspection);

        mockMvc.perform(put("/api/inspections/{id}", saved.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "title": "Updated Title"
                        }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Title"));

        Inspection updated = inspectionRepository.findById(saved.getId()).orElseThrow();
        assertThat(updated.getTitle()).isEqualTo("Updated Title");
    }
}
