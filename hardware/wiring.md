# Hardware Wiring Instructions

## Components
- Raspberry Pi 4 Model B
- USB Webcam
- 1x Green LED
- 1x Red LED
- 2x 220 ohm (or 330 ohm) Resistors
- Breadboard & Jumper Wires

## Wiring Diagram (Textual)

### Green LED (REAL Indicator)
1. **Anode (Long Leg)** -> Connect to **GPIO 18** (Physical Pin 12).
2. **Cathode (Short Leg)** -> Connect to one end of a **220Ω Resistor**.
3. **Resistor (Other end)** -> Connect to **GND** (Physical Pin 6 or any Ground).

### Red LED (FAKE Indicator)
1. **Anode (Long Leg)** -> Connect to **GPIO 23** (Physical Pin 16).
2. **Cathode (Short Leg)** -> Connect to one end of a **220Ω Resistor**.
3. **Resistor (Other end)** -> Connect to **GND** (Physical Pin 14 or any Ground).

### Camera
- Connect USB Webcam to any USB port on the Raspberry Pi.

## Usage
1. Power up Raspberry Pi.
2. Ensure backend is running continuously on a laptop/cloud.
3. Update `<YOUR_LAPTOP_IP>` in `rpi_client.py` with the actual IP address.
4. Run `python3 rpi_client.py`.
