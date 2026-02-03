The WebsmithsProfi

Team Members

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

### Umgebungsvariablen konfigurieren

1. Kopieren Sie `backend/.env.example` zu `backend/.env`
2. Füllen Sie die MongoDB-Verbindungsdaten aus
3. Für Cloudinary (Bild-Upload):
   - Erstellen Sie ein kostenloses Konto auf https://cloudinary.com
   - Gehen Sie zu Dashboard → Settings
   - Kopieren Sie `Cloud Name`, `API Key` und `API Secret`
   - Fügen Sie diese in `backend/.env` ein:
     ```
     CLOUDINARY_CLOUD_NAME=ihr_cloud_name
     CLOUDINARY_API_KEY=ihr_api_key
     CLOUDINARY_API_SECRET=ihr_api_secret
     ```
