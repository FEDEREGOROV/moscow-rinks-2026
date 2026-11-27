#!/usr/bin/env python3
"""Собирает метаданные публикаций из открытых RSS-лент для раздела новостей."""

from __future__ import annotations

import hashlib
import html
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path


OUTPUT = Path(__file__).resolve().parents[1] / "news-data.json"
GOOGLE_RSS = "https://news.google.com/rss/search"
RINK_WORD = re.compile(r"(?<!\w)кат(?:ок|ка|ку|ке|ки|ков|кам|ками|ках|ком)(?!\w)", re.I)
LUZHNIKI_WORD = re.compile(r"(?<!\w)лужник\w*", re.I)
PUBLISHER_FEEDS = (
    ("Москва 24", "https://www.m24.ru/", "https://www.m24.ru/rss.xml"),
    ("РИА Новости", "https://ria.ru/", "https://ria.ru/export/rss2/index.xml"),
    ("Российская газета", "https://rg.ru/", "https://rg.ru/xml/index.xml"),
)
NON_NEWS_HOSTS = {"kudamoscow.ru"}


def clean_text(value: str | None) -> str:
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]*>", "", value or ""))).strip()


def https_url(value: str | None) -> str | None:
    if not value:
        return None
    parsed = urllib.parse.urlparse(value.strip())
    return value.strip() if parsed.scheme == "https" and parsed.netloc else None


def fetch(url: str) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": "MoscowRinksNews/1.0 (+https://github.com/FEDEREGOROV/moscow-rinks-2026)", "Accept": "application/rss+xml, application/xml, text/xml, */*"})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(request, timeout=20) as response:
                return response.read(2_000_000)
        except urllib.error.HTTPError as error:
            if error.code != 429 or attempt == 2:
                raise
            time.sleep(3 * (attempt + 1))
    raise RuntimeError("RSS-запрос не выполнен")


def parse_feed(xml_data: bytes, label: str | None = None, site: str | None = None, via: str = "RSS") -> list[dict]:
    root = ET.fromstring(xml_data)
    result = []
    for node in root.findall(".//item"):
        title = clean_text(node.findtext("title"))
        link = https_url(node.findtext("link"))
        source = node.find("source")
        source_name = clean_text(source.text) if source is not None else label
        source_url = https_url(source.get("url")) if source is not None else site
        if not title or not link or not source_name:
            continue
        if source_name.startswith("https://"):
            source_name = urllib.parse.urlparse(source_name).netloc
        suffix = " - " + source_name
        if title.casefold().endswith(suffix.casefold()):
            title = title[: -len(suffix)].strip()
        try:
            published = parsedate_to_datetime(node.findtext("pubDate") or "")
            if published.tzinfo is None:
                published = published.replace(tzinfo=timezone.utc)
            published_at = published.astimezone(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")
        except (TypeError, ValueError):
            continue
        publisher = urllib.parse.urlparse(source_url or link).netloc.removeprefix("www.")
        if publisher in NON_NEWS_HOSTS:
            continue
        identity = publisher + "\n" + title.casefold()
        result.append({
            "id": hashlib.sha256(identity.encode()).hexdigest()[:20],
            "title": title,
            "url": link,
            "source": source_name,
            "sourceUrl": source_url or f"https://{publisher}/",
            "publishedAt": published_at,
            "via": via,
        })
    return result


def google_url(query: str) -> str:
    return GOOGLE_RSS + "?" + urllib.parse.urlencode({"q": query, "hl": "ru", "gl": "RU", "ceid": "RU:ru"})


def collect(now: datetime) -> tuple[dict[str, list[dict]], int]:
    queries = (("Лужники when:30d", "luzhniki"), ("каток when:30d", "rinks"), ("катки when:30d", "rinks"))
    cutoff = (now - timedelta(days=120)).isoformat(timespec="seconds").replace("+00:00", "Z")
    feeds: dict[str, list[dict]] = {"luzhniki": [], "rinks": []}
    success = 0
    for query, category in queries:
        try:
            found = parse_feed(fetch(google_url(query)), via="Google News RSS")
            feeds[category].extend(article for article in found if article["publishedAt"] >= cutoff)
            success += 1
            print(f"Google News RSS {query}: {len(found)}", file=sys.stderr)
        except (OSError, ET.ParseError, ValueError) as error:
            print(f"Не удалось получить Google News RSS {query}: {error}", file=sys.stderr)
        time.sleep(1)
    for label, site, url in PUBLISHER_FEEDS:
        try:
            found = parse_feed(fetch(url), label=label, site=site, via=label + " RSS")
            for article in found:
                if article["publishedAt"] < cutoff:
                    continue
                if LUZHNIKI_WORD.search(article["title"]):
                    feeds["luzhniki"].append(article)
                if RINK_WORD.search(article["title"]):
                    feeds["rinks"].append(article)
            success += 1
            print(f"{label} RSS: {len(found)}", file=sys.stderr)
        except (OSError, ET.ParseError, ValueError) as error:
            print(f"Не удалось получить {label} RSS: {error}", file=sys.stderr)
    return feeds, success


def merge(old: list[dict], new: list[dict], cutoff: str) -> list[dict]:
    by_id: dict[str, dict] = {}
    for article in old + new:
        if not isinstance(article, dict) or article.get("publishedAt", "") < cutoff or not https_url(article.get("url")):
            continue
        if urllib.parse.urlparse(article.get("sourceUrl", "")).netloc.removeprefix("www.") in NON_NEWS_HOSTS:
            continue
        key = article.get("id")
        if not key:
            continue
        previous = by_id.get(key)
        if previous is None or (previous.get("via") == "Google News RSS" and article.get("via") != "Google News RSS"):
            by_id[key] = article
    return sorted(by_id.values(), key=lambda article: article["publishedAt"], reverse=True)[:1500]


def main() -> None:
    now = datetime.now(timezone.utc)
    existing = json.loads(OUTPUT.read_text()) if OUTPUT.exists() else {"feeds": {"luzhniki": [], "rinks": []}}
    new, success = collect(now)
    if success == 0:
        raise SystemExit("Все RSS-источники недоступны; текущий снимок сохранён")
    cutoff = (now - timedelta(days=120)).isoformat(timespec="seconds").replace("+00:00", "Z")
    feeds = {name: merge(existing.get("feeds", {}).get(name, []), new[name], cutoff) for name in ("luzhniki", "rinks")}
    data = {
        "schemaVersion": 1,
        "updatedAt": now.isoformat(timespec="seconds").replace("+00:00", "Z"),
        "feeds": feeds,
    }
    OUTPUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    print(f"Лужники: {len(feeds['luzhniki'])}; катки: {len(feeds['rinks'])}; доступных RSS: {success}")


if __name__ == "__main__":
    main()
