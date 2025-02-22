let port;
let writer;
let reader;
let keepReading = true;
let currentEffect = null;

async function connect() {
    try {
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 9600 });
        writer = port.writable.getWriter();
        
        // Update UI
        document.getElementById('status').textContent = 'Connected';
        document.getElementById('status').className = 'status-online';
        document.getElementById('connect').style.display = 'none';
        
        // Enable controls
        document.getElementById('turnOn').disabled = false;
        document.getElementById('turnOff').disabled = false;
        document.getElementById('brightness').disabled = false;
        document.getElementById('blink').disabled = false;
        document.getElementById('pulse').disabled = false;
        document.getElementById('stopEffect').disabled = false;

    } catch (err) {
        console.error('Error:', err);
        document.getElementById('status').textContent = 'Connection failed!';
    }
}

async function sendCommand(command) {
    if (writer) {
        const data = new Uint8Array([command.charCodeAt(0)]);
        await writer.write(data);
    }
}

async function turnOn() {
    await sendCommand('1');
    document.getElementById('led-indicator').classList.add('led-on');
}

async function turnOff() {
    await sendCommand('0');
    document.getElementById('led-indicator').classList.remove('led-on');
}

async function setBrightness(value) {
    await sendCommand(`b${value}`);
    document.getElementById('brightness-value').textContent = `${Math.round((value/255)*100)}%`;
}

async function startBlinking() {
    if (currentEffect) clearInterval(currentEffect);
    let isOn = false;
    currentEffect = setInterval(async () => {
        if (isOn) {
            await turnOff();
        } else {
            await turnOn();
        }
        isOn = !isOn;
    }, 500);
}

async function startPulsing() {
    if (currentEffect) clearInterval(currentEffect);
    let brightness = 0;
    let increasing = true;
    currentEffect = setInterval(async () => {
        await setBrightness(brightness);
        if (increasing) {
            brightness += 5;
            if (brightness >= 255) {
                increasing = false;
            }
        } else {
            brightness -= 5;
            if (brightness <= 0) {
                increasing = true;
            }
        }
    }, 50);
}

function stopEffect() {
    if (currentEffect) {
        clearInterval(currentEffect);
        currentEffect = null;
    }
}

// Event Listeners
document.getElementById('connect').addEventListener('click', connect);
document.getElementById('turnOn').addEventListener('click', turnOn);
document.getElementById('turnOff').addEventListener('click', turnOff);
document.getElementById('brightness').addEventListener('input', (e) => setBrightness(e.target.value));
document.getElementById('blink').addEventListener('click', startBlinking);
document.getElementById('pulse').addEventListener('click', startPulsing);
document.getElementById('stopEffect').addEventListener('click', stopEffect);