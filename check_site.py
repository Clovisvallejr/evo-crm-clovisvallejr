import urllib.request
import json
import re

url = 'https://imperiodosplasticos.com.br/sitemap_index.xml'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    print("Trying sitemap...")
    html = urllib.request.urlopen(req).read().decode('utf-8')
    print("Sitemap found! Length:", len(html))
    if 'product' in html:
        print("Products in sitemap.")
except Exception as e:
    print('Error sitemap:', e)

url_api = 'https://imperiodosplasticos.com.br/wp-json/wp/v2/product'
req_api = urllib.request.Request(url_api, headers={'User-Agent': 'Mozilla/5.0'})
try:
    print("Trying wp-json/wp/v2/product...")
    resp = urllib.request.urlopen(req_api).read().decode('utf-8')
    print("API Response:", resp[:200])
except Exception as e:
    print('Error wp-json:', e)
