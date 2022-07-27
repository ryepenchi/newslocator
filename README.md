# newslocator

A Web-App showing places mentioned in the news on a map.

Scraping news sites (currently only theGuardian.com) with **python** and **rssparser**

Geoparsing with external services using **geopy**

Managing data with an SQLite database using **flask_sqlalchemy**

Displaying results with **Flask / Leaflet.js**

**Try it:** [https://newslocator.ryepenchi.xyz/](https://newslocator.ryepenchi.xyz/) (Hopefully a live version)

### Ubuntu 20.04 Server Setup
```
sudo apt update && sudo apt upgrade -y
sudo apt install python3-pip python3-dev build-essential libssl-dev libffi-dev python3-setuptools python3-venv unzip
```

### Project Files
```
wget https://github.com/ryepenchi/newslocator/archive/master.zip
unzip master.zip && rm master.zip && mv newslocator-master newslocator && cd newslocator
```
or if git is available
```
git clone https://github.com/ryepenchi/newslocator.git && cd newslocator
```
### Virtual environment and Python packages
```
python3.8 -m venv newslocator
source newslocator/bin/activate
pip install wheel
pip install -r requirements.txt
```
### Download a pre-trained model for the spacy NER
```
python -m spacy download en_core_web_md
```
### Initialize the Database
```
python src/dbconfig.py
```
### Test the scraper
```
python src/rss_scraper_en.py
```
### Set up cron job to periodically run scraper
```
crontab -e
```
and add
```
20 * * * * /home/[YOUR_USER_NAME]/newslocator/bin/python newslocator/src/rss_scraper_en.py -a
```
### Start Flask Server
Follow the instructions at

https://www.digitalocean.com/community/tutorials/how-to-serve-flask-applications-with-uwsgi-and-nginx-on-ubuntu-20-04
