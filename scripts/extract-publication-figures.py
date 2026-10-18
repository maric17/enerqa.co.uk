"""Recover original PDF artwork and anchor it to the existing rebuilt article text.

Requires PyMuPDF and Pillow. Run from the repository root. No CMS writes.
"""
import difflib
import json
import re
import sys
import unicodedata
from pathlib import Path
import pymupdf as fitz
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parent.parent
archive = fitz.open(root / "docs" / "enerQA's 2024 publication archive.pdf")
if len(sys.argv) > 1:
    page = archive[int(sys.argv[1]) - 1]
    print(json.dumps({"images": page.get_image_info(), "blocks": page.get_text("blocks")}, default=str, ensure_ascii=True))
    sys.exit(0)
rebuilt = root / "scripts" / "publication-rebuild" / "out"
slugs = list(json.loads((rebuilt / "meta.json").read_text(encoding="utf-8")))
descriptions = json.loads((root / "scripts" / "publication-figure-descriptions.json").read_text(encoding="utf-8"))
# PDF page numbers, including the two front-matter pages; exclude chapter covers.
ranges = [
    ("the-evolution", 8, 9), ("climate-forcers", 10, 11), ("weathering", 12, 14),
    ("climate-change-and-war", 15, 17), ("greenhouse-gases", 18, 21),
    ("breathing", 22, 23), ("ghg-emissions", 24, 24), ("exploring-the-rainbow", 26, 34),
    ("green-credit-lines", 35, 55), ("supercritical", 56, 59), ("driving-climate", 60, 63),
    ("i-recs", 64, 65), ("the-role-of-artificial", 66, 70), ("the-hidden-costs", 72, 73),
    ("practical-tips", 74, 76), ("sustainable-tourism", 77, 79), ("the-hidden-link", 80, 81),
    ("empowering", 82, 85), ("the-origins", 86, 90), ("environmental-impacts", 91, 95),
    ("understanding-the-dpsir", 97, 99), ("dpsir-framework", 100, 104),
    ("the-imperative", 105, 108), ("scope-4", 109, 112),
]

def text(node):
    return node.get("text", "") if "text" in node else " ".join(text(child) for child in node.get("children", []))

def normalized(value):
    return re.sub(r"[^\w]+", " ", unicodedata.normalize("NFKC", value).lower()).strip()

assets = root / "public" / "images" / "publications" / "archive"
assets.mkdir(parents=True, exist_ok=True)
manifest, audit, previews = {}, [], []
for prefix, start, end in ranges:
    slug = next(slug for slug in slugs if slug.startswith(prefix))
    body = json.loads((rebuilt / f"{slug}.json").read_text(encoding="utf-8"))
    nodes = [(index, text(node)) for index, node in enumerate(body["root"]["children"]) if len(text(node)) > 25]
    figures, previous_blocks, last_index = [], [], 0
    for page_number in range(start, end + 1):
        page = archive[page_number - 1]
        blocks = [block for block in page.get_text("blocks") if block[6] == 0 and block[1] > 55 and block[3] < page.rect.height - 35]
        images = [image for image in page.get_image_info() if image["width"] >= 200 and image["height"] >= 150 and fitz.Rect(image["bbox"]).width > 70]
        for ordinal, image in enumerate(sorted(images, key=lambda image: (image["bbox"][1], image["bbox"][0])), 1):
            rect = fitz.Rect(image["bbox"]) & page.rect
            preceding = [block[4].strip() for block in blocks if block[3] <= rect.y0 + 4]
            context = (previous_blocks + preceding)[-8:]
            index, anchor, score = 0, "", 0.0
            # Prefer the closest preceding paragraph with a recognisable match.
            for candidate in reversed(context):
                cleaned = normalized(candidate)
                if len(cleaned) < 25:
                    continue
                matches = [(difflib.SequenceMatcher(None, cleaned, normalized(value)).ratio(), idx, value) for idx, value in nodes]
                best = max(matches, default=(0.0, 0, ""))
                if best[0] > score:
                    score, index, anchor = best
                if score > 0.65:
                    break
            # Review overrides for images embedded beside a single large text block.
            if prefix == "weathering":
                index = next(idx for idx, value in nodes if value.startswith("Not only are supply chains"))
                score = 1.0
            elif prefix == "climate-change-and-war" and page_number == 15:
                index = next(idx for idx, value in nodes if value.startswith("For instance, the war in Ukraine"))
                score = 1.0
            elif prefix == "ghg-emissions" or score == 0:
                index = nodes[0][0]
                score = 1.0
            # Figure order must match the archive, even when paragraphs were merged.
            index = max(last_index, index)
            last_index = index
            anchor = text(body["root"]["children"][index])
            nearby = sorted([block for block in blocks if rect.y1 - 4 <= block[1] <= rect.y1 + 90], key=lambda block: block[1])
            caption = next((re.sub(r"\s+", " ", block[4]).strip() for block in nearby if re.match(r"\s*(?:fig(?:ure)?[.\s\d-]|\(author|source:)", block[4], re.I)), "")
            name = f"page-{page_number:03d}-{ordinal:02d}.webp"
            scale = max(2, min(4, image["width"] / max(rect.width, 1)))
            pixmap = page.get_pixmap(matrix=fitz.Matrix(scale, scale), clip=rect, alpha=False)
            picture = Image.frombytes("RGB", (pixmap.width, pixmap.height), pixmap.samples)
            picture.save(assets / name, "WEBP", lossless=True)
            # A caption can continue in a separate PDF text block.
            if caption and not re.search(r"[.)]\s*$", caption):
                first = next((block for block in nearby if re.sub(r"\s+", " ", block[4]).strip() == caption), None)
                continuation = next((block for block in nearby if first and 0 <= block[1] - first[3] < 15 and len(block[4].strip()) < 150), None)
                if continuation:
                    caption += " " + re.sub(r"\s+", " ", continuation[4]).strip()
            figure = {"src": f"/images/publications/archive/{name}", "width": pixmap.width, "height": pixmap.height,
                      "page": page_number, "caption": caption, "alt": descriptions[f"{page_number}-{ordinal}"],
                      "afterText": anchor}
            figures.append(figure)
            audit.append({"slug": slug, "page": page_number, "image": name, "anchorIndex": index, "confidence": round(score, 3)})
            thumbnail = picture.copy()
            thumbnail.thumbnail((230, 150))
            tile = Image.new("RGB", (250, 185), "#f4f7fa")
            tile.paste(thumbnail, ((250 - thumbnail.width) // 2, 5))
            ImageDraw.Draw(tile).text((8, 160), f"PDF {page_number} / {ordinal} | anchor {score:.2f}", fill="#082c45")
            previews.append(tile)
        previous_blocks.extend(block[4].strip() for block in blocks)
    manifest[slug] = {"startPage": start, "endPage": end, "figures": figures}

archive_count = len(audit)
# The earlier rebuild skipped these line-drawn tables/diagrams entirely.
# Their stored boxes use PDF bottom-origin coordinates; convert for rendering.
table_boxes = json.loads((root / "scripts/publication-rebuild/tables.json").read_text(encoding="utf-8"))
supplements = {
    29: "Hydrogen production methods, emissions and applicability by colour",
    32: "Hydrogen technology feasibility in different economic contexts",
    33: "Emission-reduction potential of hydrogen technologies",
    36: "Comparison of conventional credit lines and green credit lines",
    44: "Green-credit potential index factors, measures and data sources",
    46: "Green-credit implementation scale definitions and criteria",
    47: "Green-credit implementation scale definitions, continued",
    48: "Green-credit assessment criteria and scoring table",
    49: "Renewable-energy target ambitiousness assessment",
    51: "Green-credit implementation scoring and references for Qatar",
    52: "Green-credit implementation scoring and references for the UAE",
    53: "Green-credit potential impact indicator scores",
    57: "Supercritical water technology resource-recovery process",
    100: "DPSIR framework linking drivers, pressures, state, impacts and responses",
    102: "Climate impacts and opportunities for aquaculture",
}
for page_number, description in supplements.items():
    slug = next(slug for slug, entry in manifest.items() if entry["startPage"] <= page_number <= entry["endPage"])
    page = archive[page_number - 1]
    boxes = [box for box in table_boxes[str(page_number)] if box[2] - box[0] > 200 and box[3] - box[1] > 70]
    box = max(boxes, key=lambda box: (box[2] - box[0]) * (box[3] - box[1]))
    rect = fitz.Rect(box[0] - 2, page.rect.height - box[3] - 3, box[2] + 2, page.rect.height - box[1] + 3) & page.rect
    if page_number == 57:
        rect.y0 = 62  # Start at the resource-recovery callout, below the page header/logo.
    if page_number == 100:
        rect.y0 = 565  # Exclude the preceding paragraph's descenders.
    name = f"page-{page_number:03d}-table.webp"
    pixmap = page.get_pixmap(matrix=fitz.Matrix(3, 3), clip=rect, alpha=False)
    Image.frombytes("RGB", (pixmap.width, pixmap.height), pixmap.samples).save(assets / name, "WEBP", lossless=True)
    body = json.loads((rebuilt / f"{slug}.json").read_text(encoding="utf-8"))
    nodes = [(index, text(node)) for index, node in enumerate(body["root"]["children"]) if len(text(node)) > 25]
    preceding = [block[4] for block in page.get_text("blocks") if block[6] == 0 and 55 < block[1] and block[3] <= rect.y0 + 4]
    candidates = [(difflib.SequenceMatcher(None, normalized(candidate), normalized(value)).ratio(), idx, value) for candidate in preceding for idx, value in nodes]
    score, index, anchor = max(candidates, default=(0.0, nodes[0][0], nodes[0][1]))
    # Reviewed section placements for multi-page tables with no preceding body
    # text on the same page. Store the text anchor, never a fragile runtime index.
    reviewed_indices = {29: 32, 32: 54, 33: 63, 36: 7, 44: 43, 46: 43, 47: 43,
                        48: 51, 49: 51, 51: 54, 52: 54, 53: 59, 57: 11, 100: 6, 102: 25}
    index = reviewed_indices[page_number]
    anchor = text(body["root"]["children"][index])
    score = 1.0
    # Readable text is kept alongside each exact visual crop for assistive access.
    transcript = page.get_textbox(rect).strip()
    manifest[slug]["figures"].append({"src": f"/images/publications/archive/{name}", "width": pixmap.width,
        "height": pixmap.height, "page": page_number, "caption": description, "alt": description,
        "transcript": transcript, "afterText": anchor})
    audit.append({"slug": slug, "page": page_number, "image": name, "anchorIndex": index, "confidence": round(score, 3), "kind": "table-or-vector"})

# Archive editions preserve every original paragraph, table and footnote without
# replacing the separately edited CMS text or mixing different reference editions.
originals = root / "public" / "publications" / "archive"
originals.mkdir(parents=True, exist_ok=True)
for slug, entry in manifest.items():
    original = fitz.open()
    original.insert_pdf(archive, from_page=entry["startPage"] - 1, to_page=entry["endPage"] - 1)
    original.save(originals / f"{slug}.pdf", garbage=4, deflate=True)
    original.close()
    entry["originalPdf"] = f"/publications/archive/{slug}.pdf"
    entry["figures"].sort(key=lambda figure: figure["page"])
# The 25th article is outside the archive. Its original publisher still hosts
# the missing Sankey diagram, downloaded separately from that article's image link.
sudan_image = assets / "sudan-energy-balance-2020.png"
if sudan_image.exists():
    slug = "sudan-s-energy-balance-2020"
    width, height = Image.open(sudan_image).size
    body = json.loads((rebuilt / f"{slug}.json").read_text(encoding="utf-8"))
    manifest[slug] = {"startPage": None, "endPage": None, "figures": [{
        "src": "/images/publications/archive/sudan-energy-balance-2020.png", "width": width, "height": height,
        "page": None, "sourceUrl": "https://www.enerqa.co.uk/sudan-s-energy-balance-2020",
        "caption": "Sudan's energy balance, 2020. All units are in kilotons of oil equivalent (kTOE).",
        "alt": "Sankey diagram of Sudan's 2020 energy supply, transformation losses and consumption by sector, in kilotons of oil equivalent.",
        "afterText": text(body["root"]["children"][0]),
    }]}

destination = root / "src" / "lib" / "content" / "publication-figures.json"
destination.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
(root / "docs" / "feedback" / "publication-figure-anchors.json").write_text(json.dumps(audit, indent=2) + "\n", encoding="utf-8")
sheet = Image.new("RGB", (1250, ((len(previews) + 4) // 5) * 185), "white")
for i, tile in enumerate(previews):
    sheet.paste(tile, ((i % 5) * 250, (i // 5) * 185))
sheet.save(root / "docs" / "feedback" / "publication-figures-contact-sheet.jpg")
print(f"Recovered {archive_count} archive images; {sum(len(value['figures']) for value in manifest.values())} total images across {sum(bool(value['figures']) for value in manifest.values())} articles.")
print(json.dumps([item for item in audit if item['confidence'] < 0.45], indent=2))
