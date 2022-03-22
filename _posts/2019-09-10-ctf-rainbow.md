---
layout: post
title: Ledger's CTF 2018 and side-channels 
summary: Solving Ledger's whitebox challenge with Side-Channel attacks
description: Solving Ledger's whitebox challenge with Side-Channel attacks 
featured-img: unicorn
author: Victor Servant
categories: [Donjon]
---

# Solving Ledger's CTF2 with Side-Channel attacks

In this article we will showcase one use of our tool named [Rainbow](https://github.com/Ledger-Donjon/rainbow): breaking a 'whiteboxed' AES encryption using [Differential Computation Analysis](https://eprint.iacr.org/2015/753).

Rainbow will be used to trace the execution of the target program and Lascar will perform the side-channel attack part to retrieve the key.

## The CTF2 Challenge

The target program is part of a [CTF](https://www.ledger.com/ctf-complete-hw-bounty-still-ongoing-2-337-btc/) organized by Ledger in 2018. You can find it [here](https://github.com/LedgerHQ/CTF/blob/master/ctf2018/CTF2/ctf2). It is a 'simple' password-checking program which encrypts the user input with some key embedded in it, and matches the result with a predefined value. It was designed by [Charles Guillemet](https://twitter.com/P3b7_).

Our goal is to retrieve the password which encrypts to the value checked by this program. There are several ways of doing so but we will focus on emulated side-channels.

## What's in the whitebox?

The executable implements an AES128 encryption with several countermeasures specifically designed to make side-channel analysis difficult:

- Random masking of intermediate results
  * Every computation performed on a variable $a$ is replaced by separate computations on $a \oplus m$ and $m$, the latter being a random value chosen at runtime.
- Shuffling with dummy executions 
 * Some AESs are executed but their results do not affect the output of the program, which allows for the shuffling of AES sub-operations at runtime.

The binary also had an integrity check that would prevent basic modifications like inserting a modified version of the `rand()` function into the binary through [LIEF](https://lief.quarkslab.com/).

> After setting up a basic emulator through [Unicorn](http://www.unicorn-engine.org/) with the help of Rainbow, we will detail what each of those countermeasures does, and how to bypass them.

The challenge binary can be called like so `./ctf2 00112233445566778899aabbccddeeff`, the first and only argument being the password in hex format.

Some reverse engineering first to identify the target. I will be using Binary Ninja but the same work can be done with IDA or Ghidra. As this is an x64 Binary, the free version of IDA would do.
If you would rather look at the sources, they were published [here](https://github.com/LedgerHQ/CTF/tree/master/ctf2018/CTF2/src).

A first look at the `main` function shows the binary is not stripped.
Switching to the 'Exports' section of the triage view, we can see there's even a symbol for the sboxes, the round constants `rcon` and multiplication tables that we are used to find in various software implementations of AES (`mul2`, `mul3`).

<p align="center">
<img src="/assets/ctf2rainbow/exports_triage_view.png">
</p>

Great! That means we can just fetch the sboxes (which hold a keybyte each) within the binary and invert each of the 16 sboxes used in the first round to get the key, like [Eric Dangereux](https://github.com/LedgerHQ/CTF/blob/master/ctf2018/CTF2/ctf2_EricDangereux.py) for example. But here we're going to try side-channels, because this challenge uses countermeasures specifically against those, and showing how you get rid of those in a whitebox setting can prove useful.

The only important information we need to start off can be seen from the AES output and comparison part, as well as the input scanning.

<p align="center">
<img src="/assets/ctf2rainbow/input.png">
</p>

In the image above, we can see `strtol` being called on a byte that comes from user input (the hexadecimal string argument) and copied 15 times in 15 different buffers. Why 15?
Before we continue investigating, we'll set up a basic emulator to execute the function and observe what is going on.
 
### Setting up Rainbow

Importing an x64 emulator and loading the binary goes like this:

```python
from rainbow.generics import rainbow_x64
e = rainbow_x64()
e.load("ctf2", typ=".elf")
```

Now we need to set up arguments, and we will start executing directly at the `main` function. As we see from [the description of the challenge](https://github.com/LedgerHQ/CTF/blob/master/ctf2018/README.md), this program expects one argument, a hexadecimal string.

Setting up those at chosen addresses can be done like so:

We pick those two addresses arbitrarily (outside of already occupied ranges, of course):

```python
input_buf = 0xCAFE1000
argv = 0xCAFE0000
```

Fill the input buffer with whatever comes to mind...

```python
e[input_buf] = b"00112233445566778899aabbccddeeff"
```

And finally, as the hex string is passed when calling from the command line, it corresponds to `argv[1]`. We place the address pointing to the input and setup `rdi` and `rsi` accordingly:

```python
e[argv + 8] = input_buf
e["rdi"] = 2  # argc
e["rsi"] = argv
```

We could try running it now, but it will stop after 15 instructions complaining about jumping at an address containing garbage. This is due to an external call to `time` (and later `srand`), which we need to deal with manually. Hopefully, this will be very quick, because we can simply skip over those.

Rainbow allows to hook library calls because _Unicorn_ provides means to hook blocks, and _LIEF_ gives us the location of those functions when we load the binary.
If Unicorn jumps into one of those addresses, we redirect the execution to python and perform a manual return.

A bypass will look like this:

```python
def bypass(emu):
  return True

e.stubbed_functions['time'] = bypass 
e.stubbed_functions['srand'] = bypass
```

The `emu` parameter is a Rainbow instance. Everytime the execution hits the virtual address of the `time` or `srand` functions, we execute the associated function, passing it the whole instance, meaning it can access everything in memory, although we don't make use of it for our bypass. Returning `True` will tell Rainbow to perform a manual return to the caller. Returning `False` would have resumed execution where the hook was called.

Now let's try running it, with function calls and memory read/writes shown:

```python
e.mem_trace = True
e.function_calls = True
e.start(e.functions['main'], 0, count=100)
```

The result (part of it at least):

<p align="center">
<img src="/assets/ctf2rainbow/output_firstexec.png">
</p>

which executes the fetch of the user input.
But then we hit `strtol`. This function takes an hexadecimal character and returns its byte value. We can easily recode its behaviour in python.

```python
def pystrtol(emu):
  ad = emu['rdi']
  emu['rax'] = int(emu[ad:ad+2], 16)
  return True

e.stubbed_functions['strtol'] = pystrtol
```

Now this will execute further and stop on some more external calls: `rand()` and `clock_gettime()`.
For now, we skip over `clock_gettime()` and simulate `rand()`:

```python
from random import getrandbits
def pyrand(emu):
  emu['rax'] = getrandbits(8)
  return True

e.stubbed_functions['clock_gettime'] = bypass 
e.stubbed_functions['rand'] = pyrand
```

Final step: this binary has some C++ functions before getting into what we can presume to be the real AES execution, roughly between addresses `0x103c` and `0x10ba`. We are going to cheat again and skip over, because those functions are going to be hairy to reimplement.

Looking at the variable name `crc` in this area and the fact that the binary's code start address is passed to a stream iterator used to compute that crc, we can guess that this is an integrity check on the binary, and it should not affect our side-channel attack too much if we skip over.

```python
e.trace = 0
e.start(e.functions['main'], 0x103c)
e.start(0x10ba, 0)
```

(sidenote: if the execution stops too soon during the second start, add a `print('something')` right before it. There's a weird bug in Rainbow or Unicorn there...)

This executes until the end of the program and will print `"**** Login Failed *********"` if we hook `puts`. Below is a very simple version:

```python
def pyputs(emu):
  src = emu['rdi']
  i = 0
  c = emu[src]
  while c != b'\x00':
    print(chr(c[0]), end='' )
    i += 1
    c = emu[src+i]
  return True
```

Now that we have an emulator that works, we can start looking at what is going on dynamically. The resulting script can be found [here](https://github.com/Ledger-Donjon/rainbow/tree/master/examples/ledger_ctf2/draft.py).

### The 15 outputs

Earlier we noticed that the input was copied into 15 different buffers. If we 
try to find out what is going on at the end of `main`, we can see this:

<p align="center">
<img src="/assets/ctf2rainbow/output_xor.png">
</p>

Out of curiosity, we will stop execution at address `0x1151` and display the contents of those outputs:

```python
...
e.start(0x10ba, 0x1151)

from binascii import hexlify

ofs = 0xd03660
for i in range(0, 16*15,16):
  print(hexlify(e[ofs+i:ofs+i+16]))
```

and we get, using `b"00112233445566778899aabbccddeeff"` as input:

```
b'7edddc0f00019e5dac4fa356a15e5454'  #1
b'90501a8ddae6bed183752feae5769bb3'  #2
b'917427f4ee0e79b08c8e7d284234ef62'  # ...
b'a2f6663c08c51b6af253bab1e8ab65a2'
b'55e23ec1d94c853439617074bf367507'
b'a11021efcb356e9481716c034c4a26fd'
b'6902b65a97aa58fc84ee043e1856630a'
b'6561a3a64d46a13bcceb2a6ae9bb82da'  # <= this
b'7edddc0f00019e5dac4fa356a15e5454'  #1
b'90501a8ddae6bed183752feae5769bb3'  #2
b'917427f4ee0e79b08c8e7d284234ef62'  # ...
b'a2f6663c08c51b6af253bab1e8ab65a2'
b'55e23ec1d94c853439617074bf367507'
b'a11021efcb356e9481716c034c4a26fd'
b'6902b65a97aa58fc84ee043e1856630a'
```

Surprise! There are 7 values that appear twice, and only the seventh one appears once. As all those results are XOR-ed together, this means the 'real' AES is the seventh one, and all the other ones do not change the output and are only here as an instance of the shuffling countermeasure. 
This program starts 15 AES together and picks a random round sub-function to execute in a loop.

Out of curiosity, we can look at the `schedule()` function which actually handles the AES computation, and we can see that it has a virtual-machine like control flow, and that the dispatcher calls `rand()` every time. 

<p align="center">
<img src="/assets/ctf2rainbow/schedule_func.png">
</p>

This is where this shuffling occurs, because quickly looking at the branches inside this function, we can recognize the different AES subfunctions (shiftrows, SubBytes, MixColumns). 
It tells us that it's really a good idea to turn off the randomness so as to always execute the same sequence. More specifically, making sure `rand()` always returns `7` will force the binary to execute only the AES we are interested in.
One more detail is that this dispatcher, once an AES is completely finished, waits for a random value that is different from the index of the finished AES(s), so for a first test, we're better off using a 'real' random.

### A first trace

Let's turn the side-channel tracing on. This happens at the initialization of the Rainbow instance:

```python
e = rainbow_x64(sca_mode=True)
```

If it is still there, comment out `e.trace = 0` otherwise nothing will happen.
At the end of the script, append the following:

```python
from rainbow.utils import plot
trace = (np.array(e.sca_values_trace) & 0xffffffff).astype(np.uint32)
plot(np.array(trace))
```

(the second line has some bits that aren't usually necessary, but as some operations involve SSE registers that are 128 bits large, numpy cannot convert them as `int`s, so we truncate them by using only the lower 32 bits).

And here is the beginning of the AES, with a massive Y-scale (5e9!).

<p align="center">
<img src="/assets/ctf2rainbow/trace_basic.png">
</p>
_<center>An execution trace for the emulated AES.</center>_

The trace in its entirety is huge (520 000 points/instructions traced), and it is all too slow to emulate so far. We'll fix this later with some tricks.

### The masking countermeasure

Going back to the `schedule()` function we spot another call to `rand()`, and filling tables called `mask`, `mask3`, `shiftedmask`. So it appears to be a case of random masking countermeasure, although we cannot identify any Sbox masking/recomputation. Actually, there are no real space requirements for the program, so we suspect there are 256 versions of each sbox available, depending on the used mask.
Instead of trying to confirm this with more reversing, we will just assume the `rand()` function needs to be hooked and forced to output `0` everytime for this part of the execution.   

With the masks constant, the side-channel attack (CPA or DPA) should succeed. Another option is also to skip the execution of this code portion entirely: by default the memory will be initialized to `0`, which is exactly the value those tables would contain at every index if we had picked `mask = 0`.
In our simplified solution script [ripped2.py](https://github.com/Ledger-Donjon/rainbow/tree/master/examples/ledger_ctf2/ripped2.py) we chose the latter solution.

## The side-channel attack

The hexadecimal password we need to input can be found by going backwards from the point where `"**** Login Successful ****"` is printed, which is at address `0x13f7`. This message is printed after a sequence of 16 comparisons performed byte-by-byte on the result of the AES encryption of the user input.

<p align="center">
<img src="/assets/ctf2rainbow/cipher_comparison.png"> 
</p>

We can see what the expected encrypted message is: `0x13376942` repeated four times. So the correct password is the decryption of this value under the key that we will retrieve through side-channel analysis.


To this end we will apply a standard Sbox-output attack. That is, a correlation power analysis ([CPA](https://www.iacr.org/archive/ches2004/31560016/31560016.pdf)) on the value `AES_SBOX[input[i] ^ k]` with 256 hypotheses on `k`.
The resulting trace with the highest peak 'wins' and its corresponding index `k` gives us one keybyte. We repeat this for all 16 `i`.

---

### Short note on CPA

The [Pearson Correlation](https://en.wikipedia.org/wiki/Pearson_correlation_coefficient) is a measure of how to sets of values (in proper terms, two _random variables_) linearly relate to each other. Those two variables do not need to be defined on the same set, nor have the same variance, which allows to compare, for example, an integer variable that is the set of predicted values for `SBOX[input[i] ^ k]`, with an power consumption trace from an oscilloscope (floating-point numbers).

Using this correlation for an attack is comparing the sequence of _predictions_ on intermediate values (the first-round Sbox outputs) for all 256 possible keybytes, to the same sequence of _traced_ values. The closer to 1.0 the correlation score, the more likely the keybyte is.

---

[Lascar](https://github.com/Ledger-Donjon/lascar/) will help us do that.
The code snippet that follows is how we express this attack using Lascar.
`traces` is the variable were we will store the execution traces obtained with Rainbow and `values` contains the corresponding input passwords that were selected randomly for each trace.

```python
from lascar import Session, CpaEngine, ConsoleOutputMethod
from lascar.container import TraceBatchContainer
from lascar.tools.aes import sbox

t = TraceBatchContainer(traces, values)

s = Session(t, output_method=ConsoleOutputMethod())
s.add_engines(
    [
        CpaEngine(f"cpa{i}", lambda v, k, z=i: sbox[v[z] ^ k], range(256))
        for i in range(16)
    ]
)
s.run()
```

In order to get small traces that are faster to emulate and faster to process/attack, we will force the binary to execute only the first round of the correct (seventh) AES.

From the previous analysis, we now what we have to do:

- force masks to be 0
- force `rand()` to always output 7 during `schedule()`
- stop emulating beyond the first round

To do this, we can bypass the `rand()` function during the first part of the emulation, and once we enter the `schedule()` function, stick it to 7:

```python
def pyrand(emu, val):
  emu['rax'] = val
  return True

e.stubbed_functions['rand'] = lambda emu:pyrand(emu,0) 
e.start(e.functions['main'], 0x103c)
e.stubbed_functions['rand'] = lambda emu:pyrand(emu,7) 
e.start(0x10ba, 0x1151, count=5000)
```

You can see the result [here](https://github.com/Ledger-Donjon/rainbow/tree/master/examples/ledger_ctf2/draft.py), with a display at the end. This script was intended as an exploration script for testing that the emulation works correctly even with some hooking. 

To get fully ready for the side-channel part, we just need to make sure the state is reset between calls, and the cleanest way to do that is first packaging this whole fragmented emulation into a single function.

Fast-forwarding a bit, we can look at the original scripts I used for the attack (with a bit of dusting): [ledger_ctf2.py](https://github.com/Ledger-Donjon/rainbow/tree/master/examples/ledger_ctf2/ledger_ctf2.py) and [ripped2.py](https://github.com/Ledger-Donjon/rainbow/tree/master/examples/ledger_ctf2/ripped2.py)

`ripped2.py` contains the emulation packaged as a function that takes one single input, the password (or plaintext). `ledger_ctf2.py` handles the general logic of the attack: 

- pick a random plaintext
- call the emulator from a blank state
- gather the resulting trace

and then trim the traces and launch the Correlation attack.

This script gathers 80 traces (less than that and not all bytes are found), containing only the first round of the correct AES, and the side-channel part executed right afterwards.

If we look at the CPA results for byte 4, highlighting the expected key byte, we get this at 40 traces:
<p align="center">
<img src="/assets/ctf2rainbow/cpa3_40traces.png"> 
</p>
_<center>CPA results for third sbox output and 40 traces. Correct key hypothesis is in bright green</center>_

Not much to see, no clear peaks. However if we use 80 traces:

<p align="center">
<img src="/assets/ctf2rainbow/cpa3_80traces.png">
</p>

One can see clear peaks at around 3250, 4000 and 4750.

Once we do this for all key bytes, the result is:  `f0 33 1c e0 26 6a da ce 86 a8 a1 3b fa 14 67 40` 
and if we decrypt `0x13376942133769421337694213376942` with this key, we get:

```python
>>> from Crypto.Cipher import AES
>>> from binascii import hexlify, unhexlify
>>> c = AES.new(unhexlify("f0331ce0266adace86a8a13bfa146740"), AES.MODE_ECB)
>>> print(hexlify(c.decrypt(unhexlify("13376942"*4))))
b'0ab7982c0ec65fc9c2412d527470d768'
```

`0ab7982c0ec65fc9c2412d527470d768` being is the correct answer. 

(Inputting this into our emulator will still print `Login Failed` : this is because we do not inject the correct CRC into memory and this changes the end ciphertext.)

## Summary

A list of the some the hurdles implemented in this binary and how this method circumvents them:

- Random masking+shuffling: hooking the call to `rand()` gives full control
- Integrity-check of the binary: we can skip over this part. Also, we never had to modify the code, so this check would have passed anyway had we reimplemented the stream iterators.
- Antidebug timing checks: `clock_gettime()` is used to check whether any operation is longer than some threshold. As we are bypassing it, from the binary's viewpoint time is stuck to 0.

