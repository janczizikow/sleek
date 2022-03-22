---
layout: post
title: "Remote laser faults injection during pandemic"
summary: "How we improved our laser test bench to work remotely during the pandemic"
description: "Laser test bench improvement for remote fault injection"
featured-img: laser-improvements
author: Olivier Heriveaux
categories: [Donjon]
---

## Introduction

During the pandemic, access to our offices has been restricted. Bringing the 200 kg laser station at home was not an option, and conducting laser fault injection research with very limited access to the laboratory was difficult, so being able to operate the laser testing platform remotely became a necessity.

This short post describes some laser station enhancements we made to be able to run our experiments remotely.

## Setup problems

Our laser fault injection platform is made of a microscope used to focus a laser source down to a device under test. It is equipped with an infrared camera to observe the internal architecture of the targeted chip, and adjust the laser beam shape. Fortunately, it is equipped with a motorized stage which allows moving the laser beam across the chip from our custom software application. All the tools we developed run on the Linux operating system, and it is therefore possible to use them through an SSH connection, provided you have good internet connection. We faced some latency issues dealing with the microscope camera live image, which we quickly solved by turning on the SSH compression option (`-C`) which is not enabled by default and greatly reduces the required streaming bandwidth. Nonetheless, at the time some elements still required in situ intervention:

- Controlling the camera light source: a dedicated equipment provides infrared light to illuminate the chip for camera visualization.
- Opening or closing the mechanical camera shutter: this shutter is part of the microscope and must be closed when using the laser.
- Changing the microscope objective: 4 different optical objectives are mounted on a mechanical rotating turret and allow different microscope magnifications.

Below is detailed how we customized our test bench to control remotely the shutter and the light source. In particular, we wanted to limit the cost of those adaptations, and make it available as soon as possible.

## Controlling the light source

The silicon substrate of semiconductors is semi-transparent to infrared light, and with an infrared camera, it is therefore possible to observe the internal structure of circuits. For making the observation possible, the circuit must be illuminated with an infrared light source. Our laser microscope was shipped with a dedicated light source equipment, a *Hayashi LA-150CE*, which has a power switch and a knob to adjust the light intensity, as depicted below. When a laser testing campaign is started, we usually turn-off the light source as it may interfere with the components, especially when samples are thinned.

<center>
<img src="/assets/laser-improvements/light.jpg"/><br/>
<i>Light source front and rear panels</i>
</center><br/>

Looking at the rear of the equipment, we found a "remote" switch and an external connector were available. We understood this light source offers remote control capability through some past millennium connector. Little documentation can be found on the web, but we identified in a Hayashi catalog there exists a *LAN Control Unit* compatible with this light source. However this product is discontinued. Also, LAN connectivity is not very convenient. In the same catalog, we found the specification for the connector of the light source. Though it is not very detailed, it was enough to try this out.

<center>
<img src="/assets/laser-improvements/diagram.png"/><br/>
<i>Remote control pinout from Hayashi products catalog</i>
</center><br/>

This interface provides two main interesting features:
- Digital pins 1 and 8 can be used to switch on and off the lamp by shorting them or not. Pin 8 is actually the ground, so only pin 1 is really relevant.
- The analog pin 2 controls the light intensity with a signal ranging from 0 V (minimum intensity) to 5 V (maximum intensity). When remote mode is enabled, the front panel potentiometer is bypassed and light intensity is directly controlled by this pin.

We decided to build from scratch our own *Hayashi Light Remote Controller* using the following parts :
- A STM32 microcontroller to host the embedded application code,
- A FT232 USB-to-serial converter to allow controlling the dongle from the USB,
- A AD5621B Digital-to-Analog Converter for the 0 to 5V analog signal generation to control the light intensity.

We designed the PCB using [KiCad](https://www.kicad.org/). To be honest, this design may be a bit oversized: the microcontroller is too big for the current need, and the FT232 may be removed since STM32 devices have already USB capabilities, at the cost of software development time. Our goal was to make it quick and dirty and reuse some of our already designed schematics. 

For the fun, and because we believe this is a very promising language, we developed the microcontroller firmware in Rust.

We finally designed a simple plastic enclosure using [FreeCAD](https://www.freecadweb.org/), and printed it with [Sculpteo](https://www.sculpteo.com/).

Unexpectedly, the most difficult part of this project was identifying the connector (reference 5710140 from Amphenol for the male side), and also purchase it as it is obsolete and not sold anymore by many suppliers. The part supplier search engine [Octopart](https://octopart.com/) can help.

All the schematics and design files are available on our [GitHub repository](https://github.com/Ledger-Donjon/hayashi-light-remote).

<center>
<img src="/assets/laser-improvements/pcb.jpg"/><br/>
<i>PCB and enclosure</i>
</center><br/>

## Controlling the camera shutter

In the microscope, the laser beam and the camera share the same optical path. When the laser is shooting, a fraction of the light is reflected by the silicon and will hit the camera. To prevent sensor damage which can result on the long term in dead pixels, an optical mechanical shutter in front of the camera can be closed. The shutter is manual and requires little to no force to be actuated.

To make remote control possible, we bought a small stepper motor and a [TIC T834 Stepper Motor Controller from Polulu](https://www.pololu.com/product/3132). We developed and printed 3D gears and a body to be mounted on the microscope, in order to move the shutter with the motor.

TIC T834 requires a power source to provide the energy to the motor, but as our motor does not draw a lot of current, we shorted the USB power supply of the T834 to power the motor as well. TIC controllers are very easy to setup and use, it is well documented and it took us very little time to control the motor from our software tools. We developed a tiny controller class in Python now integrated in our [pystages](https://github.com/Ledger-Donjon/pystages) library.

Stepper motor controllers need to find out the current motor position when it is powered on. This is done with an initialization procedure where the motor will spin until a contact switch tells the controller that the motor is at the zero position. We used a simple switch directly connected to the T834 which has this feature built-in.

The 3D body part we printed was not very accurate and the two gears were not operating correctly at the first time. Using heat we could slightly bend the plastic part to correct the gap between the gears. After a few adjustments, we were able to remotely open and close the camera shutter perfectly!

<p style="text-align: center;">
<video playsinline autoplay muted loop style="width: 50%"><source src="/assets/laser-improvements/shutter.mp4" type="video/mp4"></video><br/>
<i>Shutter in action</i>
</p>

Mechanical design is available on our [GitHub repository](https://github.com/Ledger-Donjon/shutter-controller)

## Final thoughts

Integrating the control of the light source and the camera shutter allowed us to run many laser testing campaigns remotely. It is also more convenient than before, as closing the shutter and switching off the light can now be done automatically when the laser is turned on, whereas it required human physical intervention before and could be easily forgotten.

Regarding the control of the objectives turret, there already exist motorized turrets, but unfortunately they are quite expensive, and it may be tricky to replace. For the moment, we did not find any simple and low-cost solution. Rotating the turret with an external motor is hard, especially because there's a spring that locks the turret in place when the objective is aligned to the microscope. Also, the weight we can add to the motorized stage is limited. This is still an open issue at the moment, but it does not prevent working remotely, we are just limited to a selected magnification.

Finally, replacing the sample when it is broken still requires access to the lab. Fortunately, it does not happen too often. We may eventually multiplex many circuits on a single daughterboard, so we can burn a few devices before needing physical replacement, yet we did not develop such a solution.
