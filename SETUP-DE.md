# CleanFrame auf deinem Samsung The Frame

Diese Anleitung ist für deine eigene Installation geschrieben. Sie erklärt, was CleanFrame ist, wie du es auf deinen Fernseher bekommst, welche Einstellungen am Fernseher helfen und wie du die Oberfläche bedienst.

**Kurz gesagt:** CleanFrame ist eine eigene, ruhige Startseite für den Frame: deine Apps, ein Foto und die Uhrzeit. Keine Werbung, keine Empfehlungen, keine Internetverbindung. Es läuft als ganz normale Tizen-Web-App auf dem Fernseher und startet deine Apps über Samsungs offizielle Schnittstelle.

> **Auf eigenes Risiko.** CleanFrame wurde ursprünglich für einen einzigen Fernseher (QA55LS03D, Tizen 9.0) entwickelt. Die normale Installation als App ist harmlos und jederzeit wieder deinstallierbar. Der optionale Eingriff in die Home-Taste (siehe [unten](#die-home-taste)) ist es nicht – den lässt du am besten weg.

## Inhalt

1. [Wie CleanFrame mit dem Fernseher spricht](#wie-cleanframe-mit-dem-fernseher-spricht)
2. [Was du brauchst](#was-du-brauchst)
3. [Erst im Browser ausprobieren](#erst-im-browser-ausprobieren)
4. [Fernseher vorbereiten](#fernseher-vorbereiten)
5. [Computer vorbereiten](#computer-vorbereiten)
6. [Zertifikat erstellen](#zertifikat-erstellen)
7. [Installieren und starten](#installieren-und-starten)
8. [CleanFrame bedienen](#cleanframe-bedienen)
9. [Werbung: was CleanFrame kann – und was nicht](#werbung-was-cleanframe-kann--und-was-nicht)
10. [Empfohlene Einstellungen am Fernseher](#empfohlene-einstellungen-am-fernseher)
11. [Die Home-Taste](#die-home-taste)
12. [Aktualisieren, entfernen, Probleme](#aktualisieren-entfernen-probleme)

## Wie CleanFrame mit dem Fernseher spricht

Es gibt zwei getrennte Wege, und keiner davon braucht ein Passwort, ein Konto oder eine IP-Adresse im Code:

| Weg | Wofür | Wie |
| --- | --- | --- |
| **App auf dem Fernseher** | Apps starten, installierte Apps auflisten, Art Mode, TV-Einstellungen öffnen | Samsungs öffentliche [Tizen Application API](https://developer.samsung.com/smarttv/develop/api-references/tizen-web-device-api-references/application-api.html) (`tizen.application`). Die nötigen Rechte stehen in `app/config.xml`. |
| **Computer → Fernseher** (nur einmal zum Installieren) | Paket signieren, hochladen, installieren, starten | Samsungs offizielle Entwicklerwerkzeuge (Tizen Studio, `sdb`) über dein Heimnetz, Port 26101, im **Entwicklermodus** des Fernsehers |

Wichtig für deine Daten:

- Die IP-Adresse deines Fernsehers, der Name deines Zertifikatsprofils und der SDK-Pfad stehen nur in `.local/device.json`. Der Ordner `.local/` wird von Git ignoriert und landet nie im Repository.
- Zertifikate und Passwörter verwaltet Samsungs Certificate Manager in deinem Benutzerordner – nicht im Projekt.
- Die Skripte akzeptieren nur private Heimnetz-Adressen (z. B. `192.168.x.x`) und verweigern alles andere.
- CleanFrame selbst baut keine Internetverbindung auf. Schriften, Fotos und Symbole liegen in der App.

Deine Installation hat eine eigene App-Identität: `CW0mNcEgJ4.CleanFrame` (in `app/config.xml`). Sie ist kein Geheimnis. Lass sie nach der ersten Installation unverändert, sonst entsteht eine zweite App statt eines Updates.

## Was du brauchst

- Deinen Samsung The Frame und die normale Fernbedienung.
- Einen Computer (Windows, macOS oder Linux) im **selben WLAN/LAN** wie der Fernseher.
- Ein **Samsung-Konto** (kostenlos) für das Entwicklerzertifikat.
- [Node.js 22+](https://nodejs.org/) und [Python 3.10+](https://www.python.org/downloads/).
- Etwa eine Stunde Zeit. Der Fernseher muss zwischendurch einmal neu gestartet werden.

## Erst im Browser ausprobieren

So siehst du die Oberfläche, bevor du irgendetwas am Fernseher änderst:

```sh
npm ci
npm run dev:public
```

Öffne <http://localhost:4795/home/>. Pfeiltasten, Enter (= OK) und Esc (= Zurück) entsprechen der Fernbedienung. Apps starten geht im Browser nicht – das meldet die Vorschau ehrlich. Die Browser-Vorschau zeigt Englisch oder Deutsch, je nach Spracheinstellung deines Browsers.

## Fernseher vorbereiten

### 1. Modell, Firmware und IP-Adresse notieren

- **Einstellungen → Support → Info zu diesem TV**: Modell (z. B. `GQ55LS03D…`) und Softwareversion notieren.
- **Einstellungen → Allgemein und Datenschutz → Netzwerk → Netzwerkstatus → IP-Einstellungen**: die IP-Adresse des Fernsehers notieren, z. B. `192.168.1.50`.

> Tipp: Gib dem Fernseher im Router eine feste IP-Adresse (DHCP-Reservierung). Sonst musst du `.local/device.json` anpassen, wenn sich die Adresse ändert.

Menünamen unterscheiden sich je nach Baujahr leicht. Gemeint ist immer der sinngemäße Eintrag.

### 2. Entwicklermodus einschalten

1. Öffne auf dem Fernseher **Apps** (die App-Übersicht von Samsung).
2. Öffne den Ziffernblock der Fernbedienung (Taste **123** oder über die Farbtasten) und tippe **1 2 3 4 5**. Es gibt kein Eingabefeld – einfach tippen, während die App-Übersicht offen ist.
3. Im Fenster **Developer Mode** auf **On** stellen.
4. Bei **Host PC IP** die IP-Adresse **deines Computers** eintragen (nicht die des Fernsehers).
   - Windows: `ipconfig` in der Eingabeaufforderung → „IPv4-Adresse“.
   - macOS: Systemeinstellungen → Netzwerk → WLAN → Details.
5. **OK**, dann den Fernseher neu starten.

Wenn sich der Computer danach nicht verbinden kann: Fernseher **am Stecker** vom Strom trennen, 10 Sekunden warten, wieder einstecken. Ein kurzer Druck auf die Power-Taste schaltet beim Frame nur in den Art Mode und startet nicht neu. Unterbrich nie ein laufendes Firmware-Update.

## Computer vorbereiten

1. Installiere [Tizen Studio](https://developer.samsung.com/smarttv/develop/getting-started/setting-up-sdk/installing-tv-sdk.html) (Samsungs TV-SDK) in den Standardordner `~/tizen-studio`.
2. Öffne den **Package Manager** von Tizen Studio und installiere unter *Extension SDK* die **TV Extensions** und die **Samsung Certificate Extension**.
3. Lege im Projektordner die Datei `.local/device.json` an (der Ordner `.local/` ist privat und wird nie hochgeladen):

```json
{
  "host": "192.168.1.50",
  "profile": "MeinFrame"
}
```

- `host`: IP-Adresse deines Fernsehers.
- `profile`: der Name, den du gleich im Certificate Manager vergibst.
- Optional `"sdk": "/anderer/pfad/tizen-studio"`, falls Tizen Studio woanders liegt.

4. Verbindung testen:

```sh
npm run tv:info
```

Erwartet wird eine Liste mit Fähigkeiten, darunter die Tizen-Version und die CPU-Architektur. Ein reiner „Port offen“-Test reicht nicht.

> Unter Windows heißt Python oft `python` statt `python3`. Dann `python scripts/tv.py info` usw. direkt aufrufen, oder WSL verwenden.

## Zertifikat erstellen

Samsung-Fernseher installieren nur signierte Apps. Das Zertifikat ist an dein Samsung-Konto und an die Geräte-ID (DUID) deines Fernsehers gebunden.

1. Tizen Studio → **Tools → Certificate Manager → + → Samsung**.
2. Gerätetyp **TV** wählen, Profilname eingeben – genau den aus `.local/device.json` (z. B. `MeinFrame`).
3. **Autorenzertifikat** neu erstellen: Name und Passwort vergeben, mit deinem Samsung-Konto anmelden. Sicherungskopie gut aufheben – ohne dieses Zertifikat kannst du die App später nicht mehr aktualisieren.
4. **Distributorzertifikat** erstellen (Berechtigung „Public“ genügt). Die DUID deines Fernsehers wird übernommen, wenn er per `sdb` verbunden ist (Schritt „Verbindung testen“ oben). Alternativ findest du sie unter **Einstellungen → Support → Info zu diesem TV**.
5. Fertigstellen. Das Profil enthält jetzt beide Zertifikate.

Anmeldung und Passwörter gibst du nur in Samsungs eigenen Fenstern ein.

## Installieren und starten

```sh
npm run check          # prüft App, Identität und Dateien (offline)
npm run package        # baut und signiert dist/CleanFrame.wgt (fragt evtl. nach deinem Zertifikatspasswort)
npm run tv:install     # lädt die App auf den Fernseher und installiert sie
npm run tv:launch      # startet CleanFrame
```

Danach findest du **CleanFrame** in der App-Übersicht des Fernsehers und kannst es jederzeit von dort starten.

Falls `tv:install` auf deiner Firmware scheitert, geht auch Samsungs Standardbefehl:

```sh
~/tizen-studio/tools/ide/bin/tizen install -n dist/CleanFrame.wgt -s 192.168.1.50:26101
```

Welche Apps auf deinem Fernseher installiert sind (mit ihren internen IDs), zeigt:

```sh
npm run tv:apps
```

Beim **ersten Start** liest CleanFrame die installierten Apps einmal aus und behält auf der Startseite nur die Standard-Apps, die es bei dir wirklich gibt (z. B. Netflix, YouTube, Disney+, Prime Video, Apple TV). Weitere Apps wie ARD Mediathek, ZDFmediathek, Joyn oder RTL+ fügst du in wenigen Sekunden selbst hinzu (siehe unten).

Den Entwicklermodus kannst du danach wieder ausschalten. Die installierte App bleibt erhalten; für spätere Updates schaltest du ihn wieder ein.

## CleanFrame bedienen

Die Oberfläche ist komplett mit den Pfeiltasten, **OK** und **Zurück** bedienbar. Die Sprache folgt der Menüsprache des Fernsehers – auf einem deutschen Fernseher ist alles Deutsch, mit 24-Stunden-Uhr.

### Startseite

| Layout | Navigation |
| --- | --- |
| **Dock** (Standard): Apps unten in einer Leiste | Links/Rechts wählt eine App. **Hoch** führt zu *Art Mode*, *Alle Apps* und *Einstellungen* oben rechts. **Runter** oder **Zurück** springt zurück zur App. |
| **Liste**: große App-Namen links | Hoch/Runter wählt eine App. **Rechts** führt zu den drei Bedienelementen unten rechts. **Links** oder **Zurück** springt zurück. |

- **OK** startet die ausgewählte App. Nur durch Markieren startet nie etwas.
- **Zurück** auf der Startseite fragt, ob du zu Samsung Home wechseln möchtest – „Bleiben“ ist vorausgewählt.
- Wenn du aus einer App zurückkommst, ist die zuletzt gestartete App wieder ausgewählt.

### Art Mode

**Art Mode** soll den Frame direkt in den Kunstmodus mit deinem aktuellen Kunstwerk schalten. Dafür nutzt CleanFrame eine interne Schnittstelle von Samsungs Art-App, die nicht offiziell dokumentiert ist. Prüfe auf deinem Modell, ob sie wie erwartet funktioniert; falls nicht, schaltet ein kurzer Druck auf die Power-Taste ebenfalls in den Art Mode.

### Alle Apps

Zeigt alle installierten Apps alphabetisch (Samsungs Hintergrunddienste, Werbe-Player und Systemhelfer sind ausgefiltert). **OK** startet eine App. Ganz oben führt **Meine Apps** zum Bearbeiten der Startseite.

### Meine Apps (Startseite bearbeiten)

Erreichbar über **Einstellungen → Meine Apps** oder **Alle Apps → Meine Apps**. Links steht, was auf der Startseite ist (1 bis 9 Apps), rechts alles andere.

- **Hinzufügen:** rechts eine App wählen, **OK**.
- **Entfernen:** links eine App wählen, **Rechts** → *Entfernen*, **OK**. Die App bleibt installiert.
- **Reihenfolge:** links **OK** auf einer App „hebt“ sie an, **Hoch/Runter** verschiebt, **OK** setzt sie ab.
- **Rückgängig** oben rechts nimmt die letzte Änderung zurück. **Fertig** oder **Zurück** schließt.

Alles wird sofort gespeichert und bleibt nach einem Neustart erhalten.

### Einstellungen

| Bereich | Möglichkeiten |
| --- | --- |
| Hintergrund | Foto, Hell oder Dunkel; 15 Hintergrundbilder; Bildwechsel (fest, bei jedem Start, alle 5/15 Minuten, stündlich) |
| Layout | Liste oder Dock; Apps und Bedienleiste jeweils als Text, Symbole oder beides |
| Schrift | Manrope, Geist, Newsreader |
| Fokus | Typo oder Glas; Material Weich, Frost oder Klar |
| Meine Apps | Startseite bearbeiten |
| Samsung | Samsung Home oder die TV-Einstellungen öffnen |

Markieren ändert nichts – erst **OK** übernimmt eine Auswahl (erkennbar am Häkchen). Rechts siehst du eine Vorschau deiner Startseite.

Für einen besonders ruhigen Look: **Layout → Liste**, **App-Darstellung → Text**, **Hintergrund → Dunkel**.

## Werbung: was CleanFrame kann – und was nicht

CleanFrame enthält keine Werbung, keine Promo-Kacheln, keine „Empfohlen für dich“-Reihen und keine Inhalte aus dem Internet. Daran war im Code nichts zu entfernen. Die Werbung, die du vom Frame kennst, kommt von Samsungs System und von den Streaming-Apps. CleanFrame umgeht keine Sicherheitsmechanismen des Fernsehers und ändert keine Systemdateien.

**Das vermeidet CleanFrame:**

| Werbung/Ablenkung | Warum sie verschwindet |
| --- | --- |
| Banner, „Empfohlen“-Reihen und gesponserte Kacheln auf Samsungs Startseite (Smart Hub) | Du startest deine Apps von CleanFrame aus und musst die Samsung-Startseite gar nicht mehr öffnen. |
| Werbe- und Promo-Apps in App-Listen | *Alle Apps* blendet Samsungs Werbe-Player, Hintergrunddienste und Promotions aus. |
| Tracking durch die Startseite selbst | CleanFrame stellt keine Netzwerkverbindung her und speichert nur deine Einstellungen lokal auf dem Fernseher. |

**Das kann CleanFrame nicht entfernen:**

| Werbung | Woher sie kommt | Was du tun kannst |
| --- | --- | --- |
| Samsung-Startseite (Smart Hub) mit Bannern | Erscheint, wenn du die **Home-Taste** drückst, weil sie Samsungs fest zugewiesene Startseite ist | Home-Taste meiden und CleanFrame aus der App-Leiste starten; siehe [Die Home-Taste](#die-home-taste) |
| Werbung in Netflix, YouTube, Prime Video, Joyn usw. | Die Apps selbst und dein Abo-Modell | Werbefreies Abo der jeweiligen App |
| Samsung TV Plus (kostenlose Sender mit Werbung) | Samsungs eigener Dienst, startet teils automatisch | Autostart ausschalten (siehe unten) |
| Personalisierte Werbung und Auswertung deines Fernsehverhaltens (ACR) | Samsungs Datendienste | Datenschutzoptionen ausschalten (siehe unten) |
| Promotions im Art Store / Art Mode, Systemhinweise, Update-Meldungen | Samsungs Art-App und Betriebssystem | Teilweise über Einstellungen; Systemhinweise bleiben |

## Empfohlene Einstellungen am Fernseher

Diese Einstellungen sind offizielle Optionen von Samsung. Sie reduzieren Werbung und Datensammlung deutlich. Die Menüpfade gelten sinngemäß für Modelle ab 2022 und können je nach Firmware anders heißen.

**Datenschutz** – *Einstellungen → Allgemein und Datenschutz → Nutzungsbedingungen und Datenschutz* (bzw. *Datenschutzoptionen*):

- **Informationsdienste für die Anzeige** (Viewing Information Services / ACR): **aus**.
- **Interessenbezogene Werbung** (Interest-Based Advertisement): **aus**. Gegebenenfalls zusätzlich die Werbe-ID zurücksetzen.
- **Spracherkennungsdienste**: aus, wenn du keine Sprachsteuerung nutzt.
- Optionalen Nutzungsbedingungen (z. B. für Marketing-Informationen) nicht zustimmen bzw. die Zustimmung zurückziehen.

**Startverhalten** – *Einstellungen → Allgemein und Datenschutz → Startbildschirmoptionen* (ältere Modelle: *Allgemein → Smart-Funktionen*):

- **Mit Samsung TV Plus starten / Samsung TV Plus automatisch starten**: **aus**.
- **Smart Hub automatisch starten**: **aus**.
- **Letzte App automatisch starten** (Autorun Last App): **ein**. Wenn du den Fernseher in CleanFrame ausschaltest, öffnet er beim nächsten Einschalten wieder CleanFrame. Hast du zuletzt Netflix geschaut, startet entsprechend Netflix – also vor dem Ausschalten kurz zu CleanFrame zurückkehren.

**App-Leiste:** Öffne Samsungs App-Übersicht, markiere CleanFrame und verschiebe es (Taste „Runter“ → *Verschieben*) an die **erste Stelle** der Leiste. So ist CleanFrame nach der Home-Taste immer nur einen Klick entfernt.

**Netzwerkweit (optional, für Fortgeschrittene):** Ein DNS-Filter im eigenen Heimnetz (z. B. Pi-hole oder AdGuard Home) kann Samsungs Werbe- und Tracking-Server blockieren, ohne den Fernseher anzufassen. Blockiere aber nie Update- oder Lizenzserver, sonst bekommt der Fernseher keine Sicherheitsupdates mehr und Apps funktionieren nicht. Nutze dafür gepflegte, öffentlich dokumentierte Listen statt eigener Vermutungen.

## Die Home-Taste

Die **Home-Taste** der Fernbedienung öffnet immer Samsungs eigene Startseite. Samsung bietet keine offizielle Einstellung, um eine andere App als Startseite festzulegen.

Der ursprüngliche Autor hat das auf seinem Fernseher mit einem undokumentierten Systemeingriff gelöst (`scripts/native-home/`). Dieser Weg ist bewusst **nicht** Teil dieser Anleitung:

- Er nutzt interne, nicht dokumentierte Funktionen, die mit jedem Firmware-Update brechen können.
- Er ist absichtlich auf eine einzige Firmware gesperrt und würde auf deinem Fernseher den Dienst verweigern.
- Ein Fehler kann das normale Startverhalten des Fernsehers beschädigen.

Die empfohlene, sichere Kombination ist: **Letzte App automatisch starten** + CleanFrame an **erster Stelle der App-Leiste**. Damit fühlt sich CleanFrame im Alltag wie die Startseite an, ohne dass etwas am System verändert wird.

## Aktualisieren, entfernen, Probleme

**Aktualisieren:** Entwicklermodus einschalten, dann `npm run package` und `npm run tv:install`. Deine Einstellungen bleiben erhalten, solange App-Identität und Autorenzertifikat gleich bleiben.

**Entfernen:** In Samsungs App-Übersicht CleanFrame markieren → *Löschen*. Am System bleibt nichts zurück.

**Prüfungen für Änderungen am Code:**

```sh
npm run check                                      # Identität, Dateien, Syntax
CLEANFRAME_PUBLIC_FONTS=1 npm run check:browser    # Navigation, Einstellungen, Speichern (Chromium)
CLEANFRAME_PUBLIC_FONTS=1 npm run check:german     # deutsche Oberfläche: Textlänge, Uhr, keine englischen Reste
```

Einmalig vorher: `npx playwright install chromium`.

| Problem | Lösung |
| --- | --- |
| `tv:info` meldet keine Verbindung | Stimmt die IP des Computers im Entwicklermodus? Gleiches Netz (kein Gast-WLAN, kein VPN)? Fernseher am Stecker neu starten. |
| „SDB not found“ / „Tizen CLI not found“ | Tizen Studio installieren oder `"sdk"` in `.local/device.json` setzen. |
| Signieren scheitert | Profilname in `.local/device.json` exakt wie im Certificate Manager? Enthält das Distributorzertifikat die DUID dieses Fernsehers? |
| Installation „failed“ | Gibt es bereits eine CleanFrame-Version mit anderem Autorenzertifikat? Dann diese zuerst am Fernseher löschen. |
| Eine App startet nicht | In *Meine Apps* entfernen und über *Alle Apps* neu hinzufügen – dann nutzt CleanFrame die echte ID deines Fernsehers. |
| Startseite zeigt Englisch | Die Menüsprache des Fernsehers steht auf Englisch. CleanFrame folgt ihr automatisch. |

Was im Browser getestet ist und was nur am echten Fernseher geprüft werden kann, steht in [docs/tv-status.md](docs/tv-status.md). Für deinen Fernseher gilt: Erst wenn du es mit der Fernbedienung gesehen hast, ist es bestätigt.
