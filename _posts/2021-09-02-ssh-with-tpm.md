---
layout: post
title: "Protecting SSH keys with TPM 2.0"
summary: "Using a Trusted Platform Module to store SSH keys on Linux"
description: "Using a Trusted Platform Module to store SSH keys on Linux with tpm2-pkcs11"
featured-img: tpm-ssh
author: Nicolas Iooss
categories: [Donjon]
---

# Protecting SSH authentication with TPM 2.0, now available on Debian

## Introduction

SSH is one of the protocols which are widely used on the Internet: developers use it to push code on a git server (such as [GitHub](https://github.com)), system administrators use it to connect to remote consoles in a secure way, some users use it as a VPN solution (thanks to TCP connection forwarding), etc.

In this protocol, users are required to be authenticated.
They can do this with passwords, files containing private RSA keys, hardware devices such as [Ledger Nano S and Ledger Nano X](https://blog.ledger.com/ssh/), etc.

Some authentication means are more secure than others: using a hardware device designed to store a private key without making it possible to ever extract it is more secure than storing the private key in a file.
Unfortunately the most secure ones are also more painful to use.
Users who have their keys on a device need to carry the device with them, need to type their PIN code every time they initiate a SSH session, etc.
This makes it quite difficult to advocate ways more secure than passwords and files for use cases where the security of the access is not the priority.

So the question is: is it possible to store the authentication material more securely than in a file (which can be stolen by some malware), without changing the user experience?

And the answer is: yes, using a TPM!

## Some history

For quite some time, computers have been able to directly embed a security chip.
This chip, named Trusted Platform Module (TPM), provides many features including the ability to protect private keys used in public-key cryptography.

As it is embedded in computers, there is no need to plug a device in the computer in order to use it.
This is therefore considered as less secure than a hardware device which can be stored in a different place from the computer (this enables enforcing the principle that while the device is not connected to the computer, no malware can use the secrets stored in it).

So TPM is not the "best security", but it is still much more secure than using files such as `$HOME/.ssh/id_rsa` to store private keys.

How can TPM be used with OpenSSH on Linux?
With a project named `tpm2-pkcs11`, following instructions available on many websites for many years, including on the [official documentation from its code repository](https://github.com/tpm2-software/tpm2-pkcs11/blob/1.6.0/docs/SSH.md).

Now, what's the news?
This software is now finally packaged in Ubuntu and Debian, which makes it finally available to most Linux users!

More precisely here is a timeline:

* In 2014, the main specifications for TPM 2.0 were published.
  To interact with a TPM from the software, there was a standardization effort, and two incompatible software stacks were created: the one from the Trusted Computing Group (TCG), called [TPM Software Stack](https://tpm2-software.github.io/) (TSS), and the one from IBM, also called [TPM Software stack](https://sourceforge.net/projects/ibmtpm20tss/).
* In 2018, the project [`tpm2-pkcs11`](https://github.com/tpm2-software/tpm2-pkcs11) was created to provide a PKCS#11 interface to a TPM 2.0, using TCG's TSS.
  [PKCS#11](http://docs.oasis-open.org/pkcs11/pkcs11-base/v2.40/os/pkcs11-base-v2.40-os.html) is a standard which defines an Application Programming Interface (API) named *Cryptoki* to use tokens storing cryptographic keys.
  As OpenSSH supported using a PKCS#11 interface to perform user authentication, this enabled using TPM to store the keys used for SSH authentication.
* In February 2019, `tpm2-pkcs11` was added to [Fedora 29](https://src.fedoraproject.org/rpms/tpm2-pkcs11/history/tpm2-pkcs11.spec?identifier=f29).
* In September 2019, CentOS 8 was released with this package.
* In April 2020, `tpm2-pkcs11` was added to [Debian sid](https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=942091#20).
  Unfortunately it did not contain the program `tpm2_ptool` which is necessary to easily create keys. This issue was reported in [Debian bug #968310](https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=968310).
* In January 2021, Debian's package was [fixed](https://salsa.debian.org/debian/tpm2-pkcs11/-/commit/f76eb1d484dea1a38d0ad3fbdca779f84d1d924) (and the maintainer acknowledged my help!).
* In April 2021, Ubuntu 21.04 *Hirsute Hippo* was released with [the fixed package](https://packages.ubuntu.com/hirsute/libtpm2-pkcs11-tools).
* In August 2021, Debian 11 *Bullseye* was released with [the fixed package](https://packages.debian.org/bullseye/libtpm2-pkcs11-tools)

Now `tpm2-pkcs11` is available on Debian, Ubuntu and several other Linux distributions listed on [Repology](https://repology.org/project/tpm2-pkcs11/versions).

## Using tpm2-pkcs11

On Debian 11, here are the steps to generate and use a new SSH key stored securely by the TPM:

1. Install command `tpm2_ptool` and library `libtpm2_pkcs11.so.1`, which are provided by two packages:

    ```shell
    sudo apt install libtpm2-pkcs11-tools libtpm2-pkcs11-1
    ```

1. Check that the system can use a TPM 2.0. If one of the following checks fails, it could mean that the system does not have a TPM, or has a TPM 1.2, or has a TPM 2.0 which is disabled in the BIOS settings:

    * Check whether `/dev/tpm0` exists
    * Check whether the command `tpm2_getcap properties-fixed` displays some data

1. Add the current user to the group which can access the TPM device `/dev/tpmrm0`. On Debian and Ubuntu, users need to belong to a group named `tss` (thanks to configuration provided by [`tpm-udev` package](https://packages.debian.org/bullseye/tpm-udev)). The following command adds the current user to this group:

    ```shell
    sudo usermod -a -G tss "$(id -nu)"
    ```

1. Initialize a user store, protected by a password and a *SOPIN* and create a key, for example an Elliptic Curve key on the curve named "NIST P-256" (also known as "secp256r1"):

    ```shell
    tpm2_ptool init
    tpm2_ptool addtoken --pid=1 --label=ssh --userpin=MySecretPassword --sopin=MyRecoveryPassword
    tpm2_ptool addkey --label=ssh --userpin=MySecretPassword --algorithm=ecc256

    # (in order to generate RSA keys, use --algorithm=rsa2048 instead)
    ```

    The acronym *SOPIN* means *Security Officer Personal Identification Number* and is a concept from PKCS#11's specification.
    In simple use cases, it may be seen as a "recovery password" which enables modifying the password when for example it has been lost.

1. Display the public key of this new key:

    ```shell
    ssh-keygen -D /usr/lib/x86_64-linux-gnu/libtpm2_pkcs11.so.1
    ```

1. Configure the new public key in a server, for example by writing it in `$HOME/.ssh/authorized_keys` or in GitHub's account settings or in any other location where SSH public keys are used.

1. Configure the SSH client to use `tpm2-pkcs11` to connect to the server, for example by writing this in `$HOME/.ssh/config` (client side):

    ```text
    Host server
        PKCS11Provider /usr/lib/x86_64-linux-gnu/libtpm2_pkcs11.so.1
        PasswordAuthentication no
    ```

1. Connect to the server (N.B. the previous step can be skipped:

    ```shell
    ssh server

    # It is also possible to specify the tpm2-pkcs11 library directly
    ssh -I /usr/lib/x86_64-linux-gnu/libtpm2_pkcs11.so.1 server
    ```

<script id="asciicast-E6FgBwuRdA0W8OYJNTpZnB15g" src="https://asciinema.org/a/E6FgBwuRdA0W8OYJNTpZnB15g.js" async></script>

## Future work

The previous section presented how to create a new key in the TPM.
While this enables using a TPM to protect SSH authentication, there are two features which are needed to make this a real alternative to using files to store private keys:

* Feature #1: importing existing SSH keys into a TPM instead of creating new ones (which enables smooth transition to TPM storage, backing up the keys, in case the computer is broken or lost, etc.).
* Feature #2: using SSH keys without password, like unprotected private key files (this feature is more secure than key files as the protected key cannot be extracted from the TPM).

I implemented both features in `tpm2-pkcs11` and submitted them in Pull Requests [#681](https://github.com/tpm2-software/tpm2-pkcs11/pull/681) and [#695](https://github.com/tpm2-software/tpm2-pkcs11/pull/695).
Feature #1 was also presented in May during the weekly online call of [tpm.dev community](https://developers.tpm.dev/events) and the recording is available on <https://developers.tpm.dev/posts/14389750>.

So both features are likely to become available in a future release of `tpm2-pkcs11`.

By the way, for curious readers who want to understand the internals of `tpm2-pkcs11`, I published an article about them at SSTIC 2021 conference, named [Protecting SSH authentication with TPM 2.0 (article in English, presentation in French)](https://www.sstic.org/2021/presentation/protecting_ssh_authentication_with_tpm_20/).
Moreover readers who want to try things without touching a real TPM could be interested in the section "Emulating a TPM 2.0" of this article.

<sub>(Illustration: [Rainer Knäpper, Free Art License](https://commons.wikimedia.org/wiki/File:Header_TPM_module_onboard_IMGP6409_wp.jpg))</sub>
