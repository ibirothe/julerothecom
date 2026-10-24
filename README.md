# Jule Rothe – Portfolio Website

Responsive, statische Website in Dunkelgrün und Gold, umgesetzt auf Basis des freigegebenen dritten Design-Mocks. Texte sind bewusst noch Lorem-Ipsum-Platzhalter; Bildbereiche sind grau, solange keine echten Arbeiten hinterlegt sind. Ohne externe Build-Abhängigkeiten.

## Website starten

Voraussetzung: Node.js 20+.

```bash
node scripts/build.mjs
python3 -m http.server 8000 --directory dist
```

Danach im Browser `http://localhost:8000` öffnen. Alternativ kann `dist` auf einem beliebigen statischen Webserver liegen. HTML, CSS und JavaScript sind bewusst frameworkfrei.

## Neue Tattoo-Arbeiten veröffentlichen

1. Im Repository den Ordner **`assets/works/`** öffnen.
2. Neue JPG-, JPEG-, PNG-, WEBP-, AVIF- oder GIF-Dateien hochladen (z. B. über **Add file → Upload files**).
3. Die Änderung nach `main` committen. GitHub Actions baut `dist/gallery.json` automatisch neu und veröffentlicht die Website. Neue Bilder erscheinen ohne Codeänderungen in der Galerie.

Die Sortierung erfolgt absteigend nach Dateiname. Für aktuelle Arbeiten empfiehlt sich z. B. `2026-10-24-tattoo-01.webp`. Für gute Ladezeiten Fotos vor dem Upload auf ca. 1200–1800 px Kantenlänge und möglichst unter 500 KB pro Bild optimieren.

**Optional:** In `assets/works/metadata.json` können Titel und Bildbeschreibungen gepflegt werden:

```json
{
  "2026-10-24-tattoo-01.webp": {
    "title": "Lorem ipsum",
    "alt": "Detaillierte Beschreibung des Tattoos",
    "category": "Fine Line"
  }
}
```

Die Metadaten-Datei ist **nicht erforderlich**. Ohne sie wird ein lesbarer Titel aus dem Dateinamen gebildet. Vier Arbeiten werden zunächst angezeigt; bei mehr als vier erscheint ein Umschalter für die vollständige Galerie. Klick auf ein Bild öffnet die Großansicht. Wenn noch keine Arbeiten vorhanden sind, erscheinen vier graue Platzhalter.

## GitHub Pages einschalten

1. GitHub Repository → **Settings → Pages**.
2. Unter **Build and deployment / Source** die Option **GitHub Actions** wählen.
3. Den Workflow **Website bauen und veröffentlichen** ggf. unter Actions manuell anstoßen.

Das Workflow-File ist `.github/workflows/deploy.yml`. Es prüft die JavaScript-Syntax, baut die Galerie aus dem Bilderordner und veröffentlicht `dist/` via GitHub Pages. Der Workflow läuft bei jedem Push auf `main`. GitHub Pages muss für dieses Repository und den verwendeten GitHub-Plan freigeschaltet sein. Standardadresse bei Projekt-Pages: `https://ibirothe.github.io/julerothecom/`. Eine eigene Domain kann später in Pages konfiguriert werden.

## Kontaktformular anbinden

Das Kontaktformular ist frontendseitig fertig (Validierung, Statusmeldungen, Spam-Honeypot). Es versendet erst nach Einrichtung eines Formularanbieters. Beispiel **Formspree**:

1. Bei Formspree ein Formular anlegen.
2. In `site-config.js` dessen öffentliche Formular-URL als `contactEndpoint` hinterlegen, beispielsweise `https://formspree.io/f/DEINE_ID`.
3. Änderungen committen. Testnachricht senden und Zustellung prüfen.

Keine geheimen API-Schlüssel in `site-config.js` oder GitHub committen. Das Formular sendet direkt per HTTPS an die öffentliche Formspree-URL.

## Newsletter anbinden

Die Newsletter-UI enthält E-Mail-Validierung und ein Pflichtfeld zur Einwilligung. Für einen **tatsächlichen Newsletter mit Double-Opt-in** benötigt sie einen Anbieter. Unterstützt wird derzeit ein öffentliches HTML-POST-Anmeldeformular, beispielsweise von Mailchimp:

1. Eine Newsletter-Liste und Double-Opt-in beim Anbieter einrichten.
2. Die öffentliche `action`-URL des Anbieter-Anmeldeformulars in `site-config.js` als `newsletterAction` hinterlegen.
3. Falls das E-Mail-Feld beim Anbieter anders heißt, `newsletterEmailField` anpassen (Standard `EMAIL`).
4. Anmeldung mit einer Testadresse inklusive Bestätigungs-E-Mail prüfen.

Die Anmeldung öffnet die Antwort des Anbieters in einem neuen Tab. Ohne Anbieter-Konfiguration wird **keine Anmeldung vorgetäuscht**; das Formular erklärt, dass es noch nicht eingerichtet ist. Bei Anbietern ohne kompatibles HTML-POST-Formular ist eine individuelle Integration erforderlich.

## Vor dem produktiven Launch

- Alle Lorem-Ipsum-Texte ersetzen und echte Bilder mit entsprechender Nutzungserlaubnis hochladen.
- `impressum.html` und `datenschutz.html` mit korrekten geschäftlichen und datenschutzrechtlichen Angaben vervollständigen und prüfen lassen.
- Kontaktformular und Newsletter einrichten und den Double-Opt-in-Ablauf überprüfen.
- Schrift-Einbindung beachten: Aktuell werden Cormorant Garamond und Manrope über Google Fonts geladen; für datenschutzfreundliches Hosting möglichst selbst hosten (keine Schriftdateien ins Repository aufnehmen, bevor Lizenzen geprüft wurden).
- Responsives Verhalten auf echten Geräten testen, Alt-Texte ergänzen, ggf. Custom Domain setzen.

## Projektstruktur

- `index.html` – Homepage, Navigation, Galerie, Formulare.
- `styles.css` – Desktop-, Tablet- und Smartphone-Styles.
- `main.js` – Navigation, Galerie, Lightbox und Formularlogik.
- `site-config.js` – öffentliche Formular-/Newsletter-Konfiguration.
- `assets/works/` – neue Tattoo-Fotos und optional Metadaten.
- `scripts/build.mjs` – kopiert die Website nach `dist/` und erstellt die Galerie.
- `.github/workflows/deploy.yml` – automatischer GitHub-Pages-Deploy.
