const EventEmitter = require("events").EventEmitter,
      debugLog = require("debug")("WirethingDashButton"),
      fs = require("fs"),
      DashButton = require("node-dash-button");


class DashButtonDevice extends EventEmitter {


    constructor (mac) {
        super();
        this.deviceType = "dashbutton";
        this.uuid = mac;
        this.connected = false;
    }


    connect () {
        this.connected = true;
        debugLog(`Connected to Dash Button "${this.uuid}"`);
        this.emit("connect");
    }


    emitPress () {
        if (this.connected) {
            debugLog(`Dash Button "${this.uuid}" pressed`);
            this.emit("press");
        }
    }


}


class WirethingDashButton extends EventEmitter {


    constructor (whitelist) {

        super();
        this._dash = DashButton(whitelist, null, null, "all");
        this._devices = [];
        whitelist.forEach((mac) => {
            let device = new DashButtonDevice(mac);
            this._devices.push(device);
        });
        this._initialized = false;

        this._dash.on("detected", (mac) => {
            if (this._initialized) {
                try {
                    this._devices.filter((device) => (device.uuid === mac))[0].emitPress();
                } catch (e) {
                    debugLog(`Detected press for unknown Dash Button "${mac}"`);
                }
            }
        });

    }


    wirethingInit () {

        this._devices.forEach((device) => {
            this.emit("discover", device);
        });
        this._initialized = true;

    }


    static get wirething () {
        return JSON.parse(fs.readFileSync(`${__dirname}/Wirefile`));
    }


}


module.exports = WirethingDashButton;
