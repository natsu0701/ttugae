#!/usr/bin/env python3
"""Render looping alpha overlays for 뜨개내비 (knitting needles + crochet hook)."""

from __future__ import annotations

import math
import shutil
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

W, H = 1920, 1080
SCALE = 1
FPS = 24
SECONDS = 3
FRAMES = FPS * SECONDS

CORAL = (252, 95, 83, 255)
CORAL_DARK = (176, 48, 46, 255)
YARN_HL = (255, 176, 168, 220)
NEEDLE = (248, 244, 238, 255)
NEEDLE_EDGE = (36, 30, 28, 255)
METAL = (214, 210, 204, 255)
WOOD = (196, 132, 92, 255)
WOOD_DARK = (132, 78, 48, 255)
SHADOW = (20, 16, 14, 70)


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def ease(t: float) -> float:
    return 0.5 - 0.5 * math.cos(2 * math.pi * t)


def bezier(p0, p1, p2, p3, t: float):
    u = 1 - t
    return (
        u**3 * p0[0] + 3 * u**2 * t * p1[0] + 3 * u * t**2 * p2[0] + t**3 * p3[0],
        u**3 * p0[1] + 3 * u**2 * t * p1[1] + 3 * u * t**2 * p2[1] + t**3 * p3[1],
    )


def rotated(px, py, ox, oy, angle: float):
    c, s = math.cos(angle), math.sin(angle)
    dx, dy = px - ox, py - oy
    return ox + dx * c - dy * s, oy + dx * s + dy * c


def line_poly(x0, y0, x1, y1, width: float):
    ang = math.atan2(y1 - y0, x1 - x0)
    nx, ny = math.cos(ang + math.pi / 2) * width / 2, math.sin(ang + math.pi / 2) * width / 2
    return [
        (x0 + nx, y0 + ny),
        (x1 + nx, y1 + ny),
        (x1 - nx, y1 - ny),
        (x0 - nx, y0 - ny),
    ]


def draw_shadow_poly(img: Image.Image, pts, blur=18, offset=(14, 18)):
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    shifted = [(p[0] + offset[0], p[1] + offset[1]) for p in pts]
    d.polygon(shifted, fill=SHADOW)
    img.alpha_composite(layer.filter(ImageFilter.GaussianBlur(blur)))


def draw_poly(img: Image.Image, pts, fill, outline=None, width=6):
    d = ImageDraw.Draw(img)
    d.polygon(pts, fill=fill, outline=outline)
    if outline and width > 1:
        d.line(pts + [pts[0]], fill=outline, width=width, joint="curve")


def draw_capsule(img: Image.Image, x0, y0, x1, y1, width, fill, outline, stroke=7):
    pts = line_poly(x0, y0, x1, y1, width)
    draw_shadow_poly(img, pts)
    draw_poly(img, pts, fill, outline, stroke)
    d = ImageDraw.Draw(img)
    r = width / 2
    d.ellipse((x0 - r, y0 - r, x0 + r, y0 + r), fill=fill, outline=outline, width=stroke)
    d.ellipse((x1 - r, y1 - r, x1 + r, y1 + r), fill=fill, outline=outline, width=stroke)


def resample_path(points, spacing: float):
    if len(points) < 2:
        return list(points)
    out = [points[0]]
    carry = 0.0
    for i in range(1, len(points)):
        x0, y0 = points[i - 1]
        x1, y1 = points[i]
        dx, dy = x1 - x0, y1 - y0
        dist = math.hypot(dx, dy)
        if dist == 0:
            continue
        pos = spacing - carry
        while pos <= dist:
            t = pos / dist
            out.append((x0 + dx * t, y0 + dy * t))
            pos += spacing
        carry = dist - (pos - spacing)
    if out[-1] != points[-1]:
        out.append(points[-1])
    return out


def draw_yarn(img: Image.Image, points, thickness=22):
    pts = resample_path(points, max(2.0, thickness * 0.28))
    shadow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    body = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ds, db = ImageDraw.Draw(shadow), ImageDraw.Draw(body)
    r = thickness / 2
    ds.line(pts, fill=SHADOW, width=int(thickness + 8), joint="curve")
    db.line(pts, fill=CORAL_DARK, width=int(thickness), joint="curve")
    db.line(pts, fill=CORAL, width=int(thickness * 0.78), joint="curve")
    for x, y in pts[::3]:
        ds.ellipse((x - r + 8, y - r + 10, x + r + 8, y + r + 10), fill=SHADOW)
        db.ellipse((x - r, y - r, x + r, y + r), fill=CORAL_DARK)
        inner = r * 0.7
        db.ellipse((x - inner, y - inner - 2, x + inner, y + inner - 2), fill=CORAL)
    img.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(8)))
    img.alpha_composite(body)


def draw_straight_needle(img: Image.Image, base, tip, width=32):
    ang = math.atan2(tip[1] - base[1], tip[0] - base[0])
    ux, uy = math.cos(ang), math.sin(ang)
    nx, ny = -uy, ux
    knob = (base[0] + ux * 70, base[1] + uy * 70)
    taper = (tip[0] - ux * 120, tip[1] - uy * 120)
    draw_capsule(img, base[0], base[1], knob[0], knob[1], width + 10, WOOD, WOOD_DARK, 7)
    draw_capsule(img, knob[0], knob[1], taper[0], taper[1], width, NEEDLE, NEEDLE_EDGE, 6)
    w = width * 0.28
    pts = [
        (tip[0], tip[1]),
        (taper[0] + nx * w, taper[1] + ny * w),
        (taper[0] - nx * w, taper[1] - ny * w),
    ]
    draw_shadow_poly(img, pts, blur=12, offset=(10, 12))
    draw_poly(img, pts, NEEDLE, NEEDLE_EDGE, 5)
    return ang, ux, uy, nx, ny


def stitch_loop(center, nx, ny, ux, uy, rx, ry, phase=0.0):
    pts = []
    for i in range(28):
        a = i / 27 * 2 * math.pi + phase
        pts.append(
            (
                center[0] + nx * math.cos(a) * rx + ux * math.sin(a) * 6,
                center[1] + ny * math.cos(a) * rx + uy * math.sin(a) * ry,
            )
        )
    return pts


def knitting_frame(t: float) -> Image.Image:
    img = Image.new("RGBA", (W * SCALE, H * SCALE), (0, 0, 0, 0))
    sway = math.sin(2 * math.pi * t) * 0.05
    insert = 0.5 - 0.5 * math.cos(2 * math.pi * t)
    cx, cy = 960 * SCALE, 580 * SCALE

    left_base = rotated(400 * SCALE, 1020 * SCALE, cx, cy, sway)
    left_tip = rotated(860 * SCALE, 210 * SCALE, cx, cy, sway)
    right_base = rotated(1520 * SCALE, 1020 * SCALE, cx, cy, -sway)
    right_tip = rotated(
        1060 * SCALE - 70 * insert * SCALE / 2,
        230 * SCALE + 90 * insert,
        cx,
        cy,
        -sway,
    )
    lang, lux, luy, lnx, lny = draw_straight_needle(img, left_base, left_tip, 30)
    rang, rux, ruy, rnx, rny = draw_straight_needle(img, right_base, right_tip, 30)

    for i in range(7):
        along = 160 + i * 70
        c = (left_tip[0] - lux * along, left_tip[1] - luy * along)
        draw_yarn(img, stitch_loop(c, lnx, lny, lux, luy, 42, 26, t * 2 + i), 22)
    for i in range(5):
        along = 180 + i * 72
        c = (right_tip[0] - rux * along, right_tip[1] - ruy * along)
        draw_yarn(img, stitch_loop(c, rnx, rny, rux, ruy, 40, 24, -t * 2 + i), 22)

    working = (left_tip[0] + 18, left_tip[1] + 10)
    wrap = (
        (left_tip[0] + right_tip[0]) / 2,
        (left_tip[1] + right_tip[1]) / 2 + 90 + 40 * math.sin(2 * math.pi * t),
    )
    p0 = working
    p3 = (right_tip[0] - 8, right_tip[1] + 12)
    p1 = (wrap[0] - 180, wrap[1] + 120)
    p2 = (wrap[0] + 160, wrap[1] + 40)
    draw_yarn(img, [bezier(p0, p1, p2, p3, i / 69) for i in range(70)], 22)
    draw_yarn(
        img,
        [
            (
                lerp(working[0], 240 * SCALE, u),
                lerp(working[1], 640 * SCALE + 30 * math.sin(u * 8 + t * 5), u),
            )
            for u in (i / 49 for i in range(50))
        ],
        22,
    )
    return img.resize((W, H), Image.Resampling.LANCZOS)


def crochet_frame(t: float) -> Image.Image:
    img = Image.new("RGBA", (W * SCALE, H * SCALE), (0, 0, 0, 0))
    dip = math.sin(2 * math.pi * t) * 28
    twist = math.sin(2 * math.pi * t) * 0.1
    cx, cy = 1000 * SCALE, 560 * SCALE
    base = rotated(1320 * SCALE, 1000 * SCALE, cx, cy, twist)
    tip = rotated(780 * SCALE, 250 * SCALE + dip, cx, cy, twist)
    ang = math.atan2(tip[1] - base[1], tip[0] - base[0])
    ux, uy = math.cos(ang), math.sin(ang)
    nx, ny = -uy, ux

    handle_end = (base[0] + ux * 420, base[1] + uy * 420)
    throat = (tip[0] - ux * 70, tip[1] - uy * 70)
    draw_capsule(img, base[0], base[1], handle_end[0], handle_end[1], 64, WOOD, WOOD_DARK, 8)
    draw_capsule(img, handle_end[0], handle_end[1], throat[0], throat[1], 28, NEEDLE, NEEDLE_EDGE, 6)

    hook = []
    for i in range(20):
        a = ang - math.pi / 2 + i / 19 * math.pi * 1.35
        hook.append((tip[0] + math.cos(a) * 46 - ux * 6, tip[1] + math.sin(a) * 46 - uy * 6))
    hook_img = Image.new("RGBA", img.size, (0, 0, 0, 0))
    hd = ImageDraw.Draw(hook_img)
    hd.line([(throat[0], throat[1]), hook[0]], fill=NEEDLE_EDGE, width=22, joint="curve")
    hd.line(hook, fill=NEEDLE_EDGE, width=22, joint="curve")
    hd.line([(throat[0], throat[1]), hook[0]], fill=NEEDLE, width=12, joint="curve")
    hd.line(hook, fill=NEEDLE, width=12, joint="curve")
    img.alpha_composite(hook_img)

    for loop_i in range(6):
        along = 90 + loop_i * 78 + 14 * math.sin(2 * math.pi * t + loop_i * 0.7)
        center = (throat[0] - ux * along, throat[1] - uy * along)
        draw_yarn(img, stitch_loop(center, nx, ny, ux, uy, 46, 22, t * 3 + loop_i), 22)
    hook_loop = (tip[0] + nx * 8 - ux * 8, tip[1] + ny * 8 - uy * 8)
    draw_yarn(img, stitch_loop(hook_loop, nx, ny, ux, uy, 38 + 10 * math.sin(2 * math.pi * t), 20, t), 22)
    p0 = (tip[0] + nx * 36, tip[1] + ny * 36)
    p3 = (360 * SCALE, 820 * SCALE)
    p1 = (tip[0] - 280 * SCALE, tip[1] + 220 * SCALE)
    p2 = (520 * SCALE, 480 * SCALE + 70 * math.sin(2 * math.pi * t))
    draw_yarn(img, [bezier(p0, p1, p2, p3, i / 89) for i in range(90)], 22)
    return img.resize((W, H), Image.Resampling.LANCZOS)


def encode(prefix: str, out_stem: str, tmp: Path, dest: Path):
    webm = dest / f"{out_stem}.webm"
    webp = dest / f"{out_stem}.webp"
    pattern = str(tmp / f"{prefix}_%03d.png")
    subprocess.check_call(
        [
            "ffmpeg", "-y", "-framerate", str(FPS), "-i", pattern,
            "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-auto-alt-ref", "0",
            "-b:v", "0", "-crf", "34", "-an", str(webm),
        ]
    )
    subprocess.check_call(
        [
            "ffmpeg", "-y", "-framerate", str(FPS), "-i", pattern,
            "-c:v", "libwebp_anim", "-loop", "0", "-lossless", "0", "-q:v", "78",
            "-an", str(webp),
        ]
    )


def main():
    root = Path(__file__).resolve().parents[1]
    dest = root / "public" / "overlays"
    dest.mkdir(parents=True, exist_ok=True)
    tmp = Path("/tmp/ar-navi-frames")
    if tmp.exists():
        shutil.rmtree(tmp)
    tmp.mkdir()

    for i in range(FRAMES):
        t = i / FRAMES
        knitting_frame(t).save(tmp / f"knit_{i:03d}.png")
        crochet_frame(t).save(tmp / f"crochet_{i:03d}.png")
        if i % 24 == 0:
            print(f"frame {i}/{FRAMES}")

    knitting_frame(0).save("/tmp/ar-navi-knit-preview.png")
    crochet_frame(0).save("/tmp/ar-navi-crochet-preview.png")
    encode("knit", "knitting-needles", tmp, dest)
    encode("crochet", "crochet-hook", tmp, dest)
    shutil.rmtree(tmp)
    print("done")


if __name__ == "__main__":
    main()
