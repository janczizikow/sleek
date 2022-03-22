---
layout: post
title: Speculos
author: gab
summary: Speculos - an emulator for developers
featured-img: speculos
categories: Tech
---

## Speculos - an emulator for developers

Until now, developers had only one option to test their apps: load them onto a real Ledger Nano S device. However, it’s especially painful on a Secure Element since there are no debug features (no JTAG, etc.). In order to make developers’ life easier, we open-source a project allowing developers to test and run apps without any hardware device: [Speculos](https://github.com/LedgerHQ/speculos/).


<center>
<img src="/assets/speculos/speculos_nano.png" >
</center>
<br/>

Speculos is an emulator whose goal is to run Ledger Nano S apps on a desktop computer. The project is supported on Ubuntu 18.04 and WSL but it should work seamlessly on other Linux distros. The left and right arrow keys of the keyboard can be used to navigate through the apps (instead of the buttons).

It has several advantages over testing apps on a hardware device: loading an app is immediate (just run `./speculos.py app.elf`). No USB connection issues, no PIN required, no validation steps. If the app crashes, just attach a debugger to the embedded gdb stub and track down the bug.


## Examples

Here are a few usage examples worth a thousand words:

* Launch a gdb stub: `./speculos.py — debug app.elf`
* Trace every syscall made by the app: `./speculos.py — trace app.elf`
* Export the display through a VNC server: `./speculos.py -n -v 5900 app.elf`
* Make use of a library: `./speculos.py app.elf -l Libname:lib.elf`
* Increase the size of the screen: `./speculos.py -z 3 app.elf`
* Launch an app with a specific seed: `./speculos.py -s 'coffee sugar shed enemy live slab scrap garage task enable silly fresh snake favorite stick camera approve expect bronze radio install mix chief mix'`
* Send an APDU: `echo ‘e0c4000000’ | LEDGER_PROXY_ADDRESS=127.0.0.1 LEDGER_PROXY_PORT=9999 python3 -m ledgerblue.runScript — apdu`
* Launch an app for the Ledger Blue: `./speculos.py — model blue app.elf`

<center>
<img src="/assets/speculos/speculos_blue.png" >
</center>
<br/>

## Limitations
 
Please note that there are a few limitations. There is no firmware running inside Speculos, just a reimplementation of a few functions available through the SDK. As a consequence:

* There is no dashboard and no screensaver
* In some cases, an app running on Speculos might behave differently than an app running on a hardware device (indeed, the code of the project is different)
* It isn’t possible to communicate with Speculos over USB (but APDUs can be exchanged thanks to a TCP proxy)

For technical details, Speculos relies on QEMU to run ARM binaries (which is the Secure Element architecture) on a x86 CPU. The MCU and the peripherals (basically the screen and the buttons) are implemented thanks to a set of Python scripts.

<center>
<img src="/assets/speculos/speculos_archi.png" >
</center>

Take a look at the [documentation](https://github.com/LedgerHQ/speculos/blob/master/doc/) for more information, a few usage examples and additional features. We make heavy use of Speculos internally but the project is still young. If you encounter any bugs, feel free to open [issues](https://github.com/LedgerHQ/speculos/issues) and even create [pull requests](https://github.com/LedgerHQ/speculos/pulls).

As a reminder, this project is for developers only. Don’t use it to store cryptocurrencies or make transactions, it’s very much NOT a secure software wallet!
