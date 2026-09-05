/* Synapse Liquid Glass + Chromatic Metal. No dependencies. */
(() => {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";
  const liquidDefaults = {
    light: 0.14,
    refraction: 72,
    depth: 1,
    dispersion: 0.52,
    frost: 3,
    splay: 0.28,
  };
  const liquidState = { ...liquidDefaults };
  let liquidNodes = null;

  function rampStops(splay, channel, steps = 12) {
    const stops = [];
    const stop = (offset, value) => {
      const color = channel === "r" ? `rgb(${value},0,0)` : `rgb(0,${value},0)`;
      stops.push(`<stop offset="${offset.toFixed(4)}" stop-color="${color}"/>`);
    };
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      const edge = Math.pow(1 - t, 1.8);
      stop(t * splay, Math.round(255 * (0.5 + 0.5 * edge)));
    }
    for (let i = steps; i >= 0; i -= 1) {
      const t = i / steps;
      const edge = Math.pow(1 - t, 1.8);
      stop(1 - t * splay, Math.round(255 * (0.5 - 0.5 * edge)));
    }
    return stops.join("");
  }

  function mapURI(axis, splay) {
    const horizontal = axis === "x";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240"><defs><linearGradient id="g" x1="0" y1="0" x2="${horizontal ? 1 : 0}" y2="${horizontal ? 0 : 1}">${rampStops(splay, horizontal ? "r" : "g")}</linearGradient></defs><rect width="240" height="240" fill="#000"/><rect width="240" height="240" fill="url(#g)"/></svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  function makeSVGNode(tag, attrs = {}) {
    const node = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    return node;
  }

  function createLiquidFilter() {
    const svg = makeSVGNode("svg", { class: "synapse-filter-defs", "aria-hidden": "true" });
    const filter = makeSVGNode("filter", { id: "synapse-liquid-glass", x: "0", y: "0", width: "100%", height: "100%", "color-interpolation-filters": "sRGB" });
    const mapx = makeSVGNode("feImage", { result: "mapx", width: "100%", height: "100%", preserveAspectRatio: "none" });
    const mapy = makeSVGNode("feImage", { result: "mapy", width: "100%", height: "100%", preserveAspectRatio: "none" });
    const combine = makeSVGNode("feComposite", { in: "mapx", in2: "mapy", operator: "arithmetic", k2: "1", k3: "1", result: "rawmap" });
    const turbulence = makeSVGNode("feTurbulence", { type: "fractalNoise", baseFrequency: ".009", numOctaves: "2", seed: "9", result: "noise" });
    const mapWarp = makeSVGNode("feDisplacementMap", { in: "rawmap", in2: "noise", xChannelSelector: "R", yChannelSelector: "G", scale: "9", result: "map" });
    const red = makeSVGNode("feDisplacementMap", { in: "SourceGraphic", in2: "map", xChannelSelector: "R", yChannelSelector: "G", scale: "62", result: "red" });
    const redChannel = makeSVGNode("feColorMatrix", { in: "red", type: "matrix", result: "cr", values: "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" });
    const green = makeSVGNode("feDisplacementMap", { in: "SourceGraphic", in2: "map", xChannelSelector: "R", yChannelSelector: "G", scale: "72", result: "green" });
    const greenChannel = makeSVGNode("feColorMatrix", { in: "green", type: "matrix", result: "cg", values: "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" });
    const blue = makeSVGNode("feDisplacementMap", { in: "SourceGraphic", in2: "map", xChannelSelector: "R", yChannelSelector: "G", scale: "82", result: "blue" });
    const blueChannel = makeSVGNode("feColorMatrix", { in: "blue", type: "matrix", result: "cb", values: "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" });
    const blendRG = makeSVGNode("feBlend", { in: "cr", in2: "cg", mode: "screen", result: "crg" });
    const blendRGB = makeSVGNode("feBlend", { in: "crg", in2: "cb", mode: "screen" });
    [mapx, mapy, combine, turbulence, mapWarp, red, redChannel, green, greenChannel, blue, blueChannel, blendRG, blendRGB].forEach(node => filter.appendChild(node));
    svg.appendChild(filter);
    document.body.appendChild(svg);
    liquidNodes = { svg, mapx, mapy, turbulence, mapWarp, red, green, blue };
    applyLiquidSettings();
  }

  function applyLiquidSettings() {
    if (!liquidNodes) return;
    const cfg = liquidState;
    const xURI = mapURI("x", cfg.splay);
    const yURI = mapURI("y", cfg.splay);
    liquidNodes.mapx.setAttribute("href", xURI);
    liquidNodes.mapy.setAttribute("href", yURI);
    liquidNodes.mapWarp.setAttribute("scale", (cfg.refraction * 0.13).toFixed(2));
    liquidNodes.turbulence.setAttribute("baseFrequency", (0.006 + 0.010 * cfg.splay).toFixed(4));
    const split = cfg.dispersion * 0.30;
    liquidNodes.red.setAttribute("scale", (cfg.refraction * (1 - split)).toFixed(2));
    liquidNodes.green.setAttribute("scale", cfg.refraction.toFixed(2));
    liquidNodes.blue.setAttribute("scale", (cfg.refraction * (1 + split)).toFixed(2));
  }

  function setLiquidSettings(next = {}) {
    Object.keys(liquidState).forEach(key => {
      if (Number.isFinite(next[key])) liquidState[key] = next[key];
    });
    document.querySelectorAll(".fx-liquid").forEach(element => {
      if (Number.isFinite(next.light)) element.style.setProperty("--lg-light", next.light);
      if (Number.isFinite(next.depth)) element.style.setProperty("--lg-depth", next.depth);
      if (Number.isFinite(next.frost)) element.style.setProperty("--lg-frost", `${next.frost}px`);
      if (Number.isFinite(next.splay)) element.style.setProperty("--lg-splay", next.splay);
    });
    applyLiquidSettings();
    return { ...liquidState };
  }

  const VERTEX_SHADER = `
    attribute vec2 aPosition;
    varying vec2 vUv;
    void main() {
      vUv = aPosition * .5 + .5;
      gl_Position = vec4(aPosition, 0., 1.);
    }
  `;

  const FRAGMENT_SHADER = `
    precision highp float;
    varying vec2 vUv;
    uniform vec2 uResolution;
    uniform float uTime;
    uniform float uRounding;
    uniform float uDepth;
    uniform float uRoughness;
    uniform float uRGBSplit;
    uniform float uScale;
    uniform float uStretch;
    uniform float uAngle;
    uniform float uRepeats;
    uniform float uOffset;
    uniform float uPhase;
    uniform float uEvolution;
    uniform vec3 uColor0;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    uniform vec3 uColor4;
    uniform vec3 uColor5;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    vec3 ramp(float value) {
      float x = fract(value);
      float edge = mix(.006, .055, uRoughness);
      vec3 color = uColor0;
      color = mix(color, uColor1, smoothstep(.105 - edge, .105 + edge, x));
      color = mix(color, uColor2, smoothstep(.285 - edge, .285 + edge, x));
      color = mix(color, uColor3, smoothstep(.505 - edge, .505 + edge, x));
      color = mix(color, uColor4, smoothstep(.725 - edge, .725 + edge, x));
      color = mix(color, uColor5, smoothstep(.905 - edge, .905 + edge, x));
      return color;
    }

    float metalCoordinate(vec2 p, float time) {
      float ca = cos(uAngle);
      float sa = sin(uAngle);
      vec2 q = mat2(ca, -sa, sa, ca) * p;
      q.x *= uStretch;
      float seamlessA = sin(time + uPhase);
      float seamlessB = cos(time + uPhase);
      float flow = sin(q.y * (3.2 + uScale) + seamlessA * 1.7);
      flow += .55 * sin(q.y * 7.1 - seamlessB * 1.3 + q.x * 1.8);
      return q.x * uScale * uRepeats + uOffset + flow * uEvolution;
    }

    void main() {
      vec2 aspect = vec2(uResolution.x / max(uResolution.y, 1.), 1.);
      vec2 p = (vUv - .5) * 2. * aspect;
      float time = mod(uTime, 6.28318530718);
      float coord = metalCoordinate(p, time);
      float edgePulse = .5 + .5 * abs(sin(coord * 6.28318530718));
      float split = uRGBSplit * mix(.002, .018, edgePulse);
      vec3 cr = ramp(coord + split);
      vec3 cg = ramp(coord);
      vec3 cb = ramp(coord - split);
      vec3 color = vec3(cr.r, cg.g, cb.b);

      float brush = hash(vec2(floor(vUv.y * uResolution.y * .72), floor(vUv.x * 72.)));
      color += (brush - .5) * uRoughness * .19;
      float sphere = clamp(1. - dot(p, p) * .46, 0., 1.);
      color *= mix(.58, 1.18, sphere * uDepth);
      color += pow(max(0., .96 - length(p - vec2(-.30,.38))), 9.) * .58 * uDepth;

      float distanceToCenter = length(p);
      float feather = mix(.004, .026, uRounding);
      float alpha = 1. - smoothstep(1. - feather, 1., distanceToCenter);
      gl_FragColor = vec4(color * alpha, alpha);
    }
  `;

  const metalDefaults = {
    rounding: 0.72,
    depth: 1.0,
    roughness: 0.13,
    rgbSplit: 0.72,
    scale: 1.36,
    stretch: 1.72,
    angle: -0.38,
    gradient: ["#f6ffff", "#050708", "#43efff", "#fff7d1", "#ff456f", "#091018"],
    repeats: 3.7,
    offset: 0.04,
    phase: 0.55,
    evolution: 0.31,
  };

  function hexToRGB(hex) {
    const normalized = hex.replace("#", "");
    const value = normalized.length === 3 ? normalized.split("").map(char => char + char).join("") : normalized;
    const number = parseInt(value, 16);
    return [((number >> 16) & 255) / 255, ((number >> 8) & 255) / 255, (number & 255) / 255];
  }

  function compile(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("Chromatic Metal shader compile failed:", gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  function makeProgram(gl) {
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vertex || !fragment) return null;
    const program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Chromatic Metal shader link failed:", gl.getProgramInfoLog(program));
      return null;
    }
    return program;
  }

  function startChromaticMetal(canvas, overrides = {}) {
    const controls = { ...metalDefaults, ...overrides };
    controls.gradient = [...(overrides.gradient || metalDefaults.gradient)].slice(0, 6);
    const gl = canvas.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: true });
    if (!gl) {
      canvas.classList.add("no-webgl");
      return null;
    }
    const program = makeProgram(gl);
    if (!program) return null;
    gl.useProgram(program);

    const position = gl.getAttribLocation(program, "aPosition");
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uniform = name => gl.getUniformLocation(program, name);
    const uniforms = {
      resolution: uniform("uResolution"), time: uniform("uTime"), rounding: uniform("uRounding"),
      depth: uniform("uDepth"), roughness: uniform("uRoughness"), rgbSplit: uniform("uRGBSplit"),
      scale: uniform("uScale"), stretch: uniform("uStretch"), angle: uniform("uAngle"),
      repeats: uniform("uRepeats"), offset: uniform("uOffset"), phase: uniform("uPhase"),
      evolution: uniform("uEvolution"), colors: Array.from({ length: 6 }, (_, index) => uniform(`uColor${index}`)),
    };
    let width = 1;
    let height = 1;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      width = Math.max(1, Math.round(rect.width * dpr));
      height = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    }

    function draw(now = performance.now()) {
      resize();
      gl.useProgram(program);
      gl.uniform2f(uniforms.resolution, width, height);
      gl.uniform1f(uniforms.time, (now / 1000) % (Math.PI * 2));
      gl.uniform1f(uniforms.rounding, controls.rounding);
      gl.uniform1f(uniforms.depth, controls.depth);
      gl.uniform1f(uniforms.roughness, controls.roughness);
      gl.uniform1f(uniforms.rgbSplit, controls.rgbSplit);
      gl.uniform1f(uniforms.scale, controls.scale);
      gl.uniform1f(uniforms.stretch, controls.stretch);
      gl.uniform1f(uniforms.angle, controls.angle);
      gl.uniform1f(uniforms.repeats, controls.repeats);
      gl.uniform1f(uniforms.offset, controls.offset);
      gl.uniform1f(uniforms.phase, controls.phase);
      gl.uniform1f(uniforms.evolution, controls.evolution);
      controls.gradient.forEach((color, index) => gl.uniform3fv(uniforms.colors[index], hexToRGB(color)));
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    const observer = new ResizeObserver(() => draw());
    observer.observe(canvas);
    draw();

    let frameId = 0;
    function frame(now) {
      draw(now);
      frameId = requestAnimationFrame(frame);
    }
    frameId = requestAnimationFrame(frame);

    return {
      controls,
      set(next = {}) { Object.assign(controls, next); if (next.gradient) controls.gradient = [...next.gradient].slice(0, 6); draw(); return { ...controls, gradient: [...controls.gradient] }; },
      destroy() { cancelAnimationFrame(frameId); observer.disconnect(); },
      draw,
    };
  }

  function init() {
    createLiquidFilter();
    document.querySelectorAll("canvas.chromatic-metal").forEach(canvas => startChromaticMetal(canvas));
    const supported = CSS.supports("backdrop-filter", "url(#synapse-liquid-glass)") || CSS.supports("-webkit-backdrop-filter", "url(#synapse-liquid-glass)");
    document.querySelectorAll(".liquid-support").forEach(label => {
      label.dataset.active = String(supported);
      label.textContent = supported ? "Refraction active" : "Glass fallback";
    });
  }

  window.SynapseEffects = {
    liquidGlass: { settings: liquidState, set: setLiquidSettings },
    chromaticMetal: { defaults: metalDefaults, mount: startChromaticMetal },
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
