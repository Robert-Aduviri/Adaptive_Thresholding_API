function computeAdaptiveThreshold(sourceImageData, ratio, callback) {
    var integral = buildIntegral_Gray(sourceImageData);

    var width = sourceImageData.width;
    var height = sourceImageData.height;
    var s = width >> 4; // in fact it's s/2, but since we never use s...

    var sourceData = sourceImageData.data;
    var result = createImageData(width, height);
    var resultData = result.data;
    var resultData32 = new Uint32Array(resultData.buffer);

    var x = 0,
        y = 0,
        lineIndex = 0;

    for (y = 0; y < height; y++, lineIndex += width) {
        for (x = 0; x < width; x++) {

            var value = sourceData[(lineIndex + x) << 2];
            var x1 = Math.max(x - s, 0);
            var y1 = Math.max(y - s, 0);
            var x2 = Math.min(x + s, width - 1);
            var y2 = Math.min(y + s, height - 1);
            var area = (x2 - x1 + 1) * (y2 - y1 + 1);
            var localIntegral = getIntegralAt(integral, width, x1, y1, x2, y2);
            if (value * area > localIntegral * ratio) {
                resultData32[lineIndex + x] = 0xFFFFFFFF;
            } else {
                resultData32[lineIndex + x] = 0xFF000000;
            }
        }
    }
    return result;
}

function createImageData(width, height) {
    var canvas = document.createElement('canvas');
    return canvas.getContext('2d').createImageData(width, height);
}

function buildIntegral_Gray(sourceImageData) {
    var sourceData = sourceImageData.data;
    var width = sourceImageData.width;
    var height = sourceImageData.height;
    // should it be Int64 Array ??
    // Sure for big images 
    var integral = new Int32Array(width * height)
    // ... for loop
    var x = 0,
        y = 0,
        lineIndex = 0,
        sum = 0;
    for (x = 0; x < width; x++) {
        sum += sourceData[x << 2];
        integral[x] = sum;
    }

    for (y = 1, lineIndex = width; y < height; y++, lineIndex += width) {
        sum = 0;
        for (x = 0; x < width; x++) {
            sum += sourceData[(lineIndex + x) << 2];
            integral[lineIndex + x] = integral[lineIndex - width + x] + sum;
        }
    }
    return integral;
}

function getIntegralAt(integral, width, x1, y1, x2, y2) {
    var result = integral[x2 + y2 * width];
    if (y1 > 0) {
        result -= integral[x2 + (y1 - 1) * width];
        if (x1 > 0) {
            result += integral[(x1 - 1) + (y1 - 1) * width];
        }
    }
    if (x1 > 0) {
        result -= integral[(x1 - 1) + (y2) * width];
    }
    return result;
}

var testImage64 = "ImageBase64encoded"

var testImage = new Image();
testImage.src = testImage64;

document.body.appendChild(testImage);

var canvas = document.createElement('canvas');
canvas.width = testImage.width;
canvas.height = testImage.height;
document.body.appendChild(canvas);
var ctx = canvas.getContext('2d');
ctx.drawImage(testImage, 0, 0);

var testImageData = ctx.getImageData(0, 0, testImage.width, testImage.height);

var thresholdInput = document.getElementById('threshold');
thresholdInput.onchange = function () {
    updateImage();
};

function updateImage() {
    var newTh = (+thresholdInput.value) / 100;
    var thresholded = computeAdaptiveThreshold(testImageData, newTh);
    ctx.putImageData(thresholded, 0, 0);
    ctx.fillStyle = '#EE8888';
    ctx.fillText('current Threshold :' + newTh, 10, 20);
}

//  ----------------------------------
updateImage();