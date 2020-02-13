import './ui.scss';

window.onmessage = (event) => {

    if (!event.data) {
        return;
    }

    const pluginMessage = event.data.pluginMessage;
    const type = pluginMessage.type;
    const data = pluginMessage.data;

    const frameResizer = document.getElementById('frameResizer');
    const errorMessage = document.getElementById('errorMessage');

    const resizerAnchors: NodeList = document.getElementsByName('anchor');
    const layerWidth: HTMLElement = document.getElementById('layerWidth');
    const layerHeight: HTMLElement  = document.getElementById('layerHeight');
    const layerConstrain: HTMLElement  = document.getElementById('layerConstrain');
    const addPreset: HTMLElement = document.getElementById('addPreset');

    if (type === 'error') {
        const message = document.getElementById('message');
        frameResizer.style.display = 'none';
        errorMessage.style.display = 'block';
        message.innerText = data;
    }

    if (type === 'loadData') {
        frameResizer.style.display = 'flex';
        errorMessage.style.display = 'none';

        let ratio: number = data.width / data.height;
        let anchor: number = data.anchor;
        let presets: Array<any> = JSON.parse(data.presets);

        (<HTMLInputElement> layerWidth).value = String(data.width);
        (<HTMLInputElement> layerHeight).value = String(data.height);
        (<HTMLInputElement> layerConstrain).checked = data.constrain;

        // Anchors
        for (let i = 0; i < resizerAnchors.length; i++) {
            if ((<HTMLInputElement> resizerAnchors[i]).value === String(data.anchor)) {
                (<HTMLInputElement> resizerAnchors[i]).checked = true;
            }
            (<HTMLInputElement> resizerAnchors[i]).addEventListener('change', () => {
                if ((<HTMLInputElement> resizerAnchors[i]).checked) {
                    anchor = parseInt((<HTMLInputElement> resizerAnchors[i]).value);
                    parent.postMessage({
                        pluginMessage: {
                            type: 'anchorPosition',
                            data: {
                                anchor: String(anchor)
                            }
                        }
                    }, '*');
                }
            });
        }

        // Width
        layerWidth.onkeyup = (ev) => {
            if (ev.shiftKey) {
                if (ev.key === 'ArrowUp') {
                    let newWidth: number = parseInt((<HTMLInputElement> layerWidth).value) + 9;
                    (<HTMLInputElement> layerWidth).value = String(newWidth);
                    if ((<HTMLInputElement> layerConstrain).checked) {
                        let newHeight: number = Math.round(newWidth / ratio);
                        newHeight = Math.max(1, newHeight);
                        (<HTMLInputElement> layerHeight).value = String(newHeight);
                    }
                    parent.postMessage({
                        pluginMessage: {
                            type: 'resizeFrame',
                            data: {
                                anchor: anchor,
                                width: parseInt((<HTMLInputElement> layerWidth).value),
                                height: parseInt((<HTMLInputElement> layerHeight).value),
                                roundToPixels: true
                            }
                        }
                    }, '*');
                }
                if (ev.key === 'ArrowDown') {
                    let newWidth: number = parseInt((<HTMLInputElement> layerWidth).value) - 9;
                    newWidth = Math.max(1, newWidth);
                    (<HTMLInputElement> layerWidth).value = String(newWidth);
                    if ((<HTMLInputElement> layerConstrain).checked) {
                        let newHeight: number = Math.round(newWidth / ratio);
                        newHeight = Math.max(1, newHeight);
                        (<HTMLInputElement> layerHeight).value = String(newHeight);
                    }
                    parent.postMessage({
                        pluginMessage: {
                            type: 'resizeFrame',
                            data: {
                                anchor: anchor,
                                width: parseInt((<HTMLInputElement> layerWidth).value),
                                height: parseInt((<HTMLInputElement> layerHeight).value),
                                roundToPixels: true
                            }
                        }
                    }, '*');
                }
            }
        };
        layerWidth.onchange = () => {
            if ((<HTMLInputElement> layerConstrain).checked) {
                let newHeight: number = Math.round(parseFloat((<HTMLInputElement> layerWidth).value) / ratio);
                newHeight = Math.max(1, newHeight);
                (<HTMLInputElement> layerHeight).value = String(newHeight);
            }
            parent.postMessage({
                pluginMessage: {
                    type: 'resizeFrame',
                    data: {
                        anchor: anchor,
                        width: parseInt((<HTMLInputElement> layerWidth).value),
                        height: parseInt((<HTMLInputElement> layerHeight).value),
                        roundToPixels: false
                    }
                }
            }, '*');
        };

        // Height
        layerHeight.onkeyup = (ev) => {
            if (ev.shiftKey) {
                if (ev.key === 'ArrowUp') {
                    let newHeight: number = parseInt((<HTMLInputElement> layerHeight).value) + 9;
                    (<HTMLInputElement> layerHeight).value = String(newHeight);
                    if ((<HTMLInputElement> layerConstrain).checked) {
                        let newWidth: number = Math.round(newHeight * ratio);
                        newWidth = Math.max(1, newWidth);
                        (<HTMLInputElement> layerWidth).value = String(newWidth);
                    }
                    parent.postMessage({
                        pluginMessage: {
                            type: 'resizeFrame',
                            data: {
                                anchor: anchor,
                                width: parseInt((<HTMLInputElement> layerWidth).value),
                                height: parseInt((<HTMLInputElement> layerHeight).value),
                                roundToPixels: true
                            }
                        }
                    }, '*');
                }
                if (ev.key === 'ArrowDown') {
                    let newHeight: number = parseInt((<HTMLInputElement> layerHeight).value) - 9;
                    newHeight = Math.max(1, newHeight);
                    (<HTMLInputElement> layerHeight).value = String(newHeight);
                    if ((<HTMLInputElement> layerConstrain).checked) {
                        let newWidth: number = Math.round(newHeight * ratio);
                        newWidth = Math.max(1, newWidth);
                        (<HTMLInputElement> layerWidth).value = String(newWidth);
                    }
                    parent.postMessage({
                        pluginMessage: {
                            type: 'resizeFrame',
                            data: {
                                anchor: anchor,
                                width: parseInt((<HTMLInputElement> layerWidth).value),
                                height: parseInt((<HTMLInputElement> layerHeight).value),
                                roundToPixels: true
                            }
                        }
                    }, '*');
                }
            }
        };
        layerHeight.onchange = () => {
            if ((<HTMLInputElement> layerConstrain).checked) {
                let newWidth: number = Math.round(parseFloat((<HTMLInputElement> layerHeight).value) * ratio);
                newWidth = Math.max(1, newWidth);
                (<HTMLInputElement> layerWidth).value = String(newWidth);
            }
            parent.postMessage({
                pluginMessage: {
                    type: 'resizeFrame',
                    data: {
                        anchor: anchor,
                        width: parseInt((<HTMLInputElement> layerWidth).value),
                        height: parseInt((<HTMLInputElement> layerHeight).value),
                        roundToPixels: false
                    }
                }
            }, '*');
        };

        // Constrain
        layerConstrain.onchange = () => {
            if ((<HTMLInputElement> layerConstrain).checked) {
                ratio =  parseFloat((<HTMLInputElement> layerWidth).value) / parseFloat((<HTMLInputElement> layerHeight).value);
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
            parent.postMessage({
                pluginMessage: {
                    type: 'getPresets'
                }
            }, '*');
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
        let findItem = presets.find(item => {
            return item.anchor === anchor && 
                item.width === parseInt((<HTMLInputElement> layerWidth).value) &&
                item.height === parseInt((<HTMLInputElement> layerHeight).value);
        });
        if (!findItem) {
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
        } else {
            const visualBell = document.createElement('div');
            visualBell.className = 'visual-bell';
            const visualBellMessage = document.createElement('span');
            visualBellMessage.className = 'visual-bell__msg';
            visualBellMessage.innerText = 'Preset exist!';
            visualBell.appendChild(visualBellMessage);
            frameResizer.appendChild(visualBell);
            setTimeout(() => {
                visualBell.remove();
            }, 1000);
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