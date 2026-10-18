"""Read the supplied archive and inventory original figures without CMS writes."""
import json
from pathlib import Path
from pypdf import PdfReader

root = Path(__file__).resolve().parent.parent
reader = PdfReader(root / "docs" / "enerQA's 2024 publication archive.pdf")
pages = []
for number, page in enumerate(reader.pages, 1):
    text = page.extract_text() or ""
    images = []
    for image in page.images:
        width, height = image.image.size
        if width >= 200 and height >= 150:
            images.append({"name": image.name, "width": width, "height": height})
    pages.append({"page": number, "text": text, "images": images})
out = root / "docs" / "feedback"
out.mkdir(exist_ok=True)
(out / "publication-archive-inventory.json").write_text(json.dumps(pages, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"Archive: {len(pages)} pages; {sum(len(p['images']) for p in pages)} images at least 200 x 150 pixels.")
for page in pages:
    if page["images"]:
        print(json.dumps({"page": page["page"], "text": page["text"][:130], "images": page["images"]}, ensure_ascii=True))
