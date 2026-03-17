# Inspections App – Backend/Frontend Erläuterung

## Wie das Backend funktioniert

Das Backend ist eine **Spring-Boot-Anwendung** (`backend/`) mit einer klassischen REST-Architektur:

- **Einstiegspunkt:** `DemoApplication.java`
- **REST-Controller:**  
  - `InspectionController` (`/api/inspections`) für Inspektionen und deren Schritte  
  - `ChecklistController` (`/api/checklists`) für wiederverwendbare Checklisten  
  - `FileUploadController` (`/api/upload`) für Bild-Uploads
- **Persistenz:** Spring Data JPA Repositories (`InspectionRepository`, `ChecklistRepository`)
- **Datenmodell:** JPA-Entities (`Inspection`, `InspectionStep`, `Checklist`, `ChecklistStep`)
- **Datenbank:** H2 In-Memory (konfiguriert in `backend/src/main/resources/application.properties`)

### Typischer Ablauf im Backend

1. Request kommt auf einem Controller-Endpunkt an (z. B. `GET /api/inspections`).
2. Der Controller lädt/speichert Daten über das passende Repository.
3. JPA/Hibernate mapped die Entitys in die H2-Datenbank.
4. Das Ergebnis wird als JSON zurückgegeben.

Wichtige Details:

- Eine `Inspection` enthält mehrere `InspectionStep`-Einträge (1:n, `cascade` + `orphanRemoval`).
- Der Upload-Endpunkt erlaubt nur Bildtypen (`.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`) und speichert Dateien im `uploads/`-Verzeichnis.
- `WebConfig` regelt CORS (`localhost:3000` und `localhost:5173`) und stellt `/uploads/**` als statische Ressource bereit.

## Wie das Frontend funktioniert

Das Frontend ist eine **React + TypeScript + Vite** Anwendung (`frontend/`):

- **Routing:** `App.tsx` mit `react-router-dom`
- **Seiten:** u. a. `LandingPage`, `Dashboard`, `InspectionsList`, `InspectionDetail`, `ChecklistsList`
- **API-Schicht:** `src/api.ts` mit Axios (`baseURL: http://localhost:8080`)
- **Typen:** zentrale Datenstrukturen in `src/types.ts`
- **Visualisierung:** Dashboard-Charts mit `recharts`

### Typischer Ablauf im Frontend

1. Benutzer navigiert zu einer Seite (z. B. Dashboard).
2. Die Seite lädt Daten per API-Funktion aus `api.ts`.
3. Antwortdaten werden in React-State gespeichert (`useState`, `useEffect`).
4. UI rendert Tabellen, Status-Badges, Diagramme und Formulare.
5. Aktionen wie „Inspektion anlegen“, „Schritt ändern“, „Foto hochladen“ triggern API-Calls und aktualisieren danach den State.

## Zusammenarbeit von Backend und Frontend + Datenfluss

Die Kommunikation erfolgt per **HTTP/JSON über REST**:

- Frontend sendet Requests an `http://localhost:8080/api/...`
- Backend verarbeitet die Requests, liest/schreibt Daten in H2 und antwortet mit JSON
- Frontend übernimmt die JSON-Daten in den Zustand und aktualisiert die Oberfläche

### Datenfluss-Beispiel (Inspektionen)

1. Frontend: `getInspections()` in `api.ts`
2. HTTP: `GET /api/inspections`
3. Backend: `InspectionController#getAllInspections()` → `inspectionRepository.findAll()`
4. Datenbank: H2 liefert Datensätze
5. Backend: JSON-Response
6. Frontend: setzt `inspections`-State und rendert Liste/Dashboard neu

### Datenfluss-Beispiel (Foto-Upload)

1. Frontend sendet `multipart/form-data` an `POST /api/upload`
2. Backend validiert Dateityp, speichert Datei in `uploads/`
3. Backend antwortet mit URL (`/uploads/<uuid>.<ext>`)
4. Frontend speichert die URL am jeweiligen `InspectionStep` und zeigt das Bild an

---

## Zusammenfassung der geforderten Punkte

### Motivation und Use Cases
->  
Die Anwendung adressiert die strukturierte Durchführung von Inspektionen: Planung, Bearbeitung, Bewertung und Dokumentation in einem durchgängigen Prozess. Typische Use Cases sind interne Qualitätskontrollen, Sicherheitsbegehungen, Facility-Checks und standardisierte Team-Audits mit Fotodokumentation.

### Architektur der Lösung
->  
Es handelt sich um eine zweigeteilte Web-Architektur: React-Frontend für UI/Interaktion und Spring-Boot-Backend als REST-API mit JPA-Persistenz auf H2. Das Frontend ist klar in Seiten und API-Schicht getrennt, das Backend in Controller, Domain-Modelle und Repository-Layer.

### Verwendete Technologie
->  
Frontend: React, TypeScript, Vite, Axios, Recharts, React Router.  
Backend: Java 17, Spring Boot, Spring Web, Spring Data JPA, Hibernate, H2.  
Build/Test: npm/Vitest im Frontend, Maven/JUnit im Backend.

### Farbkonzepte
->  
Das UI nutzt ein neutrales Grundlayout mit violettem Sekundärton und orangem Akzent (`global.css` Variablen). Statusfarben sind konsistent codiert: geplant (violett), in Bearbeitung (grau-violett), erfolgreich (orange), fehlgeschlagen (rosa/rot). Dadurch werden Zustände in Listen, Badges und Diagrammen visuell schnell erfassbar.

### Landing Page
->  
Die Landing Page (`LandingPage.tsx`) ist als Einstieg mit Hero-Bereich, Nutzenargumentation und Schnellnavigation (Dashboard/Kontakt) aufgebaut. Zusätzlich werden Kernfunktionen in Feature-Karten und der Projektkontext (DHBW-Projekt) dargestellt.

### Dashboard und Kernfunktionalitäten
->  
Das Dashboard zeigt KPI-Kacheln, Statusverteilung (Pie Chart), zeitliche Entwicklung (Bar Chart) sowie eine Liste aktueller Inspektionen. Kernfunktionalitäten der App sind: Inspektionen anlegen, Status-Workflow (planned → in progress → completed), Schritte verwalten, Ergebnisse/Kommentare/Fotos dokumentieren, Checklisten wiederverwenden und druckfähige Ansichten erzeugen.
