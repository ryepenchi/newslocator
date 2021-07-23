#!/usr/bin/python3
# -*- coding: utf-8 -*-
"""
Created on Thu Oct 15 09:03:14 2020

@author: ryepenchi
"""
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///article_place.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

mentions = db.Table("mentions",
    db.Column("article_id", db.Integer, db.ForeignKey("article.id"), primary_key=True),
    db.Column("place_id", db.Integer, db.ForeignKey("place.id"), primary_key=True)
)

class Article(db.Model):
    id = db.Column(db.String(300), primary_key = True)
    title = db.Column(db.String(300))
    subtitle = db.Column(db.String(300))
    link = db.Column(db.String(300))
    cats = db.Column(db.String(300))
    pub_date = db.Column(db.DateTime)
    scrape_date = db.Column(db.DateTime)
    body = db.Column(db.Text)
    words = db.Column(db.Text)
    places = db.relationship(
        "Place", secondary=mentions, 
            backref=db.backref("articles", lazy=True)
    )

class Place(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    word = db.Column(db.String(50))
    place_name = db.Column(db.String(300))
    lat = db.Column(db.Float)
    lon = db.Column(db.Float)

if __name__ == '__main__':
    db.create_all()
