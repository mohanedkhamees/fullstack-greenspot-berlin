The WebsmithsProfi

Team Members

Nada Mohamed Shaaban Yassin Albialy (Matrikelnummer: s0595109)
Mohaned Khamees (Matrikelnummer: s0594227)


Description
Diese Webanwendung wird im Rahmen des Semesterprojekts im FED-Kurs entwickelt.
Ziel ist es, Orte in Berlin zu dokumentieren, die:

keine nachhaltige Infrastruktur besitzen
als nicht-nachhaltig oder umweltfeindlich gelten

Nutzer/innen sollen Problemstellen melden und mit Bildern versehen können, um Aufmerksamkeit zu schaffen und mögliche Verbesserungen anzuregen.


## Installation

Das Projekt besteht aus drei `npm`-Projekten:

- `backend/` – Node/Express Server
- `frontend/` – React/Vite App
- Projekt-Root – gemeinsame Tools (z.B. `concurrently`)

### Einmalige Installation (nach dem Klonen)

Im Terminal nacheinander ausführen:

```bash
cd backend
npm install

cd ../frontend
npm install

cd ..
npm install    # Installation der Dev-Tools im Root (z.B. concurrently)
