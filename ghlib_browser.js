(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.module = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
ghlib={
	globalReplaceInString: (string, map)=>{
		if ("" in map) return null;
		for (let i=0; i<string.length; ++i) {
			for (let from in map) {
				let isValid=true;
				for (let i2=0; i2<from.length; ++i2) if (string[i+i2] != from[i2]) isValid=false;
				if (isValid) {
					string=string.slice(0, i)+map[from]+string.slice(i+from.length);
					--i;
				}
			}
		}
		return string;
	},
	createColor: (r, g, b, a)=>{
		let color={};
		color.r=r || 0;
		color.g=g || 0;
		color.b=b || 0;
		color.a=a || 1;
		return color;
	},
	getRainbowColor: (number)=>{
		number*=6;
		let r=0;
		let g=0;
		let b=0;
		if (number <= 1) {
			r=1;
			g=number;
		}
		else if (number <= 2) {
			r=1-(number-1);
			g=1;
		}
		else if(number <= 3) {
			g=1;
			b=(number-2);
		}
		else if (number <= 4) {
			g=1-(number-3);
			b=1;
		}
		else if (number <= 5) {
			r=(number-4);
			b=1;
		}
		else if( number <= 6) {
			r=1;
			b=1-(number-5);
		}
		return ghlib.createColor(255*r, 255*g, 255*b);
	},
	createPoint: (x, y, z)=>({x: x, y: y, z: z}),
	getRandomColor: ()=>(ghlib.createColor(Math.floor(Math.random()*256), Math.floor(Math.random()*256), Math.floor(Math.random()*256))),
	drawLine: (ctx, p1, p2)=>{
		ctx.beginPath();
		ctx.moveTo(p1.x, p1.y);
		ctx.lineTo(p2.x, p2.y);
		ctx.stroke();
	},
	random: (min, max, accuracy)=>{
		if (!min) min=0;
		if (!max) max=1;
		if (accuracy === "int" || accuracy === "integer") accuracy=max-min+1;
		let x;
		if (!accuracy || accuracy === Infinity) x=Math.random();
		else if(accuracy === 1) x=0.5;
		else x=Math.floor(Math.random()*accuracy)/(accuracy-1);
		return x*(max-min)+min;
	},
	chooseRandomElementWithWeights: (list)=>{
		let sum=0;
		for (let item of list) {
			if (!isNaN(item.weight)) sum+=item.weight;
		}
		let pick=Math.random()*sum;
		for (let item of list) {
			pick-=input.weight;
			if (pick < 0) return item.element;
		}
	},
	hash: (input, length)=>{
		allowedCharacters=['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9'];
		let output="";
		let inputAsNumbers=[];
		let table=[];
		let newTable;
		for (let i=0; i<input.length; ++i) {
			inputAsNumbers.push(input.charCodeAt(i));
			table.push(input.charCodeAt(i));
		}
		let number=0;
		for (let i=0; i<length; ++i) {
			newTable=[];
			for (let i2=0; i2<table.length; ++i2) newTable[i2]=(table[(i2+1)%table.length]+table[i2]+i2)+1;
			table=newTable;
			for (let i2=0; i2<table.length; ++i2) {
				number+=table[i2]*inputAsNumbers[i2];
				--number;
				number=number%allowedCharacters.length;
			}
			output+=allowedCharacters[number];
			number=0;
		}
		return output;
	},
};

module.exports=ghlib;
},{}]},{},[1])(1)
});
