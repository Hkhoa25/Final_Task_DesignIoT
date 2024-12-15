import time
import machine
from network import WLAN
import network
import urequests as requests
import math

# Constants
INTERVAL = 30  # 30 seconds for cloud
WIFI_SSID = "WiFi network name"  # Replace with your WiFi SSID
WIFI_PASS = "WiFi password"  # Replace with your WiFi password
BASE_URL = "http://20.93.16.102/api/v1/"  
DATA_ENDPOINT = "/embed"  # Replace with the actual endpoint for your cloud API
DEBUG = True

# Wiring and Setup
ADC_PIN = machine.Pin(26)  # Analog pin for temperature sensor (change if necessary)
TEMP_SENSOR = machine.ADC(ADC_PIN)  # Initialize ADC to read from the temperature sensor
LED = machine.Pin("LED", machine.Pin.OUT)  # Internal LED to indicate data transmission

# Thermistor Parameters (Adjust these according to your sensor)
BETA = 3950  # Beta coefficient for your thermistor
R25 = 10000  # Resistance at 25°C (change this according to your thermistor)
T0 = 298.15  # Temperature in Kelvin at 25°C (standard value)

# Function to read temperature from the sensor and return it in Celsius
def read_temperature():
    adc_value = TEMP_SENSOR.read_u16()
    voltage = (adc_value / 65535.0) * 3.3  # Convert ADC value to voltage
    R = (3.3 * R25) / voltage - R25  # Calculate resistance from voltage
    temperature_K = 1 / (math.log(R / R25) / BETA + 1.0 / T0)  # Convert resistance to temperature in Kelvin
    temperature_C = temperature_K - 273.15  # Convert temperature to Celsius
    return temperature_C

# Function to log debug messages
def dlog(data):
    if DEBUG:
        print(repr(data))
    return None

# Function to send data to the cloud API
def sendData(endpoint, keyvalues):
    queryparams = ""
    for i in range(len(keyvalues)):
        key, value = keyvalues[i]
        if i == 0:
            queryparams += "?"
        else:
            queryparams += "&"
        queryparams += f'{key}={value}'
    
    request_url = BASE_URL + endpoint + queryparams
    dlog(f"Request URL: {request_url}")
    
    try:
        response = requests.get(request_url)
        dlog(f"Response Status Code: {response.status_code}")
        dlog(f"Response Content: {response.content}")
    except Exception as e:
        dlog(f"Error sending data: {e}")

# Function to connect to WiFi
def connectWifi():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    print("Connecting to WiFi", end="")
    wlan.connect(WIFI_SSID, WIFI_PASS)
    while not wlan.isconnected():
        print(".", end='')
        time.sleep(0.1)
    print("\nConnected!")
    dlog(wlan.ifconfig())
    return wlan

# Main function
def main():
    time.sleep(1)
    print("Program starting.")
    wlan = connectWifi()
    
    while True:
        LED.on()  # Turn on LED to indicate data transmission

        # Read temperature
        temperature = read_temperature()

        # Prepare data to send to the cloud
        queryparams = [("value", str(round(temperature, 2)))]  # Sending temperature data

        # Send data to cloud
        sendData(DATA_ENDPOINT, queryparams)

        print(f"Temperature: {temperature:.2f}°C")

        LED.off()  # Turn off LED after sending data
        time.sleep(INTERVAL)  # Wait for the next interval

    print("Program ending.")

# Start the main function
main()
