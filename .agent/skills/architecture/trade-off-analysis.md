, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
  24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24
];

/**
 * @param {string|HTMLImageElement} img
 * @param {string|HTMLCanvasElement} canvas
 * @param {Float} radius
 * @param {boolean} blurAlphaChannel
 * @param {boolean} useOffset
 * @param {boolean} skipStyles
 * @returns {undefined}
 */
function processImage (
  img, canvas, radius, blurAlphaChannel, useOffset, skipStyles
) {
  if (typeof img === 'string') {
    img = document.getElementById(img);
  }

  if (
    !img ||
    (Object.prototype.toString.call(img).slice(8, -1) ===
      'HTMLImageElement' && !('naturalWidth' in img))
  ) {
    return;
  }

  const dimensionType = useOffset ? 'offset' : 'natural';
  let w = img[dimensionType + 'Width'];
  let h = img[dimensionType + 'Height'];

  // add ImageBitmap support,can blur texture source
  if (Object.prototype.toString.call(img).slice(8, -1) === 'ImageBitmap') {
    w = img.width;
    h = img.height;
  }

  if (typeof canvas === 'string') {
    canvas = document.getElementById(canvas);
  }
  if (!canvas || !('getContext' in canvas)) {
    return;
  }

  if (!skipStyles) {
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
  }
  canvas.width = w;
  canvas.height = h;

  const context = canvas.getContext('2d');
  context.clearRect(0, 0, w, h);
  context.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, w, h);

  if (isNaN(radius) || radius < 1) { return; }

  if (blurAlphaChannel) {
    processCanvasRGBA(canvas, 0, 0, w, h, radius);
  } else {
    processC