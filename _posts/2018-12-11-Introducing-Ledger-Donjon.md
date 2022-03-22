---
layout: post
title: Introducing Ledger Donjon
summary: A very high level description of Ledger Donjon - the security research at Ledger.
description: A very high level description of Ledger Donjon - the security research at Ledger.
featured-img: intro-donjon
author: Charles Guillemet
categories: [Donjon]
---

At Ledger, we believe in true security. Security is not a term that we take lightly. To build secure systems, it is necessary to use secure hardware bricks and implement a secure Operating System (OS) on top of these. Even with the best security coding practices and secure hardware, nothing beats an attack-oriented mindset when it comes to assessing security.

That is why we created an internal security evaluation lab in Ledger’s Donjon.

The Ledger Donjon is made up of 8 world-class experts with extensive backgrounds in the security and smartcard industries. Its key functions are internal and external security assessment. They work closely with Ledger’s Firmware development and hardware teams to analyze and improve the security of Ledger products. The team is continuously looking for vulnerabilities on Ledger products as well as Ledger’s providers’ products. Indeed, Ledger does not build secure products from scratch, they are based on state-of-the art secure hardware which are provided by external vendors. When a vulnerability is found, countermeasures and hardening techniques are evaluated and implemented.

The team covers a wide field of expertises which allows us to work on the following topics:

# Software Attacks

Software attacks are any attempt to expose, alter, disable, destroy, steal, gain unauthorized access to or make unauthorized use of a digital asset. It covers a wide range of attacks and, in a nutshell, consists of researching unexpected behaviors on a system and playing with its software interfaces. These unexpected behaviors sometimes lead to vulnerabilities when attackers manage to force a program to run in a different way to gain access to the targeted assets. Several fields of expertise are required consisting of reverse engineering, fuzzing, static analysis, code review, cryptography, exploitation and so on.

![soft_attacks](/assets/introducing-donjon/soft.jpg)


Probably the most striking example of a software vulnerability is a Heartbleed, a bug in a cryptography library that allows attackers to intercept secure communications and steal sensitive information.

<p align="center">
<img src="/assets/introducing-donjon/heartbleed.png">
</p>
<center> <i>Heartbleed - XKCD comics</i> </center><br/>

# Side Channel Attacks

Side channel attacks are a wide range of attacks that consist of exploiting physical leakages of a device handling sensitive information. These attacks focus on measurable information obtained from the implementation of an algorithm, rather than weaknesses in the algorithm itself.

For instance, an attacker with physical access to a security device could measure the power consumption or electromagnetic emanations of the circuit to extract information that could lead to the secret manipulated by the device. To perform these attacks, a wide variety of skills are required, including cryptography, electronics, embedded software implementation and data science.

![side_channel](/assets/introducing-donjon/sca.png)
<center>  <i> Our test Side Channel test bench - Side Channel Results - Electromagnetic probes </i> </center><br/>


# Fault Attacks

Fault attacks consist of perturbing a circuit during its execution of functionalities. Such perturbations can be performed through different means including over-heating, voltage glitching, overclocking, creating strong electric or magnetic fields or more efficiently by using lasers. The hardware device may begin to show faulty behavior, such as bypassing security test or outputting incorrect results which allows an attacker to perform a Differential Fault Analysis. For instance, it allows an attacker to bypass a PIN check, or get faulty signatures leading to secret key retrieval.

![fault](/assets/introducing-donjon/fault.png)
<center> Sample preparation Machine — Deprocessed chip — Fault Attacks Test Bench — Laser microscope objectives — Scaffold Board </center><br/>

# Security Hardening

For even more security, the Donjon helps hardening Ledger’s servers by designing custom anti-tampering security solutions, preventing any attacker from stealing stored secrets.

![sensor](/assets/introducing-donjon/hardening.jpeg)
<center>  <i>Motion sensor </i> </center><br/>


# Certification

As highlighted previously, Ledger has the security knowledge required to create robust devices that defend against state-of-the-art attacks, whether that consists of software attacks, side-channel attacks or hardware attacks.

The certification program initiated at Ledger targets several objectives:

- to demonstrate to our customers (both individuals and enterprises) that they can trust our products (Ledger Nano S and Ledger Vault)
- to be challenged by a third party with highly advanced equipment in a security laboratory

As Blockchain technology is still relatively new, there are no security certification requirements for hardware wallets. Nevertheless, at Ledger we take security very seriously and are the first to undergo an exhaustive certification program for our cryptocurrency solutions — both for the Ledger Nano S and the Ledger Vault.

<p align="center">
<img src="/assets/introducing-donjon/ANSSI.jpeg">
</p>
<center><i>ANSSI - 3rd party security certification body </i></center><br/>

# Open Security

Ledger Donjon believes in open security. Security must be challenged and continuously improved. In this context, Ledger’s Donjon open sources its attack tools and methodology.
Have a look to our [Github](http://www.github.com/ledger-donjon/)

The Donjon is also driving Ledger’s bounty program which rewards security researchers for their findings on Ledger’s products.

`At Ledger, our mission is to obtain the highest level of security for your crypto assets — the Donjon team is here to continuously test and improve it.`

[Charles Guillemet](https://www.ledger.com/people/charles-guillemet/) — Chief Security Officer on behalf of the Donjon
