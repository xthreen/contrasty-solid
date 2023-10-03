function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16),
        ]
      : [0, 0, 0];
  }
  
  function rgbToHex(rgb: number[]) {
    return (
      "#" +
      rgb
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
        .toUpperCase()
    );
  }
  
  function rgbToHsl(rgb: number[]) {
    const [r, g, b] = rgb;
    const [RED, GREEN, BLUE] = [r / 255, g / 255, b / 255];
    const MAX = Math.max(RED, GREEN, BLUE);
    const MIN = Math.min(RED, GREEN, BLUE);
    const L = (MAX + MIN) / 2;
    let H = 0;
    let S = 0;
  
    if (MAX !== MIN) {
      const D = MAX - MIN;
      S = L > 0.5 ? D / (2 - MAX - MIN) : D / (MAX + MIN);
  
      switch (MAX) {
        case RED:
          H = (GREEN - BLUE) / D + (GREEN < BLUE ? 6 : 0);
          break;
        case GREEN:
          H = (BLUE - RED) / D + 2;
          break;
        case BLUE:
          H = (RED - GREEN) / D + 4;
          break;
      }
    }
  
    return [H * 60, S * 100, L * 100];
  }
  
  function hslToRgb(hsl: number[]) {
    const [h, s, l] = hsl;
    const [H, S, L] = [h / 360, s / 100, l / 100];
    let R: number;
    let G: number;
    let B: number;
  
    if (S === 0) {
      R = G = B = L;
    } else {
      const q = L < 0.5 ? L * (1 + S) : L + S - L * S;
      const p = 2 * L - q;
      R = hueToRgb(p, q, H + 1 / 3);
      G = hueToRgb(p, q, H);
      B = hueToRgb(p, q, H - 1 / 3);
    }
  
    return [Math.round(R * 255), Math.round(G * 255), Math.round(B * 255)];
  }
  
  function hueToRgb(p: number, q: number, t: number) {
    let T = t;
    if (T < 0) {
      T += 1;
    }
    if (T > 1) {
      T -= 1;
    }
    if (T < 1 / 6) {
      return p + (q - p) * 6 * T;
    }
    if (T < 1 / 2) {
      return q;
    }
    if (T < 2 / 3) {
      return p + (q - p) * (2 / 3 - T) * 6;
    }
    return p;
  }
  
  function toLinear(col: number) {
    const color = col / 255.0;
    if (color <= 0.03928) {
      return color / 12.92;
    } else {
      return Math.pow((color + 0.055) / 1.055, 2.4);
    }
  }
  
  function relativeLuminance(rgb: number[]) {
    const [r, g, b] = rgb;
    const [RED, GREEN, BLUE] = [toLinear(r), toLinear(g), toLinear(b)];
    return 0.2126 * RED + 0.7152 * GREEN + 0.0722 * BLUE;
  }
  
  function calculate(rgbOne: number[], rgbTwo: number[], textSize: string) {
    let L1 = relativeLuminance(rgbOne);
    let L2 = relativeLuminance(rgbTwo);
  
    if (L1 > L2) {
      [L1, L2] = [L2, L1];
    }
  
    const ratio = (L2 + 0.05) / (L1 + 0.05);
  
    let isAccessible: boolean;
  
    if (textSize === "small") {
      isAccessible = ratio >= 3;
    } else {
      isAccessible = ratio >= 4.5;
    }
  
    return {
      ratio,
      isAccessible,
    };
  }
  
  export {
    hexToRgb,
    hslToRgb,
    hueToRgb,
    rgbToHex,
    rgbToHsl,
    toLinear,
    relativeLuminance,
    calculate,
  };
  