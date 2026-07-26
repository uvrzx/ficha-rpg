"""Recorta o fundo das artes dos personagens com matting (U2-Net via rembg).

Flood-fill/chroma-key não serve aqui: mipin e nero são personagens escuros sobre
fundo escuro, e nero/zane têm fundo em gradiente — qualquer limiar de cor ou
vaza pra dentro da roupa ou deixa o fundo. rembg faz segmentação de pessoa e
resolve os quatro casos.

Depois do matting sobra uma franja: o anel de pixels da borda ainda carrega a
cor do fundo original (cinza claro no zane, branco no david). Sobre fundo claro
ela some, mas sobre o fundo escuro da página vira um contorno branco desenhando
a silhueta. `remove_fringe` corta esse anel e recolore o que resta com a cor de
dentro do personagem — só onde a borda é mais clara que o miolo, pra não apagar
brilho que é da arte (a gola prateada do zane, o brilho do casaco).

Rodar só quando novas artes forem adicionadas — o site consome apenas os *-cut.png.

    pip install "rembg[cpu]" scipy
    python tools/cutout.py
"""
import sys

import numpy as np
from PIL import Image, ImageFilter
from rembg import new_session, remove
from scipy.ndimage import distance_transform_edt

SOURCES = [
    ("img/mipin.webp", "img/mipin-cut.png"),
    ("img/nero.webp", "img/nero-cut.png"),
    ("img/ryan.png", "img/ryan-cut.png"),
    ("img/zane.png", "img/zane-cut.png"),
    ("img/david.png", "img/david-cut.png"),
]

ERODE_PX = 1.0      # anel externo descartado
BAND_PX = 2.5       # profundidade que ainda recebe correção de cor
SAMPLE_PX = 4.0     # de onde vem a cor "limpa" de dentro


def remove_fringe(im: Image.Image) -> Image.Image:
    arr = np.asarray(im).astype(np.float32)
    rgb, alpha = arr[:, :, :3], arr[:, :, 3]

    solid = alpha > 140
    if not solid.any():
        return im

    # 1) encolhe o alfa: o anel externo é o mais contaminado pelo fundo
    dist = distance_transform_edt(solid)
    keep = np.clip((dist - ERODE_PX) / 1.2, 0.0, 1.0)
    new_alpha = np.minimum(alpha, keep * 255.0)

    # 2) cor "de dentro": blur premultiplicado ignora o que ficou transparente
    w = (new_alpha / 255.0)[:, :, None]
    prem = Image.fromarray(np.clip(rgb * w, 0, 255).astype(np.uint8), "RGB")
    prem = prem.filter(ImageFilter.GaussianBlur(SAMPLE_PX))
    wimg = Image.fromarray(np.clip(w[:, :, 0] * 255, 0, 255).astype(np.uint8), "L")
    wimg = wimg.filter(ImageFilter.GaussianBlur(SAMPLE_PX))
    inner = np.asarray(prem).astype(np.float32) / (
        np.asarray(wimg).astype(np.float32)[:, :, None] / 255.0 + 1e-3
    )
    inner = np.clip(inner, 0, 255)

    # 3) só corrige onde a borda está MAIS CLARA que o miolo — brilho legítimo
    #    da arte (gola, sheen do casaco) fica intacto
    edge = np.clip((BAND_PX - (dist - ERODE_PX)) / BAND_PX, 0.0, 1.0)
    excess = np.clip((rgb.mean(axis=2) - inner.mean(axis=2)) / 45.0, 0.0, 1.0)
    mix = (edge * excess)[:, :, None]

    out_rgb = rgb * (1 - mix) + inner * mix
    out = np.concatenate([np.clip(out_rgb, 0, 255), new_alpha[:, :, None]], axis=2)
    return Image.fromarray(out.astype(np.uint8), "RGBA")


def run(src: str, dst: str, session) -> None:
    im = Image.open(src).convert("RGBA")
    out = remove(im, session=session, post_process_mask=True)
    out = remove_fringe(out)
    bbox = out.getbbox()
    if bbox:
        out = out.crop(bbox)
    out.save(dst, optimize=True)
    print(f"{dst}: {out.size[0]}x{out.size[1]}")


if __name__ == "__main__":
    session = new_session("u2net")
    for src, dst in SOURCES:
        try:
            run(src, dst, session)
        except Exception as exc:  # noqa: BLE001
            print(f"FALHA {src}: {exc}", file=sys.stderr)
