// ✅ src/data/writeups/boardLight.js
import React from "react";
import InjectedImage from "../../components/InjectedImage";

import BoardLightLogo from "../../assets/BoardLight.png";
import NmapScan from "../../assets/boardlightnmap.png";
import Homepage from "../../assets/boardlighthomepage.png";
import FfufScan from "../../assets/boardlightffufscan.png";
import LoginPage from "../../assets/boardlightlogin.png";
import LoginDash from "../../assets/boardlightlogindash.png";
import WhatWeb from "../../assets/boardlightwebget.png";
import PhpTest from "../../assets/boardlightphptest.png";
import PhpSuccess from "../../assets/boardlightphpsuccess.png";
import GitClone from "../../assets/boardlightgitclone.png";
import Listener from "../../assets/boardlightncconnect.png";
import HttpServer from "../../assets/boardlightserver.png";
import Linpeas from "../../assets/boardlightlinpeas.png";
import ConfigFile from "../../assets/boardlightconfig.png";
import LarissaLogin from "../../assets/boardlightlarissalogin.png";
import UserFlag from "../../assets/boardlightuserflag.png";
import Exploit from "../../assets/boardlightexploit.png";
import Pwned from "../../assets/boardlightpwned.png";

export const boardLightWriteup = [
  () => (
    <>
      <h2>📈 Introduction</h2>
      <InjectedImage imgSrc={BoardLightLogo} alt="BoardLight Logo" />
      <p>
        In the world of cybersecurity, practical skills are as crucial as
        theoretical knowledge. “BoardLight,” a captivating machine on Hack The
        Box, offered an exceptional opportunity to hone my penetration testing
        skills through a series of intriguing challenges ranging from initial
        access via web vulnerabilities to complex privilege escalations.
      </p>
    </>
  ),
  () => (
    <>
      <h2>🎯 Objectives</h2>
      <p>Embarking on the “BoardLight” challenge, my primary goals were to:</p>
      <ul>
        <li>
          Enhance Problem-Solving Skills: Apply and improve my analytical
          abilities in real-world security scenarios, focusing on identifying
          and exploiting vulnerabilities in a controlled environment.
        </li>
        <li>
          Master Web Exploitation Techniques: Delve deeper into common web
          vulnerabilities, understand their workings, and learn how to exploit
          them effectively. The aim was to refine my approach to handling
          real-life web security threats.
        </li>
        <li>
          Explore Privilege Escalation: Gain a practical understanding of
          various privilege escalation techniques by identifying and exploiting
          misconfigurations and vulnerabilities in system services and
          applications.
        </li>
        <li>
          Apply Security Tools and Scripts: Utilize popular security tools and
          custom scripts effectively to automate the reconnaissance and
          exploitation processes, enhancing efficiency and accuracy in
          penetration testing tasks.
        </li>
        <li>
          Document the Learning Process: Record each step, including both
          successes and setbacks, to create a comprehensive guide that not only
          serves as a personal reference but also assists others in the
          cybersecurity community.
        </li>
      </ul>
    </>
  ),
  () => (
    <>
      <h2>🔎 Reconnaissance</h2>
      <p>
        The reconnaissance phase was crucial in laying the groundwork for a
        successful penetration into the “BoardLight” system. My approach
        involved several key steps:
      </p>
      <h3>Network Scanning</h3>
      <p>
        I employed nmap, a powerful network scanning tool, to uncover open ports
        and detect running services on the target machine. This initial scan
        helped identify SSH (port 22) and HTTP (port 80) as potential entry
        points.
      </p>
      <InjectedImage imgSrc={NmapScan} alt="Nmap Scan" />
    </>
  ),
  () => (
    <>
      <h2>🌐 Enumeration</h2>
      <p>Starting with nmap to scan for ports and services :</p>
      <pre>
        <code>
          Nothing out of the norm so we are going to check the website
        </code>
      </pre>
      <InjectedImage imgSrc={Homepage} alt="BoardLight Homepage" />
      <p>
        After exploring the site without much result, I decided to employ the
        ffuf tool to dive deeper into its structure.
      </p>
      <InjectedImage imgSrc={FfufScan} alt="ffuf scan" />
      <p>Right from the start we get “crm”, So lets check it out.</p>
      <InjectedImage imgSrc={LoginPage} alt="BoardLight Login" />
      <p>Lets try something basic like admin:admin and see if that works</p>
      <InjectedImage imgSrc={LoginDash} alt="BoardLight Dashboard" />
      <p>
        After exploring the website and noticing control options under the
        Websites tab, I found myself at a standstill, unsure of the next steps.
        To gain more insights, I returned to the terminal and ran whatweb for
        deeper information gathering
      </p>
      <InjectedImage imgSrc={WhatWeb} alt="whatweb output" />
      <p>
        While inspecting the server’s output, I noticed a reference to the
        ‘Dolibarr Development Team.’ Curiosity led me to perform a quick Google
        search, where I discovered that Dolibarr 17.0.0 is susceptible to a PHP
        code injection vulnerability. I found a comprehensive article on
        swanscan.com detailing this vulnerability. After understanding the
        mechanics from the article, I returned to the website to attempt the
        exploit.
      </p>
      <InjectedImage imgSrc={PhpTest} alt="BoardLight PHP test" />
      <p>
        Well nothing happened so I tried something I read in the blog and turned
        the lowercase “php” uppercase “PHP” and something interesting happens
      </p>
      <InjectedImage imgSrc={PhpSuccess} alt="BoardLight PHP success" />
      <p>
        So I went to find an exploit for Dolibarr 17.0.0 and found an exploit by
        nikn0laty lets git clone the url “POC exploit for Dolibarr &lt;= 17.0.0
        (CVE-2023–30253)”
      </p>
      <InjectedImage imgSrc={GitClone} alt="BoardLight Git Clone" />
      <p>OK now lets set up our listener and run the exploit</p>
      <InjectedImage imgSrc={Listener} alt="BoardLight Listener" />
      <p>
        After several attempts to identify sudoers or escalate privileges
        yielded no success, I set up an HTTP server to download tools like
        LinPEAS, which then revealed some promising leads.
      </p>
      <InjectedImage imgSrc={HttpServer} alt="BoardLight HTTP Server" />
      <InjectedImage imgSrc={Linpeas} alt="BoardLight Linpeas" />
      <p>After running it we get some interesting results</p>
      <pre>
        <code>
          [Interesting Files] -rw-r--r-- 1 www-data www-data 2.3K Sep 6 09:22
          /var/www/html/crm.board.htb/htdocs/conf/conf.php
        </code>
      </pre>
      <p>Let’s view the contents of the conf.php file:</p>
      <InjectedImage imgSrc={ConfigFile} alt="BoardLight Config File" />
      <p>We see a username and a password.</p>
      <pre>
        <code>user=dolibarrowner pass=serverfun2$2023!!</code>
      </pre>
      <p>
        After exploring MySQL and searching through the database without finding
        much, I decided to try the password we found against the username
        identified during our LinPEAS analysis.
      </p>
      <pre>
        <code>
          [User Permissions] User: larissa Permissions: /bin/bash Groups:
          larissa
        </code>
      </pre>
      <InjectedImage imgSrc={LarissaLogin} alt="BoardLight Larissa Login" />
      <p>BOOM! we got connection with a user so lets find the flag</p>
      <InjectedImage imgSrc={UserFlag} alt="BoardLight User Flag" />
      <p>now we still have to find the root lets check privileges</p>
      <pre>
        <code>
          larissa@boardlight:~$ sudo -l [sudo] password for larissa: Sorry, try
          again. [sudo] password for larissa: Sorry, user larissa may not run
          sudo on localhost. larissa@boardlight:~$
        </code>
      </pre>
      <p>
        Well that didn't work so I went back to LinPEAS and took a deeper look
        at the results and I found
      </p>
      <pre>
        <code>
          [Interesting Files] -rwsr-xr-x 1 root root 42224 Jul 21 2024
          /usr/bin/enlightenment_sys
        </code>
      </pre>
      <p>
        Attempting to directly view the contents of the Enlightenment executable
        using cat proved ineffective due to its encrypted nature. This prompted
        me to conduct a Google search for more information on the Enlightenment
        application and its associated vulnerabilities. During this research, I
        discovered an insightful piece by MaherAzzouzi discussing an exploit he
        developed for Enlightenment. His detailed breakdown of the
        vulnerability's mechanics was enlightening. Motivated by this
        information, I cloned the exploit using Git and set up an HTTP server to
        transfer the exploit to the target machine.
      </p>
      <InjectedImage imgSrc={Exploit} alt="BoardLight Exploit" />
      <p>now lets run it and see if we did the correct research</p>
      <InjectedImage imgSrc={Pwned} alt="BoardLight Pwned" />
      <p>
        Our efforts paid off, and we successfully captured the final flag. This
        machine offered a wealth of learning opportunities, reinforcing the
        invaluable lesson that persistence and continuous learning are key in
        the field of cybersecurity. Keep exploring, and happy hunting! 9t0wl
        #1984386
      </p>
    </>
  ),
];
