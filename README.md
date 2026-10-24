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

## Mehrsprachigkeit (Issue #4)

Die Website unterstützt Deutsch (`de`, Standard) und Englisch (`en`):

- Deutsch: `https://ibirothe.github.io/julerothecom/?lang=de`
- Englisch: `https://ibirothe.github.io/julerothecom/?lang=en`
- Über den Umschalter **DE / EN** im Header bzw. mobilen Burger-Menü wechseln. Die aktuelle URL inklusive Abschnitt (`#kontakt`) bleibt dabei erhalten.
- Die Sprachwahl wird über den URL-Parameter `lang` transportiert, nicht über Cookies oder Local Storage. Auch interne Links auf Impressum und Datenschutz übernehmen ihn.
- `i18n.js` lädt `locales/de.json` als Grundsprache und optional `locales/en.json`. Fehlt ein einzelner englischer Text, wird automatisch die deutsche Version angezeigt. Ist die Datei nicht erreichbar, bleibt die statische deutsche Seite nutzbar.
- Für sichtbare Texte werden `data-i18n="key"`, für Formulare `data-i18n-placeholder="key"` und für zugängliche Bezeichnungen `data-i18n-aria-label="key"` verwendet. Für Metadaten ist `data-i18n-content="key"` verfügbar.
- Die Hauptseite aktualisiert über JavaScript `html lang`, den Dokumenttitel und die Meta-Description. Die Rechteseiten sind weiterhin ausdrücklich **unfertige Platzhalter**, aber beide Sprachfassungen sind erreichbar.
- Die bestehende Galerie unterstützt jetzt optional strukturierte Metadaten für beide Sprachen:

```json
{
  "2026-10-24-test-tattoo.webp": {
    "title": {"de": "Testarbeit 01", "en": "Test work 01"},
    "alt": {"de": "Ornamentales Tattoo", "en": "Ornamental tattoo"},
    "category": {"de": "Ornamental", "en": "Ornamental"}
  }
}
```

Bestehende einfache Strings bleiben kompatibel. Für spätere FAQs kann das gleiche Objektmuster `{ "de": "...", "en": "..." }` in der FAQ-JSON verwendet werden; die FAQ-Komponente wird separat in Issue #3 umgesetzt.

**Achtung EmailOctopus:** Das externe Embed-Formular wird vom Anbieter gerendert und nicht durch die Website-Übersetzung gesteuert. Die darin sichtbaren Feldnamen, Einwilligungstexte und Bestätigungen werden im EmailOctopus-Form-Editor gepflegt. Falls eine vollständig englische Registrierung benötigt wird, muss ein englisches Formular im Anbieter angelegt und dessen ID sprachabhängig eingebunden werden.

**Prüfung:** `node scripts/check-i18n.mjs` validiert die Sprachdateien und alle HTML-Übersetzungsschlüssel. Der GitHub-Actions-Workflow führt diese Prüfung vor dem Build aus.

## FAQ aus JSON pflegen (Issue #3)

Die Fragen stehen ausschließlich in **`content/faq.json`**. Änderungen an dieser Datei per GitHub-Commit nach `main` aktualisieren die FAQ beim nächsten erfolgreichen GitHub-Pages-Deployment. Die anfänglichen Einträge sind **Lorem-Ipsum-Testtexte**.

```json
{
  "items": [
    {
      "id": "anfrage",
      "order": 10,
      "category": {"de": "Ablauf", "en": "Process"},
      "question": {"de": "Wie läuft die Anfrage ab?", "en": "How does the inquiry work?"},
      "answer": {"de": "Hier steht die Antwort.", "en": "Your answer goes here."}
    }
  ]
}
```

- `id` muss einmalig sein und darf Buchstaben, Zahlen, Unterstrich oder Bindestrich enthalten.
- `order` ist optional und steuert die Sortierung (aufsteigend).
- `question.de` und `answer.de` sind Pflicht; englische Texte (`en`) sind optional. Fehlen sie, wird Deutsch angezeigt.
- `category` ist optional (einfacher String oder Übersetzungsobjekt mit `de`/`en`).
- Antworten werden **als Klartext** ausgegeben, niemals als HTML interpretiert. Absätze können mittels `\\n\\n` in der JSON-Antwort getrennt werden.
- `"items": []` ist zulässig und führt zu einem Hinweis statt eines Fehlers.
- Fehlerhafte Einträge werden im Frontend übersprungen; Fehler beim Laden der Datei erzeugen eine übersetzte Fehlermeldung, ohne die Galerie oder Formulare zu beeinträchtigen.
- FAQ-Abschnitt und Menüpunkt funktionieren auf Mobilgerät und Desktop. Die Einträge nutzen native `details`/`summary`-Elemente und sind per Tastatur bedienbar.

Validieren und lokal ausführen:

```bash
node scripts/check-i18n.mjs
node scripts/check-faq.mjs
node scripts/build.mjs
python3 -m http.server 8000 --directory dist
```

Der Build kopiert nun außerdem `i18n.js`, `locales/` und `content/` explizit nach `dist/`, damit Sprachumschalter und FAQ auch auf GitHub Pages funktionieren.

## Testimonials / Kundenstimmen (Issue #5)

Die Testimonials werden über **`content/testimonials.json`** gepflegt. Sie erscheinen in einer eigenen Sektion **unmittelbar vor dem Kontaktformular**. Die kompakte Navigation erhält dafür keinen zusätzlichen Menüpunkt.

```json
{
  "items": [
    {
      "id": "kundenstimme-01",
      "order": 10,
      "status": "published",
      "consentConfirmed": true,
      "firstName": "VORNAME",
      "quote": {
        "de": "Freigegebenes Originalzitat.",
        "en": "Approved translated quote."
      },
      "avatar": "kundenstimme-01.webp"
    }
  ]
}
```

- `id`: eindeutig, nur Buchstaben, Zahlen, `-`, `_`.
- `order`: optionale aufsteigende Reihenfolge.
- `status`: **`demo`** für sichtbar gekennzeichnete Gestaltungsbeispiele; **`published`** ausschließlich für echte, freigegebene Zitate.
- `firstName`: freigegebener Vorname oder Pseudonym; keine Nachnamen notwendig.
- `quote.de` ist erforderlich, `quote.en` optional. Fehlende englische Texte fallen auf Deutsch zurück. Die Inhalte werden als sicherer Klartext eingesetzt, ohne HTML-Ausführung.
- `avatar` optional: **Dateiname** einer JPG-, PNG-, AVIF- oder WEBP-Datei in `assets/testimonials/`. Foto vorher hochladen. Der Kreis schneidet die Aufnahme passend als Portrait zu; ohne Datei wird die Initiale des Namens angezeigt.
- **`consentConfirmed: true`** ist für `status:published` verpflichtend. Einen nachweisbaren Einwilligungsbeleg für Zitat, Namen/Pseudonym und ggf. Portrait separat und nicht öffentlich aufbewahren; der JSON-Flag ist keine Einwilligung selbst.
- Der Beispiel-Eintrag `demo-anna` ist fiktiv und auf der Website als **Designbeispiel, keine echte Kundenstimme** markiert.
- Bei `"items": []`, ungültigen Datensätzen oder Ladefehlern bleibt die Testimonials-Sektion verborgen und das Kontaktformular nutzbar.

Test und lokaler Build:

```bash
node scripts/check-testimonials.mjs
node scripts/build.mjs
python3 -m http.server 8000 --directory dist
```

Die CI validiert `content/testimonials.json` bei jedem Commit. Neue Portraitbilder und JSON-Einträge werden automatisch über GitHub Pages veröffentlicht.

## Seitenstruktur (Stand Oktober 2026)

Die Startseite hat diese feste Abschnitts- und Navigationsreihenfolge:

1. Start
2. Arbeiten
3. Newsletter
4. Kundenstimmen
5. Kontakt
6. FAQ

Der frühere Bereich **Über Jule** und das separate Lorem-Ipsum-Hinweisband wurden entfernt. Newsletter ist jetzt ein eigenständiger, responsiver Abschnitt. Die FAQ bleibt als letztes Element auf der Startseite erhalten. Die Haupt- und Footernavigation bieten in DE und EN dieselben sechs Abschnitte an; DE/EN steht zusätzlich als Sprachumschalter im Menü.

`node scripts/check-layout.mjs` validiert Navigation und Abschnittsreihenfolge bei jedem GitHub-Actions-Build.
