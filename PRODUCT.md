# Social Intelligence OS

## Product promise
Search anything. Upload anything. Find where it appeared. Understand what people said and how content spread.

## Two core workflows
1. Listen: keyword, brand, person, campaign, hashtag -> discover mentions across connected sources -> normalize -> deduplicate -> classify sentiment/topic/entity -> dashboard.
2. Trace: image/video/audio/url/text -> extract fingerprints/OCR/transcript -> discover public copies and related uses -> classify original/repost/edit/remix/reaction/coverage -> content genealogy.

## MVP
- Universal keyword search
- Web + News connectors
- Result normalization and deduplication
- Platform, sentiment, topic, source and date fields
- CSV export
- Content Trace UI foundation for image/video/audio uploads

## Planned connectors
News, Web, YouTube, Telegram, Reddit, X, Instagram, TikTok. Connector availability depends on public indexing, official APIs, authorized accounts, and third-party data providers.

## Dashboard
Overview / Search / Content Trace / Feed / Topics / Sources / Alerts.

## Result schema
id, title, url, platform, source, author, publishedAt, text, mediaUrl, contentType, usageType, sentiment, topic, entities, relevance, engagement, matchedTerms.

## Content usage taxonomy
Original, Repost, Partial Reuse, Edited, Remix, Reaction, Commentary, News Coverage, Meme, Quote, Parody.

## Product principles
- Never hard-code a customer or show as product logic.
- Sources are connectors behind a common normalized data layer.
- Search quality is more important than result volume.
- Every result links back to its source.
- Unsupported/private platform data must be represented honestly rather than fabricated.
