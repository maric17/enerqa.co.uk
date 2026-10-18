# Build clean Lexical bodies for every publication.
#   archive articles: dk/article.py block extraction (earlier agent) + the fixes below
#   live-only / better-on-live articles: dk/liveparse.py
# Output: kh/out/<slug>.json (lexical), kh/out/<slug>.md (review copy), kh/out/meta.json
import json, re, sys, os, copy
SP = '/private/tmp/claude-501/-Users-maric-Documents-Work-Repos-enerqa-co-uk/7d83d9ab-b2b9-4b78-9e2d-8c18945386ad/scratchpad'
sys.path.insert(0, SP + '/dk'); sys.path.insert(0, SP + '/kh')
os.chdir(SP + '/dk')
import article, liveparse
from build import ARTICLES
from opts import OPTS
from extra import EXTRA, LIVE_SOURCE, GLOBAL_REPL

OUT = SP + '/kh/out'; os.makedirs(OUT, exist_ok=True)

def txt(b): return ''.join(r[0] for r in b['fruns'])

# ---------------------------------------------------------------- archive blocks
def archive_blocks(slug):
    o = copy.deepcopy(OPTS.get(slug, {}))
    for k, v in EXTRA.get(slug, {}).items():
        if isinstance(v, dict) and isinstance(o.get(k), dict): o[k].update(v)
        elif isinstance(v, list) and isinstance(o.get(k), list): o[k] = o[k] + v
        else: o[k] = v
    # table regions (kh/tables.py) on pages confirmed to hold tables: their cell text is skipped
    TABLES = json.load(open(SP + '/kh/tables.json'))
    for pn in o.get('tablepages', []):
        o.setdefault('skipbox', {}).setdefault(pn, [])
        o['skipbox'][pn] = o['skipbox'][pn] + [[b[0] - 2, b[1] - 4, b[2] + 2, b[3] + 2] for b in TABLES.get(str(pn), [])]
    bl, dropped = article.assemble(slug, o)
    out = []
    for b in bl:
        out.append(dict(kind=b['kind'], fruns=[[r[0], r[1]] for r in b['fruns']], level=b.get('level', 0),
                        ordered=b.get('ordered', False), ref=b.get('ref', False), num=b.get('num')))
    return out, o

# ---------------------------------------------------------------- live blocks
def live_blocks(path, o):
    m, bl = liveparse.parse(path)
    out = []
    for b in bl:
        if b['kind'] == 'img': continue          # images are not imported (no media upload here)
        runs = [[re.sub(r'\s+', ' ', r[0].replace('﻿', '')), r[1] & 3] for r in b['runs'] if r[0] != '\n']
        if b['kind'] == 'h':
            out.append(dict(kind='h2' if b['level'] <= 3 else 'h3', fruns=[[''.join(r[0] for r in runs), 0]], level=0, ordered=False, ref=False))
        elif b['kind'] == 'li':
            out.append(dict(kind='li', fruns=runs, level=max(0, b.get('depth', 1) - 1), ordered=b.get('ordered', False), ref=False))
        else:
            out.append(dict(kind='p', fruns=runs, level=0, ordered=False, ref=bool(re.match(r'^\s*\[\d+\]', b['text']))))
    # trim run whitespace
    for b in out:
        if b['fruns']:
            b['fruns'][0][0] = b['fruns'][0][0].lstrip(); b['fruns'][-1][0] = b['fruns'][-1][0].rstrip()
    return m, [b for b in out if txt(b).strip() and txt(b).strip() != '<']

# ---------------------------------------------------------------- post-processing
def apply_repl(b, repl):
    for fr in b['fruns']:
        for k, v in repl.items():
            fr[0] = fr[0].replace(k, v)
        for k, v in GLOBAL_REPL:
            fr[0] = re.sub(k, v, fr[0])

def fix_spacing(b):
    fr = b['fruns']
    # no space before punctuation across run boundaries; merge equal-format runs
    for i in range(1, len(fr)):
        if re.match(r'^\s+[.,;:!?)]', fr[i][0]) and not fr[i-1][0].endswith(' '):
            fr[i][0] = fr[i][0].lstrip()
        if re.match(r'^[.,;:!?)]', fr[i][0]) and fr[i-1][0].endswith(' '):
            fr[i-1][0] = fr[i-1][0].rstrip()
    for r in fr:
        r[0] = re.sub(r' +([.,;:!?])(?=\s|$)', r'\1', r[0])
        r[0] = re.sub(r'  +', ' ', r[0])
        r[0] = re.sub(r'\.\.(?=\s|$)', '.', r[0])      # stray double full stop
    mm = []
    for r in fr:
        if mm and mm[-1][1] == r[1]: mm[-1][0] += r[0]
        else: mm.append(list(r))
    # a bold/italic run that is only whitespace or punctuation carries no emphasis
    for r in mm:
        if r[1] and not re.search(r'[A-Za-z0-9]', r[0]): r[1] = 0
    b['fruns'] = [r for r in mm if r[0] != '']
    if b['fruns']:
        b['fruns'][0][0] = b['fruns'][0][0].lstrip(); b['fruns'][-1][0] = b['fruns'][-1][0].rstrip()

def split_leadins(blocks):
    """'... end. **Label:** more' -> two paragraphs (two-column layouts ran them together)."""
    out = []
    for b in blocks:
        if b['kind'] != 'p': out.append(b); continue
        cur = dict(b, fruns=[])
        for i, r in enumerate(b['fruns']):
            prev = ''.join(x[0] for x in cur['fruns'])
            if r[1] & 1 and re.match(r'^\s*[A-Z][^:]{0,60}:\s*$', r[0]) and re.search(r'[.!?]\s*$', prev) and prev.strip():
                out.append(cur); cur = dict(b, fruns=[])
                r = [r[0].lstrip(), r[1]]
            cur['fruns'].append(list(r))
        out.append(cur)
    return out

TERMINAL = re.compile(r'[.!?:"”’)\]]$')
def join_broken(blocks):
    out = []
    in_refs = False
    for b in blocks:
        t = txt(b).strip()
        if b['kind'] in ('h2', 'h3'):
            in_refs = bool(re.match(r'^(\d+\.\s*)?(References?|Bibliography|Sources)\s*:?$', t, re.I)); out.append(b); continue
        if out and b['kind'] == 'p' and out[-1]['kind'] in ('p', 'li'):
            p = out[-1]; pt = txt(p).rstrip()
            numbered_prev = re.match(r'^(\[\s*\d+\s*\]|\d{1,2}\.\s)', pt) or p['kind'] == 'li'
            starts_new = re.match(r'^(\[\s*\d+\s*\]|\d{1,2}\.\s|[•●])', t)
            cont = False
            if in_refs and numbered_prev and not starts_new: cont = True        # a reference wrapped onto a new line
            elif not in_refs and p['kind'] == 'p' and (re.search(r'[;,]$', pt) or (re.match(r'^[a-z]', t) and not TERMINAL.search(pt))): cont = True
            if cont:
                p['fruns'].append([' ', 0]); p['fruns'].extend(b['fruns']); continue
        out.append(b)
    return out

def refs_to_list(blocks):
    """A run of 'N. text' reference paragraphs numbered 1..n becomes an ordered list."""
    out = []; i = 0
    while i < len(blocks):
        b = blocks[i]
        m = re.match(r'^(\d{1,2})\.\s', txt(b)) if b['kind'] == 'p' else None
        if m and m.group(1) == '1':
            j = i; n = 1; run = []
            while j < len(blocks) and blocks[j]['kind'] == 'p':
                mm = re.match(r'^(\d{1,2})\.\s+', txt(blocks[j]))
                if not mm or int(mm.group(1)) != n: break
                run.append(blocks[j]); n += 1; j += 1
            if len(run) >= 2:
                for rb in run:
                    rb = copy.deepcopy(rb)
                    rb['fruns'][0][0] = re.sub(r'^\d{1,2}\.\s+', '', rb['fruns'][0][0])
                    out.append(dict(rb, kind='li', ordered=True, level=0))
                i = j; continue
        out.append(b); i += 1
    return out

def drop_blocks(blocks, pats):
    return [b for b in blocks if not any(re.search(p, txt(b)) for p in pats)]

def drop_ranges(blocks, ranges):
    """(start, end): drop from the block matching start up to, not including, the one matching end."""
    for start, end in ranges:
        i = next((k for k, b in enumerate(blocks) if re.search(start, txt(b))), None)
        if i is None: print('  !! droprange start not found:', start); continue
        j = next((k for k in range(i + 1, len(blocks)) if re.search(end, txt(blocks[k]))), None)
        if j is None: print('  !! droprange end not found:', end); continue
        blocks = blocks[:i] + blocks[j:]
    return blocks

def move_footnotes(blocks):
    """Page footnotes ('3 A green lending market ...') sit mid-flow in the PDF text and split
    sentences. Collect them, in order, into a numbered Notes list before the references."""
    notes = []; out = []; n = 1
    for b in blocks:
        m = re.match(r'^(\d) (?=[A-Z])', txt(b)) if b['kind'] == 'p' else None
        if m and int(m.group(1)) == n:
            b = copy.deepcopy(b); b['fruns'][0][0] = re.sub(r'^\d\s+', '', b['fruns'][0][0])
            notes.append(dict(b, kind='li', ordered=True, level=0)); n += 1; continue
        out.append(b)
    if notes:
        k = next((i for i, b in enumerate(out) if b['kind'] in ('h2', 'h3') and re.match(r'^(\d+\.\s*)?References?\b', txt(b))), len(out))
        out[k:k] = [dict(kind='h2', fruns=[['Notes', 0]], level=0, ordered=False, ref=False)] + notes
    return out

def split_at(blocks, phrases):
    """Start a new paragraph at a phrase that the PDF ran into the block before it."""
    for ph in phrases:
        for k, b in enumerate(blocks):
            t = txt(b); i = t.find(ph)
            if i <= 0: continue
            head, tail = t[:i].rstrip(), t[i:]
            # keep the formatting of the head, the tail becomes plain text
            acc = 0; hr = []
            for r in b['fruns']:
                if acc + len(r[0]) <= len(head): hr.append(list(r)); acc += len(r[0])
                else: hr.append([r[0][:len(head) - acc], r[1]]); break
            blocks[k] = dict(b, fruns=[r for r in hr if r[0]])
            blocks.insert(k + 1, dict(kind='p', fruns=[[tail, 0]], level=0, ordered=False, ref=False))
            break
        else: print('  !! splitat phrase not found:', ph)
    return blocks

def md_block(line):
    """'- **Label:** text' / 'p:text' -> a block (verbatim text rearranged from a flattened grid)."""
    kind = 'li' if line.startswith('- ') else 'p'
    t = line[2:] if kind == 'li' else line
    runs = [[x, 1 if k % 2 else 0] for k, x in enumerate(t.split('**')) if x]
    return dict(kind=kind, fruns=runs, level=0, ordered=False, ref=False)

def replace_ranges(blocks, specs):
    for start, end, lines in specs:
        i = next((k for k, b in enumerate(blocks) if re.search(start, txt(b))), None)
        j = next((k for k in range(i + 1, len(blocks)) if re.search(end, txt(blocks[k]))), None) if i is not None else None
        if i is None or j is None: print('  !! replacerange not found:', start, end); continue
        blocks = blocks[:i] + [md_block(l) for l in lines] + blocks[j:]
    return blocks

def bullet_split(blocks, spec):
    """One paragraph holding '•'-separated items and group labels -> label paragraphs + lists."""
    k = next((i for i, b in enumerate(blocks) if re.search(spec['start'], txt(b))), None)
    if k is None: print('  !! bulletsplit start not found'); return blocks
    t = txt(blocks[k]); out = []
    for part in [x.strip() for x in t.split('•')]:
        if not part: continue
        label = next((l for l in spec['labels'] if part.endswith(l) or part == l), None)
        body = part[:-len(label)].strip() if label and part != label else ('' if label else part)
        if body: out.append(dict(kind='li', fruns=[[body, 0]], level=0, ordered=False, ref=False))
        if label: out.append(dict(kind='p', fruns=[[label, 1]], level=0, ordered=False, ref=False))
    return blocks[:k] + out + blocks[k + 1:]

def keep_refs(blocks, keep):
    """Three chapters share one globally numbered reference list; keep this article's own entries."""
    out = []; dropping = False
    for b in blocks:
        m = re.match(r'^\[\s*(\d+)\s*\]', txt(b))
        if m: dropping = int(m.group(1)) not in keep
        elif b['kind'] in ('h2', 'h3'): dropping = False
        if dropping: continue                      # the entry and the lines it wrapped onto
        out.append(b)
    return out

def move_blocks(blocks, specs):
    for what, before in specs:
        i = next((k for k, b in enumerate(blocks) if re.search(what, txt(b))), None)
        if i is None: print('  !! moveblock not found:', what); continue
        b = blocks.pop(i)
        j = next((k for k, c in enumerate(blocks) if re.search(before, txt(c))), None)
        if j is None: print('  !! moveblock target not found:', before); blocks.insert(i, b); continue
        blocks.insert(j, b)
    return blocks

def normalise_headings(blocks):
    """The page title is the only H1, so the body must open at H2: an H3 before any H2 becomes H2."""
    seen_h2 = False
    for b in blocks:
        if b['kind'] == 'h2': seen_h2 = True
        elif b['kind'] == 'h3' and not seen_h2: b['kind'] = 'h2'
    return blocks

def postprocess(blocks, o):
    for b in blocks:
        apply_repl(b, o.get('repl2', {}))
        for fr in b['fruns']:
            for k, v in o.get('rx', []): fr[0] = re.sub(k, v, fr[0])
    blocks = drop_ranges(blocks, o.get('droprange', []))
    blocks = replace_ranges(blocks, o.get('replacerange', []))
    if o.get('bulletsplit'): blocks = bullet_split(blocks, o['bulletsplit'])
    if o.get('keeprefs'): blocks = keep_refs(blocks, set(o['keeprefs']))
    blocks = drop_blocks(blocks, o.get('dropblocks', []))
    for b in blocks:
        for lvl_pat, lvl in o.get('relevel', []):
            if b['kind'] in ('h2', 'h3') and re.search(lvl_pat, txt(b)):
                b['kind'] = lvl
                if lvl == 'p': b['fruns'] = [[txt(b), 1]]     # a bold label, not a section
    if o.get('footnotes'): blocks = move_footnotes(blocks)
    if o.get('nestbullets'):
        # bullets printed under a numbered item belong to it
        for k in range(1, len(blocks)):
            b = blocks[k]; p = blocks[k - 1]
            if b['kind'] == 'li' and not b['ordered'] and b['level'] == 0 and p['kind'] == 'li' and (p['ordered'] and p['level'] == 0 or p['level'] == 1):
                b['level'] = 1
    blocks = join_broken(blocks)
    blocks = split_at(blocks, o.get('splitat', []))
    blocks = split_leadins(blocks)
    for b in blocks: fix_spacing(b)
    for b in blocks:
        for fr in b['fruns']:
            for k, v in o.get('rx_after', []): fr[0] = re.sub(k, v, fr[0])
    for ph in o.get('truncafter', []):
        # cut a block after a phrase, across formatting runs (text the PDF ran on from elsewhere)
        for b in blocks:
            t = txt(b); i = t.find(ph)
            if i < 0: continue
            keep = i + len(ph); acc = 0; nr = []
            for r in b['fruns']:
                if acc >= keep: break
                nr.append([r[0][:keep - acc], r[1]]); acc += len(r[0])
            b['fruns'] = nr
    blocks = move_blocks(blocks, o.get('moveblock', []))
    blocks = refs_to_list(blocks)
    blocks = normalise_headings(blocks)
    return [b for b in blocks if txt(b).strip()]

# ---------------------------------------------------------------- lexical
def tnode(text, fmt): return {'type': 'text', 'text': text, 'format': fmt, 'detail': 0, 'mode': 'normal', 'style': '', 'version': 1}
def elem(typ, children, **kw):
    d = {'type': typ, 'children': children, 'direction': 'ltr', 'format': '', 'indent': 0, 'version': 1}; d.update(kw); return d

def to_lexical(blocks):
    root = []; i = 0
    while i < len(blocks):
        b = blocks[i]
        kids = [tnode(r[0], r[1]) for r in b['fruns'] if r[0]]
        if b['kind'] in ('h2', 'h3'):
            root.append(elem('heading', [tnode(txt(b), 0)], tag=b['kind'])); i += 1; continue
        if b['kind'] == 'li':
            ordered = b['ordered']; items = [b]; j = i + 1
            while j < len(blocks) and blocks[j]['kind'] == 'li' and (blocks[j]['ordered'] == ordered or blocks[j]['level'] > 0):
                if ordered and blocks[j]['level'] == 0 and blocks[j].get('num') in ('1', 'a'): break   # source numbering restarts
                items.append(blocks[j]); j += 1
            base = min(it['level'] for it in items)          # a list printed indented under a heading is still top level
            items = [dict(it, level=it['level'] - base) for it in items]
            def mklist(its, ordered):
                ch = []; k = 0; val = 1
                while k < len(its):
                    it = its[k]
                    if it['level'] == 0 or not ch:
                        ch.append(elem('listitem', [tnode(r[0], r[1]) for r in it['fruns'] if r[0]], value=val)); val += 1; k += 1
                    else:
                        sub = []
                        while k < len(its) and its[k]['level'] > 0: sub.append(dict(its[k], level=0)); k += 1
                        ch.append(elem('listitem', [mklist(sub, sub[0]['ordered'])], value=val)); val += 1
                n0 = its[0].get('num'); start = int(n0) if ordered and n0 and n0.isdigit() else 1
                for k2, c in enumerate(ch): c['value'] = start + k2
                return elem('list', ch, listType='number' if ordered else 'bullet', start=start, tag='ol' if ordered else 'ul')
            root.append(mklist(items, ordered)); i = j; continue
        root.append(elem('paragraph', kids, textFormat=0, textStyle='')); i += 1
    return {'root': {'type': 'root', 'children': root, 'direction': 'ltr', 'format': '', 'indent': 0, 'version': 1}}

def to_md(blocks):
    o = []
    for b in blocks:
        t = ''.join(('**' + r[0] + '**' if r[1] & 1 else ('_' + r[0] + '_' if r[1] & 2 else r[0])) for r in b['fruns'])
        if b['kind'] == 'h2': o.append('\n## ' + t)
        elif b['kind'] == 'h3': o.append('\n### ' + t)
        elif b['kind'] == 'li': o.append(('    ' if b['level'] else '') + ((b.get('num') or '#') + '. ' if b['ordered'] else '- ') + t)
        else: o.append('\n' + t)
    return '\n'.join(o)

# ---------------------------------------------------------------- summary text (verbatim, never written by us)
def first_para(blocks):
    """The article's own opening: the Abstract's first paragraph when there is one, else the first paragraph."""
    for i, b in enumerate(blocks):
        if b['kind'] in ('h2', 'h3') and re.match(r'^Abstract\b', txt(b), re.I):
            for c in blocks[i+1:]:
                if c['kind'] == 'p': return txt(c)
    for b in blocks:
        if b['kind'] == 'p' and len(txt(b)) > 80: return txt(b)
    return ''

def sentences_upto(text, limit):
    parts = re.split(r'(?<=[.!?])\s+(?=[A-Z(“"])', text.strip())
    out = ''
    for s in parts:
        if len(out) + len(s) + (1 if out else 0) > limit: break
        out = (out + ' ' + s).strip()
    if not out:   # the first sentence alone is longer than the limit: cut on a word boundary
        cut = text[:limit - 1].rsplit(' ', 1)[0].rstrip(',;:')
        out = cut + '…'
    return out

def main(only=None):
    meta = {}
    slugs = list(ARTICLES) + [s for s in LIVE_SOURCE if s not in ARTICLES]
    for slug in slugs:
        if only and not any(slug.startswith(w) for w in only): continue
        if slug in LIVE_SOURCE:
            o = EXTRA.get(slug, {})
            _, blocks = live_blocks(SP + '/dk/live/' + LIVE_SOURCE[slug], o)
            src = 'live'
        else:
            blocks, o = archive_blocks(slug); src = 'archive'
        blocks = postprocess(blocks, o)
        lex = to_lexical(blocks)
        json.dump(lex, open(f'{OUT}/{slug}.json', 'w'), ensure_ascii=False)
        open(f'{OUT}/{slug[:60]}.md', 'w').write(to_md(blocks))
        fp = first_para(blocks)
        meta[slug] = dict(source=src, excerpt=sentences_upto(fp, 300), metaDescription=sentences_upto(fp, 160),
                          blocks=len(blocks), headings=sum(b['kind'] in ('h2', 'h3') for b in blocks))
    json.dump(meta, open(f'{OUT}/meta.json', 'w'), ensure_ascii=False, indent=1)
    return meta

if __name__ == '__main__':
    m = main(sys.argv[1:] or None)
    for k, v in m.items(): print(k[:50].ljust(50), v['source'], v['blocks'], v['headings'], '|', v['metaDescription'][:90])
