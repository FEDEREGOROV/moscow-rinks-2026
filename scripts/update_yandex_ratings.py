#!/usr/bin/env python3
"""Save the rating printed by each official Yandex Maps review widget."""

import concurrent.futures
import datetime
import html
import json
import pathlib
import re
import urllib.request


ROOT = pathlib.Path(__file__).resolve().parents[1]
WIDGETS = ROOT / "rink-review-widgets.js"
OUTPUT = ROOT / "rink-review-ratings.json"
ENTRIES = re.compile(r"^  '([^']+)': '([0-9]+)',?$", re.MULTILINE)
SCORE = re.compile(r'<p class="mini-badge__stars-count">([0-5][,.][0-9])</p>')
COUNTS = re.compile(r'<a class="mini-badge__rating"[^>]*>([^<]+)</a>')


def read_rating(entry):
    name, org_id = entry
    url = f"https://yandex.ru/maps-reviews-widget/{org_id}?comments"
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(request, timeout=15) as response:
        page = response.read().decode("utf-8")
    score = SCORE.search(page)
    counts = COUNTS.search(page)
    if not score or not counts:
        return name, None
    score_text = score.group(1).replace(".", ",")
    return name, {
        "score": float(score_text.replace(",", ".")),
        "scoreText": score_text,
        "countsText": html.unescape(counts.group(1)).strip(),
        "checkedAt": datetime.date.today().isoformat(),
    }


def main():
    entries = ENTRIES.findall(WIDGETS.read_text(encoding="utf-8"))
    if not entries:
        raise SystemExit("No Yandex widget IDs found")
    previous = json.loads(OUTPUT.read_text(encoding="utf-8"))["ratings"] if OUTPUT.exists() else {}
    ratings = {name: previous[name] for name, _ in entries if name in previous}
    failures = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        future_to_name = {pool.submit(read_rating, entry): entry[0] for entry in entries}
        for future in concurrent.futures.as_completed(future_to_name):
            name = future_to_name[future]
            try:
                _, rating = future.result()
                if rating is None:
                    ratings.pop(name, None)
                else:
                    ratings[name] = rating
            except Exception as error:
                failures.append(f"{name}: {error}")
    ordered = {name: ratings[name] for name, _ in entries if name in ratings}
    OUTPUT.write_text(json.dumps({"ratings": ordered}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Ratings: {len(ratings)} / {len(entries)} Yandex widgets")
    if failures:
        print("Failed to refresh; previous values retained:")
        print("\n".join(failures))


if __name__ == "__main__":
    main()
