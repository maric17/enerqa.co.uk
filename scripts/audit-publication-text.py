"""Compare source-archive text with every saved article, retaining reviewable gaps."""
import difflib
import json
import re
import unicodedata
from pathlib import Path

root = Path(__file__).resolve().parent.parent
pages = json.loads((root / "docs/feedback/publication-archive-inventory.json").read_text(encoding="utf-8"))
manifest = json.loads((root / "src/lib/content/publication-figures.json").read_text(encoding="utf-8"))

def text(node):
    if "text" in node:
        return node["text"]
    return " ".join(text(child) for child in node.get("children", []))

def words(value):
    value = unicodedata.normalize("NFKC", value).lower()
    return re.findall(r"\w+", value)

report = []
for slug, entry in manifest.items():
    if entry["startPage"] is None:
        continue
    original = " ".join(page["text"] for page in pages if entry["startPage"] <= page["page"] <= entry["endPage"])
    body = json.loads((root / "scripts/publication-rebuild/out" / f"{slug}.json").read_text(encoding="utf-8"))
    original_words, body_words = words(original), words(text(body["root"]))
    gaps = []
    matcher = difflib.SequenceMatcher(None, original_words, body_words, autojunk=False)
    for kind, start, end, _, _ in matcher.get_opcodes():
        if kind in ("replace", "delete") and end - start >= 30:
            gaps.append({"words": end - start, "before": " ".join(original_words[max(0, start-12):start]), "sourceText": " ".join(original_words[start:end]), "after": " ".join(original_words[end:end+12])})
    report.append({"slug": slug, "sourceWords": len(original_words), "rebuiltWords": len(body_words), "matchRatio": round(matcher.ratio(), 3), "reviewGaps": gaps})
    print(f"{slug}: {len(gaps)} source passages of at least 30 words to review")
(root / "docs/feedback/publication-text-comparison.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
