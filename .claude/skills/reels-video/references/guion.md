# Cómo escribir el guion

## Formato

- Archivo `episodes/NNN-tema/guion.txt`, UTF-8, **una frase (o dos muy cortas) por línea**. Cada línea es una escena y un archivo de voz en `lines/NN.wav`.
- Líneas vacías se ignoran.
- Duración: ~2,5 palabras por segundo con `--tempo 1.1`. 60 s ≈ 150 palabras ≈ 12–15 líneas.

## Estructura que funciona

1. **Gancho** (línea 1): una afirmación que sorprende o una pregunta. "Una sola actualización apagó ocho millones y medio de computadoras en un solo día."
2. **Contexto** (2–3 líneas): qué pasó / qué es.
3. **Desarrollo** (5–10 líneas): cómo funciona, por pasos, con un ejemplo concreto.
4. **Lección** (2–3 líneas): qué hacer con esto.
5. **Cierre** (1–2 líneas): adelanto del próximo video y llamado a seguir.

Mira los guiones en `examples/*/guion.txt` para el tono.

## Estilo

- Español neutro latinoamericano, tuteo, cercano y directo.
- Frases cortas. Evita subordinadas largas: el clon de voz pierde entonación.
- **Números en palabras**: "dos mil veinticuatro", "diecinueve por ciento". Evita cifras largas seguidas ("una vez cada doce meses, y hasta tres veces en total" sonó robótico; "una vez al año, y máximo tres veces" no).
- Evita `:` antes de listas de nombres; usa "son …".
- Cada dato del guion debe ser verdadero. Si no estás seguro, investiga o pregunta.

## Pronunciación (marcas)

La voz lee el texto entre llaves; el subtítulo muestra el de fuera:

| Escribes | Subtítulo | La voz dice |
|---|---|---|
| `SQL{ese cu ele}` | SQL | ese cu ele |
| `[Stack Overflow]{stac overflou}` | Stack Overflow | stac overflou |
| `Qwen3-TTS{kuen tres te te ese}` | Qwen3-TTS | kuen tres te te ese |

Una palabra: `PALABRA{pronunciación}` (sin espacio antes de `{`). Varias: `[dos palabras]{pronunciación}`.

Escribe la pronunciación como la leería un hispanohablante. Ejemplos que funcionaron con un clon en español:

`GitHub{guít jab}` · `YouTube{yutub}` · `Gmail{yimeil}` · `Drive{draiv}` · `[Google Cloud]{gugol claud}` · `MySQL{maisícuel}` · `SQLite{sícuelait}` · `PostgreSQL{póstgres}` · `[SQL Server]{sícuel server}` · `INSERT{insért}` · `UPDATE{ápdeit}` · `DELETE{dilít}` · `WHERE{güer}` · `SELECT{seléct}` · `Whisper{guisper}` · `RSA{erre ese a}` · `[M1 Max]{eme uno max}` · `[@gmail.com]{arroba yimeil punto com}`

Trucos:

- Separar sílabas o poner tilde cambia mucho (`guít jab` sonó mejor que `guitjab`).
- **Una palabra en inglés al final de la oración** suele salir arrastrada y cayendo de tono. Reordena para que no cierre la frase: "son bytes{baits} guardados en páginas" en vez de "páginas llenas de bytes{baits}".
- Si una frase sigue mal: `uv run tomas.py <guion> <carpeta> N --tomas 3` y que el usuario elija de oído (el medidor automático no siempre coincide con el oído).
- El usuario puede preferir grabar él mismo una palabra difícil: ofrece esa opción si el clon no mejora.
