/*
 *  SEND {message_type: "mycroft.wifi.scan"}
 *  SEND {message_type: "mycroft.wifi.connect", metadata: {ssid: "", pass: ""}}
 *  LISTEN {message_type: "mycroft.wifi.connected", metadata: {connected: boolean}}
 *  LISTEN {message_type: "mycroft.wifi.scanned", metadata: {networks: Map<SSID, {quality: "Int/Int", encrypted: "boolean"}>>}}
 * */
function getImagePath(strength) {
    if (strength > 0.8) {
        return "img/wifi_4.png";
    } else if (strength > 0.6) {
        return "img/wifi_3.png";
    } else if (strength > 0.4) {
        return "img/wifi_2.png";
    } else if (strength > 0.2) {
        return "img/wifi_1.png";
    } else {
        return "img/wifi_0.png";
    }
}

function showPanel(id) {
    var panels = document.querySelectorAll(".panel");
    Object.keys(panels).forEach(function (panel) {
        panels[panel].classList.add("hide");
    });
    document.querySelector("#" + id).classList.remove("hide");
}

function showError(message) {
    var formError = document.querySelector("#formError");
    formError.classList.add("show");
    formError.innerHTML = message;
    setTimeout(function () {
        formError.classList.remove("show");
        formError.innerHTML = "";
    }, 2000);
}

var WifiSetup = {

    selectedNetword: null,

    setListeners: function () {
        WS.addMessageListener("mycroft.wifi.connected", this.onConnected.bind(this));
        WS.addMessageListener("mycroft.wifi.scanned", this.onScanned.bind(this));
    },

    onConnected: function (data) {
        if (data.connected) {
            alert("Connected :D");
        } else {
            showError("Cannot connect on wifi network");
        }
    },

    onScanned: function (data) {
        var networks = data.networks,
            fragment = document.createDocumentFragment(),
            list = document.querySelector("#list"),
            li = null,
            span = null,
            imgSignal = null,
            imgLock = null;

        showPanel("list-panel");

        Object.keys(networks).forEach(function (network) {
            li = document.createElement("li");
            span = document.createElement("span");
            imgSignal = document.createElement("img");
            span.textContent = network;
            imgSignal.src = getImagePath(networks[network].quality);
            imgSignal.className = "wifi";
            li.appendChild(span);
            li.appendChild(imgSignal);
            if (networks[network].encrypted) {
                imgLock = document.createElement("img");
                imgLock.src = "img/lock.png";
                imgLock.className = "lock";
                li.appendChild(imgLock);
            }
            networks[network].ssid = network;
            li.addEventListener("click", this.clickNetwork.bind(this, networks[network]));
            fragment.appendChild(li);
        }.bind(this));

        list.innerHTML = null;
        list.appendChild(fragment);
    },

    clickNetwork: function (network) {
        this.selectedNetword = network;
        showPanel("connect");
    },

    sendScan: function () {
        WS.send("mycroft.wifi.scan");
    },

    /***
     * @param data is a object with ssid and pass
     */
    sendConnect: function (data) {
        WS.send("mycroft.wifi.connect", data);
    },

    clickConnect: function () {
        var pass = document.querySelector("#pass");
        this.sendConnect({
            ssid: this.selectedNetword.ssid,
            pass: pass.value
        });
    },

    init: function () {
        this.setListeners();
        this.sendScan();
        document.querySelector("#backList").addEventListener("click", function () {
            this.selectedNetword = {};
            this.sendScan();
        }.bind(this));
        document.querySelector("#passBtn").addEventListener("click", this.clickConnect.bind(this));
    }
};

window.addEventListener("load", function () {
    WS.connect();
    WS.setOnOpenListener(function () {
        WifiSetup.init();
    });
});


function fakeSend() {
    WS.onMessage({
        "message_type": "mycroft.wifi.scanned",
        "metadata": {
            "networks": {
                "augusto": {
                    "quality": 0.1,
                    "encrypted": true
                },
                "vizinho": {
                    "quality": 0.2,
                    "encrypted": false
                },
                "mycroft": {
                    "quality": 0.3,
                    "encrypted": true
                },
                "android ap": {
                    "quality": 0.4,
                    "encrypted": false
                },
                "iphone ap": {
                    "quality": 0.5,
                    "encrypted": true
                },
                "cavalo de troia": {
                    "quality": 0.6,
                    "encrypted": false
                },
                "google camp": {
                    "quality": 0.7,
                    "encrypted": true
                },
                "j camp": {
                    "quality": 0.8,
                    "encrypted": false
                },
                "charon camp": {
                    "quality": 0.9,
                    "encrypted": true
                },
                "charon camp 2": {
                    "quality": 1,
                    "encrypted": false
                }
            }
        }
    });
}
