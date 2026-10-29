# Systemdokumentation — Deutsch

## Teil A — Technische Systembeschreibung

### Zweck und Umfang
Nexus Contextual Knowledge Graph Engine ist eine entstehende, graphzentrierte Umgebung zur Darstellung von Entitäten und Beziehungen, zur Bewahrung des Quellen- und Evidenzkontexts, zur Validierung importierter Graphdaten und zur Verbindung größerer Wissensbereiche durch übergeordnete Artefakte. Das Repository enthält derzeit eine HTML/React-Anwendung in einer einzelnen Datei sowie JavaScript-Validierungsmodule, JSON-Testdaten, Schemata, Tests und GitHub-Actions-Automatisierung.

### Architekturschichten
1. **Kanonischer Graph:** Knoten und Kanten bilden Entitäten und Beziehungen ab. IDs und Attribute sollen bei unterstützten Import-/Exportvorgängen erhalten bleiben.
2. **Validierung und Datenaustausch:** Strukturprüfung, Wiederherstellung gespeicherter Zustände, Importmodi sowie formatbezogene Tests. CSV unterstützt zitierte Felder, maskierte Anführungszeichen und Zeilenumbrüche innerhalb von Feldern. Der Cypher-Importer verarbeitet nur eine begrenzte, regex-basierte Teilmenge und ist kein vollständiger Cypher-Parser.
3. **Quellen- und Evidenzkorpus:** getrennte Datensätze für Quellen/Werke, Autoren und Herausgeber, Aussagen und Evidenzverknüpfungen. Evidenz kann sich auf Knoten, Kanten, Aussagen oder einen gerichteten Knoten-Kante-Knoten-Pfad beziehen. Quelle, Aussage, Evidenzposition, Quellenzuverlässigkeit und Extraktionssicherheit sind getrennte Konzepte.
4. **Höherstufige Netzwerk-Artefakte:** Versionierte Artefakte gruppieren typisierte Verweise auf Knoten, Kanten, Aussagen, Quellen, Evidenzlinks, Kontexte und andere Artefakte. Artefaktverknüpfungen beschreiben Beziehungen wie enthält, überschneidet sich, kontextualisiert, widerspricht oder hängt ab von. „Neural“ bezeichnet derzeit ein Modellierungskonzept für höherstufige Netzwerke; ein trainiertes neuronales Netz ist noch nicht implementiert.
5. **Tests und Automatisierung:** Node.js-Tests und GitHub Actions prüfen die unterstützten Datenverträge und Testdatensätze.

### Herkunft und Unsicherheit
Die Identität eines kanonischen Objekts muss von seiner Zugehörigkeit zu einem Artefakt getrennt bleiben. Wo passend, sind Herkunft, Version, Ableitungsmethode, Eingabe-Snapshots, zeitlicher und kontextueller Geltungsbereich sowie Evidenzverweise zu speichern. Ähnlichkeit, Relevanz, Kantengewicht, Konfidenz, Quellenzuverlässigkeit, Evidenzposition und Wahrheit dürfen nicht zu einer einzigen Kennzahl verschmolzen werden. Synthetische Testdaten sind keine realen Quellenbelege.

### Implementierungsstand
Im aktuellen Arbeitszweig vorhanden sind Graphvalidierung und Tests, ein kanonisches Archiv mit Importbeispielen, Schema und Beispieldaten für Quellen/Evidenz sowie Entwurf, Schema, Beispieldaten und Integritätstests für Netzwerk-Artefakte. Ein visueller Quelleneditor, ein Artefakt-Explorer, umfassende Quellenaufnahme und tatsächliche neuronale Inferenz/Embedding-Analyse sind noch zukünftige Arbeiten. Vor Aussagen über erfolgreiche Tests des neuesten Commits muss der aktuelle GitHub-Actions-Status geprüft werden.

## Teil B — Erklärung in einfacher Sprache

Nexus ist ein Projekt, das Informationen als miteinander verbundene Bausteine ordnen soll. Ein Knoten steht für eine Sache oder Idee. Eine Kante zeigt, wie zwei Dinge zusammenhängen. Quellen und Belege sollen erklären, woher eine Information stammt. Größere Gruppen verwandter Einträge heißen Artefakte.

Ein Artefakt könnte zum Beispiel einen Bericht, ein Thema, die Verbindung zwischen beiden und Quellen zu dieser Verbindung zusammenfassen. Artefakte können wiederum mit anderen Artefakten verbunden werden. So lassen sich große Informationsmengen erkunden, ohne dieselben Angaben ständig zu kopieren.

Das System wird noch entwickelt. Einige Datenprüfungen, Beispieldatensätze, Schemata und automatische Tests sind vorhanden. Ein vollständiger visueller Editor, automatische Gruppenerkennung und echte Analysen mit neuronalen Netzen sind noch nicht fertig. Als synthetisch gekennzeichnete Beispiele dienen nur der Demonstration und belegen keine realen Tatsachen.

Bei jeder Information sollten drei Fragen getrennt bleiben: Was steht im Datensatz? Welche Quelle stützt es? Wie sicher ist die Interpretation? Widersprüche und Unsicherheit sollen sichtbar bleiben.

## Neuer Schritt zum Laden des Datenbestands

Der Loader liest Graph, Quellen, Aussagen, Beweisverknüpfungen, Artefakte und Artefaktverknüpfungen gemeinsam ein, prüft ihre Referenzen und erstellt Suchindizes. Fehlende Dateien und ungültige Verweise werden gemeldet, statt stillschweigend akzeptiert zu werden. Dies ist eine Funktion zum Laden und Prüfen der Datenkonsistenz, kein neuronales Netz, das Fakten erlernt oder beweist.

Einfach gesagt: Das System kann zusammengehörige Datensätze jetzt auf wiederverwendbare Weise sammeln und prüfen, ob ihre Verknüpfungen auf vorhandene Datensätze zeigen, bevor ein anderer Anwendungsteil sie nutzt. Der Loader ist noch nicht mit der Browseroberfläche verbunden.


## Aktualisierung des Datenladeprogramms

Der Loader führt Graph-, Quellen-, Aussagen-, Beweis- und Artefaktdatensätze zu einem geprüften Datenstand mit Suchindizes zusammen. Fehlende Dateien und ungültige Verweise werden gemeldet. Dies ist eine Funktion zur Datenkonsistenz, kein neuronales Netz zum Lernen oder Beweisen von Fakten; die Browseroberfläche ist noch nicht angebunden.
