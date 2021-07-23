#!/usr/bin/python3
# -*- coding: utf-8 -*-
"""
Created on Thu Oct 15 09:03:14 2020

@author: ryepenchi
"""
import re
from datetime import datetime
from dateutil import parser as dp
import feedparser

import spacy
from geopy.geocoders import Nominatim

from utilities import log, args, sites
from dbconfig import db, Article, Place

class Scraper:
    _instance = None
    site = None
    number = 0
    feed = None
    cnt = 0

    def __init__(self, args):
        self._instance = self
        if args.site:
            site = args.site.lower()
            if site in sites:
                self.site = sites[site]
        else:
            # Default site
            self.site = sites["theguardian"]

    def __enter__(self):
        self.nlp = spacy.load('en_core_web_md', disable=['parser', 'tagger'])
        self.geolocator = Nominatim(user_agent="wapapp")

    def __exit__(self, exception_type, exception_value, traceback):
        pass

    def get_feeds(self):
        self.feed = feedparser.parse(self.site)

    def scrape_entry(self, entry):
        if any([cat in entry.id for cat in ["/live/", "/video/", "/gallery/"]]):
            return
        # ID
        id = entry.id
        link = entry.id
        # Sanity Check for duplicate
        l = db.session.query(Article.id).all()
        existing_ids = [item for sublist in l for item in sublist]
        if id in existing_ids:
            return
        # TITLE
        title = entry.title
        title = title.replace("'","''")
        # SUBTITLE
        subtitle = ""
        # SCRAPE DATE
        scrape_date = datetime.now()
        # PUB DATE
        pub_date = dp.parse(entry.published)
        # CATEGORIES
        cats = ", ".join([t.term for t in entry.tags])
        # BODY
        body = entry.summary
        tags = re.compile(r'<[^>]+>')
        body = tags.sub("", body)
        #print("replacing shit ")
        body = body.replace("'","''")

        # NLP
        doc = self.nlp(title + body + cats)
        # Select Entities which are either
        # GPE: Countries, cities, states OR
        # LOC: Non-GPE locations, mountain-ranges, bodies of water
        ents = set([ent.text for ent in doc.ents if ent.label_ in ["LOC", "GPE"]])

        # GEOCODE
        br = []
        uids = []
        for ent in ents:
            # Get rid of single letter ents and date ents
            if len(ent) < 3:
                continue
            try:
                if type(dp.parse(ent)) == datetime:
                    continue
            except Exception:
                pass
            r = self.geolocator.geocode(ent)
            # Conditions whether new place was found, is new or relevat
            if r:
                c1 = r.raw["place_id"] not in uids
                c2 = r.raw["importance"] > 0.5
                if all((r, c1, c2)):
                    uids.append(r.raw["place_id"])
                    place = {"word": ent,
                        "address": r.raw["display_name"],
                        "geo": r.point,
                        "place_id": r.raw["place_id"]
                        }
                    br.append(place)

        # ARTICLE ENTRY
        article = Article(
            id = id,
            title = title,
            subtitle = subtitle,
            link = link,
            cats = cats,
            pub_date = pub_date,
            scrape_date = scrape_date,
            words = ",".join(ents),
            body = body
        )

        # PLACES ENTRIES
        l = db.session.query(Place.id).all()
        existing_ids = [item for sublist in l for item in sublist]

        for place in br:
            if place["place_id"] not in existing_ids:
                # make entry in places
                place = Place(
                    id = place["place_id"],
                    word = place["word"],
                    place_name = place["address"],
                    lat = place["geo"].latitude,
                    lon = place["geo"].longitude
                )
                article.places.append(place)
        db.session.add(article)
        db.session.commit()
        self.cnt += 1
    

if __name__ == "__main__":
    log("Scraper started")
    scraper = Scraper(args)
    with scraper:
        if args.all:
            scraper.get_feeds()
            for entry in scraper.feed["entries"]:
                scraper.scrape_entry(entry)
        elif args.number:
            scraper.get_feeds()
            for entry in scraper.feed["entries"][:args.number+1]:
                scraper.scrape_entry(entry)
        else:
            # Get 5 articles by default
            scraper.get_feeds()
            for entry in scraper.feed["entries"][:5]:
                scraper.scrape_entry(entry)
    log("Scraped {} articles from {}".format(scraper.cnt, scraper.site))
