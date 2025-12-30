import * as THREE from 'three';

export const MAX_RIPPLES = 6;

export function createShaderMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,

    uniforms: {
      time: { value: 0 },
      rippleCenters: {
        value: Array.from({ length: MAX_RIPPLES }, () => new THREE.Vector2(-1, -1)),
      },
      rippleTimes: { value: new Float32Array(MAX_RIPPLES) },
      rippleThreat: { value: new Float32Array(MAX_RIPPLES) },
    },

    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `,

    fragmentShader: `
      precision highp float;

      uniform float time;
      uniform vec2 rippleCenters[${MAX_RIPPLES}];
      uniform float rippleTimes[${MAX_RIPPLES}];
      uniform float rippleThreat[${MAX_RIPPLES}];

      varying vec2 vUv;

      float grid(vec2 uv) {
        vec2 g = abs(fract(uv * 24.0) - 0.5);
        return smoothstep(0.06, 0.0, min(g.x, g.y));
      }

      float ripple(vec2 uv, vec2 c, float t) {
        float d = distance(uv, c);
        return sin(32.0 * d - t * 10.0) * exp(-d * 7.0);
      }

      void main() {
        vec2 uv = vUv;

        float pcb = grid(uv);
        vec3 base = vec3(0.0, 0.45, 0.75) * pcb * 0.35;

        float energy = 0.0;
        vec3 waves = vec3(0.0);

        for (int i = 0; i < ${MAX_RIPPLES}; i++) {
          if (rippleCenters[i].x < 0.0) continue;

          float t = time - rippleTimes[i];
          if (t < 0.0) continue;

          float r = ripple(uv, rippleCenters[i], t);
          vec3 c = mix(
            vec3(0.0, 0.9, 1.0),
            vec3(1.0, 0.1, 0.1),
            rippleThreat[i]
          );

          waves += c * r;
          energy += abs(r);
        }

        float alpha = clamp(0.22 + energy * 0.7 + pcb * 0.25, 0.0, 1.0);
        gl_FragColor = vec4(base + waves, alpha);
      }
    `,
  });
}
