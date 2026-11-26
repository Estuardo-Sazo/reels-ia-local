# 017 · SQL para cambiar datos: INSERT, UPDATE, DELETE (y el WHERE olvidado)

Serie: BASES DE DATOS (interno: clase 7; no se menciona en el video ni en los textos) · Duración: 96.3 s · Videos: `out/017-cambiar-datos-sql-youtube-16x9.mp4`, `out/017-cambiar-datos-sql-reel-9x16.mp4`

Todo sale del `guion.txt`: no agregar datos que el guion no diga.

## YouTube (16:9)

### Título
```
La consulta más peligrosa de SQL: INSERT, UPDATE, DELETE y el WHERE olvidado
```

### Descripción
```
La consulta más peligrosa de SQL no tiene nada raro. Solo le falta una palabra.
Hoy vamos a aprender a cambiar datos, con tres palabras nuevas.

En este video:
📌 INSERT, para agregar filas: INSERT INTO clientes, y entre paréntesis, los valores de la nueva fila.
📌 UPDATE, para modificar filas que ya existen: UPDATE clientes SET ciudad igual a Antigua, WHERE nombre igual a Ana. El WHERE dice a cuáles filas les cambias el dato.
📌 DELETE, para borrar: DELETE FROM clientes WHERE nombre igual a Pedro borra solo a Pedro.

⚠️ La consulta más peligrosa: un UPDATE sin WHERE. El motor no te pregunta nada y cambia la ciudad de todos los clientes. Si tienes un millón, cambia el millón.
⚠️ Con DELETE pasa lo mismo: sin WHERE, borra todas las filas de la tabla.
⚠️ Y no hay botón de deshacer: si el cambio ya se confirmó, es permanente.

Cómo protegerte:
✅ Antes de cambiar o borrar, haz primero un SELECT con el mismo WHERE y revisa cuántas filas salen.
✅ Si puedes, hazlo dentro de una transacción: si algo sale mal, la deshaces antes de confirmar.

En el próximo video vamos a juntar dos tablas en una sola consulta: clientes y compras, juntos.
Suscríbete para seguir aprendiendo cómo funciona la tecnología por dentro.

#SQL #BasesDeDatos #Programacion
```

### Etiquetas (tags)
```
INSERT UPDATE DELETE, SQL para cambiar datos, UPDATE sin WHERE, DELETE sin WHERE, consulta peligrosa SQL, cómo modificar datos en SQL, cómo borrar datos en SQL, agregar filas SQL, transacciones SQL, aprender SQL, SQL desde cero, SQL para principiantes, bases de datos desde cero, programación, tecnología
```

## Shorts, TikTok, Instagram y Facebook (9:16)

### YouTube Shorts
```
La consulta más peligrosa de SQL: le falta una palabra ⚠️ #Shorts #SQL #BasesDeDatos
```

### TikTok
```
La consulta más peligrosa de SQL no tiene nada raro: solo le falta una palabra ⚠️ Un UPDATE sin WHERE cambia todas las filas, y no hay botón de deshacer. ¿Te ha pasado? #sql #basesdedatos #programacion #aprendeentiktok #tecnologia
```

### Instagram Reels
```
La consulta más peligrosa de SQL no tiene nada raro. Solo le falta una palabra ⚠️

INSERT para agregar, UPDATE para modificar y DELETE para borrar. Pero si se te olvida el WHERE, el motor cambia o borra todas las filas, y no hay botón de deshacer.

Antes de cambiar o borrar: un SELECT con el mismo WHERE, y si puedes, una transacción.

Guárdalo y sígueme para seguir aprendiendo 📌

#sql #basesdedatos #programacion #aprendeaprogramar #tecnologia
```

### Facebook Reels
```
¿Sabías que a la consulta más peligrosa de SQL solo le falta una palabra? Un UPDATE o un DELETE sin WHERE cambia o borra todas las filas, sin preguntarte nada. Hoy te explico cómo cambiar datos y cómo protegerte. #SQL #BasesDeDatos #Programacion
```
