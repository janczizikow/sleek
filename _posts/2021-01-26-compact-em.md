---
layout: post
title: "A Compact Electromagnetic Fault Injection Setup"
summary: "Introducing the EM setup of Donjon"
description: "Introducing a low-cost setup for EM"
featured-img: compact-em
author: Karim M. Abdellatif and Olivier Hériveaux
categories: [Donjon]
---

# A Compact Electromagnetic Fault Injection Setup

## Introduction
Physical security threats appear at circuit-level, where an attacker can measure or physically influence the computation/operation performed by the circuit. Side-channel attacks exploit additional sources of information (physical observations), including timing information, power consumption, electromagnetic emissions (EM), and sound. Malicious data modifications are caused by fault attacks, which can be performed by injecting faults using laser/optical [[^1]], electromagnetic [[^2]], and glitches (power and clock) [[^3]]. These attacks pose a serious threat to modern chips with cryptographic algorithms.

Electromagnetic Fault Injection (EMFI) is based on inducing faults into integrated circuits by influencing it with a flux of the magnetic field. It causes voltage and current fluctuations inside the device. As a result, the device won't work properly under such effect which leads to inducing errors. It was first proposed by Quisquater et al. in 2002 [[^4]] and has been shown as an effective fault injection technique for the purpose of conducting physical attacks against ICs as shown in [[^5]].

The main advantages of injecting faults by electromagnetic are: First, injecting faults without the need to perform chip decapsulation (in some cases). Second, targeting local parts of the circuit (better focusing).

The goal of this blog post is to highlight our low cost and handmade setup used for injecting EM faults.

## [SiliconToaster](https://eprint.iacr.org/2020/1115.pdf)
SiliconToaster [^6] is a handmade EMFI tool designed in Donjon, which is a cheap and programmable platform. It has the capability of injecting faults with a programmable voltage up to 1.2kV. It is composed of the following blocks:

+ A High voltage pulse generator with the flexibility of changing the voltage level
+ A microcontroller to adjust and monitor the generated EM voltage
+ A High voltage switching circuit which is used to inject a controlled shock into the EM injector
+ An EM injector (hand-made probe)

<center>
<img src="/assets/compact-em/silicontoaster.png"/><br/>
<i>Silicontoaster</i>
</center><br/>

## Application Target
For validation purposes, we target a 8-bit microcontroller which is decapsulated in order to facilitate the effect of EM pulse. The demo presented in this blog post is to bypass a simple PIN verification scenario shown in the code below.
``` js
    for (;;)
    {
        uint8_t command = uart_read_u8();
        if (command == 0x02)
        {
            /* Get input pin from UART */
            uint8_t buffer[8];
            for (uint8_t i = 0; i < 8; ++i)
                buffer[i] = uart_read_u8();
            /* Verify pin */
            uint8_t pin[8] = {0x39, 0x38, 0x37, 0x36, 0x31, 0x32, 0x33, 0x34};
            uint8_t good = 1;
            for (uint8_t i = 0; i < 8; ++i){
                if (pin[i] != buffer[i])
                    good = 0;
            }
            if (good == 1){
                uart_write_str("ThisIsTopSecret!");
            } else {
                uart_write_str("BadPin!TryAgain!");
            }
        }
    }

```
## Setup

In order to bypass the PIN verification scenario, the setup shown below was built to scan all the physical area of the chip. We used the SiliconToaster to inject EM pulses during the PIN verification time.

<center>
<img src="/assets/compact-em/setup.jpg"/><br/>
<i>EM setup: From left to right: 1. High-end oscilloscope. 2. SiliconToaster fixed on a CNC. 3. Computer with dedicated EM scanning software. 4. Visualization screen to show the chip surface</i>
</center><br/>

<center>
<img src="/assets/compact-em/zoom_st.png"/><br/>
<i>Close up on the DUT</i>
</center><br/>

 We invested its programmability in injecting EM pulses to find the correct settings for the EM pulse voltage and duration. With the help of the [CNC](https://www.amazon.fr/gp/product/B07MV846B4/ref=ppx_od_dt_b_asin_title_s00?ie=UTF8&psc=1) machine, all the chip surface was scanned by a step of 25 µm. Under EM voltage of 600V, several physical locations have been found sensitive to the EM pulse and the PIN verification was bypassed successfully.

<center>
<img src="/assets/compact-em/power_resized.png"/><br/>
<i>Power consumption in case of EM injection (red) and without EM injection (blue)</i>
</center><br/>

<center>
<img src="/assets/compact-em/fault_map_resized.png"/><br/>
<i>Obtained EM faults location (yellow spots)</i>
</center><br/>

## Conclusion
In this blog post, we proposed a compact EM setup that can be used in order to inject EM faults. [SiliconToaster](https://eprint.iacr.org/2020/1115.pdf) was used as a programmable EM injector to obtain a flexible voltage for the EM shock. In addition, a [$200 CNC 3018](https://www.amazon.fr/gp/product/B07MV846B4/ref=ppx_od_dt_b_asin_title_s00?ie=UTF8&psc=1) was used in order to automate the chip surface scan. The success rate of the attack is close to 1%. However, a higher success rate can be obtained by spending more time to optimize the attack parameters as the current experiment was performed in only three days.
## References

[^1]: Sergei P. Skorobogatov and Ross J. Anderson. [Optical Fault Induction Attacks](https://link.springer.com/chapter/10.1007/3-540-36400-5_2) - 2003

[^2]: Amine Dehbaoui, Jean-Max Dutertre, Bruno Robisson, and Assia Tria. [Electromagnetic Transient Faults Injection on a Hardware and a Software Implementations of AES](https://hal.archives-ouvertes.fr/emse-00742639) - 2012

[^3]: Colin O'Flynn. [Fault Injection using Crowbars on Embedded Systems](https://eprint.iacr.org/2016/810.pdf) - 2016

[^4]: J. Quisquater. [Eddy Current for Magnetic Analysis with Active Sensor](https://www.researchgate.net/publication/239065886_Eddy_current_for_magnetic_analysis_with_active_sensor) - 2002

[^5]: Amine Dehbaoui, Amir-Pasha Mirbaha, Nicolas Moro, Jean-Max Dutertre, and Assia Tria. [Electromagnetic Glitch on The AES Round Counter](https://link.springer.com/chapter/10.1007/978-3-642-40026-1_2) - 2013

[^6]:  Karim Abdellatif and Olivier Heriveaux. SiliconToaster: [A Cheap and Programmable EM Injector for Extracting Secrets](https://eprint.iacr.org/2020/1115.pdf) - 2020.
