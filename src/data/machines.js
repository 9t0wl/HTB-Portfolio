import { alertWriteup } from "./writeups/alert";
import { boardLightWriteup } from "./writeups/boardLight";
import { cerealWriteup } from "./writeups/cereal";
import { chemistryWriteup } from "./writeups/chemistry";
import { escapeTwoWriteup } from "./writeups/escapeTwo";
import { underpassWriteup } from "./writeups/underpass";

export const machines = [
  {
    name: "Cereal",
    os: "Windows",
    difficulty: "Hard",
    description: "JWT forgery → GraphQL SSRF → RCE → SeImpersonate → SYSTEM",
    writeup: cerealWriteup,
  },
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
  {
    name: "EscapeTwo",
    os: "Windows",
    difficulty: "Easy",
    description: "SMB enumeration → cert abuse with Certipy → DA with NT hash",
    writeup: escapeTwoWriteup,
  },
];
