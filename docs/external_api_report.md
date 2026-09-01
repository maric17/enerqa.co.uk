# External API Integration Report

This document outlines all the third-party external APIs currently integrated into the **enerQA** application. It details the purpose of each API, the specific endpoints utilized, authentication requirements, and the caching strategies applied to optimize performance and minimize unnecessary requests.

---

## 1. NASA POWER API
Used to retrieve daily meteorology and solar radiation data.
- **File:** `src/lib/api/nasaPower.ts`
- **Endpoint:** `https://power.larc.nasa.gov/api/temporal/daily/point`
- **Parameters:** `T2M` (Temperature at 2 Meters), `ALLSKY_SFC_SW_DWN` (All Sky Surface Shortwave Downward Irradiance)
- **Authentication:** None required.
- **Caching:** Revalidated every 12 hours.
- **Fallback:** Provides mock data for UI demonstrations if the API is unreachable.

## 2. World Bank Climate Change Knowledge Portal (CCKP) API
Provides projected climate data. Used specifically for precipitation projections.
- **File:** `src/lib/api/cckp.ts`
- **Endpoint:** `https://cckpapi.worldbank.org/cckp/v1/cmip6-x0.25_climatology_pr_climatology_annual_2020-2039_median_ssp245_ensemble_all_mean/QAT?_format=json`
- **Parameters:** CMIP6 Precipitation Projections for Qatar (SSP2-4.5).
- **Authentication:** None required.
- **Caching:** Revalidated every 24 hours.
- **Fallback:** Uses mock data if the API is unavailable.

## 3. OpenStreetMap Overpass API
Utilized for querying geospatial data, specifically mapping energy infrastructure.
- **File:** `src/lib/api/osm.ts`
- **Endpoint:** `https://overpass-api.de/api/interpreter` (POST request)
- **Query:** `[out:json];area["ISO3166-1"="QA"][admin_level=2]->.searchArea;nwr["power"="plant"](area.searchArea);out count;`
- **Purpose:** Counts the number of power plants registered in Qatar.
- **Authentication:** None required.
- **Caching:** Revalidated every 24 hours. Includes a 5-second timeout to prevent request hanging.

## 4. World Bank API (SDG 7 Alternative)
Provides sustainable development indicator data. Used as a reliable alternative to the UN SDG API which occasionally returns empty sets for specific regions.
- **File:** `src/lib/api/unSdg.ts`
- **Endpoint:** `https://api.worldbank.org/v2/country/qat/indicator/EG.FEC.RNEW.ZS?format=json&per_page=10`
- **Purpose:** Fetches Renewable energy consumption (% of total final energy consumption).
- **Authentication:** None required.
- **Caching:** Revalidated every 24 hours.

## 5. OpenAQ API
Provides open air quality data.
- **File:** `src/lib/api/openaq.ts`
- **Endpoint:** `https://api.openaq.org/v3/locations/309834/latest`
- **Purpose:** Fetches the latest air quality measurements for Doha, Qatar (specifically tracking PM2.5 and Ozone).
- **Authentication:** **Required.** Uses `X-API-Key` header mapped to `OPENAQ_API_KEY` in environment variables.
- **Caching:** Revalidated every 1 hour.
- **Fallback:** Gracefully falls back to mock data if the token is missing or the API fails.

## 6. UN OCHA HDX API
Provides humanitarian and risk datasets.
- **File:** `src/lib/api/unOcha.ts`
- **Endpoint:** `https://data.humdata.org/api/3/action/package_search?q=Qatar`
- **Purpose:** Retrieves the count of available humanitarian and risk datasets relating to Qatar.
- **Authentication:** None required.
- **Caching:** Revalidated every 24 hours.

## 7. NOAA (National Oceanic and Atmospheric Administration) API
Fetches historical climate summaries.
- **File:** `src/lib/api/noaa.ts`
- **Endpoint:** `https://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=GSOY&locationid=FIPS:QA...`
- **Purpose:** Retrieves yearly climate summaries for stations in Qatar.
- **Authentication:** **Required.** Uses `token` header mapped to `NEXT_PUBLIC_NOAA_TOKEN` in environment variables.
- **Caching:** Revalidated every 24 hours.
- **Fallback:** Defaults to mock data if the API key is not configured.

## 8. WRI Climate Watch API (Historical Emissions)
Provides global historical greenhouse gas emissions data.
- **File:** `src/lib/api/worldBank.ts`
- **Endpoint:** `https://www.climatewatchdata.org/api/v1/data/historical_emissions?regions=QAT&sectors=Total%20excluding%20LULUCF`
- **Purpose:** Fetches historical GHG emissions data for Qatar.
- **Authentication:** None required.
- **Caching:** Revalidated every 24 hours.

---

### Internal API Routes (Prepared for Future Integrations)
There are two internal API routes that currently simulate external API fetches (using mock data and artificial delays) but contain the structural foundations to switch to live data:
1. **Emissions Route:** `src/app/api/climate/emissions/route.ts` - Prepared to fetch from `api.climatewatchdata.org/v1/emissions`.
2. **Temperature Route:** `src/app/api/climate/temperature/route.ts` - Prepared to fetch from `climateknowledgeportal.worldbank.org/api/v1/cru/tas/year/`.
