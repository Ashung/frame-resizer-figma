main(true);

figma.on('selectionchange', () => {
    main();
});

figma.ui.onmessage = message => {

    const selectedLayers: readonly SceneNode[] = figma.currentPage.selection;
    const layer: SceneNode = (<FrameNode> selectedLayers[0]);

    if (message.type === 'anchorPosition') {
        console.log('anchorPosition', JSON.stringify(message.data));
        figma.root.setPluginData('frameResizerAnchorPosition', message.data.anchor);
    }

    if (message.type === 'resizeFrame') {
        console.log('resizeFrame', JSON.stringify(message.data))
        resizeFrame(layer, message.data.width, message.data.height, message.data.anchor);
    }

    if (message.type === 'constrain') {
        console.log('constrain', JSON.stringify(message.data));
        layer.constrainProportions = message.data.constrain;
    }

    if (message.type === 'getPresets') {
        const getFrameResizerPresets: string = figma.root.getPluginData('frameResizerPresets') || '[]';
        figma.ui.postMessage({
            type: 'addPreset',
            data: {
                presets: getFrameResizerPresets
            }
        });
    }

    if (message.type === 'savePresets') {
        console.log('savePresets', JSON.stringify(message.data));
        figma.root.setPluginData('frameResizerPresets', JSON.stringify(message.data));
        figma.ui.postMessage({
            type: 'reloadPresetList',
            data: {
                presets: message.data
            }
        });
    }
};

function main(showUI?: Boolean): void {

    if (showUI) {
        figma.showUI(__html__, {
            width: 220,
            height: 300
        });
    }

    const selectedLayers: readonly SceneNode[] = figma.currentPage.selection;
    if (selectedLayers.length !== 1) {
        figma.ui.postMessage({
            type: 'error',
            data: 'Please select 1 Frame or Component layer.'
        });
    } else {
        const layer: SceneNode = selectedLayers[0];
        if (!isSupportedNode(layer)) {
            figma.ui.postMessage({
                type: 'error',
                data: 'Please select 1 Frame or Component layer.'
            });
        } else {
            const getFrameResizerAnchorPosition: string = figma.root.getPluginData('frameResizerAnchorPosition') || '1';
            const getFrameResizerPresets: string = figma.root.getPluginData('frameResizerPresets') || '[]';
            figma.ui.postMessage({
                type: 'loadData',
                data: {
                    anchor: parseInt(getFrameResizerAnchorPosition),
                    width: formatNumber(layer.width),
                    height: formatNumber(layer.height),
                    constrain: layer.constrainProportions,
                    presets: getFrameResizerPresets
                }
            });
        }
    }
}

function formatNumber(num: number): number {
    if (!Number.isInteger(num)) {
        return Number(num.toFixed(2));
    }
    return num;
}

function isSupportedNode(node: BaseNode): node is FrameNode | ComponentNode {
    return node.type === "FRAME" || node.type === "COMPONENT";
}
// TODO: snap pixel
function resizeFrame(frame: FrameNode, width: number, height: number, anchor: number): void {
    const originalX = frame.x;
    const originalY = frame.y;
    const originalWidth = frame.width;
    const originalHeight = frame.height;
    const midX = originalX + originalWidth / 2;
    const midY = originalY + originalHeight / 2;
    const maxX = originalX + originalWidth;
    const maxY = originalY + originalHeight;
    
    frame.resizeWithoutConstraints(width, height);

    let offsetX: number = 0;
    let offsetY: number = 0;
    // 2: center-top
    // 5: center-center
    // 8: center-bottom
    if (anchor === 2 || anchor === 5 || anchor === 8) {
        frame.x = midX - width / 2;
        offsetX = midX - width / 2 - originalX;
        frame.children.forEach(layer => {
            layer.x -= offsetX;
        });
    }
    // 3: right-top
    // 6: right-center
    // 9: right-bottom
    if (anchor === 3 || anchor === 6 || anchor === 9) {
        frame.x = maxX - width;
        offsetX = maxX - width - originalX;
        frame.children.forEach(layer => {
            layer.x -= offsetX;
        });
    }
    // 4: left-center
    // 5: center-center
    // 6: right-center
    if (anchor === 4 || anchor === 5 || anchor === 6) {
        frame.y = midY - height / 2;
        offsetY = midY - height / 2 - originalY;
        frame.children.forEach(layer => {
            layer.y -= offsetY;
        });
    }
    // 7: left-bottom
    // 8: center-bottom
    // 9: right-bottom
    if (anchor === 7 || anchor === 8 || anchor === 9) {
        frame.y = maxY - height;
        offsetY = maxY - height - originalY;
        frame.children.forEach(layer => {
          layer.y -= offsetY;
        });
    }
}
