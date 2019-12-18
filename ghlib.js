ghlib={
	version: 17,
	author: "Rafał Majewski",
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
	createRandomTextGenerator: (settings)=>{
		let randomTextGenerator={deepness: 40, trust: 2, weights: {}, splitter: "", limit: 400, startingCharacter: String.fromCharCode(2), endingCharacter: String.fromCharCode(3)};
		randomTextGenerator={...randomTextGenerator, ...settings};
		randomTextGenerator.learnExample=(example, isRaw)=>{
			example=[...((isRaw)?(""):(randomTextGenerator.startingCharacter)), ...example, ...((isRaw)?(""):(randomTextGenerator.endingCharacter))];
			for (let i=0; i<example.length-1; ++i) {
				for (let i2=i; i2<Math.min(example.length-1, i+randomTextGenerator.deepness); ++i2) {
					let from=example.slice(i, i2+1).join(randomTextGenerator.splitter);
					let to=example[i2+1];
					if (!randomTextGenerator.weights[from]) randomTextGenerator.weights[from]={};
					if (!randomTextGenerator.weights[from][to]) randomTextGenerator.weights[from][to]=0;
					++randomTextGenerator.weights[from][to];
				}
			}
		};
		randomTextGenerator.forgetExample=(example, isRaw)=>{
			example=[...((isRaw)?(""):(randomTextGenerator.startingCharacter)), ...example, ...((isRaw)?(""):(randomTextGenerator.endingCharacter))];
			for (let i=0; i<example.length-1; ++i) {
				for (let i2=i; i2<Math.min(example.length-1, i+randomTextGenerator.deepness); ++i2) {
					let from=example.slice(i, i2+1).join(randomTextGenerator.splitter);
					let to=example[i2+1];
					if (!randomTextGenerator.weights[from]) randomTextGenerator.weights[from]={};
					if (!randomTextGenerator.weights[from][to]) randomTextGenerator.weights[from][to]=0;
					--randomTextGenerator.weights[from][to];
					if (randomTextGenerator.weights[from][to] == 0) delete randomTextGenerator.weights[from][to];
					if (Object.keys(randomTextGenerator.weights[from]).length == 0) delete randomTextGenerator.weights[from];
				}
			}
		};
		randomTextGenerator.forgetExamples=(examples, isRaw)=>{
			if (examples) for (let example of examples) randomTextGenerator.forgetExample(example);
			else randomTextGenerator.weights={};
		};
		randomTextGenerator.learnExamples=(examples, isRaw)=>{
			for (let example of examples) randomTextGenerator.learnExample(example, isRaw);
		};
		randomTextGenerator.predictNext=(splittedText)=>{
			let from=splittedText.slice(Math.max(0, splittedText.length-randomTextGenerator.deepness));
			for (let i=0; i<randomTextGenerator.deepness; ++i) {
				let weightsRow=randomTextGenerator.weights[from.join(randomTextGenerator.splitter)];
				if (weightsRow) {
					let sum=0;
					for (let to of Object.keys(weightsRow)) sum+=weightsRow[to];
					if (sum >= randomTextGenerator.trust) {
						let pick=Math.random()*sum;
						for (let to of Object.keys(weightsRow)) {
							pick-=weightsRow[to];
							if (pick < 0) return to;
						}
					}
				}
				from=from.slice(1);
			}
			from=splittedText.slice(Math.max(0, splittedText.length-randomTextGenerator.deepness));
			for (let i=0; i<randomTextGenerator.deepness; ++i) {
				let weightsRow=randomTextGenerator.weights[from.join(randomTextGenerator.splitter)];
				if (weightsRow) {
					let sum=0;
					for (let to of Object.keys(weightsRow)) sum+=weightsRow[to];
					let pick=Math.random()*sum;
					for (let to of Object.keys(weightsRow)) {
						pick-=weightsRow[to];
						if (pick < 0) return to;
					}
				}
				from=from.slice(1);
			}
		};
		randomTextGenerator.generate=(breakFunction)=>{
			let splittedText=[randomTextGenerator.startingCharacter];
			while (true) {
				let character=randomTextGenerator.predictNext(splittedText);
				if (character === randomTextGenerator.endingCharacter) break;
				if (breakFunction && breakFunction(splittedText, character)) break;
				if (!character || splittedText.length > randomTextGenerator.limit) {
					splittedText=[randomTextGenerator.startingCharacter];
					continue;
				}
				splittedText.push(character);
			}
			return splittedText.slice(1);
		};
		randomTextGenerator.lengthen=(splittedText, breakFunction)=>{
			let newSplittedText=[...splittedText];
			while (true) {
				let character=randomTextGenerator.predictNext(newSplittedText);
				if (character === randomTextGenerator.endingCharacter) break;
				if (breakFunction && breakFunction(newSplittedText, character)) break;
				if (!character || newSplittedText.length > randomTextGenerator.limit) {
					newSplittedText=[...splittedText];
					continue;
				}
				newSplittedText.push(character);
			}
			return newSplittedText;
		};
		randomTextGenerator.shrink=()=>{
			for (let from of Object.keys(randomTextGenerator.weights)) {
				let weightsRow=randomTextGenerator.weights[from];
				let sum=0;
				for (let to of Object.keys(weightsRow)) sum+=weightsRow[to];
				if (sum < randomTextGenerator.trust) delete randomTextGenerator.weights[from];
			}
		};
		return randomTextGenerator;
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