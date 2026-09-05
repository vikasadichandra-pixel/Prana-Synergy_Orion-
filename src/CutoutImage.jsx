import { useEffect, useState } from 'react';
import './image-explosion.css';

const looksLikeBackground = (r, g, b) => {
  const spread = Math.max(r, g, b) - Math.min(r, g, b);
  return r > 220 && g > 220 && b > 220 && spread < 24;
};

export default function CutoutImage({ src, alt, exploded = false }) {
  const [cutout, setCutout] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        if (!canvas.width || !canvas.height) return;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) return;
        context.drawImage(image, 0, 0);
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
        const { data } = pixels;
        const width = canvas.width;
        const height = canvas.height;
        const visited = new Uint8Array(width * height);
        const queue = [];
        const add = (x, y) => {
          const point = y * width + x;
          if (visited[point]) return;
          const offset = point * 4;
          if (!looksLikeBackground(data[offset], data[offset + 1], data[offset + 2])) return;
          visited[point] = 1;
          queue.push(point);
        };

        for (let x = 0; x < width; x += 1) { add(x, 0); add(x, height - 1); }
        for (let y = 1; y < height - 1; y += 1) { add(0, y); add(width - 1, y); }

        for (let cursor = 0; cursor < queue.length; cursor += 1) {
          const point = queue[cursor];
          const x = point % width;
          const y = Math.floor(point / width);
          data[point * 4 + 3] = 0;
          if (x) add(x - 1, y);
          if (x < width - 1) add(x + 1, y);
          if (y) add(x, y - 1);
          if (y < height - 1) add(x, y + 1);
        }

        context.putImageData(pixels, 0, 0);
        if (!cancelled) setCutout(canvas.toDataURL('image/png'));
      } catch (err) {
        console.warn('Could not process cutout image:', err);
      }
    };
    image.src = src;
    return () => { cancelled = true; };
  }, [src]);

  const imageSource = cutout || src;
  if (!exploded) return <img className="cutout" src={imageSource} alt={alt} />;

  return <div className="image-explosion" role="img" aria-label={alt}>
    <img className="slice slice-left" src={imageSource} alt="" />
    <img className="slice slice-center" src={imageSource} alt="" />
    <img className="slice slice-right" src={imageSource} alt="" />
  </div>;
}
