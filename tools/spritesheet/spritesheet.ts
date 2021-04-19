const spritesheetForm: HTMLFormElement = document.querySelector(
	"#spritesheet-form"
) as HTMLFormElement;

const outputJsonPreElem: HTMLPreElement = document.querySelector(
	"#json-output"
) as HTMLPreElement;

spritesheetForm.addEventListener("submit", (e) => {
	e.preventDefault();
	const filenameInput = spritesheetForm["filename"] as HTMLInputElement;
	const ssWidthInput = spritesheetForm["width"] as HTMLInputElement;
	const ssHeightInput = spritesheetForm["height"] as HTMLInputElement;
	const tileWidthInput = spritesheetForm["tile-width"] as HTMLInputElement;
	const tileHeightInput = spritesheetForm["tile-height"] as HTMLInputElement;

	const tilesPerRow: number =
		parseFloat(ssWidthInput.value) / parseFloat(tileWidthInput.value);

	const tilesPerCol: number =
		parseFloat(ssHeightInput.value) / parseFloat(tileHeightInput.value);

	createSpritesheetData(
		filenameInput.value,
		tilesPerRow,
		tilesPerCol,
		parseFloat(tileWidthInput.value),
		parseFloat(tileHeightInput.value)
	).then((data) => {
		outputJsonPreElem.innerText = JSON.stringify(data, null, "\t");
	});
});

async function createSpritesheetData(
	filename: string,
	tilesPerRow: number,
	tilesPerCol: number,
	tileWidth: number,
	tileHeight: number
) {
	const dataObject: any = {
		frames: {},
		meta: {
			image: filename,
			format: "RGBA8888",
			size: { w: 10, h: 15 },
			scale: "1",
		},
	};

	let tileIndex = 0;

	for (let x = 0; x < tilesPerRow; x++) {
		for (let y = 0; y < tilesPerCol; y++) {
			const tileX = tileWidth * x;
			const tileY = tileWidth * y;

			dataObject.frames[`${tileX},${tileY}`] = {
				frame: {
					x: tileX,
					y: tileY,
					w: tileWidth,
					h: tileHeight,
				},
				rotated: false,
				trimmed: false,
				spriteSourceSize: {
					x: 0,
					y: 0,
					w: tileWidth,
					h: tileHeight,
				},
				sourceSize: {
					w: tileWidth,
					h: tileHeight,
				},
			};

			// console.log(
			// 	`x = ${tileX}, y = ${tileY}, w = ${tileWidth}, h = ${tileHeight}`
			// );

			tileIndex++;
		}
	}

	return dataObject;
}

console.log(spritesheetForm);
