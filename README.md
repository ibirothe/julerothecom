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

## Newsletter mit EmailOctopus

Im Newsletter-Bereich ist das offizielle **EmailOctopus Inline-Formular** eingebettet:

- Form-ID: `7ca9f130-cfae-11f1-86da-f5e17363f70f`
- Script: `https://eocampaign1.com/form/7ca9f130-cfae-11f1-86da-f5e17363f70f.js`
- Das Einbettungsskript steht direkt im Newsletter-Bereich von `index.html`. Das alte HTML-Formular wurde entfernt, um doppelte Eingaben und Doppelanmeldungen zu vermeiden.
- CSS-Anpassungen in `styles.css` orientieren das Formular an der dunkelgrün-goldenen Website. Die Anbieter-Styles können sich ändern; die Einbettung auf Desktop und Mobilgerät prüfen.

**In EmailOctopus abschließen:**

1. Prüfen, dass das Formular vom Typ **Inline** ist und mit der richtigen Liste verbunden wurde.
2. Einwilligungs-Checkbox im Form-Editor konfigurieren; in der Website gibt es keine zweite Checkbox.
3. In der Liste **Double-Opt-in** aktivieren und Bestätigungs-E-Mail prüfen.
4. Erfolgsmeldung im EmailOctopus-Formular einrichten.
5. Mit einer echten Testadresse Anmeldung, Zustellung der Bestätigungs-E-Mail und Aufnahme in die Liste testen.
6. Die Datenschutzerklärung für den echten EmailOctopus-Einsatz aktualisieren; das externe Skript wird beim Seitenaufruf geladen.

Das Formular benötigt keinen API-Key und kein eigenes Backend. Bei blockierten externen Skripten oder deaktiviertem JavaScript kann es nicht gerendert werden.

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
