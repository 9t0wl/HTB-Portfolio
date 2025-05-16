import { alertWriteup } from "./writeups/alert";
import { boardLightWriteup } from "./writeups/boardLight";
import { chemistryWriteup } from "./writeups/chemistry";
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
  },
  {
    name: "Chemistry",
    os: "Linux",
    difficulty: "Easy",
    description: "File upload bypass → RCE → privesc using LinPEAS findings",
    writeup: chemistryWriteup,
  },
];
