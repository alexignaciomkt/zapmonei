ixels[yi + 3];

    for (let i = 0; i < radiusPlus1; i++) {
      stack.r = pr;
      stack.g = pg;
      stack.b = pb;
      stack.a = pa;
      stack = stack.next;
    }

    let rInSum = 0, gInSum = 0, bInSum = 0, aInSum = 0,
      rOutSum = radiusPlus1 * pr,
      gOutSum = radiusPlus1 * pg,
      bOutSum = radiusPlus1 * pb,
      aOutSum = radiusPlus1 * pa,
      rSum = sumFactor * pr,
      gSum = sumFactor * pg,
      bSum = sumFactor * pb,
      aSum = sumFactor * pa;

    for (let i = 1; i < radiusPlus1; i++) {
      const p = yi + ((widthMinus1 < i ? widthMinus1 : i) << 2);

      const r = pixels[p],
        g = pixels[p + 1],
        b = pixels[p + 2],
        a = pixels[p + 3];

      const rbs = radiusPlus1 - i;
      rSum += (stack.r = r) * rbs;
      gSum += (stack.g = g) * rbs;
      bSum += (stack.b = b) * rbs;
      aSum += (stack.a = a) * rbs;

      rInSum += r;
      gInSum += g;
      bInSum += b;
      aInSum += a;

      stack = stack.next;
    }

    stackIn = stackStart;
    stackOut = stackEnd;
    for (let x = 0; x < width; x++) {
      const paInitial = (aSum * mulSum) >>> shgSum;
      pixels[yi + 3] = paInitial;
      if (paInitial !== 0) {
        const a = 255 / paInitial;
        pixels[yi] = ((rSum * mulSum) >>> shgSum) * a;
        pixels[yi + 1] = ((gSum * mulSum) >>> shgSum) * a;
        pixels[yi + 2] = ((bSum * mulSum) >>> shgSum) * a;
      } else {
        pixels[yi] = pixels[yi + 1] = pixels[yi + 2] = 0;
      }

      rSum -= rOutSum;
      gSum -= gOutSum;
      bSum -= bOutSum;
      aSum -= aOutSum;

      rOutSum -= stackIn.r;
      gOutSum -= stackIn.g;
      bOutSum -= stackIn.b;
      aOutSum -= stackIn.a;

      let p = x + radius + 1;
      p = (yw + (p < widthMinus1
        ? p
        : widthMinus1)) << 2;

      rInSum += (stackIn.r = pixels[p]);
      gInSum += (stackIn.g = pixels[p + 1]);
      bInSum += (stackIn.b = pixels[p + 2]);
      aInSum += (stackIn.a = pixels[p + 3]);

      rSum += rInSum;
      gSum += gInSum;
      bSum += bInSum;
      aSum += aInSum;

      stackIn = stackIn.next;

      const {r, g, b, a} = stackOut;

      rOutSum += r;
      gOutSum += g;
      bOutSum += b;
      aOutSum += a;

      rInSum -= r;
      gInSum -= g;
      bInSum -= b;
      aInSum -= a;

      stackOut = stackOut.next;

      yi += 4;
    }
    yw += width;
  }

  for (let x = 0; x < width; x++) {
    yi = x << 2;

    let pr = pixels[yi],
      pg = pixels[yi + 1],
      pb = pixels[yi + 2],
      pa = pixels[yi + 3],
      rOutSum = radiusPlus1 * pr,
      g