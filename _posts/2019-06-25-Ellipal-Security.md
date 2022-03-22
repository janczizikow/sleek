---
layout: post
title: Extracting seed from Ellipal wallet
summary: Ellipal is a hardware wallet based on air-gapped Android device, Our study showed that communication interfaces could be re-enabled
description: Ellipal is a hardware wallet based on air-gapped Android device, Our study showed that communication interfaces could be re-enabled
featured-img: ellipal-wifi
author: Charles Guillemet, Olivier Hériveaux
categories: [Donjon]
---


# Security Analysis of Ellipal (Hardware) Wallet

[The Donjon]({% post_url 2018-12-11-Introducing-Ledger-Donjon %}), Ledger’s security research team, recently spent some time and resources to analyse the security of hardware wallets. Our goal is to raise the bar for security in the ecosystem.

The Ellipal hardware wallet was one of our evaluation targets. We found this device especially interesting since the security model is quite special.

_TL;DR_: 
We found several vulnerabilities in the device. Some of them allow an attacker to re-activate the communication interfaces and to backdoor a device enabling supply chain or evil maid attacks.
One of the vulnerabilities was especially critical since it allows an attacker with physical access to extract the seed from the device.
This work has been responsibly disclosed to the vendor allowing it to emit an upgrade.

## Ellipal security model
As stated in Ellipal’s documentation, the device is “air-gapped”, meaning there are no communication interfaces: no USB, no WiFi, no GPRS… The only way for this device to communicate is by using QR codes. It has a touchscreen to display QR codes and a camera to scan them from the user’s phone.

<p align="center">
<img src="/assets/ellipal/ellipal-interfaces.jpg">
</p>
<center> <i>Ellipal - A physically airgaped wallet</i> </center><br/>

There is also an upgrade mechanism using an SD card interface. The user has to download the upgrade file and put it on an SD card. The upgrades are encrypted and signed.

This security model sounded interesting to us, therefore we decided to study it a bit further and ordered an Ellipal. Meanwhile, we had a look at the upgrade mechanism.

## Upgrade mechanism

First of all, we retrieved the upgrade archives on the Ellipal server. To do so, we just found the URL of one of the upgrades and brute-forced the version number to retrieve the other files.

```
https://order.ellipal.com/lib/v1.7.zip
https://order.ellipal.com/lib/v1.8.zip
https://order.ellipal.com/lib/v1.8.1.zip
https://order.ellipal.com/lib/v1.9.zip
https://order.ellipal.com/lib/v1.9.3.zip
https://order.ellipal.com/lib/v1.9.4.zip
https://order.ellipal.com/lib/v2.0.zip
```
The files were decompressed and the .bin files were quickly analysed. First of all, using binwalk, we had a look at the entropy of the file.

<p align="center">
<img src="/assets/ellipal/ellipal-entropy.png">
</p>
<center> <i>Entropy of a Firmware upgrades</i> </center><br/>

This entropy trace looks a bit fishy. Indeed, a well encrypted file should have a constant entropy close to one all along the file.

Computing some statistics, we noticed that some patterns are more frequent in the file than others.

<p align="center">
<img src="/assets/ellipal/ellipal-frequencies.png">
</p>
<center> <i>Word Frequencies - several word sizes</i> </center><br/>

This clearly indicates that the file is encrypted in ECB mode which is definitely not a good practice.

<p align="center">
<img src="/assets/ellipal/ellipal-ecb.png">
</p>
<center> <i>Chaining mode - Effect on Image encryption</i> </center><br/>

[Wikipedia-chaining-mode](https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation)

The statistics also indicate that the block cipher used is a 64-bits block cipher. It might be a single DES. So, we decided to launch a brute-force attack.

We launched it on a pretty efficient computer with 2x GTX1080. The full search takes around 10 days.

**Edited on the 2019-07-11 after discussion with Ellipal**

<i> Ellipal acknowledge ECB mode is not the correct way to encrypt and told us that Integrity is more important than confidentiality for this specific mechanism </i>

Meanwhile, we received our Ellipal wallet. We quickly played with the software interface and then decided to have a look at the hardware.




## Hardware Security Study
The Ellipal device is quite similar to a low-end mobile phone. Once the plastic enclosure is opened and the battery has been removed, we can disconnect the buttons and screen and extract the motherboard of the device. The motherboard is a small multilayer PCB on which we can notice two metal passive shields, whose purpose is probably to enhance CEM properties of the electronics. We managed to remove the metal shiels using hot-air soldering station and a scalpel, without damaging the board to keep it functional.

<p align="center">
<img src="/assets/ellipal/ellipal-open.png">
</p>
<center> <i>Ellipal Device - opened </i> </center><br/>


The design is constructed around a MediaTek SoC MT6580. This is the same SoC as the Bitfi wallet ! This SoC was designed for low-cost smartphones.

<p align="center">
<img src="/assets/ellipal/ellipal-zoom.png">
</p>
<center> <i>Ellipal Device - zoom on PCB </i> </center><br/>


The design also embeds a touchscreen

- HIFAY 15-14025-3337-A0
- A deactivated USB interface, for battery charge only
- An SD card slot used for update
- An UART interface
- eMMC external Flash

Unfortunately, the LCD screen has been a little bit damaged when opening the device, and the “touch” feature was lost. However, this incident did not stop us from digging deeper...

### Finding #1: UART interface
In the industry, it is common and convenient to have debug UART interface on linux- based boards. We were quite confident that such an interface would be available on the board, and we found two test-points on the bottom layer of the PCB, right under the Mediatek SoC. 

<p align="center">
<img src="/assets/ellipal/ellipal-uart.png">
</p>
<center> <i>UART interface is active </i> </center><br/>


When booting the device,  using an oscilloscope we quickly found activity on one of those test points using an oscilloscope, which is the UART TX pin of the SoC. The baud rate can be measured and the data can be read using a simple USB-to-serial chip such as the FT232. Also, we had to slightly modify slightly the USB-to-serial converter to make it work with 1.8V logic, which is the voltage level of the I/Os of the SoC.


Lots of debug information is printed on the UART during Ellipal boot. For instance, the following output has been retrieved at boot time:

```
AP_PLL_CON1= 0x3C3C23C0
AP_PLL_CON2= 0x4
CLKSQ_STB_CON0= 0x25002100
PLL_ISO_CON0= 0x202020
ARMPLL_CON0= 0x11
ARMPLL_CON1= 0x8009A000
ARMPLL_PWR_CON0= 0x5
MPLL_CON0= 0x8000011
MPLL_CON1= 0x800E7000
MPLL_PWR_CON0= 0x5
UPLL_CON0= 0x38000001
UPLL_CON1= 0x1000060
UPLL_PWR_CON0= 0x5DISP_CG_CON0= 0xFFFFFFFC,
DISP_CG_CON1= 0x0,
  FFE0
RGU STA:      0
RGU INTERVAL: FFF
RGU SWSYSRST: 8000
==== Dump RGU Reg End ====
RGU: g_rgu_satus:0
 mtk_wdt_mafter set KP enable: KP_SEL = 0x1C70 !
```

The TX interface provides interesting logs. In particular, the partition table of the flash memory is dumped and provides an attacker very useful information:

```
[PART] blksz: 512B
[PART] [0x0000000000080000-0x000000000037FFFF] "proinfo" (6144 blocks)
[PART] [0x0000000000380000-0x000000000087FFFF] "nvram" (10240 blocks)
[PART] [0x0000000000880000-0x000000000127FFFF] "protect1" (20480 blocks)
[PART] [0x0000000001280000-0x0000000001C7FFFF] "protect2" (20480 blocks)
[PART] [0x0000000001C80000-0x0000000001CBFFFF] "seccfg" (512 blocks)
[PART] [0x0000000001CC0000-0x0000000001D1FFFF] "lk" (768 blocks)
[PART] [0x0000000001D20000-0x0000000001D7FFFF] "lk2" (768 blocks)
[PART] [0x0000000001D80000-0x0000000002D7FFFF] "boot" (32768 blocks)
[PART] [0x0000000002D80000-0x0000000003D7FFFF] "recovery" (32768 blocks)
[PART] [0x0000000003D80000-0x0000000003DFFFFF] "para" (1024 blocks)
[PART] [0x0000000003E00000-0x00000000045FFFFF] "logo" (16384 blocks)
[PART] [0x0000000004600000-0x00000000055FFFFF] "odmdtbo" (32768 blocks)
[PART] [0x0000000005600000-0x0000000005FFFFFF] "expdb" (20480 blocks)
[PART] [0x0000000006000000-0x0000000017FFFFFF] "vendor" (589824 blocks)
[PART] [0x0000000018000000-0x00000000180FFFFF] "frp" (2048 blocks)
[PART] [0x0000000018100000-0x000000001A0FFFFF] "nvdata" (65536 blocks)
[PART] [0x000000001A100000-0x000000001C7FFFFF] "metadata" (79872 blocks)
[PART] [0x000000001C800000-0x000000001C9FFFFF] "oemkeystore" (4096 blocks)
[PART] [0x000000001CA00000-0x000000001CFFFFFF] "secro" (12288 blocks)
[PART] [0x000000001D000000-0x000000001D7FFFFF] "keystore" (16384 blocks)
[PART] [0x000000001D800000-0x0000000069FFFFFF] "system" (2506752 blocks)
[PART] [0x000000006A000000-0x0000000070FFFFFF] "cache" (229376 blocks)
[PART] [0x0000000071000000-0x00000001CBF7FFFF] "userdata" (11369472 blocks)
[PART] [0x00000001CBF80000-0x00000001CCF7FFFF] "flashinfo" (32768 blocks)
```

<p align="center">
<img src="/assets/ellipal/ellipal-fastboot.jpg">
</p>
<center> <i>Activating Fastboot with UART</i> </center><br/>


We also “played” with the RX interface. There is a time-window where a keyword can be sent to the SoC to change booting mode. Sending a “FASTBOOT” token enables fastboot mode which provides commands to read or write to the filesystem with the knowledge of a manufacturer secret-key, which we don’t have so far.

We were also able to boot on factory testing mode by sending “FACTFACT”. The factory mode can be used with the volume up and down buttons. These buttons do not exist on Ellipal device, but we did find test points on the motherboard which allowed us to connect these buttons. After soldering back the volume navigation keys, we could test a few features, and in particular the WiFi test:

We were surprised that the device could connect to an access point, since it is supposed to be air-gapped. We concluded that WiFi was only disabled by software, though we did not check if Android kernel was compiled with WiFi support.

<p align="center">
<img src="/assets/ellipal/ellipal-wifi.jpg">
</p>
<center> <i>A Wifi chipset is present and active</i> </center><br/>

_Fun fact: with our new volume buttons soldered, we are able to change the volume level in Android. Even though Ellipal has no speaker, the volume UI from stock Android is still present and active!_

### Finding #2: USB interface

The USB interface is not physically soldered. Only the power-related signals are connected. The data signals are simply not soldered. There are points on the PCB for USB D+ and D- signals, connected to the SoC. We soldered these test points to the USB connector and enabled the USB. With the USB, it is possible to communicate with the MediaTek bootloader.

The MediaTek bootloader can be leveraged to dump the flash and write into it using Saleem Rasheed’s tool or Mediatek’s SP Flash Tool. Although the tool supports only the USB interface, the bootloader protocol on MediaTek SoCs is also available through UART. Fully disabling USB is then not sufficient.

The Flash Memory partition table dumped over the UART during boot phase, as shown previously, helped us to fetch only the interesting partitions without dumping the whole flash memory. Once a partition is dumped, it can be easily mounted on a linux filesystem, analysed with standard tools, modified and finally written back to the Flash memory to apply potential changes. The USB communication transfer speed is fast enough to transfer big partitions, and this would have been much more painful with a classical UART where the baud rate is usually very limited, and transfer errors might happen.

### Flash Dump

The fact that the flash can be dumped is a major vulnerability. It allowed us to reverse engineer the firmware and apps, but also to dump all the private data of the users, including their encrypted private keys. 

The user’s Bitcoin/Ethereum private keys (xpriv) are encrypted with a user input password. But the reverse engineering of the app shows that the password verification is quite weak (salted SHA-256), andit allows easy and efficient password brute-forcing. A full random 8 character-password can be brute-forced within a few minutes on a desktop computer, and we believe users will not enter very long passwords on a mobile phone.

This typically means that a physical access to the device allows an attacker to retrieve user’s private keys very quickly and at a low cost.
Flash Write
The ability to overwrite the flash is also a major vulnerability. It is then possible to backdoor the device by different means:
Pre-seed the device.
Activate the WiFi and backdoor the app so that it sends the private key over the internet.

Supply chain attacks AND evil maid attacks can be implemented with this method. And as no genuineness check mechanism is implemented, it is impossible for users to be sure their device is not backdoored.

## Software Security Study

A very quick analysis of the software has been performed.

### Finding #3: Update mechanism

The update mechanism uses an encrypted and signed apk. The apk is encrypted with 3DES in ECB mode, which is not a good practice. Moreover, the encryption key is fixed and has been retrieved from the firmware. The signature verification seems correctly implemented, and we did not manage to upload a modified firmware using the update mechanism on the device.
 
### Finding #4: Private key inputs

The private key inputs in the app are not checked. Feeding it with a very long word list makes it crash (probably Out of Memory). Nevertheless, It’s probably not possible to exploit this vector.


<p align="center">
<img src="/assets/ellipal/ellipal-donjon.gif">
</p>
<center> <i>Donjon is root on Ellipal :) </i> </center><br/>

Our first trial of filesystem modification. Worked like a charm.

# Conclusion

## Responsible disclosure

We disclosed these vulnerabilities to Ellipal who took them very seriously. We had fruitful exchanges with them. This report triggered the creation of their bounty program. They emitted an upgrade (we didn’t check the upgrade) and credited us for helping them to improve the security of their device.

They finally gave us a bounty reward. We were happy to help improving the security in the ecosystem.

<p align="center">
<img src="/assets/ellipal/ellipal-misleading.png">
</p>
<center> <i>Misleading security properties</i> </center><br/>

**Edited on the 2019-07-11 after discussion with Ellipal**

<i> This image has been removed from Ellipal blogpost - they acknowledged it was inaccurate marketing materials </i>


## Summary

We conducted a quick security evaluation of Ellipal Wallet. The security model sounds quite interesting to us. The interfaces seemed very limited.
The analysis revealed this Hardware Wallet is in fact an Android phone. The interfaces are only locked by the Android software stack.
Several flaws have been discovered and repoorted to the manufacturer.
On this kind of device, the security can be guaranteed only if:
- The software running is **genuine**: very difficult to guarantee this on a Android phone)
- The software is well written and flawless: We hope, we could help for this
- The attacker has no physical access to the device - or a **very strong** password

Consequently, the security model of the device is very similar to the [Bitfi wallet](https://cybergibbons.com/category/security-2/bitfi/) one.


**Edited on the 2019-07-11 after discussion with Ellipal**

<i> Ellipal recommandations are the following: <br/>
1) Upgrade to firmware V2 <br/>
2) Prevent physical access to the device <br/>
3) Use a long password <br/>
</i> <br/>
From our side, we didn't check the version 2. Preventing the physical access drastically reduces the attack surface while it's quite difficult to guarantee. Finally a *very* long password must be implemented especially since the password derivation is not very resource consuming. 

