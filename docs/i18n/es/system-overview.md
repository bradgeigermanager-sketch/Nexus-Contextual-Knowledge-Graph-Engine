# Documentación del sistema — español

## Parte A — Descripción técnica

### Objetivo y alcance
Nexus Contextual Knowledge Graph Engine es un entorno en desarrollo, centrado en grafos, para representar entidades y relaciones, conservar el contexto de fuentes y evidencias, validar datos de grafos importados y conectar áreas amplias de conocimiento mediante artefactos de nivel superior. El repositorio contiene actualmente una aplicación HTML/React de un solo archivo, módulos de validación JavaScript, ejemplos JSON, esquemas, pruebas y automatización con GitHub Actions.

### Capas principales
1. **Grafo canónico:** los nodos y las aristas representan entidades y relaciones. Se deben conservar los identificadores y atributos durante las operaciones de importación/exportación compatibles.
2. **Validación e intercambio de datos:** validación estructural, recuperación del estado guardado, modos de importación y pruebas por formato. CSV admite campos entre comillas, comillas escapadas y saltos de línea dentro de los campos. El importador Cypher solo admite un subconjunto limitado basado en expresiones regulares; no es un analizador Cypher completo.
3. **Corpus de referencias y evidencias:** registros separados para fuentes/obras, autores/editoriales, afirmaciones y enlaces de evidencia. La evidencia puede apuntar a un nodo, una arista, una afirmación o una ruta dirigida nodo–arista–nodo. La fuente, la afirmación, la postura de la evidencia, la fiabilidad de la fuente y la confianza de extracción son conceptos distintos.
4. **Capa de artefactos de red de nivel superior:** los artefactos versionados agrupan referencias tipadas a nodos, aristas, afirmaciones, fuentes, enlaces de evidencia, contextos y otros artefactos. Los enlaces entre artefactos expresan relaciones como contiene, se solapa, contextualiza, contradice o depende de. Actualmente, «neuronal» describe un concepto de modelado de redes de nivel superior; no significa que ya exista una red neuronal entrenada.
5. **Pruebas y automatización:** las pruebas de Node.js y GitHub Actions verifican los contratos de datos y ejemplos compatibles.

### Procedencia e incertidumbre
La identidad de un objeto canónico debe distinguirse de su pertenencia a un artefacto. Cuando corresponda, registre procedencia, versión, método de derivación, instantáneas de entrada, alcance temporal/contextual y referencias a evidencias. La similitud, relevancia, peso de arista, confianza, fiabilidad de fuente, postura de evidencia y verdad factual no deben combinarse en una sola puntuación. Los datos de prueba sintéticos no son citas reales.

### Estado actual de implementación
La rama de trabajo contiene validación del grafo y pruebas, archivo canónico y ejemplos de importación, esquema y ejemplos sintéticos del corpus de referencias/evidencias, además del diseño, esquema, ejemplos y pruebas de integridad de la capa de artefactos. El editor visual de referencias, el explorador de artefactos, la ingestión amplia de fuentes y la inferencia neuronal/los embeddings reales siguen pendientes. Compruebe el estado actual de GitHub Actions antes de afirmar que la última confirmación supera las pruebas.

## Parte B — Guía en lenguaje sencillo

Nexus es un proyecto para organizar información como piezas conectadas. Un nodo representa una cosa o una idea; una arista muestra la relación entre dos elementos. Las fuentes y evidencias ayudan a explicar de dónde procede la información. Los grupos grandes de elementos relacionados se llaman artefactos.

Por ejemplo, un artefacto puede agrupar un informe, un tema, la relación entre ambos y las fuentes que hablan de esa relación. Los artefactos también pueden conectarse entre sí. Así es posible explorar mucha información sin copiar los mismos datos una y otra vez.

El sistema todavía está en desarrollo. Ya existen algunas comprobaciones de datos, ejemplos, esquemas y pruebas automáticas. El editor visual completo, el descubrimiento automático de grupos y el análisis con una red neuronal real aún no están terminados. Los ejemplos marcados como sintéticos son demostraciones, no pruebas de hechos reales.

Para cada información, separe tres preguntas: ¿qué dice el registro?, ¿qué fuente lo respalda? y ¿cuánta confianza merece la interpretación? Las discrepancias y la incertidumbre deben mantenerse visibles.