/* Interface language. English is the source text; other languages map from it.
   The TV reports its menu language through navigator.language. */
(function () {
  'use strict';
  var DE = {
    // Home
    'Art Mode': 'Art Mode', 'All apps': 'Alle Apps', 'Settings': 'Einstellungen',
    'No apps on Home': 'Keine Apps auf der Startseite', 'Add apps': 'Apps hinzufügen',
    'Leave Home?': 'Startseite verlassen?', 'Open Samsung Home?': 'Samsung Home öffnen?', 'Stay': 'Bleiben',
    'Back': 'Zurück', 'Not saved. OK tries again.': 'Nicht gespeichert. OK versucht es erneut.',
    'TV stage': 'CleanFrame-Startseite. Pfeiltasten, OK und Zurück der Fernbedienung bedienen sie.',
    // Settings overview
    'Background': 'Hintergrund', 'Layout': 'Layout', 'Typography': 'Schrift', 'Focus': 'Fokus',
    'Apps on Home': 'Meine Apps', 'Samsung': 'Samsung', 'Home and TV settings': 'Samsung Home und TV-Einstellungen',
    '1 app': '1 App', '{0} apps': '{0} Apps', 'Open selected group': 'Bereich öffnen', 'Rotation': 'Bildwechsel',
    // Appearance values
    'Apps': 'Apps', 'Font': 'Schrift', 'Home controls': 'Bedienleiste', 'Material': 'Material',
    'Dark': 'Dunkel', 'Light': 'Hell', 'Photo': 'Foto', 'List': 'Liste', 'Dock': 'Dock', 'Type': 'Typo', 'Glass': 'Glas',
    'Soft': 'Weich', 'Frost': 'Frost', 'Clear tint': 'Klar', 'Icons': 'Symbole', 'Icons and text': 'Symbole und Text',
    'Text': 'Text', 'Both': 'Beides',
    'Fixed': 'Fest', 'Each time Home opens': 'Bei jedem Start', 'Every 5 minutes': 'Alle 5 Minuten',
    'Every 15 minutes': 'Alle 15 Minuten', 'Every hour': 'Stündlich',
    'Background type': 'Hintergrundart', 'Wallpaper': 'Hintergrundbild', 'App display': 'App-Darstellung', 'Focus style': 'Fokus-Stil',
    'Choose Photo to use wallpaper and rotation.': 'Wähle „Foto“, um Hintergrundbild und Bildwechsel zu nutzen.',
    'Materials are available with a Photo background.': 'Materialien gibt es mit Foto-Hintergrund.',
    'Choose Glass focus or the Dock layout to use materials.': 'Wähle Glas-Fokus oder das Dock-Layout für Materialien.',
    'Choose Photo in Background to use rotation.': 'Wähle unter Hintergrund „Foto“ für den Bildwechsel.',
    'Timed changes pause while Settings or another panel is open.': 'Der Bildwechsel pausiert, solange ein Menü geöffnet ist.',
    'Samsung Home': 'Samsung Home', 'Open Samsung’s Home screen': 'Samsungs eigene Startseite öffnen',
    'TV settings': 'TV-Einstellungen', 'Picture, sound and network settings': 'Bild, Ton und Netzwerk',
    // Appearance status
    'Try again': 'Erneut versuchen', 'Loading {0}…': '{0} wird geladen…', 'your choice': 'Auswahl',
    'Back cancels this change.': 'Zurück bricht die Änderung ab.',
    'Couldn’t save this change.': 'Die Änderung wurde nicht gespeichert.', 'Couldn’t load {0}.': '{0} konnte nicht geladen werden.',
    'Couldn’t load this appearance.': 'Diese Darstellung konnte nicht geladen werden.', 'Your current choice is kept.': 'Die bisherige Auswahl bleibt.',
    'Return to {0}': 'Zurück zu {0}', 'Retry this change': 'Änderung erneut versuchen', 'Apply selected setting': 'Auswahl übernehmen',
    'Choose a wallpaper': 'Hintergrundbild wählen', 'Choose a rotation interval': 'Wechselintervall wählen', 'Open on the TV': 'Auf dem Fernseher öffnen',
    'Preparing {0}…': '{0} wird vorbereitet…', 'Applying {0}…': '{0} wird übernommen…', 'Applied': 'Übernommen', 'Preview': 'Vorschau',
    'Couldn’t save {0}.': '{0} wurde nicht gespeichert.', '{0} of {1}': '{0} von {1}',
    'Retry this photo': 'Foto erneut versuchen', 'Apply selected photo': 'Foto übernehmen',
    // All apps and the Home editor
    'Loading installed apps…': 'Installierte Apps werden geladen…', 'No installed apps found.': 'Keine installierten Apps gefunden.',
    'Could not read installed apps.': 'Installierte Apps konnten nicht gelesen werden.', 'On Home': 'Auf der Startseite',
    'Not on Home': 'Nicht auf der Startseite', 'Then scroll': 'Weitere per Scrollen', 'Undo': 'Rückgängig', 'Done': 'Fertig',
    'Remove from Home': 'Entfernen', 'Recently removed': 'Zuletzt entfernt', 'Other installed apps': 'Weitere installierte Apps',
    'Home is full': 'Startseite ist voll', 'Add to Home': 'Hinzufügen',
    'Home holds nine apps. Remove one first.': 'Die Startseite fasst neun Apps. Entferne zuerst eine.',
    'Home needs one app': 'Mindestens eine App bleibt', 'Nothing to undo': 'Nichts rückgängig zu machen',
    'Couldn’t save. Nothing changed.': 'Nicht gespeichert. Nichts wurde geändert.',
    'Remove {0}': '{0} entfernen', 'Add {0}': '{0} hinzufügen', 'Move {0}': '{0} verschieben',
    'Undo {0}': 'Rückgängig: {0}', 'Undone: {0}.': 'Rückgängig gemacht: {0}.',
    '{0} is in Recently removed. OK puts it back.': '{0} liegt unter „Zuletzt entfernt“. OK holt die App zurück.',
    '{0} is on Home, position {1}.': '{0} ist auf der Startseite, Position {1}.', '{0} moved to position {1}.': '{0} auf Position {1} verschoben.',
    '{0} stays installed.': '{0} bleibt installiert.', 'Moving {0}. OK places it, Back puts it back.': '{0} wird verschoben. OK setzt ab, Zurück bricht ab.',
    // Device messages
    'Open CleanFrame on the TV to use this control.': 'Diese Funktion gibt es nur auf dem Fernseher.',
    'The web preview cannot control the TV.': 'Die Browser-Vorschau kann den Fernseher nicht steuern.',
    'The TV could not open this screen.': 'Der Fernseher konnte diesen Bildschirm nicht öffnen.',
    'Try again, or press the remote’s Home button to return to CleanFrame.': 'Bitte erneut versuchen oder mit der Home-Taste zu CleanFrame zurückkehren.',
    'The TV did not respond. Please try again.': 'Der Fernseher hat nicht reagiert. Bitte erneut versuchen.',
    'This app has no launch target.': 'Für diese App ist kein Startziel hinterlegt.',
    // Wallpapers
    'Misty coast': 'Nebelküste', 'Quiet cove': 'Stille Bucht', 'Forest mist': 'Waldnebel', 'Mountain valley': 'Bergtal',
    'Desert stars': 'Wüstensterne', 'Blue peaks': 'Blaue Gipfel', 'Bridge at dusk': 'Brücke im Abendlicht', 'Sunlit ridges': 'Sonnige Grate',
    'Golden hour': 'Goldene Stunde', 'Sunlit summits': 'Sonnige Gipfel', 'Gold Coast dusk': 'Gold Coast am Abend',
    'Sydney Harbour': 'Hafen von Sydney', 'Amber hills': 'Bernsteinhügel', 'Mint wave': 'Minzwelle', 'Alpine glow': 'Alpenglühen'
  };
  var TABLES = { de: DE };
  var requested = window.ShoreQA && window.ShoreQA.lang || navigator.language || 'en';
  var lang = String(requested).toLowerCase().split('-')[0];
  var table = TABLES[lang] || null;
  if (!table) lang = 'en';
  function t(text) { return table && table.hasOwnProperty(text) ? table[text] : text; }
  function f(text) {
    var args = arguments;
    return t(text).replace(/\{(\d)\}/g, function (all, n) { return String(args[+n + 1]); });
  }
  window.CleanFrameI18n = { lang: lang, t: t, f: f, hour12: lang === 'en' };
}());
