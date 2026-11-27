import importlib.util
import unittest
from pathlib import Path


SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "update_news.py"
spec = importlib.util.spec_from_file_location("update_news", SCRIPT)
news = importlib.util.module_from_spec(spec)
spec.loader.exec_module(news)


class NewsFeedTest(unittest.TestCase):
    def test_parses_source_and_removes_publisher_suffix(self):
        xml = b'''<rss><channel><item>
          <title>New rink in Luzhniki - Publisher</title>
          <link>https://example.com/one</link>
          <pubDate>Fri, 27 Nov 2026 08:00:00 GMT</pubDate>
          <source url="https://example.com">Publisher</source>
        </item></channel></rss>'''
        article = news.parse_feed(xml, via="Google News RSS")[0]
        self.assertEqual(article["title"], "New rink in Luzhniki")
        self.assertEqual(article["source"], "Publisher")
        self.assertEqual(article["publishedAt"], "2026-11-27T08:00:00Z")

    def test_direct_publisher_url_replaces_aggregator_link(self):
        old = {"id": "same", "title": "Каток открыт", "url": "https://news.google.com/one", "source": "Издание", "sourceUrl": "https://example.com", "publishedAt": "2026-11-27T08:00:00Z", "via": "Google News RSS"}
        direct = {**old, "url": "https://example.com/one", "via": "Издание RSS"}
        merged = news.merge([old], [direct], "2026-11-01T00:00:00Z")
        self.assertEqual(len(merged), 1)
        self.assertEqual(merged[0]["url"], direct["url"])

    def test_keyword_forms(self):
        self.assertIsNotNone(news.LUZHNIKI_WORD.search("В Лужниках откроется каток"))
        self.assertIsNotNone(news.RINK_WORD.search("Пять катков открылись"))
        self.assertIsNone(news.RINK_WORD.search("Кататься на коньках"))


if __name__ == "__main__":
    unittest.main()
