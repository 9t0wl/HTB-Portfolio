// src/utils/replacePlaceholders.js
import IMG1 from "../assets/1underpassscreenshot.png";
import IMG2 from "../assets/2underpassscreenshot.png";
import IMG3 from "../assets/3underpassscreenshot.png";
import IMG4 from "../assets/pwnedunderpass.png";
import IMG5 from "../assets/UnderPass.png";

// ✅ optional: expand this list if you have more
const imageMap = {
  IMG1,
  IMG2,
  IMG3,
  IMG4,
  IMG5,
};

export function replacePlaceholders(text) {
  const parts = [];
  const regex = /\[\[IMG(\d+)]]/g;

  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const imgNumber = match[1];
    const placeholderIndex = match.index;

    // ✅ add plain text before placeholder
    if (placeholderIndex > lastIndex) {
      parts.push(text.substring(lastIndex, placeholderIndex));
    }

    // ✅ add image component
    const imageKey = `IMG${imgNumber}`;
    const imageSrc = imageMap[imageKey];
    if (imageSrc) {
      parts.push(
        <img
          key={imageKey}
          src={imageSrc}
          alt={imageKey}
          style={{ maxWidth: "100%", margin: "1rem 0", display: "block" }}
        />
      );
    } else {
      // ✅ fallback (leave as text if image not found)
      parts.push(match[0]);
    }

    lastIndex = regex.lastIndex;
  }

  // ✅ add any remaining text after last placeholder
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
}
