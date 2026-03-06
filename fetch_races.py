import requests
from bs4 import BeautifulSoup
import json
import re
import os

DATA_FILE = "data/races.json"
DATA_DIR = "data"

def fetch_races():
    url = "https://trailrunner.jp/taikai.html"
    print(f"Fetching {url}...")
    try:
        response = requests.get(url)
        response.raise_for_status()
        response.encoding = response.apparent_encoding
    except Exception as e:
        print(f"Error fetching URL: {e}")
        return []

    soup = BeautifulSoup(response.text, "html.parser")
    # The page uses tables for layout. We need to be careful.
    # Based on inspection, race rows are in tables.
    tables = soup.find_all("table")
    
    races = []
    
    for table in tables:
        rows = table.find_all("tr")
        for row in rows:
            cols = row.find_all("td")
            if len(cols) < 2:
                continue
            
            # col 0: Date string e.g. "2月1日(日)"
            date_col_text = cols[0].get_text(strip=True)
            # Try to extract month
            month_match = re.search(r'(\d+)月', date_col_text)
            if not month_match:
                continue
            month = int(month_match.group(1))
            
            # col 1: Details
            detail_cell = cols[1]
            full_text = detail_cell.get_text(strip=True)
            
            # Race Name: usually in <strong>
            name_tag = detail_cell.find("strong")
            if name_tag:
                race_name = name_tag.get_text(strip=True)
            else:
                # Fallback: take text before first '(' or '【'
                race_name = re.split(r'[（(【]', full_text)[0]

            # Prefecture: (県名) - look for text inside parentheses
            # regex to find (Something)
            pref_match = re.search(r'[（(](.*?)[)）]', full_text)
            prefecture = pref_match.group(1) if pref_match else "その他"
            
            # Distance: 【distance】
            dist_match = re.search(r'【(.*?)】', full_text)
            distance_str = dist_match.group(1) if dist_match else ""
            
            # Distance Category
            # Extract all numbers from distance string
            dist_nums = re.findall(r'(\d+)', distance_str)
            dist_category = "ショート" # Default
            
            if dist_nums:
                try:
                    # Treat the maximum distance mentioned as the categorization basis
                    max_dist = max(map(int, dist_nums))
                    if max_dist >= 50:
                        dist_category = "ロング"
                    elif max_dist >= 20:
                        dist_category = "ミドル"
                    else:
                        dist_category = "ショート"
                except:
                    pass
            elif "km" not in distance_str and "mile" in distance_str:
                 # simplistic check for miles
                 dist_category = "ロング"

            # Link
            link_tag = detail_cell.find("a", href=True)
            link = link_tag['href'] if link_tag else "#"

            races.append({
                "month": month,
                "date": date_col_text,
                "name": race_name,
                "prefecture": prefecture,
                "distance": distance_str,
                "category": dist_category,
                "link": link
            })
            
    return races

def save_races(races_data):
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
    
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(races_data, f, ensure_ascii=False, indent=2)
    print(f"Saved {len(races_data)} races to {DATA_FILE}")

if __name__ == "__main__":
    data = fetch_races()
    if data:
        save_races(data)
    else:
        print("No races found or error occurred.")
