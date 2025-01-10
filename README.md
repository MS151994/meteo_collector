# IMGW Meteorologist Collector

Application for collecting and filtering data from the [IMGW API](https://meteo.imgw.pl/).
It was created to enable home automation to collect data,
present it visually and generate appropriate notifications.

example of use in HomeAssistant

<div display="flex" align="center" width="100%">
    <img src="/docs/images/ha-imgw-card-dark.png" width="250"/>
    <img src="/docs/images/ha-imgw-card-light.png" width="250"/>
</div>

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

### Available plugins

#### Warning Style Generator

Possible to add a "style" object to each warning that will contain the icon and the icon URL for use in the HomeAssistant tab
If you want to get this, you need to enable the add-on and set the icon path and file extension

```json
      "style": {
        "color": "yellow", - colors are generated from warning level. yellow | orange | red | green
        "icon": "/local/icon/info/code-yellow.png"
      }
```

sample config:

```
      ENABLE_WARNINGS_STYLES_PLUGIN=true
      ICON_PATH=/local/icon/info
      ICON_MIME_TYPE=.png
```

## Run Meteorologist Collector

| ENV                             | Type     | Description                                                         |
| :------------------------------ | :------- | :------------------------------------------------------------------ |
| `LOG_LEVEL`                     | `string` | **Optional**. default DEBUG                                         |
| `ICON_PATH`                     | `string` | **Optional**. location HomeAssistant icon for 'iconPath' generator  |
| `ICON_MIME_TYPE`                | `string` | **Optional**. extension of icon file                                |
| `ENABLE_WARNINGS_STYLES_PLUGIN` | `bool`   | **Optional**. enable plugin for adding style object to each warning |

### Docker

```bash
   docker run \
   --name meteocollector \
   --restart=unless-stopped \
   -p 8080:8080 \
   -e LOG_LEVEL=debug \
   -e ENABLE_WARNINGS_STYLES_PLUGIN=true \
   -e ICON_MIME_TYPE=<file extension> \
   -e ICON_PATH=<path/to/icon> \
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
      - LOG_LEVEL=info
      - ICON_PATH=/local/
      - ICON_MIME_TYPE=.jpeg
      - ENABLE_WARNINGS_STYLES_PLUGIN=true
```

## Roadmap

- Language support
- Syngeos API
- IMGW hydro
- IMGW weather station
- Send data to HomeAssistant via MQTT
- Send notification to mobile phone

## Tech Stack

**Server:** Node, Express, Typescript

## Authors

- [@mstepien](https://www.github.com/MS151994)
