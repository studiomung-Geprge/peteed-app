import base64
import glob
import re

def svg_data_uri(svg: str) -> str:
    b64 = base64.b64encode(svg.encode('utf-8')).decode('ascii')
    return f"data:image/svg+xml;base64,{b64}"

# ---------------------------------------------------------------------------
# Shared illustration palette (derived from the app's own tokens in index.css)
# ---------------------------------------------------------------------------
INK = "#1C1C1A"
INK2 = "#2E2E2B"
PAPER = "#FFF8F5"
CORAL = "#FF6B4A"
CORAL_LIGHT = "#FFD4C8"
RUST = "#E8521F"
DEEP_CORAL = "#C1442E"
CORAL_TINT = "#F7E4DF"
SAGE = "#6E8F73"
SAGE_LIGHT = "#D9E6D6"
SAGE_DARK = "#3F5B45"
GOLD = "#C99A3D"
GOLD_LIGHT = "#F2E0B8"
GOLD_DARK = "#8A6A26"
PLUM = "#8B5A6B"
PLUM_LIGHT = "#EBD9DE"
DOG_TAN = "#E8B784"
DOG_TAN_DARK = "#C98F5C"
DOG_CREAM = "#FBEBD8"
WHITE = "#FFFFFF"

_defs = []
_def_ids = set()

def _reset_defs():
    _defs.clear()
    _def_ids.clear()

def lgrad(id_, c1, c2, x1=0, y1=0, x2=1, y2=1):
    if id_ not in _def_ids:
        _defs.append(f'<linearGradient id="{id_}" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}">'
                      f'<stop offset="0%" stop-color="{c1}"/><stop offset="100%" stop-color="{c2}"/></linearGradient>')
        _def_ids.add(id_)
    return f'url(#{id_})'

def rgrad(id_, c1, c2, cx=0.5, cy=0.4, r=0.75):
    if id_ not in _def_ids:
        _defs.append(f'<radialGradient id="{id_}" cx="{cx}" cy="{cy}" r="{r}">'
                      f'<stop offset="0%" stop-color="{c1}"/><stop offset="100%" stop-color="{c2}"/></radialGradient>')
        _def_ids.add(id_)
    return f'url(#{id_})'

def rrect(x, y, w, h, r, fill, opacity=1):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" ry="{r}" fill="{fill}" opacity="{opacity}"/>'

def rect(x, y, w, h, fill, opacity=1):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" opacity="{opacity}"/>'

def circ(cx, cy, r, fill, opacity=1):
    return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}" opacity="{opacity}"/>'

def ell(cx, cy, rx, ry, fill, opacity=1, rot=0):
    t = f' transform="rotate({rot} {cx} {cy})"' if rot else ''
    return f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="{fill}" opacity="{opacity}"{t}/>'

def pth(d, fill="none", stroke="none", sw=0, opacity=1, cap="round", join="round"):
    s = f'<path d="{d}" fill="{fill}"'
    if stroke != "none":
        s += f' stroke="{stroke}" stroke-width="{sw}" stroke-linecap="{cap}" stroke-linejoin="{join}"'
    s += f' opacity="{opacity}"/>'
    return s

def txt(x, y, content, size, color, weight=700, anchor="middle", opacity=1, spacing=None, family="'Segoe UI',Arial,sans-serif"):
    ls = f' letter-spacing="{spacing}"' if spacing else ''
    return (f'<text x="{x}" y="{y}" font-family="{family}" font-size="{size}" font-weight="{weight}" '
            f'fill="{color}" text-anchor="{anchor}" opacity="{opacity}"{ls}>{content}</text>')

def pill_label(cx, bottom_y, text_str, w, h=30, bg="rgba(28,28,26,.55)", color="#fff", size=14):
    x = cx - w / 2
    y = bottom_y - h - 10
    return (rrect(x, y, w, h, h / 2, bg) +
            txt(cx, y + h * 0.68, text_str, size, color, 700))

def svg_wrap(w, h, body):
    defs_str = "<defs>" + "".join(_defs) + "</defs>" if _defs else ""
    out = f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">{defs_str}{body}</svg>'
    _reset_defs()
    return out

# ---------------------------------------------------------------------------
# 1. Pet portrait — "만두" (Mandu), a round-faced tan dog
# ---------------------------------------------------------------------------
def pet_photo():
    w = h = 400
    bg = rrect(0, 0, w, h, 0, rgrad("gPetBg", CORAL_LIGHT, CORAL, cx=0.32, cy=0.28, r=0.95))
    deco = (circ(w * 0.86, h * 0.14, 70, WHITE, 0.10) +
            circ(w * 0.08, h * 0.92, 60, INK, 0.06) +
            circ(w * 0.9, h * 0.86, 34, WHITE, 0.08))
    cx, cy = w * 0.5, h * 0.46
    # back ears (behind head)
    ears_back = (ell(cx - 92, cy - 78, 46, 62, DOG_TAN_DARK, rot=-18) +
                 ell(cx + 92, cy - 78, 46, 62, DOG_TAN_DARK, rot=18))
    # inner ear
    ears_inner = (ell(cx - 92, cy - 70, 22, 34, PLUM_LIGHT, rot=-18) +
                  ell(cx + 92, cy - 70, 22, 34, PLUM_LIGHT, rot=18))
    # head
    head = ell(cx, cy, 128, 118, rgrad("gPetHead", "#F6D9B6", DOG_TAN, cx=0.4, cy=0.3, r=0.9))
    # cheeks (fluffy jowls)
    cheeks = ell(cx - 96, cy + 46, 46, 40, DOG_TAN) + ell(cx + 96, cy + 46, 46, 40, DOG_TAN)
    # muzzle
    muzzle = ell(cx, cy + 44, 62, 46, DOG_CREAM)
    # nose
    nose = pth(f"M {cx-16} {cy+18} Q {cx} {cy+8} {cx+16} {cy+18} Q {cx+16} {cy+34} {cx} {cy+38} Q {cx-16} {cy+34} {cx-16} {cy+18} Z", fill=INK)
    # nose highlight
    nose_hl = ell(cx - 5, cy + 20, 4, 3, "#fff", 0.6)
    # mouth
    mouth = pth(f"M {cx} {cy+38} L {cx} {cy+50} M {cx} {cy+50} Q {cx-22} {cy+62} {cx-40} {cy+50} M {cx} {cy+50} Q {cx+22} {cy+62} {cx+40} {cy+50}",
                stroke=INK2, sw=4, cap="round")
    # eyes
    eye_l = ell(cx - 44, cy - 6, 15, 18, INK)
    eye_r = ell(cx + 44, cy - 6, 15, 18, INK)
    eye_hl = circ(cx - 48, cy - 12, 4.5, "#fff", 0.9) + circ(cx + 40, cy - 12, 4.5, "#fff", 0.9)
    brows = pth(f"M {cx-58} {cy-28} Q {cx-44} {cy-36} {cx-30} {cy-28}", stroke=DOG_TAN_DARK, sw=5) + \
            pth(f"M {cx+30} {cy-28} Q {cx+44} {cy-36} {cx+58} {cy-28}", stroke=DOG_TAN_DARK, sw=5)
    # blush
    blush = ell(cx - 78, cy + 20, 16, 10, CORAL, 0.35) + ell(cx + 78, cy + 20, 16, 10, CORAL, 0.35)
    # collar
    collar = pth(f"M {cx-96} {cy+92} Q {cx} {cy+118} {cx+96} {cy+92} L {cx+96} {cy+104} Q {cx} {cy+130} {cx-96} {cy+104} Z", fill=RUST)
    tag = circ(cx, cy + 116, 13, GOLD_LIGHT) + circ(cx, cy + 116, 13, "none") + \
          pth(f"M {cx} {cy+109} q -8 6 0 14 q 8 -6 0 -14 Z", fill=GOLD_DARK)
    caption = pill_label(cx, h - 14, "만두 · 반려동물 등록사진", 208)
    body = bg + deco + ears_back + ears_inner + head + cheeks + brows + eye_l + eye_r + eye_hl + \
        muzzle + nose + nose_hl + mouth + blush + collar + tag + caption
    return svg_wrap(w, h, body)

# ---------------------------------------------------------------------------
# 2. Health record illustrations (600x400 landscape cards)
# ---------------------------------------------------------------------------
def _hr_card(bg_grad_id, c1, c2, scene_fn, caption):
    w, h = 600, 400
    bg = rrect(0, 0, w, h, 0, lgrad(bg_grad_id, c1, c2, 0, 0, 1, 1))
    deco = circ(w * 0.86, h * 0.18, 110, WHITE, 0.07) + circ(w * 0.07, h * 0.92, 90, INK, 0.05)
    scene = scene_fn(w * 0.5, h * 0.44)
    cap = pill_label(120, h - 18, caption, 176, size=15)
    return svg_wrap(w, h, bg + deco + scene + cap)

def _scene_checkup(cx, cy):
    tube = pth(f"M {cx-70} {cy-60} q -30 0 -30 34 v 20 q 0 34 34 34 q 34 0 34 -34 v -14",
               stroke=WHITE, sw=12, opacity=0.95)
    ear_l = circ(cx - 70, cy - 62, 9, WHITE)
    chest = circ(cx + 12, cy + 30, 36, WHITE) + circ(cx + 12, cy + 30, 22, "rgba(255,255,255,.35)")
    tube2 = pth(f"M {cx+8-30} {cy+8} Q {cx-2} {cy-30} {cx+12} {cy+2}", stroke=WHITE, sw=10, opacity=0.9)
    paw = circ(cx + 96, cy - 58, 24, WHITE, 0.16) + \
        pth(f"M {cx+96} {cy-70} a6 6 0 1 0 .1 0 M {cx+84} {cy-58} a5 5 0 1 0 .1 0 M {cx+108} {cy-58} a5 5 0 1 0 .1 0 M {cx+96} {cy-48} a7 8 0 1 0 .1 0",
            fill=WHITE, opacity=0.5)
    heartline = pth(f"M {cx-110} {cy+94} h30 l8 -18 l12 34 l10 -50 l8 24 h34",
                     stroke="rgba(255,255,255,.55)", sw=5)
    return tube + ear_l + chest + tube2 + paw + heartline

def _scene_vaccine(cx, cy):
    barrel = rrect(cx - 70, cy - 22, 120, 40, 8, WHITE)
    ticks = "".join(rect(cx - 60 + i * 20, cy - 14, 3, 24, "rgba(0,0,0,.12)") for i in range(6))
    plunger_rod = rect(cx + 50, cy - 6, 34, 8, WHITE)
    plunger_head = rrect(cx + 82, cy - 14, 10, 24, 3, WHITE)
    needle = pth(f"M {cx-70} {cy-2} L {cx-116} {cy-2}", stroke=WHITE, sw=4)
    drop = pth(f"M {cx-122} {cy-8} q -8 10 0 18 q 8 -8 0 -18 Z", fill=WHITE, opacity=0.85)
    vial = rrect(cx - 30, cy + 42, 40, 56, 6, WHITE, 0.92) + \
        rect(cx - 30, cy + 42, 40, 18, "rgba(0,0,0,.14)") + \
        rrect(cx - 34, cy + 34, 48, 12, 4, WHITE)
    cross = rect(cx + 60, cy + 48, 26, 8, WHITE, 0.85) + rect(cx + 69, cy + 39, 8, 26, WHITE, 0.85)
    return barrel + ticks + plunger_rod + plunger_head + needle + drop + vial + cross

def _scene_prescription(cx, cy):
    bottle = rrect(cx - 34, cy - 30, 68, 96, 10, WHITE) + \
        rrect(cx - 40, cy - 46, 80, 20, 6, WHITE) + \
        rrect(cx - 28, cy - 8, 56, 30, 4, "rgba(0,0,0,.14)")
    pill1 = rrect(cx + 60, cy - 40, 54, 24, 12, WHITE, 0.95) + rrect(cx + 60, cy - 40, 27, 24, 12, "rgba(0,0,0,.16)")
    pill2 = rrect(cx + 76, cy + 4, 54, 24, 12, WHITE, 0.85, )
    pill2 = f'<g transform="rotate(-24 {cx+103} {cy+16})">{rrect(cx+76, cy+4, 54, 24, 12, WHITE, 0.85)}{rrect(cx+76, cy+4, 27, 24, 12, "rgba(0,0,0,.16)")}</g>'
    pill3 = f'<g transform="rotate(18 {cx+50} {cy+52})">{circ(cx+50, cy+52, 15, WHITE, 0.9)}{pth(f"M {cx+50} {cy+37} L {cx+50} {cy+67} M {cx+35} {cy+52} L {cx+65} {cy+52}", stroke="rgba(0,0,0,.18)", sw=3)}</g>'
    cross = rect(cx - 96, cy + 30, 26, 8, WHITE, 0.85) + rect(cx - 87, cy + 21, 8, 26, WHITE, 0.85)
    return bottle + pill1 + pill2 + pill3 + cross

def _scene_dental(cx, cy):
    tooth = pth(
        f"M {cx-4} {cy-46} C {cx-40} {cy-58} {cx-52} {cy-20} {cx-40} {cy+14} "
        f"C {cx-34} {cy+30} {cx-30} {cy+46} {cx-18} {cy+46} "
        f"C {cx-8} {cy+46} {cx-8} {cy+22} {cx} {cy+22} "
        f"C {cx+8} {cy+22} {cx+8} {cy+46} {cx+18} {cy+46} "
        f"C {cx+30} {cy+46} {cx+34} {cy+30} {cx+40} {cy+14} "
        f"C {cx+52} {cy-20} {cx+40} {cy-58} {cx+4} {cy-46} "
        f"C {cx+2} {cy-50} {cx-2} {cy-50} {cx-4} {cy-46} Z", fill=WHITE)
    shine = ell(cx - 14, cy - 14, 8, 20, "rgba(255,255,255,.9)", 0.5, rot=-10)
    def star(sx, sy, s, op):
        return pth(f"M {sx} {sy-s} L {sx+s*0.28} {sy-s*0.28} L {sx+s} {sy} L {sx+s*0.28} {sy+s*0.28} "
                   f"L {sx} {sy+s} L {sx-s*0.28} {sy+s*0.28} L {sx-s} {sy} L {sx-s*0.28} {sy-s*0.28} Z",
                   fill=WHITE, opacity=op)
    stars = star(cx + 74, cy - 44, 14, 0.9) + star(cx + 100, cy - 12, 8, 0.7) + star(cx - 86, cy + 30, 9, 0.6)
    brush_handle = rrect(cx - 118, cy + 40, 70, 14, 7, WHITE, 0.85)
    brush_head = rrect(cx - 132, cy + 28, 26, 22, 6, WHITE, 0.95)
    bristles = "".join(rect(cx - 128 + i * 6, cy + 20, 3, 10, WHITE, 0.9) for i in range(4))
    return tooth + shine + stars + brush_handle + brush_head + bristles

HR_CHECKUP = _hr_card("gCk", INK2, INK, _scene_checkup, "정기 검진 · Health Checkup")
HR_VACCINE = _hr_card("gVx", RUST, DEEP_CORAL, _scene_vaccine, "예방접종 · Vaccination")
HR_PRESCRIPTION = _hr_card("gRx", CORAL, RUST, _scene_prescription, "처방전 · Prescription")
HR_DENTAL = _hr_card("gDt", PLUM, "#4A3540", _scene_dental, "치과 진료 · Dental Care")

# ---------------------------------------------------------------------------
# 3. Facility scene illustrations (400x200 landscape thumbnails)
# ---------------------------------------------------------------------------
def _fac_base(sky1, sky2, ground, w=400, h=200, ground_y=132):
    gid = f"gSky{sky1[1:]}"
    sky = rrect(0, 0, w, h, 0, lgrad(gid, sky1, sky2, 0, 0, 0, 1))
    grnd = rect(0, ground_y, w, h - ground_y, ground)
    grass = "".join(circ(20 + i * 27, ground_y + 10 + (i % 3) * 6, 2.2, "rgba(255,255,255,.25)") for i in range(15))
    sun = circ(w * 0.86, h * 0.16, 30, WHITE, 0.14)
    return sky + sun + grnd + grass

def _tree(cx, base_y, scale=1.0, crown="#3F5B45", trunk="#6B4A32"):
    s = scale
    return (rect(cx - 5 * s, base_y - 26 * s, 10 * s, 26 * s, trunk) +
            circ(cx, base_y - 44 * s, 22 * s, crown) +
            circ(cx - 16 * s, base_y - 32 * s, 15 * s, crown) +
            circ(cx + 16 * s, base_y - 32 * s, 15 * s, crown))

def _tent(cx, base_y, w, h, color, stripe):
    body = pth(f"M {cx-w/2} {base_y} L {cx} {base_y-h} L {cx+w/2} {base_y} Z", fill=color)
    door = pth(f"M {cx} {base_y-h*0.5} L {cx-w*0.16} {base_y} L {cx+w*0.16} {base_y} Z", fill=stripe, opacity=0.85)
    ridge = pth(f"M {cx} {base_y-h} L {cx} {base_y-h*0.5}", stroke=stripe, sw=3, opacity=0.7)
    guyline = pth(f"M {cx-w/2} {base_y} L {cx-w*0.68} {base_y+8} M {cx+w/2} {base_y} L {cx+w*0.68} {base_y+8}",
                  stroke="rgba(28,28,26,.25)", sw=2)
    peg1 = circ(cx - w * 0.68, base_y + 8, 2, "rgba(28,28,26,.3)")
    peg2 = circ(cx + w * 0.68, base_y + 8, 2, "rgba(28,28,26,.3)")
    return guyline + peg1 + peg2 + body + door + ridge

def _dog_sit(cx, gy, s, color, dark=None):
    dark = dark or DOG_TAN_DARK
    tail = pth(f"M {cx-16*s} {gy-30*s} Q {cx-34*s} {gy-40*s} {cx-30*s} {gy-58*s}", stroke=color, sw=7 * s, cap="round")
    leg = rrect(cx + 6 * s, gy - 14 * s, 7 * s, 16 * s, 3 * s, color)
    body = ell(cx, gy - 26 * s, 20 * s, 26 * s, color)
    head = circ(cx + 15 * s, gy - 56 * s, 15 * s, color)
    ear = ell(cx + 6 * s, gy - 66 * s, 7 * s, 11 * s, dark, rot=-20)
    snout = ell(cx + 28 * s, gy - 52 * s, 9 * s, 7 * s, DOG_CREAM)
    nose = circ(cx + 35 * s, gy - 52 * s, 2.4 * s, INK)
    eye = circ(cx + 18 * s, gy - 59 * s, 2.2 * s, INK)
    return tail + body + leg + head + ear + snout + nose + eye

def fac_euiseong():
    w, h = 400, 200
    body = _fac_base(SAGE_LIGHT, "#EFE3C8", SAGE, ground_y=136)
    trees = _tree(46, 150, 0.9, crown=SAGE_DARK) + _tree(360, 156, 0.7, crown=SAGE_DARK)
    tents = _tent(160, 158, 74, 60, WHITE, GOLD) + _tent(232, 162, 60, 48, CORAL_TINT, DEEP_CORAL)
    dog = _dog_sit(292, 174, 0.85, DOG_TAN)
    cap = pill_label(w / 2, h - 12, "의성 펫월드 · 테마파크 · 캠핑장", 236)
    return svg_wrap(w, h, body + trees + tents + dog + cap)

def fac_mungyeong():
    w, h = 400, 200
    body = _fac_base("#F7E4DF", "#FBEFE9", "#C8DABB", ground_y=138)
    tree = _tree(44, 152, 0.85, crown="#7A9B6E")
    building = (rrect(140, 96, 150, 60, 6, "#FBF6EE") +
                pth("M 132 96 L 215 56 L 298 96 Z", fill=DEEP_CORAL) +
                rrect(196, 122, 30, 34, 3, DEEP_CORAL) + circ(220, 139, 2.2, GOLD_LIGHT) +
                rrect(154, 116, 20, 22, 3, "#EADFCB") + rrect(262, 116, 20, 22, 3, "#EADFCB") +
                pth("M 164 127 h0 M 164 116 v22 M 154 127 h20", stroke="#C8B892", sw=2) +
                pth("M 272 127 v0 M 272 116 v22 M 262 127 h20", stroke="#C8B892", sw=2))
    heart = pth("M 215 44 c -6 -8 -18 -3 -18 6 c 0 9 18 18 18 18 c 0 0 18 -9 18 -18 c 0 -9 -12 -14 -18 -6 Z", fill=CORAL)
    lawn = "".join(circ(150 + i * 12, 176 + (i % 2) * 5, 1.6, "rgba(255,255,255,.4)") for i in range(14))
    cap = pill_label(w / 2, h - 12, "문경새재 힐링센터 · 호텔 · 미용", 232)
    return svg_wrap(w, h, body + tree + building + heart + lawn + cap)

def fac_gyeongju():
    w, h = 400, 200
    body = _fac_base("#F2E0B8", "#F7EDD3", "#DCC98C", ground_y=140)
    outline = pth("M 150 138 L 150 78 L 250 78 L 250 138", stroke="rgba(138,106,38,.55)", sw=3, cap="square") + \
        "".join(rect(150, 78 + i * 20, 100, 10, "rgba(138,106,38,.28)") for i in range(3))
    scaffold = "".join(rect(150 + i * 25, 78, 2, 60, "rgba(138,106,38,.45)") for i in range(5))
    crane_mast = rect(300, 40, 6, 100, GOLD_DARK)
    crane_arm = rect(220, 40, 130, 6, GOLD_DARK)
    crane_cable = pth("M 236 46 L 236 70", stroke=GOLD_DARK, sw=3)
    crane_hook = rrect(230, 70, 12, 10, 2, GOLD_DARK)
    crane_counter = rect(292, 46, 20, 14, GOLD_DARK)
    cone1 = pth("M 96 140 L 84 118 L 108 118 Z", fill=DEEP_CORAL) + rect(80, 140, 32, 6, DEEP_CORAL)
    cone_band = rect(86, 128, 20, 4, WHITE, 0.85)
    cone2 = pth("M 330 148 L 320 130 L 340 130 Z", fill=DEEP_CORAL) + rect(316, 148, 28, 6, DEEP_CORAL)
    ribbon = rrect(w / 2 - 62, 152, 124, 26, 13, DEEP_CORAL) + txt(w / 2, 170, "조성중 · COMING SOON", 12, WHITE, 700)
    cap = pill_label(w / 2, h - 6, "경주 펫피아 · 테마파크", 190, h=24, size=12)
    return svg_wrap(w, h, body + outline + scaffold + crane_mast + crane_arm + crane_cable + crane_hook +
                     crane_counter + cone1 + cone_band + cone2 + ribbon)

def fac_pohang():
    w, h = 400, 200
    body = _fac_base("#DCE8DE", "#EAF1E6", SAGE_DARK, ground_y=140)
    back_trees = _tree(70, 148, 1.15, crown="#4E6E52") + _tree(150, 150, 0.95, crown="#5C7F5F") + \
        _tree(330, 150, 1.05, crown="#4E6E52")
    shelter = (rrect(196, 118, 70, 40, 6, "#F4E7D2") +
               pth("M 188 118 L 231 92 L 274 118 Z", fill=DEEP_CORAL) +
               rrect(214, 132, 34, 26, 4, "#3F5B45") +
               circ(231, 106, 6, WHITE, 0.6))
    dog = _dog_sit(148, 176, 1.05, DOG_TAN)
    cap = pill_label(w / 2, h - 12, "포항 숲강아지 · 유기동물 입양센터", 246)
    return svg_wrap(w, h, body + back_trees + shelter + dog + cap)

FAC_EUISEONG = fac_euiseong()
FAC_MUNGYEONG = fac_mungyeong()
FAC_GYEONGJU = fac_gyeongju()
FAC_POHANG = fac_pohang()

PET_PHOTO = pet_photo()

REPLACEMENTS = {
    "https://images.unsplash.com/photo-1736196674354-b5e918a64644?w=400&h=400&fit=crop&crop=face": svg_data_uri(PET_PHOTO),
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop": svg_data_uri(HR_CHECKUP),
    "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&h=400&fit=crop": svg_data_uri(HR_VACCINE),
    "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=600&h=400&fit=crop": svg_data_uri(HR_PRESCRIPTION),
    "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&h=400&fit=crop": svg_data_uri(HR_DENTAL),
    "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=200&fit=crop": svg_data_uri(FAC_EUISEONG),
    "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=200&fit=crop": svg_data_uri(FAC_MUNGYEONG),
    "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400&h=200&fit=crop": svg_data_uri(FAC_GYEONGJU),
    "https://images.unsplash.com/photo-1594004844563-536a03a6e532?w=400&h=200&fit=crop": svg_data_uri(FAC_POHANG),
}

if __name__ == "__main__":
    js_path = glob.glob("dist/assets/index-*.js")[0]
    css_path = glob.glob("dist/assets/index-*.css")[0]

    with open(js_path, "r", encoding="utf-8") as f:
        js = f.read()

    total_replacements = 0
    for url, data_uri in REPLACEMENTS.items():
        count = js.count(url)
        total_replacements += count
        js = js.replace(url, data_uri)
        print(f"replaced {count}x -> {url}")

    remaining = re.findall(r"https://images\.unsplash\.com/[^`'\"]*", js)
    print(f"\ntotal replacements: {total_replacements}")
    print(f"remaining unsplash refs: {remaining}")

    with open(js_path.replace(".js", ".inlined.js"), "w", encoding="utf-8") as f:
        f.write(js)

    with open(css_path, "r", encoding="utf-8") as f:
        css = f.read()

    with open("artifact_body.html", "w", encoding="utf-8") as f:
        f.write("<title>PETEED</title>\n")
        f.write("<style>\n" + css + "\n</style>\n")
        f.write('<div id="root"></div>\n')
        f.write('<script type="module">\n' + js + "\n</script>\n")

    print("\nwrote artifact_body.html, size(bytes):", len(open("artifact_body.html", encoding="utf-8").read().encode("utf-8")))
