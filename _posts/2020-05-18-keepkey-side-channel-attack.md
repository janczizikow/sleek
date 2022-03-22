---
layout: post
title: KeepKey Hardware Wallet Under The Scope
summary: "A side-channel attack on the PIN verification of the KeepKey hardware wallet allows to retrieve the PIN of the device"
description: We mounted a 2-steps side-channel attack on the PIN verification function of the KeepKey hardware wallet. If an attacker has a physical access to the device, the attack exposes the user PIN of the device. 
featured-img: scaffold
author: Manuel San Pedro
categories: [Donjon]
---

# Follow-up on PIN verification against side-channel attack: KeepKey hardware wallet under the scope.

TLDR: We mounted a 2-steps side-channel attack on the PIN verification function [storage_isPinCorrect_impl](https://github.com/keepkey/keepkey-firmware/blob/620052f166b3e34e6834dbae57cf607621eedd9d/lib/firmware/storage.c#L300) of the KeepKey hardware wallet. If an attacker has a physical access to the device, the attack exposes the user PIN of the device. 

Following [our study on Trezor One last year](https://donjon.ledger.com/Breaking-Trezor-One-with-SCA/), we decided to take a look at KeepKey hardware wallet. Even though the KeepKey PIN verification mechanism is different from the one we broke on Trezor, the main reasons the scheme is vulnerable are that:

- KeepKey uses the same general purpose non-secure microcontroller (MCU) to store *secrets*: the STM32F205, the same as  Trezor. It is known that this MCU is not suited to resist physical attacks.
- These *secrets* are manipulated within functions that are not protected against side-channel attacks (in this study: the AES function from [trezor-crypto library](https://github.com/KeepKey/trezor-firmware/tree/3740fa946d6486525f4239c824c5a6d78c4cb7f8/crypto), and a native `memcmp`).

In the following document, we show the feasibility of a side-channel PIN extraction, by mounting two distinct profiled side-channel attacks:
- The first part targets the AES function and allows to retrieve `wrapped_storage_key`.
- The second part targets the `memcmp` function and allows to retrieve `storage_key_fingerprint`.

As it will be explained later, once these two values are known, an off-line brute-forcing allows to retrieve the user's PIN.

We will first describe the attack scenario. Then we explain how side-channel works on embedded devices, and what are the principles of a profiled Side-Channel Attack. After that we will present KeepKey PIN verification mechanism, and the experimental results we got on both the attacks.


## Attack scenario

We consider here a physical attack on a hardware wallet. The physical access to a victim device is mandatory.

The attack context is the following. The attacker:

- gets its own KeepKey device,
- mounts the two profiled attacks described hereafter using this *profiling* device,
- has access to an *unknown* KeepKey device,
- attacks this new device by inputting random PIN values, while monitoring power consumption,
- gets the correct PIN value from the attacks,
- Inputs this PIN to the *unknown* (still functioning) device.

At the end, the attacker has he correct PIN: he can use the device to move all the funds.

## Side-channel overview

Side Channel Attacks rely on the fact that the physical behavior of a device depends on the data it manipulates. An attacker able to measure the physical behavior can characterize this dependency in order to get information on sensitive data.

Side Channel Attacks can leverage several physical behaviors (the so-called side-channels): 
- execution time
- power consumption of the device: can be measured using a shunt resistor and a current probe plugged to an oscilloscope.
- electromagnetic emission of the device: can be measured using an EM probe and an amplifier connected to an oscilloscope.

- ...

In the present study, we focus on the power consumption of the device, during the [storage_isPinCorrect_impl](https://github.com/keepkey/keepkey-firmware/blob/620052f166b3e34e6834dbae57cf607621eedd9d/lib/firmware/storage.c#L300) function.
These physical measurements (called side-channel *traces* or leakages) are recorded using a digital oscilloscope. Finally, a statistical post processing is applied to retrieve sensitive data.

Side-Channel Attacks can be divided in 2 categories: Profiled attacks and Unsupervised attacks.

- Profiled attacks can be applied when an attacker can have access to an *open device*, on which she is able to characterize the physical behavior of a sensitive value she targets, that she can choose. This characterization is called the *Profiling phase*, and results in a *database* describing the physical behavior of the sensitive value on the target. Once the profiling is done, the attacker can then apply this *database* on a whole new device, with an unknown sensitive value, that will be retrieved in a certain number of attempts (one attempt = one side-channel *traces*). Classical state-of-the art profiled attacks are Template Attacks, and, more recently, Deep-Learning based Attacks.
- Unsupervised attacks use the same mechanism but without the leakage characterization. In this situation the attacker needs to figure out the leakage model by himself. Classical leakage model exists, such as Hamming weight (number of bits set) or Hamming distance (number of bits to flip). It is well known that unsupervised attacks are less efficient. [DPA, CPA]

The context of an open-source code running on a [STM32](https://www.st.com/en/microcontrollers/stm32-32-bit-arm-cortex-mcus.html) fits perfectly with profiled attacks .

For all these analyses, *lascar (*Ledger’s Advanced Side-Channel Analysis Repository) has been used. We have recently open-sourced it [here](https://github.com/LedgerHQ/lascar/).

## KeepKey PIN verification mechanism

Before Trezor [patched](https://blog.trezor.io/details-of-security-updates-for-trezor-one-firmware-1-8-0-and-trezor-model-t-firmware-2-1-0-408e59dc012) their PIN-verification mechanism following our [previous side-channel attack on Trezor One PIN](https://donjon.ledger.com/Breaking-Trezor-One-with-SCA/), KeepKey already used a *protected* storage, where the sensitive content of the flash was encrypted by a `storage_key`, which is unwrapped by the user PIN.

A `wrapped_storage_key` and a `storage_key_fingerprint` are stored on the flash, along with the encrypted sensitive data.

The whole PIN-verification is implemented within the [storage_isPinCorrect_impl](https://github.com/keepkey/keepkey-firmware/blob/620052f166b3e34e6834dbae57cf607621eedd9d/lib/firmware/storage.c#L300) function, described in the following diagram.

![Overview of the PIN Verification Mechanism](/assets/keepkey-sca/kk.png)

Here is the source code (unrolled version):

```c
bool storage_isPinCorrect_impl(const char *pin, const uint8_t wrapped_key[64], const uint8_t key_fingerprint[32], uint8_t key[64]) {
    
    
    // derive wrapping key from the pin:
    uint8_t wrapping_key[64];
    sha512_Raw((const uint8_t*)pin, strlen(pin), wrapping_key);

    // unwrap the storage key stored in flash:
    uint8_t iv[64];
    memcpy(iv, wrapping_key, sizeof(iv));
    aes_decrypt_ctx ctx;
    aes_decrypt_key256(wrapping_key, &ctx);
    aes_cbc_decrypt(wrapped_key, storage_key, 64, iv + 32, &ctx);
    memzero(&ctx, sizeof(ctx));
    memzero(iv, sizeof(iv));

    // hash the storage_key:
    uint8_t fp[32];
    sha256_Raw(storage_key, 64, fp);

    // compare this hash with the key fingerprint stored in flash
    bool ret = memcmp(fp, key_fingerprint, 32) == 0;
    if (!ret)
        memzero(key, 64);
    memzero(wrapping_key, 64);
    memzero(fp, 32);
    return ret;
}
```



All the cryptographic functions used (AES-256 CBC, SHA-512, SHA-256) are implemented within [trezor-crypto library](https://github.com/KeepKey/trezor-firmware/tree/3740fa946d6486525f4239c824c5a6d78c4cb7f8/crypto), without side-channel protection. The final `memcmp` is the native `libc` implementation, also not protected against side-channels.

A first profiled side-channel attack will be mounted on the AES part and will expose `wrapped_storage_key`. A second one will target `memcmp` and will expose `key_fingerprint`.

Another important point is the Pin-Try Counter (PTC) mechanism. On KeepKey, there are no explicit PTC. But at every wrong PIN attempt, a timer is doubled, so that in the end one should expect to wait 136 years to request 32 wrong PIN in a row. 

We will need to take this countermeasure into account for our attacks, since we won't be able to request as many wrong PINs on the device as fast as we want. In order for the attack to be practical, we have to set a "time threshold" to pass the attack, before the KeepKey user realizes its device is lost and erases it.

From a side channel perspective, one PIN attempt results in a side-channel trace.

Given the fact that the PTC implements a timer, the side-channel robustness of the KeepKey PIN verification mechanism relies on two questions:

- How many attempts are needed to extract the wrapped_key processed during the AES-256?

- How many attempts are needed to extract the key_fingerprint during the `memcmp`?

## Side-channel setup

During all this study, we used a genuine KeepKey device with a modified firmware, allowing repeated calls to the targeted function: [storage_isPinCorrect_impl](https://github.com/keepkey/keepkey-firmware/blob/620052f166b3e34e6834dbae57cf607621eedd9d/lib/firmware/storage.c#L300)

We want to monitor the real-time power consumption of the MCU. In order to do that, we insert a shunt resistor between the GND of the MCU and the GND of the PCB. 

We actually used our evaluation board [scaffold](https://github.com/Ledger-Donjon/scaffold) to mount the attack, used to facilitate the setup and communication. As it can be seen on the following picture, the KeepKey device is running on scaffold, and its power consumption is measured through scaffold inner resistor and an oscilloscope.

![KeepKey device on Scaffold](/assets/keepkey-sca/scaffold.jpg)

To acquire the power consumption, a [PicoScope 6000 Series](https://www.picotech.com/oscilloscope/picoscope-6000-series) is used.

To drive the side-channel acquisition/processing of the data, we use our side-channel open-source library [lascar](https://github.com/Ledger-Donjon/lascar).

## Experimental results

The two attacks we mounted are very similar in the sense that they both are profiled side-channel attacks.
It means that the attacker has the opportunity to fully characterize the power consumption behavior during the targeted functions, on a device for which she controls the input. Once this profiling is done, she can use the profiling to match on new traces from a new KeepKey device for which the correct PIN is unknown.

For more information on profiled side-channel attacks use in this context, please refer to [our Trezor attack paper](https://eprint.iacr.org/2019/401.pdf): it explains the steps we take to mount such attacks:
- First, find a *proper sensitive* value and characterize it.
- Then, profile this *sensitive value* to build statistical classifiers on side channel traces from an open KeepKey device, with known varying secret.
- Finally, apply these classifiers on side-channel traces acquired from a new KeepKey device with unknown fixed secret.

We apply here the very same methodology, except that we target different *sensitive values* from the one used during the Trezor attack.


### Breaking trezor-crypto `AES` with a profiled side-channel attack

The first *critical* step of the [storage_isPinCorrect_impl](https://github.com/keepkey/keepkey-firmware/blob/620052f166b3e34e6834dbae57cf607621eedd9d/lib/firmware/storage.c#L300) function is the AES part. An AES-256 CBC decryption is called with:
- `SHA512(pin)` as key/iv (known values)
- `wrapped_storage_key` as input (unknown). The output of this AES is `storage_key`, on 64 bytes.

The purpose of this section is to try to mount a profiled side-channel attack able to extract the value of `storage_key` from KeepKey power traces.

To study the AES function used in the PIN verification, we extracted the AES part from [storage_isPinCorrect_impl](https://github.com/keepkey/keepkey-firmware/blob/620052f166b3e34e6834dbae57cf607621eedd9d/lib/firmware/storage.c#L300).

**IMPORTANT**: I insist on the fact that we want to retrieve the value of `wrapped_key`, which is the `input` of the AES, and not the encryption key (as it is done usually in an attack).

What we do first is to acquire a large set of power traces: 500K AES traces of 22500 time samples, where we set both the `key` and the `input` to known random values. We focus temporally on the first AES-256 round. This set of traces is called the *profiling set*.

#### Exhibiting a set of sensitive_values leading to a secret

We then exhibit a classical `sensitive_value`: the value for each trace, of a given byte of `round_key_14 XOR input` (where `round_key_14` is the value of the last round key derived from the AES-256 key). 
During the first round indeed, the `input` is first `XORED` with the `round_key_14`.

We use this `sensitive_value` to compute an [ANOVA](https://en.wikipedia.org/wiki/Analysis_of_variance) (using [NICV](https://eprint.iacr.org/2013/717.pdf)) over the *profiling set* of 500K power traces we acquired. It consists of   comparing the variance of the `sensitive_value` with the global variance of the power traces.
The following image shows the results of this ANOVA. On the upper part, the blue curve is the mean power leakage from the *profiling set*. On the lower part, the 16 NICV computed from the 16 `sensitive_values` (one per byte of `round_key_14`).

![ANOVA](/assets/keepkey-sca/anova_aes.png)

This shows a strong dependency (more than 10% for most bytes) between the variance of our `sensitive_values` and the captured power traces.

Every one of these 16 `sensitive_values` will be used for a profiled side-channel attack, each one targeting the value of an `input` byte.

#### Profiling

Once a sensitive_value function is chosen from the previous step, the profiling can be launched. Using the set of 500K traces, and the `sensitive_values`, one *classifier* per `input` byte is built.


A *classifier* is a decision function that is designed to predict, from a trace with unknown *input* value, the likelihood of the partition belonging. 

In simpler words, the *classifier* for byte *i* applied on a *power trace*  will answer the question: *what is the most likely value for `input[i] - round_key[i]`? Moreover, it gives the probability for each possible value of each candidate for `input[i]`* (since `round_key[i]` is known).

In profiled side-channel attacks, lots of types of classifiers can be used (Support-Vector Machines, Random Forests, Decision trees, AdaBoost, ... neural networks if you prefer deep learning).
In this very case, we used the simplest and fastest type of *classifier*: [Linear Discriminant Analysis](https://en.wikipedia.org/wiki/Linear_discriminant_analysis) (with [sklearn](https://scikit-learn.org/stable/modules/generated/sklearn.discriminant_analysis.LinearDiscriminantAnalysis.html) and [lascar](https://github.com/Ledger-Donjon/lascar)).
In order to get a faster (and more efficient) supervision phase, a Points of Interest (POI) selection is performed for each trace. The POI are selected using the leakage characterization. For each digit, only the points of leakage where the NICV is the highest are used.

#### Matching

We focus here on a single byte of input, but without loss of generality, the attack extends to every bytes.

The *profiling set* has been acquired from a KeepKey device where both the input and the key are known.

To validate the effectiveness of our profiling attack, we acquired 100 batches of 25 power traces such that the input is fixed within each set.

Each one of these batches is passed through the classifiers computed just before. What the following picture shows is the progression for the rank of the solution for the first byte of `input`, with respect to the number of traces given to the classifier. Every curve indicates the attack progression on one batch. The red curve with cross indicates the mean rank of the solution over all attacks.

![Matching](/assets/keepkey-sca/matching_aes.png)

**Reminder**: in the case of the KeepKey PIN verification mechanism, `input = wrapped_key`. Hence, every one of theses batches of 25 traces can be seen as traces acquired from a new KeepKey device PIN verification, where the `wrapped_key` is fixed.

Extending this attack to the 64 bytes of `wrapped_key` would then allow us to extract the whole value of `wrapped_key` within around 20 traces.

Regarding theses results, one should argue that:

- Due to the timer countermeasure implemented within [storage_isPinCorrect_impl](https://github.com/keepkey/keepkey-firmware/blob/620052f166b3e34e6834dbae57cf607621eedd9d/lib/firmware/storage.c#L300) function, acquiring 20 traces takes more than 24 days.
- 64 attacks in parallel must be set up to recover the 64 bytes of `wrapped_key`: this can lead to uncertainty if one of these attacks is less efficient than the others.

But on the other hand, these results can be improved by:
- spending times at optimizing the signal processing, 
- tuning advanced neural network to act as classifiers, 
- watching *sensitive_values* over inner AES rounds,
- work with electromagnetic emanations.

### Breaking `memcmp` with a profiled SCA

The final step of the [storage_isPinCorrect_impl](https://github.com/keepkey/keepkey-firmware/blob/620052f166b3e34e6834dbae57cf607621eedd9d/lib/firmware/storage.c#L300)  function is the `memcmp` part.

The output of the AES-256 CBC part is hashed (with SHA-256) and compared with `key_fingerprint` (stored on KeepKey flash)

The profiled attack on `memcmp` is basically the same. We only use a different `sensitive value`.

What happens in `memcmp` is that 2 buffers (`buffer0` and `buffer1`) are compared, byte per byte. In order to make a comparison, a subtraction is done.

Here is a source code for `memcmp`:

```c
int memcmp (const void * buffer0, const void * buffer1, size_t count)
{
  const unsigned char *s0 = (const unsigned char*)buffer0;
  const unsigned char *s1 = (const unsigned char*)buffer1;

  while (count-- > 0)
    {
      if (*s0++ != *s1++)
	  return s0[-1] < s1[-1] ? -1 : 1;
    }
  return 0;
}
```

**Note:** One should notice that the native `memcmp` function is not time constant: the function exits as soon as there is a byte that differs. Although this flaw will not be used in here, it could lead to other timing side-channel attacks.

For our PoC, we choose to use as a `sensitive value`:  `buffer0[0]-buffer1[0]`. It is indeed what is computed during the `s0[-1] < s1[-1] ? -1 : 1` statement.

Again we acquired 500K traces with known random values for `buffer0` and `buffer1`. This is our *profiling set* for the attack.

As before we compute the ANOVA using the sensitive value just described:

![ANOVA on memcmp](/assets/keepkey-sca/charac_memcmp.png)

One can notice that the computed ANOVA values are higher than for AES. NICV reaches more than 50%. These results show a stronger dependency than for the AES, and imply that the attack should be easier (i.e. the attack should need fewer traces to conclude).

The profiling part is done in exactly the same way as for AES.

For the matching part, we acquired 100 batches of 25 power traces such that the `buffer1` is fixed within each set (since `buffer1 = key_fingerprint` in our case).

Each one of these batches is passed through the classifiers computed just like before. What the following picture shows is the progression for the rank of the solution for the first byte of `buffer1`, with respect to the number of traces given to the classifier. The red curve with cross indicates the mean rank of the solution over all attacks.

![Matching on memcmp](/assets/keepkey-sca/matching_memcmp.png)


We then can see that our profiled attack needs no more than 8 traces to extract the correct value of `buffer1[0]`.

**Reminder**: in the case of the KeepKey PIN verification mechanism, `buffer1 = key_fingerprint`. Hence, every one of theses batches of 25 traces can be seen as traces acquired from a new KeepKey device PIN verification, where the key_fingerprint is fixed.

Without loss of generality, similar profiled attacks targeting the 32 bytes of `key_fingerprint` will then allow us to extract its whole value within 8 traces.

## Putting all together: PIN extraction

This article presents a PoC on how to retrieve the user PIN from side-channel traces coming from a locked KeepKey device.

Applying to this device the two profiled side-channel attacks presented here, by only using around 12 PIN attempts, we get, with a good success rate:

- `wrapped_key` from the attack on AES,

- `key_fingerprint` from the attack on `memcmp`.

We can now mount an off-line brute-force, which will test each PIN on `wrapped_key` until the resulting `storage key` produces the correct `key_fingerprint`. Testing all the possible PIN (up to 9 digits) within a simple script takes around 10 minutes on a single thread.

```python
from time import perf_counter
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes

# Test vector for PIN=5555
WRAPPED_STORAGE_KEY = b"\x1b\xff\x8575\x86=<\x96\xc0\x10\xb3#\x02\x84\xba\x1dG\xd2PO\xf7\x1d\x1f\xbd&@\xe9\xd7\x12)\x9b\x99r\x18s\x16\xb2-U\xee|\xe8\xbbJ\xa0\xe11|nf\xe8\n\xaf\x86\x9f\x84\x99z]\x05\xca#\xd5"
STORAGE_KEY_FINGERPRINT = b"\xd2\x87C\xfd\xa4\xd5\xab/D\x87\xc9\xfe\xd0\xb0\xfd\xc9\xa2\x9f\xb4\xf4\x99r\xfa\x0c\xc3\xa5\x079](\xb0|"

def bruteforce(wrapped_key: bytes, fingerprint: bytes, max_pin_digits=8) -> str:
    backend = default_backend()

    for i in range(10 ** max_pin_digits):
        pin = str(i)
        if "0" in pin:
            continue

        digest = hashes.Hash(hashes.SHA512(), backend=backend)
        digest.update(pin.encode())
        wrapping_key = digest.finalize()

        cipher = Cipher(
            algorithms.AES(wrapping_key[:32]), modes.CBC(wrapping_key[32:48]), backend,
        )
        decryptor = cipher.decryptor()
        storage_key = decryptor.update(wrapped_key) + decryptor.finalize()

        digest = hashes.Hash(hashes.SHA256(), backend=backend)
        digest.update(storage_key)
        if digest.finalize() == fingerprint:
            return pin

def main():
    print(f"Brute-forcing all pin with {MAX_PIN_DIGITS} or less digits...")

    start = perf_counter()
    pin = bruteforce(WRAPPED_STORAGE_KEY, STORAGE_KEY_FINGERPRINT)
    stop = perf_counter()

    if pin:
        print(f"Brute-forcing SUCCESS with pin {pin} in {stop - start:f}s.")
    else:
        print(f"Brute-forcing FAILED with {MAX_PIN_DIGITS}-digits pin in {stop - start:f}s.")

if __name__ == "__main__":
    main()
```



## Conclusion

The work presented in this blog post has been disclosed to ShapeShift on December 16, 2019.

We do not claim to have *broken* KeepKey hardware wallet with side-channel. This side-channel attack is even considered as *minor* when compared to other [attacks](https://donjon.ledger.com/Unfixable-Key-Extraction-Attack-on-Trezor/) we found on STM32 devices (since we only extract the PIN in this post).

We just want to state that whenever *sensitive secrets* are manipulated within a hardware security device, it should be done with proper care to prevent hardware attacks, especially when the target is a non protected microcontroller.

In the side-channel literature there are a lot of techniques, hacks and tricks to annihilate this class of attack. For instance, for the AES part, we recommended ShapeShift to take a look at the [SecAESSTM32 repository](https://github.com/ANSSI-FR/SecAESSTM32). The project aims at proposing a C library to perform AES routines on 32-bit Cortex-M4 ARM architecture while taking side-channel attacks into account. The [technical report](https://github.com/ANSSI-FR/SecAESSTM32/blob/master/doc/technical-report/technical_analysis.pdf) gives a great description of the work done.

ShapeShift adapted the SecAESSTM32 library for Cortex-M3 to handle the side-channel on AES. They also replaced `memcmp` with [`memcmp_s`](https://github.com/keepkey/keepkey-firmware/blob/master/lib/board/memcmp_s.c), a constant-time implementation. A new firmware, 6.4.1, has been issued and correctly patches the vulnerabilities.
