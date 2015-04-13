1802js
======

An JavaScript emulation of RCA CDP1802 CPU

Used in all emulations at [ASM80 online IDE](http://www.asm80.com)

You can use 1802js also as Node.js or AMD module.

Usage
-----

(a.k.a. The API)

- *window.CPU1802* - main object (instantiated at the start - it shall change)
- *CPU1802.init(memoryTo,memoryAt,ticker, portTo, portAt, setQ)* - Initializes the whole system. All parameters are callback functions for port / memory access:
	- memoryTo(addr,value) - store byte to given address
	- memoryAt(addr) - read byte from given address
	- ticker(T) - unused now. For future use
	- portTo(addr,value) - write byte to given port
	- portAt(addr, D) - read byte from given port, D is the value CDP sends to bus during INP
	- setQ(value) - a callback for catching Q changes
- *CPU1802.T()* - returns clock ticks count from last init (or reset)
- *CPU1802.reset()* - does a CPU reset
- *CPU1802.set(register, value)* - sets internal register (named PC (=R(P)), SP (=R(X)), D, X, Q, EF1-EF4, R0-RF, DF) to a given value (SP means R(X), it's for compatibility)
- *CPU1802.status()* - Returns a object {pc, sp, d, x, q, df, ef1..ef4, r0..rf} with actual state of internal registers
- *CPU1802.steps(N)* - Execute instructions as real CPU, which takes "no less than N" clock ticks.- *CPU1802.steps(N)* - Execute instructions as real CPU, which takes "no less than N" clock ticks.
- *CPU1802.interrupt()* - Perform an INTERRUPT operation (X=2, P=1, IE=0, save status in T) 
- *CPU1802.dmaOUT()* - Perform a DMA operation (returns value in memory at R0, R0++);
- *CPU1802.dmaIN(value)* - Perform a DMA operation (store value in memory at R0, R0++);
- *CPU1802.disasm(i,a,b,pc)* - Disassembly instruction. You have to provide 4 bytes - first one is an instruction code, second and third are parameters (they can be omitted when instruction is single byte or two bytes), fourth is PC value (for short branch). It returns an array of two elements: the first is instruction mnemonics, the second is an instruction length.


Tests
-----

1802js is slightly tested with qUnit - just a basic functionality at this moment
