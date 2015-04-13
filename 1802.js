(function(name, definition) {
    if (typeof module != 'undefined') module.exports = definition();
    else if (typeof define == 'function' && typeof define.amd == 'object') define(definition);
    else this[name] = definition();
}('CPU1802', function() {


var     
    T=0,

    P = 0,
    X = 0,
    D = 0,
    DF = 0,
    IE = 0,
    idle=0,
    regT = 0,

    Q = 0,
    EF1=0,EF2=0,EF3=0,EF4=0,
    
// regs & memory

    r = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], //R0-R15
    breakFlag=false,
    excycles, addcycles;

var byteTo, byteAt, ticks, portOut, portIn, setQ,
wordAt = function(addr) {
	return byteAt(addr)*256+byteAt(0xffff&(addr+1));
},
wordTo = function(addr, data) {
	byteTo(addr,(data>>8)&0xff);
	byteTo((addr+1)&0xffff,data&0xff);
},


cycletime = [0,2,0,0,0,0,2,2,4,4,2,2,2,2,2,2,2,2,0,0,0,0,2,2,0,2,0,2,0,0,0,0,4,0,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0,5,0,10,0,0,9,12,2,0,0,2,2,0,2,2,2,2,2,0,2,2,0,2,2,0,0,2,2,0,2,2,2,2,2,0,2,2,0,2,7,0,0,7,7,0,7,7,7,7,7,0,7,7,4,7,6,0,0,6,6,0,6,6,6,6,6,0,6,6,3,6,2,2,2,0,2,2,2,0,2,2,2,2,3,8,3,0,3,3,3,0,3,3,3,4,3,3,3,3,4,0,4,5,5,5,5,0,5,5,5,6,5,5,5,5,6,8,6,7,4,4,4,0,4,4,4,5,4,4,4,4,5,9,5,6,2,2,2,0,2,2,2,0,2,2,2,2,0,0,3,0,3,3,3,0,3,3,3,4,3,3,3,3,0,0,4,5,5,5,5,0,5,5,5,6,5,5,5,5,0,0,6,7,4,4,4,0,4,4,4,5,4,4,4,4,0,0,5,6],

bcd2dec= [
  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15,  // 0x00
 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,  // 0x10
 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35,  // 0x20
 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45,  // 0x30
 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55,  // 0x40
 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65,  // 0x50
 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75,  // 0x60
 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85,  // 0x70
 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95,  // 0x80
 90, 91, 92, 93, 94, 95, 96, 97, 98, 99,100,101,102,103,104,105,  // 0x90
100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,  // 0xA0
110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,  // 0xB0
120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,  // 0xC0
130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,  // 0xD0
140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,  // 0xE0
150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165   // 0xF0
],
dec2bcd= [
	0x00,0x01,0x02,0x03,0x04,0x05,0x06,0x07,0x08,0x09,
	0x10,0x11,0x12,0x13,0x14,0x15,0x16,0x17,0x18,0x19,
	0x20,0x21,0x22,0x23,0x24,0x25,0x26,0x27,0x28,0x29,
	0x30,0x31,0x32,0x33,0x34,0x35,0x36,0x37,0x38,0x39,
	0x40,0x41,0x42,0x43,0x44,0x45,0x46,0x47,0x48,0x49,
	0x50,0x51,0x52,0x53,0x54,0x55,0x56,0x57,0x58,0x59,
	0x60,0x61,0x62,0x63,0x64,0x65,0x66,0x67,0x68,0x69,
	0x70,0x71,0x72,0x73,0x74,0x75,0x76,0x77,0x78,0x79,
	0x80,0x81,0x82,0x83,0x84,0x85,0x86,0x87,0x88,0x89,
	0x90,0x91,0x92,0x93,0x94,0x95,0x96,0x97,0x98,0x99
],

gRP = function() {return r[P];},
sRP = function(v) {r[P]=v;},
gRX = function() {return r[X];},
sRX = function(v) {r[X]=v;},

M1 = function() {
	var rp = gRP();
	var v = byteAt(rp++);
	rp &=0xffff;
	sRP(rp);
	return v;
},

cond = function(N) {
	var iff = false;
	switch (N & 7) {
		case 0: iff=true; break;
		case 1: iff=(Q == 1); break;
		case 2: iff=(D === 0); break;
		case 3: iff=(DF==1); break;
		case 4: iff=(EF1 == 1); break;
		case 5: iff=(EF2 === 0); break;
		case 6: iff=(EF3 == 1); break;
		case 7: iff=(EF4 === 0); break;
	}
	return (N>7) ? !iff : iff;
},

opADD = function(o,cy) {
	D = D + o + cy;
	if (D>255) {DF = 1;D-=256;} else {DF=0;}
},
opSM = function(o,cy) {
	D = D - o - cy;
	if (D<0) {DF = 1;D+=256;} else {DF=0;}
},
opSD = function(o,cy) {
	D = o - D - cy;
	if (D<0) {DF = 1;D+=256;} else {DF=0;}
},

opSHR = function() {
	DF = D&1;
	D >>= 1;
},
opSHL = function() {
	DF = (D&0x80)?1:0;
	D <<= 1;
	D &= 0xff;
},
opSHRC = function() {
	D |= DF<<8;
	DF = D&1;
	D >>= 1;
},
opSHLC = function() {
	D <<= 1;
	D |= DF;
	DF = (D&0x100)?1:0;
	D &= 0xff;
},


step = function() {
	if (idle==1) {
		T+=2;
		return 2;
	}

	var pc = gRP();

	var instructCode = M1();
	var Tadvance = false;
	var iff,temp;

	//console.log(pc,byteAt(0),instructCode,mode);


	//BIG SWITCH
	
	var I = (instructCode & 0xf0) >> 4;
	var N = (instructCode & 0x0f);


	switch (I) {
		case 0: //LDN
			if (N===0) { // IDL
				idle=1;
				break;
			}
			D = byteAt(r[N]);
			break;
		case 1: //INC
			r[N]++;
			r[N] &= 0xffff;
			break;

		case 2: //DEC
			r[N]--;
			r[N] &= 0xffff;
			break;

		case 4: //LDA
			D = byteAt(r[N]++);
			r[N] &= 0xffff;
			break;

		case 5: //STR
			byteTo(r[N], D);
			break;
		case 8: //GLO
			D = r[N] & 0xff;
			break;
		case 9: //GHI
			D = (r[N] & 0xff00) >> 8;
			break;
		case 0xA: //PLO
			r[N] = (r[N]&0xff00) | (D & 0xff);
			break;

		case 0xB: //PHI
			r[N] = (r[N]&0x00ff) | ((D & 0xff)<<8);
			break;

		case 0xD: //SEP
			P = N;
			break;
		case 0xE: //SEX
			X = N;
			break;


		//BR
		case 0x3:
			iff = cond(N);
			temp = M1();
			if(iff) sRP(pc & 0xff00 | temp);
			break;
		//LBR
		case 0xC:
			Tadvance = true;
			if ((N & 7)<4) {
				iff = cond(N);
				temp = M1() << 8 | M1();
				if(iff) sRP(temp);
			} else {
				//LSxx
				if (N == 4) break;
				iff = !cond(N-4);
				if (N == 0xc) {iff = (IE==1);}
				if(iff) {M1();M1();}
			}
			break;

		//OUT, INP
		case 0x6:
			if (N===0) { //IRX
				sRX((gRX()+1) & 0xffff);
			}
			if (N<8) { //OUT
				temp = gRX();
				sRX((temp+1)&0xffff);
				portOut(N,byteAt(temp));
			}
			if (N>8) { //INP
				temp = portIn(N-8, D);
				byteTo(gRX(),temp);
			}
			break;

		//Misc
		case 0x7: 
			switch (N) {
				case 0:
				case 1: //RET, DIS
					temp = byteAt(gRX());
					X = (temp & 0xf0) >> 4;
					P = (temp & 0x0f);
					sRX((gRX()+1) &0xffff);
					IE = (N===0)?1:0;
					break;
				
				case 2: 
					D = byteAt(gRX());
					sRX((gRX()+1) &0xffff);
					break;
				
				case 3: 
					byteTo(gRX(),D);
					sRX((gRX()-1) &0xffff);
					break;
				

				case 8: 
					byteTo(gRX(),regT);
					break;
				
				case 9: 
					regT = P | (X<<4);
					byteTo(r[2],regT);
					X = P;
					r[2] = (r[2]-1) & 0xffff;
					break;
				

				case 0xa: Q = 0; if (setQ) setQ(0); break;
				case 0xb: Q = 1; if (setQ) setQ(1); break;

				case 4: opADD(byteAt(gRX()),DF); break;
				case 0xc: opADD(M1(),DF); break;
				case 5: opSD(byteAt(gRX()),DF); break;
				case 0xd: opSD(M1(),DF); break;
				case 6: opSHRC(); break;
				case 0xe: opSHLC(); break;
				case 7: opSM(byteAt(gRX()),DF); break;
				case 0xf: opSM(M1(),DF); break;
				

			}	
			break;
		

		case 0xF: 
			switch (N) {
				case 0: D = byteAt(gRX()); break;
				case 1: D = D | byteAt(gRX()); break;
				case 2: D = D & byteAt(gRX()); break;
				case 3: D = D ^ byteAt(gRX()); break;


				case 8: temp = M1(); D = temp; break;
				case 9: D = D | M1(); break;
				case 0xa: D = D & M1(); break;
				case 0xb: D = D ^ M1(); break;

				case 4: opADD(byteAt(gRX()),0); break;
				case 0xc: opADD(M1(),0); break;
				case 5: opSD(byteAt(gRX()),0); break;
				case 0xd: opSD(M1(),0); break;
				case 6: opSHR(); break;
				case 0xe: opSHL(); break;
				case 7: opSM(byteAt(gRX()),0); break;
				case 0xf: opSM(M1(),0); break;

				

			}	
			break;
		


	} //END OF BIG SWITCH
	
  T+=2; 
  if (Tadvance) T++;
  time = Tadvance ? 3 : 2;
  if (ticks) ticks(time);
  return time; 

},

reset = function(){
	r[0] = 0;
	P = 0;
	X = 0;
	Q = 0;
	IE = 1;
	idle = 0;

	T=0;
};

var toHexN = function(n,d) {
  var s = n.toString(16);
  while (s.length <d) {s = '0'+s;}
  return s.toUpperCase();
};

var toHex2 = function(n) {return toHexN(n & 0xff,2);};
var toHex4 = function(n) {return toHexN(n,4);};

// ~ rel8
// @ d8
// ^ d16
var ds = [
["IDL",1],["LDN 1",1],["LDN 2",1],["LDN 3",1],["LDN 4",1],["LDN 5",1],["LDN 6",1],["LDN 7",1],["LDN 8",1],["LDN 9",1],["LDN A",1],["LDN B",1],["LDN C",1],["LDN D",1],["LDN E",1],["LDN F",1],
["INC 0",1],["INC 1",1],["INC 2",1],["INC 3",1],["INC 4",1],["INC 5",1],["INC 6",1],["INC 7",1],["INC 8",1],["INC 9",1],["INC A",1],["INC B",1],["INC C",1],["INC D",1],["INC E",1],["INC F",1],
["DEC 0",1],["DEC 1",1],["DEC 2",1],["DEC 3",1],["DEC 4",1],["DEC 5",1],["DEC 6",1],["DEC 7",1],["DEC 8",1],["DEC 9",1],["DEC A",1],["DEC B",1],["DEC C",1],["DEC D",1],["DEC E",1],["DEC F",1],
["BR ~",2],["BQ ~",2],["BZ ~",2],["BDF ~",2],["B1 ~",2],["B2 ~",2],["B3 ~",2],["B4 ~",2],["SKP",1],["BNQ ~",2],["BNZ ~",2],["BNF ~",2],["BN1 ~",2],["BN2 ~",2],["BN3 ~",2],["BN4 ~",2],
["LDA 0",1],["LDA 1",1],["LDA 2",1],["LDA 3",1],["LDA 4",1],["LDA 5",1],["LDA 6",1],["LDA 7",1],["LDA 8",1],["LDA 9",1],["LDA A",1],["LDA B",1],["LDA C",1],["LDA D",1],["LDA E",1],["LDA F",1],
["STR 0",1],["STR 1",1],["STR 2",1],["STR 3",1],["STR 4",1],["STR 5",1],["STR 6",1],["STR 7",1],["STR 8",1],["STR 9",1],["STR A",1],["STR B",1],["STR C",1],["STR D",1],["STR E",1],["STR F",1],
["IRX",1],["OUT 1",1],["OUT 2",1],["OUT 3",1],["OUT 4",1],["OUT 5",1],["OUT 6",1],["OUT 7",1],["---",1],["INP 1",1],["INP 2",1],["INP 3",1],["INP 4",1],["INP 5",1],["INP 6",1],["INP 7",1],
["RET",1],["DIS",1],["LDXA",1],["STXD",1],["ADC",1],["SDB",1],["SHRC",1],["SMB",1],["SAV",1],["MARK",1],["REQ",1],["SEQ",1],["ADCI @",2],["SDBI @",2],["SHLC",1],["SMBI @",2],
["GLO 0",1],["GLO 1",1],["GLO 2",1],["GLO 3",1],["GLO 4",1],["GLO 5",1],["GLO 6",1],["GLO 7",1],["GLO 8",1],["GLO 9",1],["GLO A",1],["GLO B",1],["GLO C",1],["GLO D",1],["GLO E",1],["GLO F",1],
["GHI 0",1],["GHI 1",1],["GHI 2",1],["GHI 3",1],["GHI 4",1],["GHI 5",1],["GHI 6",1],["GHI 7",1],["GHI 8",1],["GHI 9",1],["GHI A",1],["GHI B",1],["GHI C",1],["GHI D",1],["GHI E",1],["GHI F",1],
["PLO 0",1],["PLO 1",1],["PLO 2",1],["PLO 3",1],["PLO 4",1],["PLO 5",1],["PLO 6",1],["PLO 7",1],["PLO 8",1],["PLO 9",1],["PLO A",1],["PLO B",1],["PLO C",1],["PLO D",1],["PLO E",1],["PLO F",1],
["PHI 0",1],["PHI 1",1],["PHI 2",1],["PHI 3",1],["PHI 4",1],["PHI 5",1],["PHI 6",1],["PHI 7",1],["PHI 8",1],["PHI 9",1],["PHI A",1],["PHI B",1],["PHI C",1],["PHI D",1],["PHI E",1],["PHI F",1],
["LBR ^",3],["LBQ ^",3],["LBZ ^",3],["LBDF ^",3],["NOP",1],["LSNQ",1],["LSNZ",1],["LSNF",1],["LSKP",1],["LBNQ ^",3],["LBNZ ^",3],["LBNF ^",3],["LSIE",1],["LSQ",1],["LSZ",1],["LSDF",1],
["SEP 0",1],["SEP 1",1],["SEP 2",1],["SEP 3",1],["SEP 4",1],["SEP 5",1],["SEP 6",1],["SEP 7",1],["SEP 8",1],["SEP 9",1],["SEP A",1],["SEP B",1],["SEP C",1],["SEP D",1],["SEP E",1],["SEP F",1],
["SEX 0",1],["SEX 1",1],["SEX 2",1],["SEX 3",1],["SEX 4",1],["SEX 5",1],["SEX 6",1],["SEX 7",1],["SEX 8",1],["SEX 9",1],["SEX A",1],["SEX B",1],["SEX C",1],["SEX D",1],["SEX E",1],["SEX F",1],
["LDX",1],["OR",1],["AND",1],["XOR",1],["ADD",1],["SD",1],["SHR",1],["SM",1],["LDI @",2],["ORI @",2],["ANI @",2],["XRI @",2],["ADI @",2],["SDI @",2],["SHL",1],["SMI @",2]];

var disasm = function(i,a,b,pc) {
      var sx = ds[i];
      var s = sx[0];
      var d8 = toHex2(a);
      var rel8 = toHex4((pc & 0xff00) | (a & 0xff));
      s=s.replace("~","$"+rel8);
      s=s.replace("@","$"+d8);
      var d16 = toHex2(a)+toHex2(b);
      s=s.replace("^","$"+d16);
      return [s,sx[1]];
    };

return {
	"steps": function(Ts){
		//T=0;
		while (Ts>0){
			Ts-=step(); 
			if (breakFlag) {T+=Ts;return;}
		}
	}, 
	"T":function(){return T;}, 
	"memr":function(addr){return byteAt(addr);}, 
	"reset":reset, 
	"init": function(bt,ba,tck,porto, porti, setq){
		byteTo=bt; 
		byteAt = ba; 
		portOut = porto;
		portIn = porti;
		setQ = setq;
		ticks=tck; 
		reset();
	},
	"status": function() {
		return {
			"pc":r[P],
			"sp":r[X],
			"d":D,
			"p":P,
			"x":X,
			"r0":r[0],
			"r1":r[1],
			"r2":r[2],
			"r3":r[3],
			"r4":r[4],
			"r5":r[5],
			"r6":r[6],
			"r7":r[7],
			"r8":r[8],
			"r9":r[9],
			"ra":r[10],
			"rb":r[11],
			"rc":r[12],
			"rd":r[13],
			"re":r[14],
			"rf":r[15],
			"df":DF,
			"q":Q,
			"ef1":EF1,
			"ef2":EF2,
			"ef3":EF3,
			"ef4":EF4
		};
	},
	"interrupt": function() {
		if (IE===0) {
			return;
		}
		IE = 1;
		regT = P | (X<<4);
		X=2;
		P=1;
		T++;
		idle=0;
	},
	"dmaOUT": function() {
		var v = byteAt(r[0]);
		r[0]++;
		idle=0;
		T++;
		return v;
	},
	"dmaIN": function(value) {
		byteTo(r[0],value & 0xff);
		r[0]++;
		T++;
		idle=0;
	},
	"set":function(reg,value) {
		switch (reg.toLowerCase()) {
			case "pc": r[P]=value & 0xffff;return;
			case "d": D=value & 0xff;return;
			case "x": X=value & 0xf;return;
			case "p": P=value & 0xf;return;
			case "df": DF=value & 0x1;return;
			case "sp": r[X]=value & 0xffff;return;
			case "r0": r[0]=value & 0xffff;return;
			case "r1": r[1]=value & 0xffff;return;
			case "r2": r[2]=value & 0xffff;return;
			case "r3": r[3]=value & 0xffff;return;
			case "r4": r[4]=value & 0xffff;return;
			case "r5": r[5]=value & 0xffff;return;
			case "r6": r[6]=value & 0xffff;return;
			case "r7": r[7]=value & 0xffff;return;
			case "r8": r[8]=value & 0xffff;return;
			case "r9": r[9]=value & 0xffff;return;
			case "ra": r[10]=value & 0xffff;return;
			case "rb": r[11]=value & 0xffff;return;
			case "rc": r[12]=value & 0xffff;return;
			case "rd": r[13]=value & 0xffff;return;
			case "re": r[14]=value & 0xffff;return;
			case "rf": r[15]=value & 0xffff;return;
			case "q": Q=value & 0x1;return;
			case "ef1": EF1=value & 0x1;return;
			case "ef2": EF2=value & 0x1;return;
			case "ef3": EF3=value & 0x1;return;
			case "ef4": EF4=value & 0x1;return;

		}
	},
	"flagsToString": function() {
		return (DF==1)?"DF":"-";
	},
	"disasm": disasm
};

}));
