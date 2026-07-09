import requests
import time
import pandas as pd
from datetime import datetime, timedelta
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("WeatherEngine")

class WeatherIntegrationEngine:
    """
    Handles fetching weather data for ML Training (Historical) and Inference (Forecast/Climatology).
    Uses the Open-Meteo API which is 100% FREE, requires NO API KEY, and supports 10,000 calls/day.
    """
    def __init__(self):
        self.geocoding_url = "https://geocoding-api.open-meteo.com/v1/search"
        self.archive_url = "https://archive-api.open-meteo.com/v1/archive"
        self.forecast_url = "https://api.open-meteo.com/v1/forecast"
        
        # Cache to avoid hitting geocoding API repeatedly for the same stadium
        self.venue_coords_cache = {}

    def get_coordinates(self, venue_name: str, country: str = "") -> tuple:
        """Finds Latitude and Longitude for a given stadium/venue."""
        query = f"{venue_name} {country}".strip()
        
        if query in self.venue_coords_cache:
            return self.venue_coords_cache[query]
            
        try:
            params = {"name": venue_name, "count": 1, "format": "json"}
            response = requests.get(self.geocoding_url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if "results" in data and len(data["results"]) > 0:
                lat = data["results"][0]["latitude"]
                lon = data["results"][0]["longitude"]
                self.venue_coords_cache[query] = (lat, lon)
                return lat, lon
            else:
                logger.warning(f"Could not find coordinates for {query}")
                return None, None
                
        except Exception as e:
            logger.error(f"Geocoding API error for {query}: {e}")
            return None, None
        finally:
            # Respect rate limits (1 request per second for geocoding is safe)
            time.sleep(1)

    def fetch_historical_weather(self, lat: float, lon: float, date_str: str) -> dict:
        """Fetches EXACT weather data for past matches to Train the ML Model."""
        params = {
            "latitude": lat,
            "longitude": lon,
            "start_date": date_str,
            "end_date": date_str,
            "daily": "temperature_2m_max,precipitation_sum,windspeed_10m_max",
            "timezone": "auto"
        }
        
        try:
            res = requests.get(self.archive_url, params=params)
            res.raise_for_status()
            data = res.json()
            
            if "daily" in data:
                # Open-Meteo daily archive doesn't explicitly have a single 'cloud_cover' daily mean, 
                # but we can infer overcast conditions based on high precipitation & low temp proxies, 
                # or you can query hourly 'cloudcover' and average it. For simplicity, we use proxy logic here.
                precip = data["daily"]["precipitation_sum"][0]
                wind = data["daily"]["windspeed_10m_max"][0]
                
                # Simple Proxy: If it rained more than 2mm, it's likely overcast.
                cloud_cover_proxy = 80.0 if precip > 2.0 else 30.0
                
                return {
                    "temperature": data["daily"]["temperature_2m_max"][0],
                    "rain_probability": precip, 
                    "wind_speed": wind,
                    "cloud_cover": cloud_cover_proxy
                }
        except Exception as e:
            logger.error(f"Historical weather error on {date_str}: {e}")
            
        return {"temperature": None, "rain_probability": None, "wind_speed": None, "cloud_cover": None}

    def fetch_climatology_for_future(self, lat: float, lon: float, target_date_str: str) -> dict:
        """
        Calculates Historical Averages for matches far in the future (e.g. 2027).
        It pulls the weather for that exact month/day from the last 5 years and averages it.
        """
        target_date = datetime.strptime(target_date_str, "%Y-%m-%d")
        
        temps = []
        rains = []
        winds = []
        clouds = []
        
        # Look back up to 5 historical years
        current_year = datetime.now().year
        valid_years_checked = 0
        years_back = target_date.year - current_year + 1
        
        while valid_years_checked < 5 and years_back < 20: # cap at 20 years back
            past_date = target_date.replace(year=target_date.year - years_back)
            past_date_str = past_date.strftime("%Y-%m-%d")
            
            past_weather = self.fetch_historical_weather(lat, lon, past_date_str)
            if past_weather["temperature"] is not None:
                temps.append(past_weather["temperature"])
                rains.append(past_weather["rain_probability"])
                winds.append(past_weather["wind_speed"])
                clouds.append(past_weather["cloud_cover"])
                valid_years_checked += 1
                
            years_back += 1
            time.sleep(0.5) # rate limit protection
            
        if temps:
            return {
                "temperature": round(sum(temps) / len(temps), 1),
                "rain_probability": round(sum(rains) / len(rains), 1),
                "wind_speed": round(sum(winds) / len(winds), 1),
                "cloud_cover": round(sum(clouds) / len(clouds), 1)
            }
        return {"temperature": None, "rain_probability": None, "wind_speed": None, "cloud_cover": None}

    def process_dataset(self, df: pd.DataFrame, save_path: str = None) -> pd.DataFrame:
        """
        Iterates over the dataset to append weather features.
        Built with rate limiting so it won't crash your internet or IP ban you.
        """
        logger.info(f"Starting weather extraction for {len(df)} rows...")
        
        temps, rains, winds, clouds = [], [], [], []
        
        today = datetime.now()
        
        for idx, row in df.iterrows():
            venue = row.get("venue_name", "")
            country = row.get("venue_country", "")
            match_date_str = row.get("match_date", "")
            
            if not venue or not match_date_str:
                temps.append(None); rains.append(None); winds.append(None); clouds.append(None)
                continue
                
            lat, lon = self.get_coordinates(venue, country)
            
            if lat is None or lon is None:
                temps.append(None); rains.append(None); winds.append(None); clouds.append(None)
                continue

            try:
                match_date = datetime.strptime(match_date_str, "%Y-%m-%d")
            except:
                temps.append(None); rains.append(None); winds.append(None); clouds.append(None)
                continue

            # Check if match is in the past, near future, or far future
            days_diff = (match_date - today).days

            weather = {"temperature": None, "rain_probability": None, "wind_speed": None, "cloud_cover": None}

            if days_diff < 0:
                # Past match - Get exact historical weather
                weather = self.fetch_historical_weather(lat, lon, match_date_str)
            elif days_diff <= 14:
                # Near future - In reality we'd hit the forecast API, but for simplicity of this script
                # we can use the same logic or just use climatology
                weather = self.fetch_climatology_for_future(lat, lon, match_date_str)
            else:
                # Far future (e.g. 2027) - Climatology
                weather = self.fetch_climatology_for_future(lat, lon, match_date_str)

            temps.append(weather["temperature"])
            rains.append(weather["rain_probability"])
            winds.append(weather["wind_speed"])
            clouds.append(weather["cloud_cover"])
            
            # Print progress every 10 rows
            if (idx + 1) % 10 == 0:
                logger.info(f"Processed {idx + 1}/{len(df)} matches...")
                if save_path:
                    # Save incremental progress
                    temp_df = df.copy()
                    temp_df["temperature"] = pd.Series(temps)
                    temp_df["rain_probability"] = pd.Series(rains)
                    temp_df["wind_speed"] = pd.Series(winds)
                    temp_df["cloud_cover"] = pd.Series(clouds)
                    temp_df.to_csv(save_path, index=False)
                    
            # API Safety Sleep to prevent limits (Open-Meteo allows lots, but better safe)
            time.sleep(0.5)

        df["temperature"] = temps
        df["rain_probability"] = rains
        df["wind_speed"] = winds
        df["cloud_cover"] = clouds
        
        if save_path:
            df.to_csv(save_path, index=False)
            logger.info(f"Saved weather-enriched dataset to {save_path}")
            
        return df

if __name__ == "__main__":
    # Test script usage
    engine = WeatherIntegrationEngine()
    test_data = pd.DataFrame([
        {"venue_name": "Lord's", "venue_country": "England", "match_date": "2023-07-15"}, # Past
        {"venue_name": "MCG", "venue_country": "Australia", "match_date": "2027-12-26"} # Future 2027
    ])
    
    result = engine.process_dataset(test_data)
    print("\nWeather Results:\n", result)
