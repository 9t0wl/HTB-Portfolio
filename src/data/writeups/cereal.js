// ✅ src/data/writeups/cereal.js
import React from "react";
import InjectedImage from "../../components/InjectedImage";

import CerealIntro from "../../assets/Cereal.png";
import NmapScan from "../../assets/cerealnmap.png";
import DirSearch from "../../assets/cerealdirsearch.png";
import LoginPage from "../../assets/cerealloginlandingpage.png";
import CurlObfus from "../../assets/cerealcurlobfus.png";
import CurlLocalFiles from "../../assets/cereal_curl_local_files.png";
import GitDumper from "../../assets/cerealgitdumper.png";
import GitLog from "../../assets/cerealgitlog.png";
import BeautifyJS from "../../assets/cerealbeautify.png";
import ForgeJWT from "../../assets/cereal_forged_jwt_py_script.png";
import JWTError from "../../assets/cereal_jwt_error_missing_exp_claim.png";
import CurlForRCE from "../../assets/cereal_curl_for_rce.png";
import ReverseShellCmd from "../../assets/cereal_reverse_shellcmd.png";
import PythonServer from "../../assets/cerealpythonserver.png";
import ShellConnect from "../../assets/cerealsshconnection.png";
import RemoteConnection from "../../assets/cereal_remote_connection.png";
import Pwned from "../../assets/cerealpwned.png";

export const cerealWriteup = [
  () => (
    <>
      <h2>📈 Introduction</h2>
      <InjectedImage imgSrc={CerealIntro} alt="Cereal Logo" />
      <p>
        <strong>Cereal</strong> is a hard-rated Windows box from Hack The Box.
        It combines JWT forgery, GraphQL SSRF, .NET deserialization, and Windows
        privilege escalation with <code>SeImpersonatePrivilege</code>.
      </p>
      <p>
        One unique challenge was building the <strong>GenericPotato</strong>{" "}
        binary. After multiple failed attempts on my Kali Linux system due to
        missing .NET Framework 4.5 assemblies, I used my wife's Windows machine
        with <strong>Visual Studio 2022</strong> and the{" "}
        <strong>.NET v4.8 Developer Pack</strong> to build the executable
        successfully. 🪢💻
      </p>
    </>
  ),

  () => (
    <>
      <h2>🔎 Enumeration</h2>
      <InjectedImage imgSrc={NmapScan} alt="Nmap Scan" />
      <p>Nmap showed ports 80 (HTTP), 443 (HTTPS), and others.</p>
      <InjectedImage imgSrc={LoginPage} alt="Login Page" />
      <p>
        I visited the login page at <code>cereal.htb</code> in the browser. Then
        I ran directory brute-forcing with <code>dirsearch</code> and discovered
        the presence of a <code>.git</code> folder in the output.
      </p>
      <InjectedImage imgSrc={DirSearch} alt="DirSearch Results" />
    </>
  ),

  () => (
    <>
      <h2>📜 Discovering the Frontend</h2>
      <InjectedImage imgSrc={CurlObfus} alt="Curl Landing Page Obfuscated" />
      <p>
        I used <code>curl</code> to fetch and analyze the obfuscated login page
        source. This revealed bundled JavaScript files such as{" "}
        <code>jquery.js</code>, <code>bootstrap.js</code>, and{" "}
        <code>modernizr.js</code>.
      </p>
      <InjectedImage imgSrc={CurlLocalFiles} alt="Curl Local JS Files" />
    </>
  ),

  () => (
    <>
      <h2>🔍 Git Enumeration</h2>
      <InjectedImage imgSrc={GitDumper} alt="Git Dumper" />
      <InjectedImage imgSrc={GitLog} alt="Git Log Output" />
      <p>
        Using <code>git-dumper</code>, I dumped the hidden Git repository and
        inspected the commit history. I found a leaked private key used to sign
        JWTs.
      </p>
    </>
  ),

  () => (
    <>
      <h2>🔐 JWT Forging & Access</h2>
      <InjectedImage imgSrc={BeautifyJS} alt="Beautify JS" />
      <p>
        I beautified the JS bundle to understand JWT validation logic and token
        structure. The application was using RS256 which allowed key confusion
        attacks if we had the private key.
      </p>
      <InjectedImage imgSrc={ForgeJWT} alt="JWT Forge Script" />
      <InjectedImage imgSrc={JWTError} alt="Missing Expiration Error" />
      <p>
        Forged tokens using the leaked RSA key. My initial attempt failed due to
        missing required claims like <code>exp</code>. Once added, the token
        worked and allowed me access to internal functionality.
      </p>
    </>
  ),

  () => (
    <>
      <h2>🗕️ Payload Delivery</h2>
      <InjectedImage imgSrc={PythonServer} alt="Python File Host" />
      <p>
        I hosted payloads like <code>shell.aspx</code> and <code>nc.exe</code>{" "}
        on my attack machine with <code>python3 -m http.server</code>. These
        would be used later as the target server made outbound HTTP requests
        through SSRF.
      </p>
    </>
  ),

  () => (
    <>
      <h2>⚡ First Shell Gained</h2>
      <InjectedImage
        imgSrc={RemoteConnection}
        alt="Remote Connect before Shell"
      />
      <p>
        After sending a forged JWT and pointing the SSRF <code>sourceURL</code>{" "}
        to my malicious <code>shell.aspx</code>, I received a reverse shell from
        the system as user <code>sonny</code>. From here, I explored the machine
        and prepared for privilege escalation.
      </p>
      <p>
        Running the command <code>whoami /priv</code> under the{" "}
        <code>sonny</code> shell revealed:
      </p>
      <pre>
        <code>
          Privilege Name Description State =============================
          =========================================== ========
          SeImpersonatePrivilege Impersonate a client after authentication
          Enabled SeIncreaseWorkingSetPrivilege Increase a process working set
          Disabled SeChangeNotifyPrivilege Bypass traverse checking Enabled
        </code>
      </pre>
      <p>
        These privileges confirmed the feasibility of using{" "}
        <strong>GenericPotato</strong> for a SYSTEM-level token impersonation
        attack.
      </p>
      <p>
        The user flag was located at:{" "}
        <code>C:\Users\sonny\Desktop\user.txt</code>
      </p>
    </>
  ),

  () => (
    <>
      <h2>🧵 Setup for SYSTEM Access</h2>
      <InjectedImage imgSrc={ShellConnect} alt="Reverse Shell Connection" />
      <p>
        I used <code>scp</code> from my Kali machine to upload{" "}
        <code>nc64.exe</code> and <code>GenericPotato.exe</code> into{" "}
        <code>C:\ProgramData\</code> on the target using Sonny's shell:
      </p>
      <pre>
        <code>
          scp nc64.exe kali@&lt;target&gt;:/home/kali/ scp GenericPotato.exe
          kali@&lt;target&gt;:/home/kali/
        </code>
      </pre>
      <p>
        Then I started <code>GenericPotato.exe</code> with the reverse shell
        parameters. This was the command that initiated SYSTEM impersonation:
      </p>
      <InjectedImage
        imgSrc={ReverseShellCmd}
        alt="GenericPotato Running Before SYSTEM Shell"
      />
    </>
  ),

  () => (
    <>
      <h2>🥪 GraphQL SSRF to Trigger RCE</h2>
      <InjectedImage imgSrc={CurlForRCE} alt="Curl Command for RCE" />
      <p>
        To execute GenericPotato and trigger the{" "}
        <code>SeImpersonatePrivilege</code> exploit, I used SSRF via the{" "}
        <code>updatePlant</code> mutation in the internal GraphQL API. I had
        three terminals open: one listener on port <code>4444</code>, one
        terminal running <code>GenericPotato</code> on Sonny’s shell, and one to
        send the GraphQL mutation.
      </p>
      <pre>
        <code>{`curl -k -X POST -H "Content-Type: application/json" \
--data-binary '{"query":"mutation{updatePlant(plantId:2, version:2.2, sourceURL:\"http://localhost:8889\")}"}' \
http://localhost:8081/api/graphql`}</code>
      </pre>
      <p>
        This triggered the HTTP listener, which caught a SYSTEM-level
        authentication request. GenericPotato duplicated the token and attempted
        to spawn a reverse shell as SYSTEM.
      </p>
    </>
  ),

  () => (
    <>
      <h2>🛠️ SYSTEM Access</h2>
      <p>
        I confirmed SYSTEM-level access and began privilege escalation
        enumeration. The final shell connected back and I navigated to retrieve{" "}
        <code>C:\Users\Administrator\Desktop\root.txt</code>.
      </p>
    </>
  ),

  () => (
    <>
      <h2>🌼 Rooted!</h2>
      <InjectedImage imgSrc={Pwned} alt="Pwned Screenshot" />
      <p>
        All flags collected! This machine required real persistence, deep
        enumeration, and multi-stage web-to-system chaining. It’s one of the
        toughest boxes I’ve tackled—and the most rewarding.
      </p>
    </>
  ),

  () => (
    <>
      <h2>📚 Key Takeaways</h2>
      <ul>
        <li>JWT key forgery with RS256 + private key leakage</li>
        <li>GraphQL mutation abuse for SSRF and internal payload delivery</li>
        <li>
          SeImpersonate-based privesc using GenericPotato + port forwarding
        </li>
        <li>
          Creative use of multiple systems (including Visual Studio on Windows)
          to overcome build barriers
        </li>
      </ul>
      <h3>✅ Machine Completed: Cereal</h3>
      <a href="https://app.hackthebox.com/profile/1984386">9t0wl #1984386</a>
    </>
  ),
];
