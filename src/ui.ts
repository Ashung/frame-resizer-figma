import './ui.scss';

const frameResizer = document.getElementById('frameResizer');
const errorMessage = document.getElementById('errorMessage');
const resizerAnchors: NodeList = document.getElementsByName('anchor');
const layerWidth: HTMLElement = document.getElementById('layerWidth');
const layerHeight: HTMLElement  = document.getElementById('layerHeight');
const layerConstrain: HTMLElement  = document.getElementById('layerConstrain');
const addPreset: HTMLElement = document.getElementById('addPreset');

// Input number only
[layerWidth, layerHeight].forEach(elem => {
    const events = ['input', 'keydown', 'keyup', 'mousedown', 'mouseup', 'select', 'contextmenu', 'drop'];
    events.forEach(event => {
        elem.addEventListener(event, () => {
            const input = elem as HTMLInputElement;
            if (!/^\d*$/.test(input.value) && input.value !== 'Mixed') {
                input.value = input.value.replace(/[^\d]/g,'');
            }
            if (input.value === '') {
                input.value = 'Mixed';
            }
        });
    });
});

window.onmessage = (event) => {

    if (!event.data) {
        return;
    }

    const pluginMessage = event.data.pluginMessage;
    const type = pluginMessage.type;
    const data = pluginMessage.data;

    if (type === 'error') {
        const message = document.getElementById('message');
        frameResizer.style.display = 'none';
        errorMessage.style.display = 'block';
        message.innerText = data.message;
    }

    if (type === 'loadData') {
        frameResizer.style.display = 'flex';
        errorMessage.style.display = 'none';

        let ratio: number = 0;
        let anchor: number = data.anchor;
        let presets: Array<any> = JSON.parse(data.presets);

        if (isNaN(data.width) && isNaN(data.height)) {
            ratio = data.width / data.height;
        }

        (<HTMLInputElement> layerWidth).value = String(data.width);
        (<HTMLInputElement> layerHeight).value = String(data.height);
        if (data.constrain === 'Mixed') {
            (<HTMLInputElement> layerConstrain).checked = false;
        } else {
            (<HTMLInputElement> layerConstrain).checked = data.constrain;
        }

        // Anchors
        for (let i = 0; i < resizerAnchors.length; i++) {
            let resizerAnchor = (<HTMLInputElement> resizerAnchors[i]);
            if (resizerAnchor.value === String(data.anchor)) {
                resizerAnchor.checked = true;
            }
            resizerAnchor.onchange = () => {
                if (resizerAnchor.checked) {
                    anchor = parseInt(resizerAnchor.value);
                    parent.postMessage({
                        pluginMessage: {
                            type: 'anchorPosition',
                            data: {
                                anchor: String(anchor)
                            }
                        }
                    }, '*');
                }
            }
        }

        // Width
        layerWidth.onkeyup = (ev) => {
            if (ev.key === 'ArrowUp') {
                let newWidth: number = parseInt((<HTMLInputElement> layerWidth).value);
                if (isNaN(newWidth)) {
                    newWidth = 0;
                }
                if (ev.shiftKey) {
                    newWidth += 10;
                } else {
                    newWidth += 1;
                }
                (<HTMLInputElement> layerWidth).value = String(newWidth);
                if ((<HTMLInputElement> layerConstrain).checked) {
                    if (ratio !== 0) {
                        let newHeight: number = Math.round(newWidth / ratio);
                        newHeight = Math.max(1, newHeight);
                        (<HTMLInputElement> layerHeight).value = String(newHeight);
                    } else {
                        (<HTMLInputElement> layerHeight).value = 'Mixed';
                    }
                }
                let width = parseInt((<HTMLInputElement> layerWidth).value);
                let height = parseInt((<HTMLInputElement> layerHeight).value);
                parent.postMessage({
                    pluginMessage: {
                        type: 'resizeFrame',
                        data: {
                            anchor: anchor,
                            width: isNaN(width) ? 'Mixed' : width,
                            height: isNaN(height) ? 'Mixed' : height,
                            constrain: (<HTMLInputElement> layerConstrain).checked,
                            roundToPixels: true
                        }
                    }
                }, '*');
            }
            if (ev.key === 'ArrowDown') {
                let newWidth: number = parseInt((<HTMLInputElement> layerWidth).value);
                if (isNaN(newWidth)) {
                    newWidth = 0;
                }
                if (ev.shiftKey) {
                    newWidth -= 10;
                } else {
                    newWidth -= 1;
                }
                newWidth = Math.max(1, newWidth);
                (<HTMLInputElement> layerWidth).value = String(newWidth);
                if ((<HTMLInputElement> layerConstrain).checked) {
                    if (ratio !== 0) {
                        let newHeight: number = Math.round(newWidth / ratio);
                        newHeight = Math.max(1, newHeight);
                        (<HTMLInputElement> layerHeight).value = String(newHeight);
                    } else {
                        (<HTMLInputElement> layerHeight).value = 'Mixed';
                    }
                }
                let width = parseInt((<HTMLInputElement> layerWidth).value);
                let height = parseInt((<HTMLInputElement> layerHeight).value);
                parent.postMessage({
                    pluginMessage: {
                        type: 'resizeFrame',
                        data: {
                            anchor: anchor,
                            width: isNaN(width) ? 'Mixed' : width,
                            height: isNaN(height) ? 'Mixed' : height,
                            constrain: (<HTMLInputElement> layerConstrain).checked,
                            roundToPixels: true
                        }
                    }
                }, '*');
            }
        };
        layerWidth.onchange = () => {
            if ((<HTMLInputElement> layerConstrain).checked) {
                if (ratio !== 0) {
                    let newHeight: number = Math.round(parseFloat((<HTMLInputElement> layerWidth).value) / ratio);
                    newHeight = Math.max(1, newHeight);
                    (<HTMLInputElement> layerHeight).value = String(newHeight);
                } else {
                    (<HTMLInputElement> layerHeight).value = 'Mixed';
                }
            }
            let width = parseInt((<HTMLInputElement> layerWidth).value);
            let height = parseInt((<HTMLInputElement> layerHeight).value);
            parent.postMessage({
                pluginMessage: {
                    type: 'resizeFrame',
                    data: {
                        anchor: anchor,
                        width: isNaN(width) ? 'Mixed' : width,
                        height: isNaN(height) ? 'Mixed' : height,
                        constrain: (<HTMLInputElement> layerConstrain).checked,
                        roundToPixels: false
                    }
                }
            }, '*');
        };

        // Height
        layerHeight.onkeyup = (ev) => {
            if (ev.key === 'ArrowUp') {
                let newHeight: number = parseInt((<HTMLInputElement> layerHeight).value);
                if (isNaN(newHeight)) {
                    newHeight = 0;
                }
                if (ev.shiftKey) {
                    newHeight += 10;
                } else {
                    newHeight += 1;
                }
                (<HTMLInputElement> layerHeight).value = String(newHeight);
                if ((<HTMLInputElement> layerConstrain).checked) {
                    if (ratio !== 0) {
                        let newWidth: number = Math.round(newHeight * ratio);
                        newWidth = Math.max(1, newWidth);
                        (<HTMLInputElement> layerWidth).value = String(newWidth);
                    } else {
                        (<HTMLInputElement> layerWidth).value = 'Mixed';
                    }
                }
                let width = parseInt((<HTMLInputElement> layerWidth).value);
                let height = parseInt((<HTMLInputElement> layerHeight).value);
                parent.postMessage({
                    pluginMessage: {
                        type: 'resizeFrame',
                        data: {
                            anchor: anchor,
                            width: isNaN(width) ? 'Mixed': width,
                            height: isNaN(height) ? 'Mixed': height,
                            constrain: (<HTMLInputElement> layerConstrain).checked,
                            roundToPixels: true
                        }
                    }
                }, '*');
            }
            if (ev.key === 'ArrowDown') {
                let newHeight: number = parseInt((<HTMLInputElement> layerHeight).value);
                if (isNaN(newHeight)) {
                    newHeight = 0;
                }
                if (ev.shiftKey) {
                    newHeight -= 10;
                } else {
                    newHeight -= 1;
                }
                newHeight = Math.max(1, newHeight);
                (<HTMLInputElement> layerHeight).value = String(newHeight);
                if ((<HTMLInputElement> layerConstrain).checked) {
                    if (ratio !== 0) {
                        let newWidth: number = Math.round(newHeight * ratio);
                        newWidth = Math.max(1, newWidth);
                        (<HTMLInputElement> layerWidth).value = String(newWidth);
                    } else {
                        (<HTMLInputElement> layerWidth).value = 'Mixed';
                    }
                }
                let width = parseInt((<HTMLInputElement> layerWidth).value);
                let height = parseInt((<HTMLInputElement> layerHeight).value);
                parent.postMessage({
                    pluginMessage: {
                        type: 'resizeFrame',
                        data: {
                            anchor: anchor,
                            width: isNaN(width) ? 'Mixed' : width,
                            height: isNaN(height) ? 'Mixed' : height,
                            constrain: (<HTMLInputElement> layerConstrain).checked,
                            roundToPixels: true
                        }
                    }
                }, '*');
            }
        };
        layerHeight.onchange = () => {
            if ((<HTMLInputElement> layerConstrain).checked) {
                if (ratio !== 0) {
                    let newWidth: number = Math.round(parseFloat((<HTMLInputElement> layerHeight).value) * ratio);
                    newWidth = Math.max(1, newWidth);
                    (<HTMLInputElement> layerWidth).value = String(newWidth);
                } else {
                    (<HTMLInputElement> layerWidth).value = 'Mixed';
                }
            }
            let width = parseInt((<HTMLInputElement> layerWidth).value);
            let height = parseInt((<HTMLInputElement> layerHeight).value);
            parent.postMessage({
                pluginMessage: {
                    type: 'resizeFrame',
                    data: {
                        anchor: anchor,
                        width: isNaN(width) ? 'Mixed' : width,
                        height: isNaN(height) ? 'Mixed' : height,
                        constrain: (<HTMLInputElement> layerConstrain).checked,
                        roundToPixels: false
                    }
                }
            }, '*');
        };

        // Constrain
        layerConstrain.onchange = () => {
            if ((<HTMLInputElement> layerConstrain).checked) {
                let width = parseInt((<HTMLInputElement> layerWidth).value);
                let height = parseInt((<HTMLInputElement> layerHeight).value);
                if (isNaN(width) && isNaN(height)) {
                    ratio = width / height;
                } else {
                    ratio = 0;
                }
            }
            parent.postMessage({
                pluginMessage: {
                    type: 'constrain',
                    data: {
                        constrain: (<HTMLInputElement> layerConstrain).checked
                    }
                }
            }, '*');
        };

        // Presets
        createPresetsList(presets, false);
        addPreset.onclick = () => {
            let width = parseInt((<HTMLInputElement> layerWidth).value);
            let height = parseInt((<HTMLInputElement> layerHeight).value);
            if (isNaN(width)) {
                showVisualBell('Width is mixed!', true);
            } else if (isNaN(height)) {
                showVisualBell('Height is mixed!', true);
            } else {
                parent.postMessage({
                    pluginMessage: {
                        type: 'getPresets'
                    }
                }, '*');
            }
        };
    }

    if (type === 'addPreset') {
        let presets: Array<any> = JSON.parse(data.presets);
        let anchor: number = 1;
        for (let i = 0; i < resizerAnchors.length; i++) {
            if ((<HTMLInputElement> resizerAnchors[i]).checked) {
                anchor = parseInt((<HTMLInputElement> resizerAnchors[i]).value);
            }
        }
        // Checking exist preset
        let findItem = presets.find(item => {
            return item.anchor === anchor && 
                item.width === parseInt((<HTMLInputElement> layerWidth).value) &&
                item.height === parseInt((<HTMLInputElement> layerHeight).value);
        });
        if (findItem) {
            showVisualBell('Preset exist!');
        } else {
            presets.push({
                anchor: anchor,
                width: parseInt((<HTMLInputElement> layerWidth).value),
                height: parseInt((<HTMLInputElement> layerHeight).value)
            });
            parent.postMessage({
                pluginMessage: {
                    type: 'savePresets',
                    data: {
                        presets: presets,
                        scrollToBottom: true
                    }
                }
            }, '*');
        }
    }

    if (type === 'reloadPresetList') {
        createPresetsList(data.presets, data.scrollToBottom);
    }

};

function createPresetsList(presets: any[], scrollToBottom: boolean): void {
    const presetsList = document.getElementById('presetsList');
    presetsList.innerHTML = '';
    presets.forEach((preset, index) => {
        const item = document.createElement('div');
        item.className = 'presetItem';
        const label = document.createElement('a');
        label.setAttribute('href', '#');
        label.className = 'presetItem__title presetAnchor--' + preset.anchor;
        label.innerText = preset.width + 'x' + preset.height;
        label.addEventListener('click', () => {
            parent.postMessage({
                pluginMessage: {
                    type: 'resizeFrame',
                    data: {
                        anchor: preset.anchor,
                        width: preset.width,
                        height: preset.height,
                        constrain: (<HTMLInputElement> layerConstrain).checked,
                        roundToPixels: true
                    }
                }
            }, '*');
        });
        const button = document.createElement('a');
        button.setAttribute('href', '#');
        button.className = 'icon icon--minus icon--button';
        button.addEventListener('click', () => {
            presets.splice(index, 1);
            parent.postMessage({
                pluginMessage: {
                    type: 'savePresets',
                    data: {
                        presets: presets,
                        scrollToBottom: false
                    }
                }
            }, '*');
            item.remove();
        });
        item.appendChild(label);
        item.appendChild(button);
        presetsList.appendChild(item);
    });
    if (scrollToBottom) {
        let newPreset = presetsList.lastChild;
        (<HTMLElement> newPreset).scrollIntoView();
    }
}

function showVisualBell(text: string, error?: boolean): void {
    // Remove exist visual bell
    const visualBells = document.querySelectorAll('.visual-bell');
    visualBells.forEach(node => {
        node.remove();
    });
    // Create visual bell
    const visualBell = document.createElement('div');
    visualBell.className = 'visual-bell';
    if (error) {
        visualBell.classList.add('visual-bell--error');
    }
    const visualBellMessage = document.createElement('span');
    visualBellMessage.className = 'visual-bell__msg';
    visualBellMessage.innerText = text;
    visualBell.appendChild(visualBellMessage);
    frameResizer.appendChild(visualBell);
    setTimeout(() => {
        visualBell.style.opacity = '0';
    }, 1000);
    setTimeout(() => {
        visualBell.remove();
    }, 1300);
}