# Pravi crteže ulice za početni ekran (src/assets/scene/shops.svg i city.svg).
# Pokretanje: python3 scripts/hero-ulica.py src/assets/scene
"""Pravi SVG fajlove za ulicu na početnom ekranu: niz radnji (shops.svg) i daleki grad (city.svg)."""
import sys, os

out = sys.argv[1]
os.makedirs(out, exist_ok=True)

RED, RED_D, BLUE, NAVY = '#e3131c', '#b80d14', '#1446b8', '#0a2668'
FONT = "font-family='Arial, Helvetica, sans-serif' font-weight='800'"
W, H = 2400, 600  # jedan krug niza; ponavlja se vodoravno
GROUND = 400       # vrh prizemlja (radnje), ispod su izlozi

parts = []
add = parts.append


def windows(x0, w, top, bottom, frame, glass, cols, balcony=False):
    rows = max(1, int((bottom - top) // 95))
    gx = (w - 60) / cols
    for r in range(rows):
        y = top + 22 + r * 95
        for c in range(cols):
            x = x0 + 30 + c * gx + (gx - 52) / 2
            add(f"<rect x='{x - 4:.0f}' y='{y - 4}' width='60' height='76' rx='4' fill='{frame}'/>")
            add(f"<rect x='{x:.0f}' y='{y}' width='52' height='68' rx='2' fill='{glass}'/>")
            # odsjaj i krstić prozora
            add(f"<path d='M{x + 26:.0f} {y} V{y + 68} M{x:.0f} {y + 30} H{x + 52:.0f}' stroke='{frame}' stroke-width='4'/>")
            add(f"<path d='M{x + 6:.0f} {y + 60} L{x + 20:.0f} {y + 6}' stroke='#fff' stroke-opacity='.35' stroke-width='5' stroke-linecap='round'/>")
            if balcony and r == rows - 1 and c % 2 == 0:
                add(f"<rect x='{x - 10:.0f}' y='{y + 66}' width='72' height='8' fill='{frame}'/>")
                for i in range(6):
                    add(f"<rect x='{x - 6 + i * 12:.0f}' y='{y + 46}' width='3' height='22' fill='{frame}'/>")
                add(f"<rect x='{x - 10:.0f}' y='{y + 44}' width='72' height='4' fill='{frame}'/>")
                # saksije sa cvećem
                add(f"<rect x='{x + 4:.0f}' y='{y + 36}' width='44' height='10' rx='3' fill='#b5562f'/>")
                for i in range(5):
                    add(f"<circle cx='{x + 8 + i * 9:.0f}' cy='{y + 33}' r='5' fill='{['#e3131c', '#ff6b8a', '#3fae5a'][i % 3]}'/>")


def awning(x0, x1, y, color, stripe='#fff'):
    w = x1 - x0
    n = int(w // 28)
    sw = w / n
    add(f"<path d='M{x0} {y} H{x1} L{x1 + 10} {y + 38} H{x0 - 10} Z' fill='{color}'/>")
    for i in range(0, n, 2):
        a = x0 + i * sw
        add(f"<path d='M{a:.1f} {y} H{a + sw:.1f} L{a + sw + 10 * (2 * (i + 1) / n - 1):.1f} {y + 38} H{a + 10 * (2 * i / n - 1):.1f} Z' fill='{stripe}' fill-opacity='.9'/>")
    # nazubljena ivica
    d = f"M{x0 - 10} {y + 38}"
    for i in range(n):
        a = x0 - 10 + i * (w + 20) / n
        d += f" q{(w + 20) / n / 2:.1f} 16 {(w + 20) / n:.1f} 0"
    add(f"<path d='{d}' fill='{color}'/>")
    add(f"<path d='M{x0 - 10} {y + 38} H{x1 + 10}' stroke='#000' stroke-opacity='.12' stroke-width='3'/>")


def storefront(x0, w, sign, sign_bg, aw, items, door='#28334f'):
    # natpis
    add(f"<rect x='{x0 + 24}' y='{GROUND + 6}' width='{w - 48}' height='42' rx='6' fill='{sign_bg}'/>")
    add(f"<text x='{x0 + w / 2}' y='{GROUND + 36}' text-anchor='middle' font-size='26' fill='#fff' {FONT} letter-spacing='2'>{sign}</text>")
    awning(x0 + 18, x0 + w - 18, GROUND + 52, aw)
    # izlog
    wx, wy, ww, wh = x0 + 26, GROUND + 104, w - 150, H - GROUND - 112
    add(f"<rect x='{wx - 6}' y='{wy - 6}' width='{ww + 12}' height='{wh + 6}' rx='4' fill='{door}'/>")
    add(f"<rect x='{wx}' y='{wy}' width='{ww}' height='{wh}' fill='#cfe0fb'/>")
    add(f"<rect x='{wx}' y='{wy + wh - 22}' width='{ww}' height='22' fill='#a9c3ee'/>")
    items(wx, wy, ww, wh)
    add(f"<path d='M{wx + 12} {wy + wh - 30} L{wx + 52} {wy + 8}' stroke='#fff' stroke-opacity='.5' stroke-width='8' stroke-linecap='round'/>")
    # vrata
    dx = x0 + w - 104
    add(f"<rect x='{dx - 6}' y='{GROUND + 98}' width='82' height='{H - GROUND - 98}' rx='4' fill='{door}'/>")
    add(f"<rect x='{dx + 4}' y='{GROUND + 108}' width='62' height='{H - GROUND - 128}' rx='2' fill='#9fbcf0'/>")
    add(f"<circle cx='{dx + 58}' cy='{GROUND + 150}' r='4' fill='#ffd166'/>")
    add(f"<rect x='{dx + 12}' y='{GROUND + 118}' width='46' height='18' rx='3' fill='#fff'/>")
    add(f"<text x='{dx + 35}' y='{GROUND + 131}' text-anchor='middle' font-size='8.5' fill='{RED}' {FONT}>OTVORENO</text>")
    # prag
    add(f"<rect x='{x0}' y='{H - 8}' width='{w}' height='8' fill='#000' fill-opacity='.12'/>")


# ---------- šta je u izlozima ----------
def pizza(x, y, w, h):
    for i, cx in enumerate([x + w * 0.25, x + w * 0.62]):
        cy = y + h - 34
        add(f"<ellipse cx='{cx:.0f}' cy='{cy}' rx='44' ry='14' fill='#c58a4a'/>")
        add(f"<ellipse cx='{cx:.0f}' cy='{cy - 4}' rx='40' ry='11' fill='#ffd166'/>")
        for dx, dy in [(-18, -4), (6, -8), (20, 0), (-4, 2)]:
            add(f"<ellipse cx='{cx + dx:.0f}' cy='{cy - 4 + dy}' rx='6' ry='3' fill='{RED}'/>")
    # kutije za picu
    for i in range(3):
        add(f"<rect x='{x + w - 78}' y='{y + h - 30 - i * 14}' width='66' height='12' fill='#d9a066' stroke='#b9824a' stroke-width='2'/>")
    add(f"<circle cx='{x + w * 0.44:.0f}' cy='{y + 34}' r='22' fill='{RED}'/>")
    add(f"<text x='{x + w * 0.44:.0f}' y='{y + 42}' text-anchor='middle' font-size='22' fill='#fff' {FONT}>%</text>")


def pharmacy(x, y, w, h):
    for i in range(4):
        for j in range(3):
            bx, by = x + 16 + i * 52, y + 20 + j * 42
            add(f"<rect x='{bx}' y='{by}' width='40' height='30' rx='4' fill='{['#fff', '#dbe5fb', '#ffe1e1'][(i + j) % 3]}' stroke='{BLUE}' stroke-opacity='.4' stroke-width='2'/>")
            add(f"<path d='M{bx + 20} {by + 8} V{by + 22} M{bx + 13} {by + 15} H{bx + 27}' stroke='{RED}' stroke-width='4'/>")
    add(f"<rect x='{x}' y='{y + 62}' width='{w}' height='4' fill='{NAVY}' fill-opacity='.25'/>")
    add(f"<rect x='{x}' y='{y + 104}' width='{w}' height='4' fill='{NAVY}' fill-opacity='.25'/>")


def flowers(x, y, w, h):
    colors = [RED, '#ff6b8a', '#ffd166', '#ff3d6e', '#ffffff', '#c86bff']
    for i in range(5):
        cx = x + 28 + i * (w - 56) / 4
        add(f"<path d='M{cx - 16:.0f} {y + h - 22} L{cx - 12:.0f} {y + h - 56} H{cx + 12:.0f} L{cx + 16:.0f} {y + h - 22} Z' fill='{['#b5562f', BLUE, '#3a6ee0'][i % 3]}'/>")
        for k in range(5):
            fx = cx - 14 + (k % 3) * 14
            fy = y + h - 74 - (k // 3) * 16 - (i % 2) * 8
            add(f"<path d='M{cx:.0f} {y + h - 56} L{fx:.0f} {fy}' stroke='#3fae5a' stroke-width='3'/>")
            add(f"<circle cx='{fx:.0f}' cy='{fy}' r='9' fill='{colors[(i + k) % len(colors)]}'/>")
            add(f"<circle cx='{fx:.0f}' cy='{fy}' r='3' fill='#ffd166'/>")


def cakes(x, y, w, h):
    # vitrina sa policama
    add(f"<rect x='{x}' y='{y + 66}' width='{w}' height='5' fill='#fff' fill-opacity='.8'/>")
    for i, (cx, top) in enumerate([(x + 50, y + 66), (x + 130, y + 66), (x + 70, y + h - 22), (x + 160, y + h - 22)]):
        add(f"<rect x='{cx - 28}' y='{top - 34}' width='56' height='34' rx='5' fill='{['#ff6b8a', '#7a3b1e', '#fff', '#ffd166'][i]}'/>")
        add(f"<path d='M{cx - 28} {top - 26} q7 8 14 0 t14 0 t14 0 t14 0 V{top - 34} H{cx - 28} Z' fill='#fff'/>")
        add(f"<circle cx='{cx}' cy='{top - 40}' r='6' fill='{RED}'/>")
        add(f"<rect x='{cx - 34}' y='{top}' width='68' height='4' rx='2' fill='#dfe7f7'/>")


def market(x, y, w, h):
    for i in range(3):
        bx = x + 14 + i * (w - 28) / 3
        bw = (w - 28) / 3 - 10
        add(f"<rect x='{bx:.0f}' y='{y + h - 46}' width='{bw:.0f}' height='24' fill='#c08850'/>")
        add(f"<path d='M{bx:.0f} {y + h - 34} H{bx + bw:.0f}' stroke='#8a5a2b' stroke-width='3'/>")
        fruit = ['#e3131c', '#ffb02e', '#3fae5a'][i]
        for k in range(5):
            add(f"<circle cx='{bx + 10 + k * (bw - 20) / 4:.0f}' cy='{y + h - 50 - (k % 2) * 8}' r='10' fill='{fruit}'/>")
    for i in range(6):
        add(f"<rect x='{x + 18 + i * 34}' y='{y + 22}' width='22' height='48' rx='5' fill='{['#fff', BLUE, RED][i % 3]}'/>")
        add(f"<rect x='{x + 24 + i * 34}' y='{y + 14}' width='10' height='10' rx='2' fill='{NAVY}'/>")


def depot(x, y, w, h):
    # paketi i fascikle sa dokumentima
    stack = [(0, 0, 70, 46), (74, 0, 58, 40), (12, -46, 52, 40), (80, -40, 44, 34), (30, -86, 46, 34)]
    for dx, dy, bw, bh in stack:
        bx, by = x + 20 + dx, y + h - 22 - bh + dy
        add(f"<rect x='{bx}' y='{by}' width='{bw}' height='{bh}' rx='3' fill='#d9a066' stroke='#b9824a' stroke-width='2'/>")
        add(f"<rect x='{bx + bw / 2 - 5:.0f}' y='{by}' width='10' height='{bh}' fill='{RED}' fill-opacity='.85'/>")
    for i in range(3):
        add(f"<rect x='{x + w - 66 + i * 6}' y='{y + h - 92 + i * 6}' width='44' height='58' rx='3' fill='{['#fff', '#dbe5fb', '#fff'][i]}' stroke='{BLUE}' stroke-width='2'/>")
    for k in range(3):
        add(f"<path d='M{x + w - 46} {y + h - 70 + k * 10} H{x + w - 18}' stroke='{BLUE}' stroke-width='2.5'/>")


# ---------- zgrade ----------
BUILDINGS = [
    # širina, visina zgrade, fasada, okvir prozora, staklo, kolone, balkon, natpis, boja natpisa, tenda, izlog
    (400, 560, '#f4f1ea', '#c9c2b2', '#8fb0e8', 3, True, 'PICERIJA', RED, RED, pizza),
    (380, 470, '#dbe5fb', '#9fb3dc', '#6f95dc', 3, False, 'APOTEKA', '#1f9d55', '#1f9d55', pharmacy),
    (400, 520, '#ffffff', '#d3d9e6', '#8fb0e8', 3, True, 'CVEĆARA', '#d6246e', '#ff6b8a', flowers),
    (420, 590, '#f2d9cf', '#c9a597', '#7fa2e0', 3, True, 'TORTE I KOLAČI', '#7a3b1e', '#ff6b8a', cakes),
    (380, 480, '#e9eef8', '#aab8d4', '#7fa2e0', 3, False, 'MARKET', BLUE, BLUE, market),
    (420, 540, '#ffffff', '#c9d3e8', '#8fb0e8', 3, True, 'BEEP BEEP DOSTAVA', RED, RED, depot),
]

add(f"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 {W} {H}' width='{W}' height='{H}'>")
x = 0
for bw, bh, facade, frame, glass, cols, balcony, sign, sign_bg, aw, items in BUILDINGS:
    top = H - bh
    add(f"<rect x='{x}' y='{top}' width='{bw}' height='{bh}' fill='{facade}'/>")
    # krov i venac
    add(f"<rect x='{x - 6}' y='{top - 14}' width='{bw + 12}' height='18' rx='3' fill='{frame}'/>")
    add(f"<rect x='{x}' y='{top + 4}' width='{bw}' height='8' fill='#000' fill-opacity='.06'/>")
    # dimnjak / antena
    add(f"<rect x='{x + bw - 80}' y='{top - 44}' width='26' height='32' fill='{frame}'/>")
    add(f"<path d='M{x + 70} {top - 14} V{top - 60} M{x + 56} {top - 50} H{x + 84}' stroke='{frame}' stroke-width='4'/>")
    # sprat
    windows(x, bw, top + 20, GROUND - 20, frame, glass, cols, balcony)
    add(f"<rect x='{x}' y='{GROUND - 6}' width='{bw}' height='10' fill='{frame}'/>")
    storefront(x, bw, sign, sign_bg, aw, items)
    # senka između zgrada
    add(f"<rect x='{x + bw - 6}' y='{top}' width='6' height='{bh}' fill='#000' fill-opacity='.08'/>")
    x += bw

# ulične svetiljke između nekih zgrada
for lx in [400, 1180, 1980]:
    add(f"<rect x='{lx - 4}' y='{H - 330}' width='8' height='330' fill='{NAVY}'/>")
    add(f"<path d='M{lx} {H - 326} q0 -30 36 -30' stroke='{NAVY}' stroke-width='7' fill='none'/>")
    add(f"<path d='M{lx + 22} {H - 356} h30 l-6 18 h-18 z' fill='{NAVY}'/>")
    add(f"<ellipse cx='{lx + 37}' cy='{H - 336}' rx='9' ry='4' fill='#fff3b0'/>")
    add(f"<rect x='{lx - 10}' y='{H - 24}' width='20' height='24' rx='3' fill='{NAVY}'/>")
add('</svg>')
assert x == W, x
open(os.path.join(out, 'shops.svg'), 'w').write(''.join(parts))

# ---------- daleki grad (jedna boja, providno u sceni) ----------
CW, CH = 2400, 320
c = [f"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 {CW} {CH}' width='{CW}' height='{CH}'><g fill='#fff'>"]
import random
random.seed(7)
x = 0
while x < CW:
    w = random.choice([90, 120, 150, 180])
    h = random.randint(110, 260)
    c.append(f"<rect x='{x}' y='{CH - h}' width='{w}' height='{h}'/>")
    if random.random() < 0.35:
        c.append(f"<rect x='{x + w / 2 - 10:.0f}' y='{CH - h - 40}' width='20' height='40'/>")
    x += w + random.choice([0, 0, 20])
# kupola i toranj (crkva u daljini), drveće
c.append(f"<rect x='1500' y='{CH - 300}' width='60' height='300'/><path d='M1500 {CH - 300} L1530 {CH - 360} L1560 {CH - 300} Z'/>")
c.append(f"<ellipse cx='1640' cy='{CH - 220}' rx='70' ry='60'/><rect x='1570' y='{CH - 220}' width='140' height='220'/>")
for tx in range(40, CW, 210):
    c.append(f"<circle cx='{tx}' cy='{CH - 40}' r='{random.randint(34, 52)}'/>")
c.append('</g></svg>')
open(os.path.join(out, 'city.svg'), 'w').write(''.join(c))
print('ok')
