import { createEffect, createSignal } from "solid-js";
import type { Component } from "solid-js";

import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  calculate,
} from "./lib/contrast-utils";

import styles from "./App.module.css";

const rgbRe = /(?:rgb\()?(\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?/;
const hslRe =
  /(?:hsl\()?(\d{1,3}), ?(\d{1,3}\.?\d{1,2})%?, ?(\d{1,3}\.?\d{1,2})(?:%\))?/;

type DisplayValue = "Hex" | "RGB" | "HSL";
type TextSize = "large" | "normal";

const App: Component = () => {
  const [getWindowWidth, setWindowWidth] = createSignal(window.innerWidth);
  const [getRgbOne, setRgbOne] = createSignal([255, 255, 255]);
  const [getRgbTwo, setRgbTwo] = createSignal([0, 0, 0]);
  const [getTextSize, setTextSize] = createSignal("large" as TextSize);
  const [getRatio, setRatio] = createSignal(0);
  const [getIsAccessible, setIsAccessible] = createSignal(false);
  const [getAsValueOne, setAsValueOne] = createSignal("Hex" as DisplayValue);
  const [getAsValueTwo, setAsValueTwo] = createSignal("Hex" as DisplayValue);

  const handleConversion = (rgb: number[], asValue: "Hex" | "RGB" | "HSL") => {
    switch (asValue) {
      case "Hex":
        return rgbToHex(rgb);
      case "RGB":
        return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
      case "HSL":
        return `hsl(${rgbToHsl(rgb)[0]}, ${rgbToHsl(rgb)[1].toPrecision(
          3
        )}%, ${rgbToHsl(rgb)[2].toPrecision(3)}%)`;
    }
  };

  const refresh = () => {
    const result = calculate(getRgbOne(), getRgbTwo(), getTextSize());
    setRatio(parseFloat(result.ratio.toFixed(3)));
    setIsAccessible(result.isAccessible);
  };

  const handleTextSizeEvent = (event: Event) => {
    const select = event.target as HTMLSelectElement;
    setTextSize(select.value as TextSize);
  };

  const handleSelectEvent = (event: Event) => {
    const select = event.target as HTMLSelectElement;
    if (select.parentElement?.id === "test-text") {
      setAsValueOne(select.value as DisplayValue);
    } else {
      setAsValueTwo(select.value as DisplayValue);
    }
  };

  const handleRgbValue = (
    asValue: "Hex" | "RGB" | "HSL",
    element: HTMLInputElement
  ) => {
    if (asValue === "RGB") {
      const rgbMatches = element.value.match(rgbRe);
      if (rgbMatches) {
        return [
          parseInt(rgbMatches[1]),
          parseInt(rgbMatches[2]),
          parseInt(rgbMatches[3]),
        ];
      } else {
        return hexToRgb(element.value);
      }
    } else if (asValue === "HSL") {
      const hslMatches = element.value.match(hslRe);
      if (hslMatches) {
        return hslToRgb([
          parseInt(hslMatches[1]),
          parseFloat(parseFloat(hslMatches[2]).toPrecision(3)),
          parseFloat(parseFloat(hslMatches[3]).toPrecision(3)),
        ]);
      } else {
        return hexToRgb(element.value);
      }
    } else {
      return hexToRgb(element.value);
    }
  };

  const handleRgbEvent = (event: Event) => {
    const element = event.target as HTMLInputElement;
    if (element.id === "rgbOne") {
      setRgbOne(handleRgbValue(getAsValueOne(), element));
    }
    if (element.id === "rgbTwo") {
      setRgbTwo(handleRgbValue(getAsValueTwo(), element));
    }
    if (element.id === "rgbOneDisplay") {
      setRgbOne(handleRgbValue(getAsValueOne(), element));
    }
    if (element.id === "rgbTwoDisplay") {
      setRgbTwo(handleRgbValue(getAsValueTwo(), element));
    }
    refresh();
  };

  const handleResize = () => {
    setWindowWidth(window.innerWidth);
  };

  createEffect(() => {
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [getWindowWidth]);

  createEffect(() => {
    refresh();
  }, [getRgbOne, getRgbTwo, getTextSize]);

  return (
    <>
      <header class={styles.banner}>Text Contrast Accessibility</header>
      <div id="desc-container" class={styles.textContainer}>
        <p id="description" class={styles.typography}>Styling text isn't usually the foremost concern for many developers, however the readability of any
          paragraph of text is a crucial part of the user experience. This tool allows you to test the contrast
          ratio of two colors to ensure that your text is accessible to a broad user base. The WCAG 2.0 standard
          requires a contrast ratio of 4.5:1 for normal text and 3:1 for large text. This tool will display the
          contrast ratio of the two colors you select, and will also tell you if the contrast ratio is sufficient
          for normal or large text.
        </p>
      </div>
      <main class={styles.mainGrid}>
        <div class={styles.colorSelector}>
          <label for="colorSelect" class={styles.selectorLabel}>
            Text Size
          </label>
          <select
            id="colorSelect"
            name="colorSelect"
            class={styles.selectInner}
            onChange={handleTextSizeEvent}
          >
            <option value="large">Large text</option>
            <option value="normal">Normal text</option>
          </select>
        </div>
        <article class={styles.rgbOne} id="test-text">
          <h2>Text Color</h2>
          <div class={styles.innerContainer}>
            <input
              type="color"
              id="rgbOne"
              name="rgbOne"
              value={rgbToHex(getRgbOne())}
              onInput={handleRgbEvent}
            />
            <div class={styles.outputRgb} id="test-text">
              <label class={styles.outputLabel} for="rgbOneDisplay">
                Value
              </label>
              <input
                type="text"
                id="rgbOneDisplay"
                name="rgbOneDisplay"
                value={handleConversion(getRgbOne(), getAsValueOne())}
                onChange={handleRgbEvent}
                class={styles.outputInner}
              />
              <select
                onChange={handleSelectEvent}
                id="display-value-select-one"
              >
                <option value="Hex">Hex</option>
                <option value="RGB">RGB</option>
                <option value="HSL">HSL</option>
              </select>
            </div>
          </div>
        </article>
        {getWindowWidth() > 1200 && <div class={styles.divider}></div>}
        <article class={styles.rgbTwo} id="test-bg">
          <h2>Background Color</h2>
          <div class={styles.innerContainer}>
            <input
              type="color"
              id="rgbTwo"
              name="rgbTwo"
              value={rgbToHex(getRgbTwo())}
              onInput={handleRgbEvent}
            />
            <div class={styles.outputRgb} id="text-bg">
              <label class={styles.outputLabel} for="rgbTwoDisplay">Value</label>
              <input
                type="text"
                id="rgbTwoDisplay"
                name="rgbTwoDisplay"
                value={handleConversion(getRgbTwo(), getAsValueTwo())}
                onChange={handleRgbEvent}
                class={styles.outputInner}
              />
              <select
                onChange={handleSelectEvent}
                id="display-value-select-two"
              >
                <option value="Hex">Hex</option>
                <option value="RGB">RGB</option>
                <option value="HSL">HSL</option>
              </select>
            </div>
          </div>
        </article>
        {getWindowWidth() > 1200 && (
          <div style={{ "grid-area": "output-left" }}></div>
        )}
        <article
          id="lorem-bg"
          style={{ "background-color": rgbToHex(getRgbTwo()) }}
        >
          {getWindowWidth() > 1200 ? (
            <span id="lorem" style={{ color: rgbToHex(getRgbOne()) }}>
              "Lorem ipsum dolor sit amet consectetur adipisicing elit..."
            </span>
          ) : (
            <span id="lorem" style={{ color: rgbToHex(getRgbOne()) }}>
              "Lorem ipsum..."
            </span>
          )}
        </article>
        {getWindowWidth() > 1200 && (
          <div style={{ "grid-area": "output-right" }}></div>
        )}
      </main>
      <footer>
        <p id="lineRatio">
          Contrast Ratio: <span id="ratio">{getRatio()}</span>
        </p>
        <p id="lineAccessible">
          {getIsAccessible() ? (
            <span id="isAccessible" style={{ color: "#00ff00" }}>
              Accessible!
            </span>
          ) : (
            <span id="isAccessible" style={{ color: "#ff0000" }}>
              Not Accessible!
            </span>
          )}
        </p>
      </footer>
    </>
  );
};

export default App;
