# IMGW Meteorologist Collector

An application for collecting and filtering data from the IMGW API. 
It was created to enable home automation to collect data, 
present it visually and generate appropriate notifications.
----
## API Reference

#### Get warnings for your location

```http
  GET /weather/warnings?location=""
```

| Parameter  | Type     | Description                                                 |
|:-----------|:---------|:------------------------------------------------------------|
| `location` | `string` | **Required**. Your location like "Łódź" or "aleksandrowski" |
| `location` | `number` | **Required**. Your location like given by teryt 0456        |

you can specify the location for which weather warnings should be searched.
the location can be given as a number (1234) or the name of the city (Łódź) or land (aleksandrowski)

#### Response from API for founded warnings 

```json
{
    "location": "Łódź",
    "phenomenonName": "Gęsta mgła",
    "lastUpdate": "2024-11-07T22:07:38.272Z",
    "estimatedEndTime": "10 godzin 52 min",
    "errorMessage": "",
    "warnings": [
        {
            "phenomenonName": "Gęsta mgła",
            "additionalInfo": {
                "level": 1,
                "probability": 80,
                "validTo": "2024-11-08T09:00:00.000Z",
                "validFrom": "2024-11-07T20:00:00.000Z",
                "estimatedEndTime": "10 godzin 52 min",
                "published": "2024-11-07T11:23:00.000Z",
                "content": "Prognozuje się gęste mgły, w zasięgu których...",
                "comment": "Brak."
            },
            "style": {
                "color": "yellow",
                "icon": "/local/icon/info/code-yellow.png"
            }
        }
    ]
}
```
*if there is more than one weather warning for your location, it will be added to the warnings array

#### Response from API for not found warnings

```json
{
  "location": "Łódź",
  "phenomenonName": "Brak ostrzeżeń",
  "lastUpdate": "2024-11-07T22:37:23.238Z",
  "estimatedEndTime": "Not available",
  "errorMessage": "Not found warnings for given location (Poznań)",
  "warnings": []
}
```
*if the data you entered into the search exists, but there are currently no warnings, you will be informed about this in the errorMessage

#### Response from API for not found location

```json
{
  "location": "Not found location for given territory: aleksandrowskiii",
  "phenomenonName": "Brak ostrzeżeń",
  "lastUpdate": "2024-11-07T22:11:04.453Z",
  "estimatedEndTime": "Not available",
  "errorMessage": "Not found warnings for given location (aleksandrowskiii)",
  "warnings": []
}
```
*if the data you entered for the search does not exist, you will be informed about it in location field

## Run Meteorologist Collector
| ENV        | Type     | Description                                                                   |
|:-----------|:---------|:------------------------------------------------------------------------------|
| `IMGW_API_URL` | `string` | **Required**. imgw api - https://danepubliczne.imgw.pl/api/data/warningsmeteo |
| `LOG_LEVEL` | `string` | **Required**. default info                                                    |
| `ICON_LOCATION` | `string` | **Optional**. location homeassitant icon for 'iconPath' generator             |
| `ICON_EXTENSION` | `string` | **Optional**. extension of icon file                                          |


### Docker

```bash
   docker run \
   --name meteocollector \
   --restart=unless-stopped \
   -p 8080:8080 \
   -e IMGW_API_URL=https://danepubliczne.imgw.pl/api/data/warningsmeteo \
   -e LOG_LEVEL=debug \
   maciek600/meteocollector:v1.0.0 
```

### Docker Compose

```yaml
services:
  meteo_collector:
    image: maciek600/meteocollector:tagname
    container_name: meteo-collector-api
    restart: unless-stopped
    ports:
      - '8080:8080'
    environment:
      - IMGW_API_URL=https://danepubliczne.imgw.pl/api/data/warningsmeteo
      - LOG_LEVEL=info
      - ICON_LOCATION=
      - ICON_EXTENSION=
```


## Roadmap
- Syngeos API
- IMGW hydro 
- IMGW weather station
- Send data to HomeAssistant via MQTT 



## Tech Stack

**Server:** Node, Express, Typescript

## Authors
- [@mstepien](https://www.github.com/MS151994)