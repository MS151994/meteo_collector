# IMGW Meteorologist Collector

Application for collecting and filtering data from the [IMGW API](https://meteo.imgw.pl/).
It was created to enable home automation to collect data,
present it visually and generate appropriate notifications.

---

## API Reference

#### Get warnings for your location

```
  GET /weather/warnings?location=""
```

| Parameter  | Type     | Description                                                 |
| :--------- | :------- | :---------------------------------------------------------- |
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

\*if there is more than one weather warning for your location, it will be added to the warnings array

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

\*if the data you entered into the search exists, but there are currently no warnings, you will be informed about this in the errorMessage

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

\*if the data you entered for the search does not exist, you will be informed about it in location field

### Additional info to warning

"style" object can be added to each warning, which will contain an icon and a icon url for use in HomeAssistant card
If you want to get it, you need to set the icon path, file extension and enable its feature 

[see more]() 

## Run Meteorologist Collector

| ENV              | Type     | Description                                                                   |
|:-----------------|:---------|:------------------------------------------------------------------------------|
| `IMGW_API_URL`   | `string` | **Optional**. imgw api - https://danepubliczne.imgw.pl/api/data/warningsmeteo |
| `LOG_LEVEL`      | `string` | **Optional**. default info                                                    |
| `ICON_LOCATION`  | `string` | **Optional**. location homeassitant icon for 'iconPath' generator             |
| `ICON_MIME`      | `string` | **Optional**. extension of icon file                                          |
| `ENABLE_ICON`    | `bool`   | **Optional**. enable for set icon and style to each warning                   |

### Docker

```bash
   docker run \
   --name meteocollector \
   --restart=unless-stopped \
   -p 8080:8080 \
   -e LOG_LEVEL=debug \
   -e ENABLE_ICON=true \
   -e ICON_MIME=<file extension> \
   -e ICON_LOCATION=<path/to/icon> \
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
      - "8080:8080"
    environment:
      - IMGW_API_URL=https://danepubliczne.imgw.pl/api/data/warningsmeteo
      - LOG_LEVEL=info
      - ICON_LOCATION=
      - ICON_EXTENSION=
```

## Roadmap
- Language support
- Syngeos API
- IMGW hydro
- IMGW weather station
- Send data to HomeAssistant via MQTT

## Tech Stack

**Server:** Node, Express, Typescript

## Authors

- [@mstepien](https://www.github.com/MS151994)
