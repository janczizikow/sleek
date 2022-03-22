---
layout: post
title: "Lit by Laser: PIN Code Recovery on Coldcard Mk2 Wallets"
summary: How the Donjon performed a PIN code recovery on a Coldcard Mk2 wallet.
description: How the Donjon performed a PIN code recovery on a Coldcard Mk2 wallet.
featured-img: coldcard-pin-code
author: Olivier Hériveaux
categories: [Donjon]
---

# Lit by Laser: PIN Code Recovery on Coldcard Mk2 Wallets

## Introduction

[Coldcard](https://coldcardwallet.com/) is a Bitcoin hardware wallet from Coinkite manufacturer. The platform runs on a standard STM32 microcontroller paired with a secure memory which provides secure storage of the seed behind authentication protection. Relying on a secure memory rather than a standard microcontroller, this wallet has a good security design. The firmware code is Open Source, available on their [GitHub repository](https://github.com/Coldcard/firmware). The project is active and well documented.

In early 2019, we evaluated the security of the [Microchip ATECC508A](https://www.microchip.com/wwwproducts/en/ATECC508A) secure memory. This circuit is commonly used in IoT applications as the root of trust, and also in the Coldcard wallet in its Mk2 version (latest version today is Mk3). This article explains how a vulnerability we identified in this secure memory can be used to recover the PIN code of a Coldcard Mk2 hardware wallet. The ATECC508A vulnerability is not detailed in this article: it will be presented soon during next [SSTIC 2020 conference](https://www.sstic.org/).

## Coldcard Mk2 Wallet Security

The Coldcard wallet runs its operating system on a STM32 microcontroller. It has a keypad, a screen and a genuine check LED. It can be used directly connected to a computer with a USB cable, or in air-gap mode with the help of an SD-card. All the components are inside a plastic enclosure which is difficult to open without leaving any tamper evidence.

<center>
<img src="/assets/coldcard-pin-code/coldcard.jpg"/><br/>
<i>Coldcard hardware wallet</i>
</center><br/>

Recent research publications showed STM32F microcontrollers are vulnerable to hardware attacks, usually allowing recovering all the content of their Flash memory [^1] [^2] [^3]. Therefore, storing the secret seed in the Flash memory of the microcontroller is highly discouraged unless a strong passphrase is enabled and encrypts the seed. Protecting the seed behind PIN code authentication, Coinkite chose to store the sensitive data of the wallet inside a secure memory - the [ATECC508 from Microchip](https://www.microchip.com/wwwproducts/en/ATECC508A) - which is paired with the main microcontroller. The secure memory grants access to the seed once pairing is checked and knowledge of the PIN code is proven. This wallet design is stronger than wallets relying only on the vulnerable STM32F readout protection.

The ATECC508A secure memory has 10 kB of EEPROM memory, organized in three zones:
- CONFIG: device configuration, monotonic counters, data slots / keys security parameters.
- DATA: data and keys storage space
- OTP: read-only storage

The DATA zone has 16 data slots which can store small chunks of data, and be used as keys for unlocking other data slots. Each data slot has access rules defined in the CONFIG zone. The EEPROM memory of the chip cannot be read or written directly: only the firmware of the secure memory has access to this memory, and it exposes commands to setup the configuration, read and modify the stored data with authentication and access rules checking.

The device also features two monotonic 21 bits counters, used by the Coldcard wallet to implement PIN-try-counters. Those counters are stored in the CONFIG zone.

The list of commands was fully documented in the datasheet accessible on the Microchip website, but it looks like they recently restricted this document under NDA and it’s no more available on their website. It can, however, be found [here on alternative websites](https://datasheetspdf.com/pdf-file/1297448/Microchip/ATECC508A/1). The ATECC508A firmware is stored in an internal ROM memory, which cannot be read nor updated. Our security assessment of this secure memory was therefore conducted in a black box approach.

The data slots of the secure memory have very limited size. The Coldcard Mk2 wallet uses them as shown in the table below. The most relevant data slots have been highlighted. This configuration is defined in the [ae_config.h](https://github.com/Coldcard/firmware/blob/master/stm32/bootloader/ae_config.h) source file.

<table>
  <tr>
    <th style="text-align: left">#</th>
    <th style="text-align: left">Name</th>
    <th style="text-align: left">Description<br/>(as stated in Coldcard documentation)</th>
    <th style="text-align: left">Access rights<br/>Defined in CONFIG</th>
    <th style="text-align: left">Size in bytes (1)</th> 
  </tr>
  <tr>
    <td>0</td>
    <td></td>
    <td>Unused data slot</td>
    <td>read/write without conditions</td>
    <td>36</td>
  </tr>
  <tr style="background-color: #f1a76a">
    <td>1</td>
    <td>Pairing</td>
    <td>Pairing secret shared between the secure memory and the microcontroller</td>
    <td>No read/write access</td>
    <td>36</td>
  </tr>
  <tr>
    <td>2</td>
    <td>Words</td>
    <td>Random value used for anti-phishing feature</td>
    <td>No read/write access</td>
    <td>36</td>
  </tr>
  <tr style="background-color: #f1a76a">
    <td>3</td>
    <td>PIN1</td>
    <td>PIN for the main wallet</td>
    <td>
      No read access<br/>
      Encrypted write with key #3 (PIN1)<br/><br/>
      Key #3 usage requires authentication with key #1 (pairing)
    </td>
    <td>36</td>
  </tr>
  <tr>
    <td>4</td>
    <td>PIN2</td>
    <td>PIN for the secondary wallet</td>
    <td>
      No read access<br/>
      Encrypted write with key #4 (PIN2)<br/><br/>
      Key #4 usage requires authentication with key #1 (pairing)
    </td>
    <td>36</td>
  </tr>
  <tr>
    <td>5</td>
    <td>Lastgood1</td>
    <td>Last successful login attemps for PIN 1</td>
    <td>
      Read without conditions<br/>
      Encrypted write with key #3 (PIN1)
    </td>
    <td>36</td>
  </tr>
  <tr>
    <td>6</td>
    <td>Lastgood2</td>
    <td>Last successful login attemps for PIN 2</td>
    <td>
      Read without conditions<br/>
      Encrypted write with key #4 (PIN2)
    </td>
    <td>36</td>
  </tr>
  <tr>
    <td>7</td>
    <td>PIN3</td>
    <td>Duress PIN for the main wallet</td>
    <td>
      No read access<br/>
      Encrypted write with key #7 (PIN3)<br/><br/>
      Key #7 usage requires authentication with key #1 (pairing)
    </td>
    <td>36</td>
  </tr>
  <tr>
    <td>8</td>
    <td>PIN4</td>
    <td>Duress PIN for the secondary wallet</td>
    <td>
      No read access<br/>
      Encrypted write with key #8 (PIN4)<br/><br/>
      Key #8 usage requires authentication with key #1 (pairing)
    </td>
    <td>416</td>
  </tr>
  <tr style="background-color: #f1a76a">
    <td>9</td>
    <td>Secret1</td>
    <td>Main wallet seed</td>
    <td>Encrypted read/write with key #3 (PIN1)</td>
    <td>72</td>
  </tr>
  <tr>
    <td>10</td>
    <td>Secret2</td>
    <td>Secondary wallet seed</td>
    <td>Encrypted read/write with key #4 (PIN2)</td>
    <td>72</td>
  </tr>
  <tr>
    <td>11</td>
    <td>Secret3</td>
    <td>Main duress wallet seed</td>
    <td>Encrypted read/write with key #7 (PIN3)</td>
    <td>72</td>
  </tr>
  <tr>
    <td>12</td>
    <td>Secret4</td>
    <td>Secondary duress wallet seed</td>
    <td>Encrypted read/write with key #8 (PIN4)</td>
    <td>72</td>
  </tr>
  <tr>
    <td>13</td>
    <td>BrickMe</td>
    <td>Brickme PIN</td>
    <td>
      No read access<br/>
      Encrypted write with key #13 (brickme)<br/><br/>
      Key #13 usage requires authentication with key #1 (pairing)
    </td>
    <td>72</td>
  </tr>
  <tr>
    <td>14</td>
    <td>Firmware</td>
    <td>
      Hash of MCU flash contents<br/>
      Controls genuine red/green light
    </td>
    <td>
      No read access<br/>
      Encrypted write with key #3 (PIN1)
    </td>
    <td>72</td>
  </tr>
  <tr>
    <td>15</td>
    <td></td>
    <td>Unused data slot</td>
    <td>No read/write access</td>
    <td>72</td>
  </tr>
</table>
<center><i><small>(1) Data slot size. Less may be used by the application. For instance, the PIN hash data slots only use the first 32 bytes block.</small></i></center><br>

The elliptic curve cryptography component of the ATECC508A secure memory supports only the NIST P-256 curve. It cannot be used for signing Bitcoin transactions (which uses the secp256k1 curve), and all the cryptographic operations related to cryptocurrencies are actually performed by the STM32 microcontroller. Before signing a transaction, the microcontroller will authenticate the user by querying the PIN code and fetching the seed stored by the secure memory. The secure memory will enforce PIN code correctness - the MCU cannot fetch the seed if the PIN is incorrect. The process can be summarized as following:

1. The microcontroller gets the number of previous invalid PIN entry attempts: this is the difference between the monotonic counter of PIN1 (stored in CONFIG zone) and the data slot #5 (Lastgood1). Depending on the invalid tries count, a delay before the next verification may be applied.

2. The microcontroller proves to the secure memory the knowledge of the pairing secret. This is done by picking a nonce and calling the “CheckMac” command of the ATECC508A. If the microcontroller responds correctly to the secure memory challenge, usage of the key #3 (PIN1 data slot) is unlocked.

3. The monotonic counter corresponding to the PIN1 is incremented. Note that decrementing this counter is not possible: this is guaranteed by the secure memory itself.

4. Hash the PIN entered by the user together with the pairing secret: if the PIN is correct, this should match the content of the data slot #3. The content of the slot #3 is the following:
```
SHA256( SHA256( pairing_secret + 0h58184d33 + PIN ) )
```
The pairing secret is 32 bytes long. This is the content of the ATECC508A data slot #1 and is shared secretly with the MCU. This secret is different for every Coldcard device. It is generated during the first boot of the wallet and locked definitively.

5. The microcontroller then calls the “CheckMac” command to prove to the secure memory knowledge of the slot #3 (PIN1). This is done by hashing (one more time) the content of the slot #3 together with picked nonces to prevent replay attacks. If the verification succeeds, the secure memory will unlock further use of the key #3, which is required for accessing the slot #9 in the next step. Also, if the PIN is correct, the new value of the monotonic counter is copied in the data slot #5 (Lastgood1) - this resets the number of invalid attempt to zero.

6. Finally, the microcontroller reads the data slot #9 (Secret1) and decrypts the data returned by the secure memory using the hash as key (key #3).

## Breaking the Secure Memory

During our evaluation of the ATECC508A, we found a vulnerability allowing an attacker to retrieve the content of a data slot configured as secret with no read possibility (even when authenticated).

This attack is performed using Laser Fault Injection, a state-of-the-art testing technique used in the smartcard industry by evaluation laboratories. This work is not covered by this article and will be presented in details during the SSTIC conference in June 2020, but to sum it up, we physically injected a fault during the execution of the secure memory to bypass the access conditions verification of a targeted data slot. This is an invasive attack which requires physical access to the secure memory die:

- The wallet plastic case is open.
- The secure memory is desoldered.
- The plastic package of the secure memory is milled to gain backside access to the silicon.
- The secure memory is mounted on the attack platform, with the backside of the silicon facing the laser beam.
- Our scripts and dedicated [Scaffold board](https://github.com/Ledger-Donjon/scaffold) can send commands to the secure memory and in the same time inject faults by driving the laser source.

<br/><center>
<img src="/assets/coldcard-pin-code/lab.jpg"/><br/>
<i>Our laser evaluation platform… for the most curious...<br/>
From left to right: 1. Scaffold board (red) under the laser microscope. 2. High-end oscilloscope. 3. Computer with dedicated laser scanning software and microscope camera display. 4. Plant.
</i>
</center><br/>

<center>
<img src="/assets/coldcard-pin-code/closeup.jpg"/><br/>
<i>Close up on the microscope and Scaffold board with ATECC508A daughterboard inserted.</i>
</center><br/>

<center><img src="/assets/coldcard-pin-code/daughterboard.jpg"/><br/>
<i>Scaffold daughterboard PCB for ATECC508A</i>
</center><br/>

Both Pairing and PIN1 data slots meet the configuration requirements for being eligible to the vulnerability of the ATECC508A. Retrieving the content of those two data slots gives two options:

1. Run an offline bruteforce: try to hash each possible PIN combination until the content of the data slot #3 is matched: this gives the user PIN which can then be entered in the wallet interface after soldering the secure memory back to the wallet PCB. This gives access to the funds, but not the seed though.

2. Communicate directly with the secure memory. Authenticate by proving knowledge of the pairing secret and the data slot #3, then send a request to read the content of the data slot #9, which stores the seed encrypted. Decrypt the seed using the data slot #3 as key. This gives the seed, but not the PIN.

## How bad is it?

The security scheme of the Coldcard Mk2 wallet is well designed and relies mainly on the ATECC508A secure memory, which is a smart design decision. The equipment required to perform the physical attack of the ATECC508A is expensive: about $200k, which limits the potential attackers. It requires serious knowledge and expertise, and the exploitation is difficult.

## Online Brute-Force Attack

As there is no try counter supported by the ATECC508A, authentication trials on slot #3 are not limited. With the knowledge of the pairing secret, online PIN brute-force would be possible by sending authentication requests directly to the secure memory. The only limiting factor is the processing time of the secure memory, and an attacker would be able to try a lot of PIN codes.

Hence, brute-force mitigation still relies on the STM32L4 microcontroller, which is not very secure. Fortunately, the glitching attacks previously discovered on the STM32F2 and STM32F4 devices does not seem to apply to the L4 series.

## New Mitigations

This work was conducted on the Mk2 revision of the wallet, which is no more available. Coinkite recently released the new Mk3 version, which fixes the issues mentioned:

- The ATECC508A secure memory has been replaced by the ATECC608A, an hardened version of this chip which has also many new features. Our single Fault Injection Attack does not apply to this new product.

- PIN try counter is now enforced by the ATECC608A, preventing previously possible online brute-force attacks on the PIN. This feature was really missing in the ATECC508A, so that’s a real improvement.

## Conclusion

Use of secure circuits is considered best practice for protecting secrets in a system. Those circuits are much stronger than standard microcontrollers. The vulnerability we found is powerful, but required really expensive equipment, a lot of efforts and expertise. Compared to microcontrollers, where a simple low-cost voltage glitch can give full access to the Flash memory, the ATECC device can protect from a wide range of attackers.

The updated Coldcard Mk3 version has stronger security, mainly enforced by the use of the ATECC608A secure memory from Microchip. If you own a Coldcard Mk2 as your favourite wallet, you can now go upgrade it :)

Our attack is not applicable to every use of the ATECC508A. In particular, we are not able to retrieve a data slot declared as a P-256 private key. Many IoT applications relies on those P-256 keys and can still be considered somewhat safe. Additionally, this circuit is now considered deprecated and use of its successor - the ATECC608 - is recommended by Microchip for new designs.

## Responsible disclosure

Our research lab found the ATECC508A vulnerability in May 2019. The full details of our attack has been shared with Microchip in June 2019 to help them improve their design and fix those issues. As this is a hardware flaw which requires a silicon change, the process of fixing it can be much longer than patching a software vulnerability, and we agreed to give Microchip extra time to plan a new silicon release. Microchip has been really cooperative and we had constructive discussions, we feel they are really willing to improve the security of their solutions. Coinkite manufacturer has been noticed about the vulnerability as well.

## References

[^1]: Johannes Obermaier and Stefan Tatschner. [Shedding too much Light on a Micro-controller’s Firmware Protection](https://www.usenix.org/system/files/conference/woot17/woot17-paper-obermaier.pdf) - 2017

[^2]: Marc Schink & Johannes Obermaier. [Exception(al) Failure - Breaking the STM32F1 Read-Out Protection](https://blog.zapb.de/stm32f1-exceptional-failure/) - 2020

[^3]: Claudio Bozzato, Riccardo Focardi, and Francesco Palmarini. [Shaping the Glitch: Optimizing Voltage Fault Injection Attacks](https://tches.iacr.org/index.php/TCHES/article/view/7390) - 2019

