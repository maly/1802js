module("Syntax and coding standards");

jsHintTest( "JSHint", "../../emu/1802.js");

module("Basic tests");

test( "Namespace", function() {
	notEqual( CPU1802, null, "CPU1802 is defined" );
    equal( typeof(CPU1802), "object", "CPU1802 is an object" );
});


module("Simple OP tests" , {
	setup: function() {

	}
});
var byteAt = function(addr){return RAM[addr];};
var byteTo = function(addr,v){RAM[addr] = v;};

var RAM;

test( "Reset", function() {
	CPU1802.init(byteTo,byteAt,null);
	CPU1802.reset();
	var s = (CPU1802.status());
	equal(s.pc,0,"Reset");
});

test( "Simple op NOP", function() {
	RAM = [0xc4];
	CPU1802.init(byteTo,byteAt,null);
	CPU1802.steps(1);
	var s = (CPU1802.status());
	equal(s.pc,1,"PC");
	equal(CPU1802.T(),3,"Timer");

});

test( "Simple op INC", function() {
	RAM = [0x11];
	CPU1802.init(byteTo,byteAt,null);
	CPU1802.set("r1",0);
	CPU1802.steps(1);
	var s = (CPU1802.status());
	equal(s.pc,1,"PC");
	equal(s.r1,1,"Operation");
	equal(CPU1802.T(),2,"Timer");

});

test( "Simple op DEC", function() {
	RAM = [0x21];
	CPU1802.init(byteTo,byteAt,null);
	CPU1802.set("r1",0);	
	CPU1802.steps(1);
	var s = (CPU1802.status());
	equal(s.pc,1,"PC");
	equal(s.r1,0xffff,"Operation");
	equal(CPU1802.T(),2,"Timer");

});

test( "Simple op PLO", function() {
	RAM = [0xA1];
	CPU1802.init(byteTo,byteAt,null);
	CPU1802.set("r1",0);
	CPU1802.set("d",0x55);
	CPU1802.steps(1);
	var s = (CPU1802.status());
	equal(s.pc,1,"PC");
	equal(s.r1,0x0055,"Operation");
	equal(CPU1802.T(),2,"Timer");

});
test( "Simple op PHI", function() {
	RAM = [0xB1];
	CPU1802.init(byteTo,byteAt,null);
	CPU1802.set("r1",0);
	CPU1802.set("d",0x55);
	CPU1802.steps(1);
	var s = (CPU1802.status());
	equal(s.pc,1,"PC");
	equal(s.r1,0x5500,"Operation");
	equal(CPU1802.T(),2,"Timer");

});

test( "Simple op LDI", function() {
	RAM = [0xF8,0x55];
	CPU1802.init(byteTo,byteAt,null);
	CPU1802.steps(1);
	var s = (CPU1802.status());
	equal(s.pc,2,"PC");
	equal(s.d,0x55,"Operation");
	equal(CPU1802.T(),2,"Timer");

});

test( "Simple op SEX", function() {
	RAM = [0xe5];
	CPU1802.init(byteTo,byteAt,null);
	CPU1802.steps(1);
	var s = (CPU1802.status());
	equal(s.pc,1,"PC");
	equal(s.x,0x5,"Operation");
	equal(CPU1802.T(),2,"Timer");

});

test( "IDLE", function() {
	RAM = [0x00,0xff];
	CPU1802.init(byteTo,byteAt,null);
	CPU1802.steps(1);
	CPU1802.steps(1);
	CPU1802.steps(1);
	CPU1802.steps(1);
	CPU1802.steps(1);
	var s = (CPU1802.status());
	equal(s.pc,1,"PC");
	equal(CPU1802.T(),10,"Timer");

});


test( "IDLE+DMA+NORMAL", function() {
	RAM = [0x00,0x55,0xc4]; //IDL, NOP
	CPU1802.init(byteTo,byteAt,null);
	CPU1802.steps(1);
	CPU1802.steps(1);
	CPU1802.steps(1);
	CPU1802.steps(1);
	CPU1802.steps(1);
	var v = CPU1802.dmaOUT();
	CPU1802.steps(1);
	var s = (CPU1802.status());
	equal(s.pc,3,"PC");
	equal(v,0x55,"DMA");
	equal(CPU1802.T(),14,"Timer");

});


module ("Branches");
test( "Simple op BR", function() {
	RAM = [0x30,0x55];
	CPU1802.init(byteTo,byteAt,null);
	CPU1802.steps(1);
	var s = (CPU1802.status());
	equal(s.pc,0x55,"PC");
	equal(CPU1802.T(),2,"Timer");

});
test( "Simple op NBR", function() {
	RAM = [0x38,0x55];
	CPU1802.init(byteTo,byteAt,null);
	CPU1802.steps(1);
	var s = (CPU1802.status());
	equal(s.pc,0x2,"PC");
	equal(CPU1802.T(),2,"Timer");

});


test( "BZ / BNZ", function() {
	RAM = [0x32,0x55,0x3a,0xaa];
	CPU1802.init(byteTo,byteAt,null);
	CPU1802.set("d",0xff);	
	CPU1802.steps(1);
	var s = (CPU1802.status());
	equal(s.pc,0x2,"PC");
	equal(CPU1802.T(),2,"Timer");
	CPU1802.steps(1);
	var s = (CPU1802.status());
	equal(s.pc,0xaa,"PC");
	equal(CPU1802.T(),4,"Timer");

});
test( "BNZ / BZ", function() {
	RAM = [0x3a,0x55,0x32,0xaa];
	CPU1802.init(byteTo,byteAt,null);
	CPU1802.set("d",0x0);	
	CPU1802.steps(1);
	var s = (CPU1802.status());
	equal(s.pc,0x2,"PC");
	equal(CPU1802.T(),2,"Timer");
	CPU1802.steps(1);
	var s = (CPU1802.status());
	equal(s.pc,0xaa,"PC");
	equal(CPU1802.T(),4,"Timer");

});

test( "LBR", function() {
	RAM = [0xC0,0x55, 0xaa];
	CPU1802.init(byteTo,byteAt,null);
	CPU1802.steps(1);
	var s = (CPU1802.status());
	equal(s.pc,0x55AA,"PC");
	equal(CPU1802.T(),3,"Timer");

});

test( "LBZ / LBNZ", function() {
	RAM = [0xC2,0x55,0xaa,0xCA,0xaa, 0x55];
	CPU1802.init(byteTo,byteAt,null);
	CPU1802.set("d",0xff);	
	CPU1802.steps(1);
	var s = (CPU1802.status());
	equal(s.pc,0x3,"PC");
	equal(CPU1802.T(),3,"Timer");
	CPU1802.steps(1);
	var s = (CPU1802.status());
	equal(s.pc,0xaa55,"PC");
	equal(CPU1802.T(),6,"Timer");

});

test( "LSZ / LSNZ", function() {
	RAM = [0xCE,0xC6,0xaa, 0x55];
	CPU1802.init(byteTo,byteAt,null);
	CPU1802.set("d",0xff);	
	CPU1802.steps(1);
	var s = (CPU1802.status());
	equal(s.pc,0x1,"PC");
	equal(CPU1802.T(),3,"Timer");
	CPU1802.steps(1);
	var s = (CPU1802.status());
	equal(s.pc,4,"PC");
	equal(CPU1802.T(),6,"Timer");

});



module ("Arithmetic");

test( "SHR", function() {
	RAM = [0xF6];
	CPU1802.init(byteTo,byteAt,null);
	CPU1802.set("d",0xaa);
	CPU1802.steps(1);
	var s = (CPU1802.status());
	equal(s.pc,1,"PC");
	equal(s.df,0x00,"Flags C");
	equal(s.d,0x55,"Op");
	equal(CPU1802.T(),2,"Timer");

});
test( "SHL", function() {
	RAM = [0xFE];
	CPU1802.init(byteTo,byteAt,null);
	CPU1802.set("d",0x55);
	CPU1802.steps(1);
	var s = (CPU1802.status());
	equal(s.pc,1,"PC");
	equal(s.df,0x00,"Flags C");
	equal(s.d,0xAA,"Op");
	equal(CPU1802.T(),2,"Timer");

	RAM = [0xFE];
	CPU1802.init(byteTo,byteAt,null);
	CPU1802.set("d",0xd5);
	CPU1802.steps(1);
	var s = (CPU1802.status());
	equal(s.pc,1,"PC");
	equal(s.df,0x1,"Flags C");
	equal(s.d,0xAA,"Op");
	equal(CPU1802.T(),2,"Timer");


});

test( "SHRC", function() {
	RAM = [0x76];
	CPU1802.init(byteTo,byteAt,null);
	CPU1802.set("d",0xaa);
	CPU1802.set("df",1);
	CPU1802.steps(1);
	var s = (CPU1802.status());
	equal(s.pc,1,"PC");
	equal(s.df,0x00,"Flags C");
	equal(s.d,0xD5,"Op");
	equal(CPU1802.T(),2,"Timer");

});

test( "ADI 1+2", function() {
	RAM = [0xFC,0x02];
	CPU1802.init(byteTo,byteAt,null);
	CPU1802.set("d",1);
	CPU1802.set("df",1);
	CPU1802.steps(1);
	var s = (CPU1802.status());
	equal(s.pc,2,"PC");
	equal(s.df,0x00,"Flags C");
	equal(s.d,0x3,"Op");
	equal(CPU1802.T(),2,"Timer");

});

test( "ADI FF+2", function() {
	RAM = [0xFC,0x02];
	CPU1802.init(byteTo,byteAt,null);
	CPU1802.set("d",0xff);
	CPU1802.set("df",1);
	CPU1802.steps(1);
	var s = (CPU1802.status());
	equal(s.pc,2,"PC");
	equal(s.df,1,"Flags C");
	equal(s.d,1,"Op");
	equal(CPU1802.T(),2,"Timer");

});
test( "ADCI FF+2", function() {
	RAM = [0x7C,0x02];
	CPU1802.init(byteTo,byteAt,null);
	CPU1802.set("d",0xff);
	CPU1802.set("df",1);
	CPU1802.steps(1);
	var s = (CPU1802.status());
	equal(s.pc,2,"PC");
	equal(s.df,1,"Flags C");
	equal(s.d,2,"Op");
	equal(CPU1802.T(),2,"Timer");

});


test( "SDI 1,2", function() {
	RAM = [0xFD,0x02];
	CPU1802.init(byteTo,byteAt,null);
	CPU1802.set("d",1);
	CPU1802.set("df",1);
	CPU1802.steps(1);
	var s = (CPU1802.status());
	equal(s.pc,2,"PC");
	equal(s.df,0x00,"Flags C");
	equal(s.d,0x1,"Op");
	equal(CPU1802.T(),2,"Timer");

});

test( "SMI 1,2", function() {
	RAM = [0xFF,0x02];
	CPU1802.init(byteTo,byteAt,null);
	CPU1802.set("d",1);
	CPU1802.set("df",1);
	CPU1802.steps(1);
	var s = (CPU1802.status());
	equal(s.pc,2,"PC");
	equal(s.df,1,"Flags C");
	equal(s.d,0xff,"Op");
	equal(CPU1802.T(),2,"Timer");

});

module("DMA");

test( "DMA IN", function() {
	RAM = [0xFF,0xff];
	CPU1802.init(byteTo,byteAt,null);
	CPU1802.dmaIN(0x55);
	equal(RAM[0],0x55,"RAM");
	equal(CPU1802.T(),1,"Timer");

});

test( "DMA OUT", function() {
	RAM = [0xFF,0xff];
	CPU1802.init(byteTo,byteAt,null);
	var v = CPU1802.dmaOUT();
	equal(v,0xff,"RAM");
	equal(CPU1802.T(),1,"Timer");

});


module("Async tests");

asyncTest ("SEQ", function(){
	RAM = [0x7B,0x02];
	CPU1802.init(byteTo,byteAt,null, null, null, function(q) {
		equal(q, 1, "Q OK");
		start();
	});
	CPU1802.set("d",1);
	CPU1802.set("df",1);
	CPU1802.steps(1);
	var s = (CPU1802.status());
	equal(s.pc,1,"PC");
	equal(CPU1802.T(),2,"Timer");

});

asyncTest ("REQ", function(){
	RAM = [0x7A,0x02];
	CPU1802.init(byteTo,byteAt,null, null, null, function(q) {
		equal(q, 0, "Q OK");
		start();
	});
	CPU1802.set("d",1);
	CPU1802.set("df",1);
	CPU1802.steps(1);
	var s = (CPU1802.status());
	equal(s.pc,1,"PC");
	equal(CPU1802.T(),2,"Timer");

});

asyncTest ("OUT 4", function(){
	RAM = [0x64,0xAA];
	CPU1802.init(byteTo,byteAt,null, function(p,d) {
		equal(p, 4, "Port OK");
		equal(d, 0xaa, "VAL OK");
		start();
	});
	CPU1802.set("x",3);
	CPU1802.set("r3",1);
	CPU1802.steps(1);
	var s = (CPU1802.status());
	equal(s.pc,1,"PC");
	equal(s.r3,2,"RX");
	equal(CPU1802.T(),2,"Timer");

});

asyncTest ("INP 4", function(){
	RAM = [0x6C,0x88];
	CPU1802.init(byteTo,byteAt,null, null, function(p,d) {
		equal(p, 4, "Port OK");
		equal(d, 0x55, "VAL OK");
		start();
		return 0xaa
	});
	CPU1802.set("d",0x55);
	CPU1802.set("x",3);
	CPU1802.set("r3",1);
	CPU1802.steps(1);
	var s = (CPU1802.status());
	equal(s.pc,1,"PC");
	equal(s.r3,1,"RX");
	equal(RAM[1],0xAA,"M(RX)");
	equal(CPU1802.T(),2,"Timer");

});

module ("Disassembler");

test( "ADC", function() {
	var s = CPU1802.disasm(0x74,1,2,10);
	equal(s[0],"ADC","Instruction OK");
	equal(s[1],1,"Length OK");

});

test( "ADCI", function() {
	var s = CPU1802.disasm(0x7C,1,2,10);
	equal(s[0],"ADCI $01","Instruction OK");
	equal(s[1],2,"Length OK");

});

test( "GLO 1", function() {
	var s = CPU1802.disasm(0x81,1,2,10);
	equal(s[0],"GLO 1","Instruction OK");
	equal(s[1],1,"Length OK");

});

test( "LBR", function() {
	var s = CPU1802.disasm(0xc0,1,2,10);
	equal(s[0],"LBR $0102","Instruction OK");
	equal(s[1],3,"Length OK");

});

test( "BR", function() {
	var s = CPU1802.disasm(0x30,1,2,10);
	equal(s[0],"BR $0001","Instruction OK");
	equal(s[1],2,"Length OK");

});

test( "BR page", function() {
	var s = CPU1802.disasm(0x30,1,2,0x5510);
	equal(s[0],"BR $5501","Instruction OK");
	equal(s[1],2,"Length OK");

});