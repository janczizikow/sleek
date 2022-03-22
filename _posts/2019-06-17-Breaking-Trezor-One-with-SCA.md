---
layout: post
title: Breaking Trezor One with Side Channel Attacks
summary: A Side Channel Attack on PIN verification allows an attacker with a stolen Trezor One to retrieve the correct value of the PIN within a few minutes.
description: A Side Channel Attack on PIN verification allows an attacker with a stolen Trezor One to retrieve the correct value of the PIN within a few minutes.
featured-img: segascope
author: Charles Guillemet, Manuel San Pedro, Victor Servant
categories: [Donjon]
---

## TL;DR

A Side Channel Attack on PIN verification allows an attacker with a stolen Trezor One to retrieve the correct value of the PIN within a few minutes.

## Intro

Following Trezor’s post detailing the latest firmware update’s security improvements, we can now present the side-channel analysis evaluation performed on the Trezor One. This was done at the [Ledger Donjon](https://medium.com/ledger-on-security-and-blockchain/ledger-donjon-3e04e0ce49a9) and has been [responsibly disclosed](https://www.ledger.com/our-shared-security-responsibly-disclosing-competitor-vulnerabilities). The conclusion of our analysis being that it is possible to mount two profiled side-channel attacks on the device leading to

- **the retrieval of the PIN code of a stolen device.**
- the retrieval of significant portions of the scalar used during an elliptic curve point multiplication (which leads to a private key recovery).

In this post we describe our study for the PIN retrieval.

One clarification regarding our approach at the Ledger Donjon: we work not only to keep our own security at a high level, but equally evaluate and improve the security of products in the cryptocurrency ecosystem. Following a responsible approach, we advise our competitors and help them to maintain a high standard as well. Based on our findings regarding the PIN verification, Trezor was able to propose a patch and reinforce its security. 
More details regarding this can be found here.

## Trezor One Hardware Wallet

Hardware wallets have been designed to protect private keys used to access cryptocurrency accounts. These secrets are supposed to never leave the device. This is the principle of isolation, also known as cold storage. The private keys are never “hot”, or online, meaning they can never be exposed to the internet nor to the computer to which it’s connected.

[Trezor](http://trezor.io) is an Open Source Hardware Wallet created by the Czech company SatoshiLabs. The Trezor One is the main product of the company and is built on a general purpose microcontroller unit (MCU). Although it's claimed as *fully opensource*, only the firmware written by Satoshilabs is opensource. The chips itself is not open source nor the low-level software of the chip vendor hidden in the flash.


## Side-Channel Analysis

Side-Channel Analysis relies on the fact that **the physical behavior of a device depends on the data it manipulates.**

An attacker able to measure the physical behavior can characterize this dependency in order to get information on sensitive data. Side Channel Attacks can leverage several physical behaviors (the so-called side-channels). For instance:

- The execution time of a specific function,
- The power consumption of the device: can be measured using a shunt resistor and a current probe plugged to an oscilloscope,
- The Electromagnetic Emission of the device: can be measured using an EM probe and an amplifier plugged to an oscilloscope,

These physical leakages (called side-channel traces) are usually recorded using a digital oscilloscope. Afterwards a statistical post-processing is applied to retrieve sensitive data.

Since all of Trezor’s firmware code is open-source, we opted for profiled side-channel attack.

Profiled attacks can be applied when an attacker has access to an open device, on which he is able to characterize the physical behavior of a sensitive value he targets, which he can choose. This characterization phase is called the Profiling phase, and results in a database describing the physical behavior of the sensitive value on the target. Once the profiling is done, the attacker can then use this database on a whole new device, with an unknown sensitive value, which will be retrieved in a certain number of attempts (ie traces). Classical state-of-the-art profiled attacks are Machine Learning based attacks.

## Our Side-Channel Setup

We use a Trezor one device on which we modified the firmware for profiling, which allowed us to send multiple requests to the targeted security functions (which we will detail later on in this post)

The firmware running on this test device has been slightly modified:

- NVM writes which decrease the PIN Try Counter (PTC) are deactivated for automation
- A triggering mechanism is mounted, framing the call of the targeted function

We use trezorctl, the command line client for communicating with Trezor, to send multiple request to the targeted functions with chosen inputs.

During these requests, we save both the inputs that we sent and the side-channel leakages we capture.

At the beginning of the study, we chose to acquire both power and electromagnetic (EM) consumption. We are only presenting the results /with the power traces: the use of EM did not improve our results.

![typical_sca_setup](/assets/scapin/typical-sca-setup.png)
<center> <i> Typical Side Channel Setup</i> </center><br/>


At the Donjon, we use a Tektronix MSO54 oscilloscope to acquire signals. This is our equipment to evaluate the security of our devices. It costs around 20k USD, but it’s much more powerful than it needs to be. We acquired at 3GSamples/s on 1 us (3000 time samples per traces). A simple oscilloscope with 100MHz of bandwidth and 1GSamples/s of sampling rate would suffice, and would cost around 1K$.

All the scripts developed for this study are lascar-based. Lascar is the python3 side-channel library we open-sourced (see post). Those scripts are used (among others) to communicate with the Trezor Device, request leakages from the oscilloscope, store the acquired traces, and process them to mount the attack.


![sega_scope](/assets/scapin/segascope.jpeg)
<center> <i>Our Trezor’s side-channel bench.</i> </center><br/>


## Retrieving a Trezor’s PIN

All critical operations that could be run on the Trezor One require the user to enter a PIN code to unlock the device. We will show here how we mounted a profiled side-channel attack to retrieve an user PIN.

### Source Code

The PIN verification function code extracted from the firmware source code is presented below:
![pin_code](/assets/scapin/pincode.png)
<center> <i>Source code of Trezor One PIN verification</i> </center><br/>

A few remarks about the targeted source code:

- `storageRom->pin` is the value we are looking for: the user PIN value. It consists in a table of `N` digits, and each one of the digits can takes 9 values (the digit 0 cannot be used).
- As written in the comments, the function is not sensitive to timing attacks: but time is not the side-channel we use.
- The `storageRom->pin` digits are processed in the function one-by-one in the main loop. This means, from a side-channel point of view, that we can target each digit independently from the others. This is called a Divide & Conquer strategy: instead of attacking a N-digits PIN (9^N possible values), we mount N side-channel attacks, each of them on a single digit (9 possible values for each digit). We are currently working on 4-digits PIN, but the attack can be extended to any PIN size.
- There is a particular sensitive value depending on the secret that looks interesting: the value, at each step of the while loop of the subtraction: `storageRom->pin[i] — presented_pin[i] for 0 ≤ i < 4`. This sensitive value handles both the secret and the input value, allowing a side-channel attacker to induce differentiability.

### Simple Power Analysis

The next step consists of observing what the side-channel leakages look like. For instance, here are the traces corresponding to the power consumption of 10 PIN verifications (using different PINs)

![spa_pin](/assets/scapin/spa-pin.png)
<center> <i>Power consumption over time of 10 executions of the storage_ContainsPin function.</i></center> <br/>

These 700ns capture the main loop of the `storage_containsPin` function. It might not be obvious that these weird curves contain information, but we will try to convince you.

### Leakage characterization

We need to characterize the sensitive value that we chose. This means that we have to make sure that the power traces contain information depending on the value of the subtraction.

In order to do so, we acquire a large set of 200K such traces, with random known inputs. On one hand we have the set of power traces, and on the other we compute for each step the set of the subtraction values (all inputs are known). We use then a ANOVA tool called NICV to compare these sets. The sensitive value is used as a partitioning function on the power traces. We then compute the NICV trace: it consists of a ratio between the variance explained by our partitioning and the total variance of the power traces. A null NICV value means that our partitioning is wrong. But on the other hand, a high NICV value means that the power traces can be explained by the partitioning.

![nicv_pin](/assets/scapin/nicv-pin.png)
<center> <i>Leakage characterization of our 4 sensitive values: storageRom->Pin[i]-presented[i]</i></center> <br/>

From this figure, we validate a dependency between our sensitive values and the acquired power leakages. The NICV curves also give us a temporal indication: when exactly each digit is processed by the function.

This characterization phase (with NICV) will be used do select the Point Of Interests (POI) used for the profiling phase: indeed the NICV peaks for each step of the loop give temporal indications for the next steps.

### Profiling phase

We have acquired 200K power traces for the leakage characterization. We have extracted for each PIN digit the corresponding POI. This set of reduced traces will be the profiling set.

Each trace can be labeled (for each PIN digit) by the value of the corresponding subtraction.

The profiling phase is basically an instance of Machine Learning Classification. We use the known labeled data to build one classifier per PIN digit. A classifier is a decision function designed to predict the value of the unknown label of a new unknown trace.


![learning_pin](/assets/scapin/learning-pin.png)
<center> <i>Profiling Phase: Device A is an open device.</i></center> <br/>

In our case the label of a trace is the value of subtraction. Since we always know the value of the `presented_pin`, knowing the subtraction implies knowing the value of `storageRom->pin`.

In Machine Learning Classification, lots of different classifiers can be used (support vector machines, Random Forests, Decision trees, AdaBoost, … neural networks if you prefer deep learning). In this very case, we used one of the simplest and fastest type of classifier: Linear Discriminant Analysis (LDA).

So we are building the LDA classifiers (one for each PIN digit). They are fed with the set of profiling traces, and saved for further usage: they will be used during the next phase to reconstruct a user PIN from a whole new Trezor device.

### Matching Phase

Now let’s use another Trezor One Device, for which we do not know the value of storageRom->pin.

![matching_pin](/assets/scapin/matching-pin.png)
<center> <i>Matching phase: We do not know the PIN for Device B</i></center> <br/>

Just as before, we can measure the physical leakages of this new device, while executing the `storage_containsPin` function, with chosen `presented_pin` values.

The resulting traces are passed through the classifiers previously built. At each new trace (=PIN attempt), the set of classifiers outputs the most likely candidate for `storageRom->pin`. Each new trace brings information to the classifiers which update their outputs.

To validate our attack, we took a new Trezor, set a random PIN, and acquire 15 power traces resulting from a PIN verification with a random `presented_pin`. This operation has been repeated 300 times, leading to 300 sets of 15 traces.

The matching phase has been performed on these 300 sets.

We are displaying here the average rank of the correct value `storageRom->pin[i]` among the 9 guesses, for each digit (there are 9 possibles value for a PIN digit). The rank progression for each digit is displayed in function of the number of traces used:

![mean_rank](/assets/scapin/mean-rank.png)
<center> <i>Mean rank progression (over 300 attacks) of the solution for storageRom->pin[i] (for each i) depending on the number of traces used for matching.</i></center> <br/>

What these 4 curves show is that the attack is a success: after 10 power traces (in the worst case), we ALWAYS get `storageRom->pin[i]=guessed_pin[i]`. Meaning that we used 10 PIN attempts to reconstruct the whole user PIN.

Moreover, we also were able to optimize these results. We just used traces resulting from a random `presented_pin`. But with a chosen `presented_pin` strategy, the attacker can dynamically request specific `presented_pin` depending on the current state of the output of the classifiers. The resulting heuristic led to better results, since we managed to reduce the average number of PIN attempts from 10 to 5.5.

In Trezor’s post detailing the latest security features on the Trezor One firmware (including the attack on the PIN), they mention that we need 16 PIN attempts are needed to unlock a device. We however disclosed them the result of 5.5 PIN attempts, which is, unluckily, below the 16-PIN-attempts limit before Trezor wipes its data.

The post also describes the way in which Trezor patched the code to circumvent this attack, through a new set of mechanisms described in `trezor-storage`.
![new_scheme](/assets/scapin/new-scheme.png)
<center><i>The new PIN mechanisms of Trezor</i></center> <br/>

It was however a nice project, and we were very happy to **contribute to the improvement of the PIN verification function of Trezor One**.

A more detailed/technical description of our work (along with the scalar multiplication attack) has been presented and published at SSTIC19.

- [PDF of the article](https://www.sstic.org/media/SSTIC2019/SSTIC-actes/side_channel_assessment_hardware_wallets/SSTIC2019-Article-side_channel_assessment_hardware_wallets-guillemet_san-pedro_servant.pdf)
- [Video (in french)](https://www.sstic.org/2019/presentation/side_channel_assessment_hardware_wallets/)

## Conclusion

- We demonstrated a practical Side Channel Attacks allowing an attacker with a stolen Trezor One device to retrieve the correct value of the PIN with a very high probability within a few minutes.
- **2018-10-31**: This vulnerability has been disclosed to Trezor team
- **2019-03-06**: A firmware update has been issued on 
- **2019-06-02**: A small bounty from Satoshi lab has been granted to the Donjon - Thanks for this

We did not study the update against Side Channel Attacks. It seems clearly more robust, we tend to think this implementation a Side Channel Attack might be still possible while it would require more than 16 traces to succeed.
