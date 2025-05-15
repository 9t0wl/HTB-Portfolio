import IMG1 from "../assets/1underpassscreenshot.png";
import IMG2 from "../assets/2underpassscreenshot.png";
import IMG3 from "../assets/3underpassscreenshot.png";
import IMG4 from "../assets/pwnedunderpass.png";
import IMG5 from "../assets/UnderPass.png";
import { alertWriteup } from "./writeups/alert";
import { boardLightWriteup } from "./writeups/boardLight";
import { underpassWriteup } from "./writeups/underpass";

export const machines = [
  {
    name: "BoardLight",
    os: "Linux",
    difficulty: "Easy",
    description: "SQLi + Dolibarr CVE + Privesc with Enlightenment exploit",
    writeup: boardLightWriteup,
  },
  {
    name: "Alert",
    os: "Linux",
    difficulty: "Easy",
    description: "Stored XSS → shell injection → privesc via vulnerable config",
    writeup: alertWriteup,
  },
  {
    name: "UnderPass",
    os: "Linux",
    difficulty: "Easy",
    description: "daloRADIUS default creds → SSH → privesc via mosh-server",
    writeup: underpassWriteup,
    images: [IMG1, IMG2, IMG3, IMG4, IMG5],
  },
  {
    name: "Chemistry",
    os: "Linux",
    difficulty: "Easy",
    description: "File upload bypass → RCE → privesc using LinPEAS findings",
    writeup: [],
  },
];
