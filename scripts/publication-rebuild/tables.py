# Find table regions on each archive page from their ruling lines (thin rects / stroked
# segments), so the cell text that pypdf flattens into nonsense can be skipped.
import pypdf, json, sys
from pypdf.generic import ContentStream
PDF = "/Users/maric/Documents/Work/Repos/enerqa.co.uk/docs/enerQA's 2024 publication archive.pdf"
OUT = '/private/tmp/claude-501/-Users-maric-Documents-Work-Repos-enerqa-co-uk/7d83d9ab-b2b9-4b78-9e2d-8c18945386ad/scratchpad/kh/tables.json'

CELLS = []
def mul(a, b):
    return [a[0]*b[0]+a[1]*b[2], a[0]*b[1]+a[1]*b[3], a[2]*b[0]+a[3]*b[2], a[2]*b[1]+a[3]*b[3],
            a[4]*b[0]+a[5]*b[2]+b[4], a[4]*b[1]+a[5]*b[3]+b[5]]
def pt(m, x, y): return (m[0]*x+m[2]*y+m[4], m[1]*x+m[3]*y+m[5])

def rules(reader, content, resources, ctm0, out, depth=0):
    xobjs = resources.get('/XObject') if resources else None
    xobjs = xobjs.get_object() if xobjs else {}
    ctm = list(ctm0); stack = []; cur = None; path = []
    try: ops = ContentStream(content, reader).operations
    except Exception: return
    for operands, op in ops:
        op = op.decode() if isinstance(op, bytes) else op
        if op == 'q': stack.append(list(ctm))
        elif op == 'Q':
            if stack: ctm = stack.pop()
        elif op == 'cm': ctm = mul([float(v) for v in operands], ctm)
        elif op == 're':
            x, y, w, h = [float(v) for v in operands]
            a = pt(ctm, x, y); b = pt(ctm, x+w, y+h)
            path.append(('r', min(a[0], b[0]), min(a[1], b[1]), max(a[0], b[0]), max(a[1], b[1])))
        elif op == 'm':
            cur = pt(ctm, float(operands[0]), float(operands[1]))
        elif op == 'l' and cur:
            nxt = pt(ctm, float(operands[0]), float(operands[1]))
            path.append(('l', min(cur[0], nxt[0]), min(cur[1], nxt[1]), max(cur[0], nxt[0]), max(cur[1], nxt[1]))); cur = nxt
        elif op in ('f', 'F', 'f*', 'S', 's', 'B', 'B*', 'b', 'b*'):
            for kind, x0, y0, x1, y1 in path:
                w, h = x1-x0, y1-y0
                if kind == 'r' and 5 < w < 560 and 5 < h < 700: CELLS.append([round(x0, 1), round(y0, 1), round(x1, 1), round(y1, 1)])
                # a rule: thin in one direction, long in the other
                if (h <= 2.5 and w >= 15) or (w <= 2.5 and h >= 8): out.append([round(x0, 1), round(y0, 1), round(x1, 1), round(y1, 1)])
            path = []
        elif op == 'n':
            for kind, x0, y0, x1, y1 in path:
                if kind == 'r' and 5 < x1-x0 < 560 and 5 < y1-y0 < 700: CELLS.append([round(x0, 1), round(y0, 1), round(x1, 1), round(y1, 1)])
            path = []
        elif op == 'Do' and depth < 3:
            xo = xobjs.get(operands[0])
            if xo is None: continue
            xo = xo.get_object()
            if xo.get('/Subtype') == '/Form':
                m = xo.get('/Matrix'); fm = [float(v) for v in m] if m else [1, 0, 0, 1, 0, 0]
                rules(reader, xo, xo.get('/Resources') or resources, mul(fm, ctm), out, depth+1)

def cluster(rs, pad=4):
    groups = []
    for r in rs:
        box = list(r); members = [r]
        merged = True
        while merged:
            merged = False
            for g in groups[:]:
                gb = g['box']
                if gb[0]-pad <= box[2] and box[0]-pad <= gb[2] and gb[1]-pad <= box[3] and box[1]-pad <= gb[3]:
                    box = [min(box[0], gb[0]), min(box[1], gb[1]), max(box[2], gb[2]), max(box[3], gb[3])]
                    members += g['m']; groups.remove(g); merged = True
        groups.append({'box': box, 'm': members})
    out = []
    for g in groups:
        b = g['box']; hs = [m for m in g['m'] if m[3]-m[1] <= 2.5]; vs = [m for m in g['m'] if m[2]-m[0] <= 2.5]
        if len(hs) >= 3 and len(vs) >= 2 and b[2]-b[0] > 150 and b[3]-b[1] > 30:
            out.append([round(v, 1) for v in b])
    return out

def grids(cells):
    cells = [list(c) for c in {tuple(c) for c in cells}]
    out = []
    for g in cluster_boxes(cells, pad=1.5):
        xs = {round(c[0]) for c in g['m']}; ys = {round(c[1]) for c in g['m']}; b = g['box']
        if len(g['m']) >= 4 and len(xs) >= 2 and len(ys) >= 2 and b[2]-b[0] > 150: out.append([round(v, 1) for v in b])
    return out

def cluster_boxes(rs, pad):
    groups = []
    for r in rs:
        box = list(r); members = [r]; merged = True
        while merged:
            merged = False
            for g in groups[:]:
                gb = g['box']
                if gb[0]-pad <= box[2] and box[0]-pad <= gb[2] and gb[1]-pad <= box[3] and box[1]-pad <= gb[3]:
                    box = [min(box[0], gb[0]), min(box[1], gb[1]), max(box[2], gb[2]), max(box[3], gb[3])]
                    members += g['m']; groups.remove(g); merged = True
        groups.append({'box': box, 'm': members})
    return groups

r = pypdf.PdfReader(PDF)
res = {}
for i, p in enumerate(r.pages):
    rs = []; CELLS.clear()
    rules(r, p.get_contents(), p.get('/Resources'), [1, 0, 0, 1, 0, 0], rs)
    t = cluster(rs) + grids(CELLS)
    if t: res[i+1] = t
json.dump(res, open(OUT, 'w'))
for k, v in res.items(): print(k, v)
