<h1 align="center">gsm2mqtt</h1>

### Gsm2mqtt is project for share and send SMS with mqtt topic

## Getting Started

### With Docker

Using docker compose:

```yaml
version: "3"
services:
  control:
    image: ghcr.io/jeufore/gsm2mqtt:latest
    container_name: gsm2mqtt
    privileged: true
    environment: 
      - MQTT_HOST=<mqtt_host>
      - MQTT_PORT=<mqtt_port>
      - MQTT_USER=<mqtt_user>
      - MQTT_PASSWORD=<mqtt_password>
      - MODEM_PATH=<modem_path>
      - MODEM_PIN=<modem_pin>
```

or docker run
```bash
docker run -d \
    --privileged \
    --name gsm2mqtt \
    -e MQTT_HOST=<mqtt_host>
    -e MQTT_PORT=<mqtt_host>
    -e MQTT_USER=<mqtt_user>
    -e MQTT_PASSWORD=<mqtt_password>
    -e MODEM_PATH=<modem_path>
    -e MODEM_PIN=<modem_pin> \
    ghcr.io/jeufore/gsm2mqtt:latest
```

### For the development

```bash
# install dependencies project
npm i

# start project
npm start
```

## .env
| Parameter             | Example value                                     | Description                               |
|-----------------------|---------------------------------------------------|-------------------------------------------|
| MQTT_HOST             | "mqtt.example.com"                                | Mqtt host                                 |
| MQTT_USER             | "user"                                            | Mqtt user                                 |
| MQTT_PASSWORD         | "vIaVKkP3wiyy"                                    | Mqtt password                             |
| MQTT_PORT             | "1883"                                            | Mqtt port                                 |
| MODEM_PATH            | /dev/serial-1                                     | Modem path                                |
| MODEM_PIN             | 1111                                              | Modem pin                                 |
| DEBUG                 | "true"                                            | Enabled modem debug                        |
<br/>