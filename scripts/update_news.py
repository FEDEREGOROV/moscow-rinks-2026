#!/usr/bin/env python3
"""Собирает новости с сайтов «Лужников» и из открытых RSS-лент."""

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
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from html.parser import HTMLParser
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
OFFICIAL_SITEMAPS = (
    ("Лужники", "https://www.luzhniki.ru/", "https://www.luzhniki.ru/sitemap.xml"),
    ("Аквакомплекс «Лужники»", "https://aqua.luzhniki.ru/", "https://aqua.luzhniki.ru/sitemap.xml"),
)


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


def parse_sitemap(xml_data: bytes, site: str, cutoff_date: str) -> list[tuple[str, str]]:
    root = ET.fromstring(xml_data)
    host = urllib.parse.urlparse(site).netloc
    rows = []
    for node in root.findall(".//{*}url"):
        url = https_url(node.findtext("{*}loc"))
        modified = (node.findtext("{*}lastmod") or "")[:10]
        if not url or urllib.parse.urlparse(url).netloc != host or modified < cutoff_date:
            continue
        path = urllib.parse.urlparse(url).path.rstrip("/")
        if not path.startswith("/news/") or path in {"/news/news", "/news/promo", "/news/press-centr"}:
            continue
        rows.append((url, modified))
    return rows


class OfficialArticleParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.title_parts: list[str] = []
        self.fallback_parts: list[str] = []
        self.in_heading = False
        self.in_title = False
        self.published: str | None = None

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = dict(attrs)
        if tag == "h1" and "article__title" in (attributes.get("class") or ""):
            self.in_heading = True
        elif tag == "title":
            self.in_title = True
        elif tag == "time" and not self.published:
            candidate = (attributes.get("datetime") or "")[:10]
            try:
                datetime.fromisoformat(candidate)
                self.published = candidate
            except ValueError:
                pass

    def handle_endtag(self, tag: str) -> None:
        if tag == "h1":
            self.in_heading = False
        elif tag == "title":
            self.in_title = False

    def handle_data(self, data: str) -> None:
        if self.in_heading:
            self.title_parts.append(data)
        if self.in_title:
            self.fallback_parts.append(data)


def parse_official_article(html_data: bytes, url: str, label: str, site: str, modified: str) -> dict | None:
    parser = OfficialArticleParser()
    parser.feed(html_data.decode("utf-8", "replace"))
    title = clean_text("".join(parser.title_parts) or "".join(parser.fallback_parts).split(" | ")[0])
    if not title or not parser.published:
        return None
    publisher = urllib.parse.urlparse(site).netloc.removeprefix("www.")
    identity = publisher + "\n" + title.casefold()
    return {
        "id": hashlib.sha256(identity.encode()).hexdigest()[:20],
        "title": title,
        "url": url,
        "source": label,
        "sourceUrl": site,
        "publishedAt": parser.published,
        "sourceModifiedAt": modified,
        "via": label + " sitemap",
    }


def collect_official(existing: dict, cutoff_date: str) -> tuple[list[dict], int]:
    cached = {
        item.get("url"): item
        for item in existing.get("feeds", {}).get("luzhniki", [])
        if isinstance(item, dict) and str(item.get("via", "")).endswith(" sitemap")
    }
    articles = []
    success = 0
    for label, site, sitemap in OFFICIAL_SITEMAPS:
        try:
            rows = parse_sitemap(fetch(sitemap), site, cutoff_date)
            success += 1
        except (OSError, ET.ParseError, ValueError) as error:
            print(f"Не удалось получить sitemap {site}: {error}", file=sys.stderr)
            continue
        to_fetch = []
        for url, modified in rows:
            previous = cached.get(url)
            if previous and previous.get("sourceModifiedAt") == modified:
                articles.append(previous)
            else:
                to_fetch.append((url, modified))

        def read_article(row: tuple[str, str]) -> dict | None:
            url, modified = row
            try:
                return parse_official_article(fetch(url), url, label, site, modified)
            except (OSError, ValueError) as error:
                print(f"Не удалось прочитать {url}: {error}", file=sys.stderr)
                return None

        with ThreadPoolExecutor(max_workers=3) as pool:
            articles.extend(article for article in pool.map(read_article, to_fetch) if article)
        print(f"{label}: {len(rows)} страниц в sitemap, новых или изменённых: {len(to_fetch)}", file=sys.stderr)
    return [article for article in articles if article["publishedAt"][:10] >= cutoff_date], success


def collect(now: datetime, existing: dict) -> tuple[dict[str, list[dict]], int]:
    queries = (("Лужники when:30d", "luzhniki"), ("каток when:30d", "rinks"), ("катки when:30d", "rinks"))
    cutoff = (now - timedelta(days=120)).isoformat(timespec="seconds").replace("+00:00", "Z")
    feeds: dict[str, list[dict]] = {"luzhniki": [], "rinks": []}
    official, success = collect_official(existing, cutoff[:10])
    feeds["luzhniki"].extend(official)
    feeds["rinks"].extend(article for article in official if RINK_WORD.search(article["title"]))
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
    by_story: dict[tuple[str, str], dict] = {}
    for article in old + new:
        if not isinstance(article, dict) or article.get("publishedAt", "")[:10] < cutoff[:10] or not https_url(article.get("url")):
            continue
        publisher = urllib.parse.urlparse(article.get("sourceUrl", "")).netloc.removeprefix("www.")
        if publisher in NON_NEWS_HOSTS:
            continue
        title = re.sub(r"\W+", " ", article.get("title", "").casefold()).strip()
        if not title:
            continue
        key = publisher, title
        previous = by_story.get(key)
        priority = lambda item: 2 if str(item.get("via", "")).endswith(" sitemap") else 1 if item.get("via") != "Google News RSS" else 0
        if previous is None or priority(article) > priority(previous) or (priority(article) == priority(previous) and article["publishedAt"] > previous["publishedAt"]):
            chosen = article.copy()
            if previous:
                chosen["id"] = previous.get("id", chosen.get("id"))
            by_story[key] = chosen
    return sorted(by_story.values(), key=lambda article: article["publishedAt"], reverse=True)[:1500]


def main() -> None:
    now = datetime.now(timezone.utc)
    existing = json.loads(OUTPUT.read_text()) if OUTPUT.exists() else {"feeds": {"luzhniki": [], "rinks": []}}
    new, success = collect(now, existing)
    if success == 0:
        raise SystemExit("Все источники недоступны; текущий снимок сохранён")
    cutoff = (now - timedelta(days=120)).isoformat(timespec="seconds").replace("+00:00", "Z")
    feeds = {name: merge(existing.get("feeds", {}).get(name, []), new[name], cutoff) for name in ("luzhniki", "rinks")}
    data = {
        "schemaVersion": 1,
        "updatedAt": now.isoformat(timespec="seconds").replace("+00:00", "Z"),
        "feeds": feeds,
    }
    OUTPUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    print(f"Лужники: {len(feeds['luzhniki'])}; катки: {len(feeds['rinks'])}; доступных источников: {success}")


if __name__ == "__main__":
    main()
