// ✅ src/data/writeups/escapeTwo.js
import React from "react";
import InjectedImage from "../../components/InjectedImage";

// Add images like these once you're ready
// import NmapScan from "../../assets/escape_nmap.png";
// import BloodHound from "../../assets/escape_bloodhound.png";
// import Certipy from "../../assets/escape_certipy.png";

export const escapeTwoWriteup = [
  () => (
    <>
      <h2>✨ Introduction</h2>
      <p>
        This write-up walks through the EscapeTwo machine from Hack The Box. As
        a Windows-based machine rated "Easy," it offers an engaging dive into
        Active Directory enumeration, DACL manipulation, and certificate-based
        privilege escalation.
      </p>
      <p>
        <a href="https://app.hackthebox.com/profile/1984386">9t0wl #1984386</a>
      </p>
    </>
  ),

  () => (
    <>
      <h2>🔎 Reconnaissance</h2>
      <p>We begin with an Nmap scan to identify open ports and services:</p>
      <pre>
        <code>nmap -sC -sV -Pn -p- 10.10.11.XXX</code>
      </pre>
      <p>
        Open ports included typical AD services such as SMB, LDAP, and Kerberos.
        From there, we began enumerating for usernames and shares.
      </p>
      {/* <InjectedImage imgSrc={NmapScan} alt="Nmap Scan" /> */}
    </>
  ),

  () => (
    <>
      <h2>🔐 Initial Access</h2>
      <p>
        We obtained initial credentials or enumerated shares and usernames via
        SMB or LDAP. Using these, we authenticated and began exploring AD.
      </p>
      <p>
        After pivoting through enumeration, we identified a low-privileged user:
        <code>rose / KxEPkKe6R8su</code>
      </p>
    </>
  ),

  () => (
    <>
      <h2>🪨 Privilege Escalation</h2>
      <p>
        Running BloodHound revealed that the user had privileges to modify
        DACLs. We used <code>bloodyAD</code> or <code>dacledit.py</code> to
        assign rights to another account.
      </p>
      {/* <InjectedImage imgSrc={BloodHound} alt="BloodHound Output" /> */}
      <p>
        With DACLs modified, we leveraged <code>certipy-ad</code> to request a
        certificate and impersonate the privileged account.
      </p>
      {/* <InjectedImage imgSrc={Certipy} alt="certipy-ad usage" /> */}
    </>
  ),

  () => (
    <>
      <h2>📂 Flags Captured</h2>
      <ul>
        <li>
          <strong>user.txt:</strong> Acquired after gaining initial access with
          low-privilege credentials.
        </li>
        <li>
          <strong>root.txt:</strong> Captured after escalating using certificate
          abuse via Certipy.
        </li>
      </ul>
    </>
  ),

  () => (
    <>
      <h2>📚 Lessons Learned</h2>
      <ul>
        <li>Windows enumeration with SMB, LDAP, and Kerberos</li>
        <li>DACL manipulation and privilege assignment</li>
        <li>Using BloodHound for privilege mapping</li>
        <li>Abusing AD CS with Certipy for full compromise</li>
      </ul>
      <p>
        Great learning opportunity to reinforce Active Directory privilege
        escalation techniques!
      </p>
    </>
  ),
];
