## HomeAssistant configuration

### REST

in configuration.yaml file create rest platform

```yaml
- platform: rest
  scan_interval: 1800
  name: meteo-collector
  resource: http://<<IP ADDRESS>>:<<PORT>>/weather/warnings?location="YOUR_LOCATION"
  value_template: ' {{ value_json.location }}'
  json_attributes:
    - location
    - warnings
    - phenomenonName
    - lastUpdate
    - estimatedEndTime
    - errorMessage
```

## HomeAssistant Card

This card based on custom-button-card https://github.com/custom-cards/button-card
icon: https://basmilius.github.io/weather-icons/index-fill.html or https://basmilius.github.io/weather-icons/index.html

- you should place the icon pack in the default HomeAssistant directory

### small warning card:

```yaml
type: custom:button-card
entity: sensor.meteo_collector
show_icon: false
show_name: false
tap_action:
  action: none
styles:
  grid:
    - grid-template-areas: '"name icon" "name_state icon" "desc icon" "desc_state desc_state"'
    - grid-template-columns: 1rf 1fr 1fr
    - grid-template-rows: min-content min-content min-content
  card:
    - padding: 20px
    - background: var(--secondary-background-color);
    - border: none
  custom_fields:
    name_state:
      - justify-self: start
      - text-transform: capitalize
      - font-weight: 400
      - font-size: 1.1rem
    name:
      - justify-self: start
      - text-transform: capitalize
      - opacity: 0.5
    desc_state:
      - justify-self: start
      - text-transform: capitalize
      - font-weight: 400
      - font-size: 1.1rem
    desc:
      - justify-self: start
      - text-transform: capitalize
      - opacity: 0.5
    icon:
      - justify-self: end
custom_fields:
  name: |
    [[[    
      return `czas trwania:`
    ]]]
  name_state: |
    [[[       
      return entity.attributes.estimatedEndTime
    ]]]
  desc: |
    [[[      
      return `rodzaj`
    ]]]
  desc_state: |
    [[[
      return entity.state
    ]]]
  icon: |
    [[[
      let icon = "/local/icon/info/code-green.png";
      if(entity.attributes.warnings.length)
        icon = entity.attributes.warnings[0].style.icon

      return '<img src = " ' + icon + ' " width="100" height="100";/>'
    ]]]
```

### details warning card

```yaml
type: custom:button-card
entity: sensor.meteo_collector
show_icon: false
show_name: false
tap_action:
  action: none
styles:
  grid:
    - grid-template-areas: '"desc desc desc " "com com com"'
  card:
    - padding: 14px
    - border: none
    - background: var(--secondary-background-color);
  custom_fields:
    desc:
      - justify-self: center
      - text-align: left
      - font-size: 1.2rem
      - font-weight: 300
      - width: 100%
      - text-wrap: wrap
    com:
      - justify-self: start
      - font-size: .8rem
      - opacity: 0.6
      - margin-top: 30px
      - text-wrap: wrap
custom_fields:
  desc: |
    [[[
      let warnings = entity.attributes.warnings;
      const data = [];

      for(const warning of warnings) {
        data.push({
          state: warning.phenomenonName,
          content: warning.additionalInfo.content,
          comment: warning.additionalInfo.comment,
          probability: warning.additionalInfo.probability,
          level: warning.additionalInfo.level,
          duration: warning.additionalInfo.estimatedEndTime,
          published: warning.additionalInfo.published,
          validFrom: warning.additionalInfo.validFrom,
          validTo: warning.additionalInfo.validTo,
          color: warning.style.color
        })
      };

      return `${data.map(el=>`
        <div style="display: flex; flex-direction: column;">
        <div style="display: flex; flex-direction: row; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid ${el.color};">
          <p style="margin: 5px; display: block; font-weight: 600; font-size: 1.3rem">${el.state}</p> 
          <span style="margin: 5px; display: block; opacity: 0.8; font-size: 0.8em;">Poziom ostrzeżenia: ${el.level} </span>
        </div>
          <span style="padding: 0 5px; margin-bottom: 10px;">${el.content}</span>
          <span style="padding: 0 5px; opacity: 0.8; font-size: 0.8em;">prawdopodobieństwo: ${el.probability}% </span>
          <span style="padding: 0 5px; opacity: 0.8; font-size: 0.8em;">ważne przez: ${el.duration} </span>
          <span style="padding: 0 5px; opacity: 0.8; font-size: 0.8em;">obowiązuje od: ${new Date(el.validFrom).toLocaleString().slice(0,-3)} </span>
          <span style="padding: 0 5px; opacity: 0.8; font-size: 0.8em;">obowiązuje do: ${new Date(el.validTo).toLocaleString().slice(0,-3)} </span>
          <span style="padding: 5px; margin-top: 5px; border-top: 1px solid rgba(255,255,255, .2); font-size: 0.8em;">komentarz:</span>
          <span style="padding: 0 5px; opacity: 0.6; font-size: 0.8em;">${el.comment} </span>
          <span style="padding: 0 5px; opacity: 0.8; font-size: 0.8em; margin-top: 10px;">opublikowano: ${new Date(el.published).toLocaleString().slice(0,-3)} </span>
        </div>`
        )}`
    ]]]
```
