---
layout: post
title: Everybody be Cool, This is a Robbery!
summary: Summary of the HSM vulnerabilities exposed at Black Hat 2019
description: Summary of the HSM vulnerabilities exposed at Black Hat 2019
featured-img: hsm_bh19 
author: Jean-Baptiste Bédrune, Gabriel Campana
categories: [Donjon]
---

# Everybody be Cool, This is a Robbery!

The Ledger Donjon spends significant time and effort to assess the security of every piece of Ledger technology — along with our industry’s. During a recent security audit we uncovered vulnerabilities in a vendor’s Hardware Security Module (HSM). Jean-Baptiste Bédrune and Gabriel Campana gave a talk at Black Hat USA 2019 about HSMs security. The [slides](https://i.blackhat.com/USA-19/Thursday/us-19-Campana-Everybody-Be-Cool-This-Is-A-Robbery.pdf) are already online and this blog post aims at providing a technical summary to impatient readers before the release of the talk video.

## Takeaway

A high-level overview for people less inclined to dive into technical details can be found on [Ledger’s website](https://www.ledger.com/a-note-on-recent-research/).

The Ledger Security Team found 14 vulnerabilities in a HSM model and worked tightly with the vendor to get them fixed. The exploitation of these vulnerabilities allows a remote attacker to gain arbitrary code execution in the HSM and eventually to the theft of every secret key. This has been responsibly disclosed and properly corrected by the vendor, raising the bar of security for all the HSM industry.

## About HSMs

HSMs (Hardware Security Modules) are security devices that protect cryptographic keys. They generate keys, securely store them, and perform cryptographic operations.

They are used wherever keys are highly sensitive: public key infrastructures to issue digital certificates, banking to verify transactions, telco operators to authenticate SIM on their network. Using an HSM is often a requirement in these industries, as this is the device that offers the highest security for your keys.

During Black Hat USA, we presented our security analysis of an HSM from a major vendor. As these devices are rather expensive, and installed in secure locations, there are seldom evaluated by security teams. As a result, there is almost no independent information about the security of these devices.

The role of HSMs is to generate keys, secure them, and perform cryptographic operations. Usually, keys are generated and stored in the HSM and cannot leave them. Generated keys are expected to be secure: these devices often embed a true random number generator, hence the keys cannot be predicted.

Our research defeats those assumptions: we showed a full compromise of the evaluated HSM. It includes the extraction of all the protected keys, a modification of the random number generator so that all the keys become predictable. Eventually, a persistent backdoor is installed on the HSM: even if you fully update the HSM, it will still be compromised.

HSMs can be queried using a standard API, PKCS #11, originated by RSA Security. Most of the work related to the security of HSMs is related to the PKCS #11 standard. This standard is old, not easy to use nor to implement, and has weaknesses by design: [wrap and decrypt attack](https://www.iacr.org/workshops/ches/ches2003/presentations/CHES%20-%20On%20the%20Security%20of%20PKCS11.pdf), [obsolete ciphers (DES) and weak mechanisms](https://medium.com/gemini/your-bitcoin-wallet-may-be-at-risk-safenet-hsm-key-extraction-vulnerability-58c97bf6b927) that lead to key extraction... Our work was not about PKCS #11 itself, but on the implementation of PKCS #11 by the vendor. PKCS #11 API is standard, but not its implementation: each vendor has its own SDK, and often provides many additions to ease integration in telco environments, cryptocurrencies, blockchain, etc.

There are two main types of HSM: network HSM, and internal cards. Our HSM is a PCIe card (Fig. 1, encircled in red), but it also exists as a network appliance. This card is installed on a standard server (the “host”). It is supposed that an attacker has successfully compromised the host: he can communicate with the HSM, and wants to extract its keys. Nevertheless, he has no clue about the credentials needed to authenticate with the HSM. From there, we tried to get access to these keys. The following parts explain our method.

![HSM installation](/assets/hsm_bh2019/image1.jpg)

_<center>Fig. 1: HSM installed in a standard Linux server</center>_

## Looking for bugs

### Gathering information

This HSM has an interesting feature: developers can develop custom modules, which will be executed on the HSM. We took advantage of this feature to develop two modules: a module which installs a custom shell, and a debugger. 
From there, all the files, processes, configuration files, etc. on the HSM can be analyzed. First results show that:
The main process, which handles the communication with the outside world, run as root.
The kernel is a stripped Linux 2.6.28.8 kernel (released in 2009).
There are very few libraries and executables on the HSM: no libc, no shell, only the bare necessary files.

We set a more comfortable environment up by installing BusyBox on the HSM, again using the custom module feature. Coupled with the debugger, that eases a lot crash analysis and the understanding of the whole system.

### Fuzzing

We found a few vulnerabilities during the reverse engineering of the firmware, but all of them required to be authenticated.

We decided to automate the vulnerability research and developed a fuzzer targeting PKCS #11 functions accessible without authentication. The usage examples of the PKCS #11 API provided by the documentation cover every PKCS #11 command and can thus be reused as a fuzzing testsuite. A basic fuzzer module was developed to mutate data generated on the host. Bytes are randomly mutated between the userland libraries and the kernel module before being sent to the HSM. Some malformed messages crash the host kernel module or triggers out-of-memory situations on the HSM. We filtered these messages to allow the fuzzer without interaction.

About 14 vulnerabilities were found by the fuzzer, all of them being memory corruption bugs. The most interesting ones are:
A vulnerability similar to Heartbleed allowing an authenticated attacker to read parts of the heap memory. Even if it doesn’t allow code execution, it might leak sensitive data such as keys in some situations.
A type confusion during the deserialization of a digest object. We developed a reliable exploit to gain remote code execution without authentication. The exploit development was probably made easier because of the lack of hardening and mitigation.

Once an attacker manages to gain arbitrary code execution, the game is not over. As there is no interesting binary (eg. `/bin/sh`) on the HSM, usual shellcodes that indeed executes a shell can’t be used. Moreover, there is no standard communication channel such as a network stack between the host and the HSM. We thus chose to patch the authentication function to make it possible to login as admin into the HSM without valid credentials. The vendor tools can the ben used to install a malicious custom module.

## Exploitation

We developed a few proof-of-concept, highlighted by demos, to show that once code execution is gained on the HSM, attackers can steal secrets and gain persistence.

### Secrets theft

Indeed, the whole flash memory can be accessed thanks to some of the OS primitives. This can be used to extract the data and also backdoor the system. All objects attributes marked as sensitive are encrypted with a single key, stored in a physical component of the HSM. The ability to execute code on the HSM allows to retrieve that key and also to dump the whole flash memory. The filesystem can then be reconstructed offline and the secrets decrypted with the encryption key.

<center>
  <video width="640" controls="controls">
    <source src="/assets/hsm_bh2019/02-key-extraction.webm" type="video/webm">
  </video>
</center>

### Firmware signature bypass

While code execution vulnerabilities are powerful, then don't lead directly to a persistent access to the HSM. That's why we studied the update mechanism and found a logical flaw by reverse engineering. It leads to the bypass of firmware signatures. It allows attackers to install malicious update and breaks the HSM integrity.
Persistence
With the firmware signature bypass (or a write access to the filesystem thanks to arbitrary code execution), a backdoor can be added to the partition containing the firmware. The process is tricky because failing at writing a valid firmware image can brick the HSM and there is no way to make it work again in that case.

The implant hooks the mechanism update to let the backdoor survive across reboot; and some of the PKCS #11 mechanisms are modified to compromise the random generator. The authentication mechanism could also have been modified to allow further access to the HSM without valid credentials.

<center>
  <video width="640" controls="controls">
    <source src="/assets/hsm_bh2019/03-random-backdoor.webm" type="video/webm">
  </video>
</center>

### Conclusion

Every vulnerability has been responsibly disclosed to the vendor who published a firmware update to fix them. We obviously recommend paying close attention to vendor security advisories and to apply security updates.

It is difficult to differentiate the security level of the various HSM models and vendors on the market. This study isn’t exhaustive and doesn’t claim to be a state of the art of HSMs security. One can assume that the security level can be quite different across different vendors and even across different models from the same vendor.

Finally, we hope that our findings will raise awareness about the security of these devices and also lay the groundwork for other security researchers.
