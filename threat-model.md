---
layout: page
title: Threat Model
permalink: /threat-model/
---

This page is intended to describe the threat model of Ledger Nano S and Nano X devices. It first lists the main security objectives the devices intend to fulfill. Then it describes the security mechanisms implemented in order to actually reach these objectives. The associated threats to these security mechanisms are also mentioned.

## Security Objectives

The main security objective of the Ledger Nano devices is to provide a **physical and logical** security to users' funds. This objective can be divided in the following sub-objectives:
1. Guarantee the **confidentiality of user seeds and private keys**.
2. Ensure the use of digital assets is performed under **user consent**. In particular, the device shall prevent attackers from misleading the end user (e.g. by displaying arbitrary data on the device screen).
3. Provide a mechanism allowing the user to verify that her device is **genuine**.
4. Protect users' **privacy**. In particular, the device shall prevent users from being uniquely identified.
5. Protect the **confidentiality of the firmware and the IP of the Secure Element**.

## Definitions

For the sake of clarity, some basic definitions are recalled. In particular, the roles, the key usage and the components of the devices are recalled.

### Roles

- **End user**: The end user is the happy owner of a Ledger Nano S/X. She has physical access to the device.
- **Firmware developer**: Only some Ledger employees can develop the Firmware of the Ledger Nano devices. They are in charge of developing the OS and its cryptographic library.
- **App developer**: Anyone can develop an app running on top of the Ledger Nano S OS (BOLOS). Developing on Ledger Nano X requires Ledger authorization though.
- **HSM**: Hardware Security Modules are basically remote computers able to check the device genuineness and perform privileged operations (install/remove apps, update firmware) on the devices.

### Key Usage Scenarios

- User installs apps thanks to the [Ledger Live](https://www.ledger.com/ledger-live) application.
- User makes cryptocurrency transaction thanks to the Ledger Live. Critical pieces of information are displayed and confirmed on the device.
- User updates her device thanks to the Ledger Live application.

### High Level Architecture

The Ledger Nano S and Nano X are composed of:

- A Secure Element (ST31 for Nano S, ST33 for Nano X)
- A general purpose MCU (STM32F042 for Nano S, STM32WB55 for Nano S)
- External peripherals: screen, buttons

The following schema describes the architecture of the Nano S. On the Nano X,
the buttons and the screen are directly connected to the Secure Element.

![Ledger Nano Architecture](architecture.png)


# Security Mechanisms

Several security mechanisms are implemented at different levels. In the following we'll distinguish device security mechanisms, OS security mechanisms and app security mechanisms.

| Level  | Security Mechanism                                           | Security Objectives                                          |
| ------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Device | [Genuineness](device-genuineness/)                         | Genuineness                                                  |
| Device | [Secure Display and Inputs](device-secure-display-and-inputs/) | Confidentiality of user seeds, User consent                  |
| Device | [Physical Resistance](device-physical-resistance/)         | Confidentiality of user seeds, Confidentiality of the firmware |
| OS     | [PIN Security Mechanism](os-pin-security-mechanism/)       | Confidentiality of user seeds                                |
| OS     | [Random Number Generation](os-random-number-generation/)   | Confidentiality of user seeds                                |
| OS     | [Confidentiality of Seed and Private Keys](os-seed-confidentiality/) | Confidentiality of user seeds and private keys               |
| OS     | [Confidentiality and Integrity](os-confidentiality-and-integrity/) | Confidentiality of the firmware                              |
| OS     | [Transport Security](os-transport-security/)               | Confidentiality of the firmware                              |
| App    | [Isolation](app-isolation/)                                | Confidentiality of private keys, User consent                |
| App    | [User Consent](app-user-consent/)                          | User consent                                                 |
