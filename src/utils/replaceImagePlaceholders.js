// src/utils/replaceImagePlaceholders.js
import IMG1 from "../assets/1underpassscreenshot.png";
import IMG2 from "../assets/2underpassscreenshot.png";
import IMG3 from "../assets/3underpassscreenshot.png";
import IMG4 from "../assets/pwnedunderpass.png";
import IMG5 from "../assets/UnderPass.png";

// Add all your images here
const imageMap = {
  IMG1,
  IMG2,
  IMG3,
  IMG4,
  IMG5,
};

export function replaceImagePlaceholders(text) {
  // Replace any [[IMGx]] with React image tag
  return text.replace(/\[\[(IMG\d+)\]\]/g, (match, key) => {
    const img = imageMap[key];
    if (!img) return match; // leave as is if not found
    return `<img src="${img}" alt="${key}" style="max-width:100%; margin:1rem 0; border-radius:8px; box-shadow:0 0 10px rgba(0,0,0,0.5);" />`;
  });
}
