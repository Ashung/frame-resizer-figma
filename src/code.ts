main(true);

figma.on('selectionchange', () => {
    main();
});

figma.ui.onmessage = message => {

    if (message.type === 'anchorPosition') {
        figma.root.setPluginData('frameResizerAnchorPosition', message.data.anchor);
    }

    if (message.type === 'resizeFrame') {
        for (const node of figma.currentPage.selection) {
            const layer = node as FrameNode;
            let width: number;
            let height: number;
            if (isNaN(message.data.width)) {
                if (layer.constrainProportions) {
                    if (isNaN(message.data.height)) {
                        width = layer.width;
                    } else {
                        width = Math.round(message.data.height * layer.width / layer.height)
                    }
                } else {
                    width = layer.width;
                }
            } else {
                width = message.data.width;
            }
            if (isNaN(message.data.height)) {
                if (layer.constrainProportions) {
                    if (isNaN(message.data.width)) {
                        height = layer.height;
                    } else {
                        height = Math.round(message.data.width * layer.height / layer.width);
                    }
                } else {
                    height = layer.height;
                }
            } else {
                height = message.data.height;
            }
            resizeFrame(layer, width, height, message.data.anchor, message.data.roundToPixels);
        }
        loadData();
    }

    if (message.type === 'constrain') {
        for (const node of figma.currentPage.selection) {
            node.constrainProportions = message.data.constrain;
        }
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
        figma.root.setPluginData('frameResizerPresets', JSON.stringify(message.data.presets));
        figma.ui.postMessage({
            type: 'reloadPresetList',
            data: {
                presets: message.data.presets,
                scrollToBottom: message.data.scrollToBottom
            }
        });
    }
};

function main(showUI?: boolean): void {
    if (showUI) {
        figma.showUI(__html__, {
            width: 220,
            height: 270
        });
    }
    loadData();
}

function loadData(): void {
    const selectedLayers: readonly SceneNode[] = figma.currentPage.selection;
    const checkingResult = checkingLayers(selectedLayers.slice());
    if (checkingResult.type === 'error') {
        figma.ui.postMessage(checkingResult);
    }

    if (checkingResult.type === 'support') {
        const data = checkingResult.data;
        const getFrameResizerAnchorPosition: string = figma.root.getPluginData('frameResizerAnchorPosition') || '1';
        const getFrameResizerPresets: string = figma.root.getPluginData('frameResizerPresets') || '[]';
        figma.ui.postMessage({
            type: 'loadData',
            data: {
                anchor: parseInt(getFrameResizerAnchorPosition),
                width: data.width,
                height: data.height,
                constrain: data.constrain,
                presets: getFrameResizerPresets
            }
        });
    }
}

interface PostMessage {
    type: string,
    data: {
        message?: string,
        width?: number | 'Mixed',
        height?: number | 'Mixed',
        constrain?: boolean | 'Mixed'
    }
}

function checkingLayers(nodes: any[]): PostMessage {
    let widths: number [] = [];
    let heights: number [] = [];
    let constrains: boolean [] = [];
    if (nodes.length === 0) {
        return {
            type: 'error',
            data: {
                message: 'Selected Frame and Component layers.'
            }
        };
    }
    for (const node of nodes) {
        if (node.type !== "FRAME" && node.type !== "COMPONENT") {
            return {
                type: 'error',
                data: {
                    message: 'Support to only resize Frame and Component.'
                }
            };
        }
        if (node.type === "FRAME" || node.type === "COMPONENT") {
            if (node.layoutMode !== 'NONE') {
                return {
                    type: 'error',
                    data: {
                        message: 'Not support to resize frame with auto-layout.'
                    }
                };
            }
        }
        let width = formatNumber(node.width);
        let height = formatNumber(node.height);
        if (!widths.includes(width)) {
            widths.push(width);
        }
        if (!heights.includes(height)) {
            heights.push(height);
        }
        if (!constrains.includes(node.constrainProportions)) {
            constrains.push(node.constrainProportions);
        }
    }
    return {
        type: 'support',
        data: {
            width: widths.length > 1 ? 'Mixed' : widths[0],
            height: heights.length > 1 ? 'Mixed' : heights[0],
            constrain: constrains.length > 1 ? 'Mixed' : constrains[0]
        }
    };
}

function formatNumber(num: number): number {
    if (!Number.isInteger(num)) {
        return Number(num.toFixed(2));
    }
    return num;
}

function resizeFrame(frame: FrameNode, width: number, height: number, anchor: number, roundToPixels: boolean): void {
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

    if (roundToPixels) {
        frame.x = Math.round(frame.x);
        frame.y = Math.round(frame.y);
    }
}
