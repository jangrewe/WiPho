# Transcend Wifi SD Photo Downloader/Viewer

This Node.js app searches for a Transcend Wifi SD on the local network and waits for photos to be taken ("Shoot & View" mode of the mobile app).
When it detects that a photo was taken, it will download that photo to a specified folder.

The app also features a simple but functional web interface that will display the last photo taken, e.g. for live previewing during a photo shooting.

![ubvg6](https://cloud.githubusercontent.com/assets/126137/6565612/98e8c9ce-c6b1-11e4-89a8-b6e17e2e4f13.jpg)

## Usage
- Make sure you have Node.js and NPM installed
- Copy ```config.json-dist``` to ```config.js``` and edit it to your needs
- Run ```npm install```
- Start with ```npm start```
- Open a browser and access ```http://127.0.0.1:3000``` (replace IP and port according to your configuration changes)

If your Wifi SD is on the same network as the one detected/configured, you should see that the card is found and the app is waiting for photos to be taken.

## Troubleshooting
- Tested on Debian (jessie) with Node.js v0.10.32
- If you card is not found, make sure it is connected to the same network as the machine running this app. Different subnets won't work.
- If you don't know your "broadcast address", remove that line 'broadcastAddr' from config.json check if the right address is detected. (Hint: if your IP address is 192.168.0.11, the broadcast address will most likely be 192.168.0.255 - at least on a regular home network.)
