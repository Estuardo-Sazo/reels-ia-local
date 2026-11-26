# 011 · ¿Cómo se guardan los datos en el disco?

Serie: BASES DE DATOS (interno: clase 2; no se menciona en el video ni en los textos) · Duración: 103.3 s · Videos: `out/011-como-se-guardan-los-datos-youtube-16x9.mp4`, `out/011-como-se-guardan-los-datos-reel-9x16.mp4`

Todo sale del `guion.txt`: no agregar datos que el guion no diga.

## YouTube (16:9)

### Título
```
¿Cómo se guardan los datos en el disco? Páginas, filas y bytes de una base de datos
```

### Descripción
```
Tu tabla de clientes no se guarda como una hoja de cálculo. En el disco, son bytes guardados en páginas.
Hoy abrimos el disco para ver cómo se guardan de verdad tus datos.

En este video:
📌 El motor no escribe tus datos como un texto, línea por línea: divide cada archivo en bloques del mismo tamaño, llamados páginas.
📌 Cuánto mide una página: 8 kilobytes en PostgreSQL, 16 en MySQL y 4 en SQLite.
📌 Por qué páginas: el disco no lee un dato suelto, siempre lee un bloque completo. Si necesitas una sola fila, igual hay que traer la página entera a la memoria.
📌 El disco es mucho más lento que la memoria: lo que más importa es cuántas páginas hay que leer.
📌 Por dentro de una página: un encabezado, una lista que dice dónde empieza cada fila, las filas guardadas desde el final hacia el centro y espacio libre en medio.
📌 Cada fila son solo bytes: un número entero ocupa cuatro, y un texto como "Ana" guarda cuánto mide y luego sus letras.
📌 El motor guarda en memoria las páginas que más usa, para no ir al disco a cada rato.
📌 Dato curioso: cuando borras una fila, muchas veces no desaparece al instante. Se marca como borrada y su espacio se reutiliza después.

Si tienes un millón de clientes repartidos en miles de páginas, ¿cómo encuentra el motor a uno sin leerlas todas? Eso lo vemos en el próximo video: los índices.
Suscríbete para seguir aprendiendo cómo funciona la tecnología por dentro.

#BasesDeDatos #SQL #Programacion
```

### Etiquetas (tags)
```
cómo se guardan los datos, páginas de base de datos, cómo funciona una base de datos por dentro, almacenamiento en disco, base de datos en disco, filas y bytes, tamaño de página, PostgreSQL, MySQL, SQLite, memoria y disco, borrar filas, bases de datos desde cero, aprender bases de datos, SQL, programación, tecnología
```

## Shorts, TikTok, Instagram y Facebook (9:16)

### YouTube Shorts
```
Tu tabla no es un Excel: son páginas de bytes 💾 #Shorts #BasesDeDatos #SQL
```

### TikTok
```
Tu tabla de clientes no se guarda como una hoja de cálculo: en el disco son bytes guardados en páginas 💾 Y cuando borras una fila, muchas veces no desaparece al instante. ¿Lo sabías? #basesdedatos #sql #programacion #aprendeentiktok #tecnologia
```

### Instagram Reels
```
Tu tabla de clientes no se guarda como una hoja de cálculo. En el disco, son bytes guardados en páginas 💾

El motor divide cada archivo en páginas del mismo tamaño, porque el disco siempre lee un bloque completo. Lo que más importa es cuántas páginas hay que leer.

Y un dato curioso: cuando borras una fila, se marca como borrada y su espacio se reutiliza después.

Guárdalo y sígueme para seguir aprendiendo 📌

#basesdedatos #sql #programacion #aprendeaprogramar #tecnologia
```

### Facebook Reels
```
¿Sabías que tu base de datos no guarda las filas como un Excel? Las guarda en páginas de bytes, porque el disco siempre lee bloques completos. Y cuando borras una fila, muchas veces sigue ahí un rato. Hoy abrimos el disco para verlo. #BasesDeDatos #SQL #Programacion
```
