# Transcend Wifi SD Photo Downloader/Viewer

This Node.js app searches your Transcend Wifi SD and waits for photos to be taken ("Shoot & View"), which it then downloads to a specified folder and displays in a webinterface.

## Usage
- Make sure you have Node.js installed
- Copy ```config.json-dist``` to ```config.js``` and edit it to your needs
- Run ```npm install```
- Start with ```npm start```
- Open a browser and access ```http://127.0.0.1:80``` (replace IP and port according to your changes)

If your Wifi SD is on the same network as the one detected/configured, you should see that the card is found and the app is waiting for photos to be taken.

## Troubleshooting
- Tested on Debian (jessie) with Node.js v0.10.32
- If you card is not found, make sure it is connected to the same subnet as the machine running this app
- If you don't know your "broadcast address", remove that line 'broadcastAddr' from config.json check if the right address is detected
