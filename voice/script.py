"""Lectura de guiones con marcas de pronunciación.

En el guion, `ML-KEM{eme ele kem}` se muestra como "ML-KEM" en los subtítulos y la voz
lee "eme ele kem". Para varias palabras: `[Stack Overflow]{stac overflou}`. Sirve para
siglas y nombres que el modelo de voz pronuncia mal.
"""
import re
from pathlib import Path

MARK = re.compile(r"\[([^\]]+)\]\{([^}]+)\}|([^\s\[]+?)\{([^}]+)\}")


def lines(path: str) -> list[str]:
    return [l.strip() for l in Path(path).read_text(encoding="utf-8").splitlines() if l.strip()]


def spoken(text: str) -> str:
    return MARK.sub(lambda m: m.group(2) or m.group(4), text)


def display(text: str) -> str:
    return MARK.sub(lambda m: m.group(1) or m.group(3), text)
