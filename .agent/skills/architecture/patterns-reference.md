 yi += 4;
    }
    yw += width;
  }

  for (let x = 0; x < width; x++) {
    yi = x << 2;
    let pr = pixels[yi],
      pg = pixels[yi + 1],
      pb = pixels[yi + 2],
      rOutSum = radiusPlus1 * pr,
      gOutSum = radiusPlus1 * pg,
      bOutSum = radiusPlus1 * pb,
      rSum = sumFactor * pr,
      gSum = sumFactor * pg,
      bSum = sumFactor * pb;

    stack = stackStart;

    for (let i = 0; i < radiusPlus1; i++) {
      stack.r = pr;
      stack.g = pg;
      stack.b = pb;
      stack = stack.next;
    }

    let rInSum = 0, gInSum = 0, bInSum = 0;
    for (let i = 1, yp = width; i <= radius; i++) {
      yi = (yp + x) << 2;

      rSum += (stack.r = (pr = pixels[yi])) * (rbs = radiusPlus1 - i);
      gSum += (stack.g = (pg = pixels[yi + 1])) * rbs;
      bSum += (stack.b = (pb = pixels[yi + 2])) * rbs;

      rInSum += pr;
      gInSum += pg;
      bInSum += pb;

      stack = stack.next;

      if (i < heightMinus1) {
        yp += width;
      }
    }

    yi = x;
    stackIn = stackStart;
    stackOut = stackEnd;
    for (let y = 0; y < height; y++) {
      p = yi << 2;
      pixels[p] = (rSum * mulSum) >>> shgSum;
      pixels[p + 1] = (gSum * mulSum) >>> shgSum;
      pixels[p + 2] = (bSum * mulSum) >>> shgSum;

      rSum -= rOutSum;
      gSum -= gOutSum;
      bSum -= bOutSum;

      rOutSum -= stackIn.r;
      gOutSum -= stackIn.g;
      bOutSum -= stackIn.b;

      p = (x + (
        ((p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1) *
                width
      )) << 2;

      rSum += (rInSum += (stackIn.r = pixels[p]));
      gSum += (gInSum += (stackIn.g = pixels[p + 1]));
      bSum += (bInSum += (stackIn.b = pixels[p + 2]));

      stackIn = stackIn.next;

      rOutSum += (pr = stackOut.r);
      gOutSum += (pg = stackOut.g);
      bOutSum += (pb = stackOut.b);

      rInSum -= pr;
      gInSum -= pg;
      bInSum -= pb;

      stackOut = stackOut.next;

      yi += width;
    }
  }

  return imageData;
}

/**
 *
 */
export class BlurStack {
  /**
   * Set properties.
   */
  constructor () {
    this.r = 0;
    this.g = 0;
    this.b = 0;
    this.a = 0;
    this.next = null;
  }
}

export {
  /**
    * @function module:StackBlur.image
    * @see module:StackBlur~processImage
    */
  processImage as image,
  /**
    * @function m