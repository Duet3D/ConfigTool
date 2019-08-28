<style scoped>
div {
	height: 0;
	padding-bottom: 50%;
	position: relative;
}

canvas {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
}

@font-face {
	font-family: 'Liberation Sans';
	font-style: normal;
	font-weight: normal;
	src: local('Liberation Sans'), url('../fonts/LiberationSans-Regular.woff') format('woff');
}
</style>

<template>
	<div>
		<canvas ref="canvas" :width="width" :height="height"></canvas>
	</div>
</template>

<script>
'use strict';

import { mapState } from 'vuex'

let row, column, font;

export default {
	computed: mapState(['template']),
	mounted() {
		this.draw();
	},
	methods: {
		draw() {
			const context = this.$refs.canvas.getContext('2d');
			context.fillStyle = 'rgb(0, 0, 255)';
			context.fillRect(0, 0, 128, 64);

			row = column = font = 0;
			this.value.split('\n').forEach(function(line, index) {
				this.renderLine(context, line, index === this.currentLine);
			}, this);
		},
		renderLine(context, line, highlight) {
			// Parse all parameters
			const params = {};
			let letter = null, param = '', inCommand = true, inQuotes = false, wasInQuotes = false;
			for (let i = 0; i < line.length; i++) {
				let paramComplete = (i === line.length - 1);

				const c = line[i];
				if (inCommand) {
					if (c === ' ' || c === '\t') {
						inCommand = false;
					} else if (c === ';') {
						break;
					}
				} else if (inQuotes) {
					if (c === '"') {
						inQuotes = false;
						paramComplete = wasInQuotes = true;
					} else {
						param += c;
					}
				} else {
					if (c === '"') {
						if (wasInQuotes) {
							param += '"';
						}
						inQuotes = true;
					} else if (c === ' ' || c === '\t' || c === ';') {
						paramComplete = true;
					} else if (letter === null) {
						letter = c.toUpperCase();
					} else {
						param += c;
					}
					wasInQuotes = false;
				}

				if (paramComplete) {
					if (param !== '') {
						if (letter !== null) {
							params[letter] = param;
						} else if (this.template.firmware >= 2.02) {
							params.T = param;
						}
						param = '';
					}
					letter = null;

					if (c === ';') {
						break;
					}
				}
			}

			// Update sticky parameters
			if (params.hasOwnProperty('R')) {
				row = parseInt(params.R);
			}
			if (params.hasOwnProperty('C')) {
				column = parseInt(params.C);
			}
			if (params.hasOwnProperty('F')) {
				font = parseInt(params.F);
			}

			// Try to render the element
			if (isNumber(row) && isNumber(column) && this.checkVisibility(params.V || 0)) {
				if (line.startsWith('image')) {
					this.drawImage(context, params.L, highlight);
				} else if (line.startsWith('text')) {
					column += this.drawText(context, params.T || '', row, column, params, highlight ? 2 : 0);
				} else if (line.startsWith('button')) {
					params.H = '1';
					column += this.drawText(context, params.T || '', row, column, params, highlight ? 1 : 0);
				} else if (line.startsWith('value') || line.startsWith('alter')) {
					column += this.drawText(context, (0).toFixed(params.D || 0), row, column, params, highlight ? 1 : 0);
				} else if (line.startsWith('files')) {
					// TODO
				}
			}
		},
		checkVisibility(visibility) {
			const val = parseInt(visibility);
			switch (val) {
				case 2: return (this.machineState === 1);
				case 3: return (this.machineState !== 1);
				case 4: return (this.machineState !== 0);
				case 5: return (this.machineState === 0);
				case 6: return (this.machineState === 2);
				case 7: return (this.machineState === 1 || this.machineState === 3);
				case 10: return this.sdMounted;
				case 11: return !this.sdMounted;
				case 20: return this.toolHeaterFault;
				case 28: return this.bedFault;
			}
			return true;
		},
		drawText(context, text, row, column, params, highlight) {
			const fontSize = (font === 1) ? 11 : 9;
			context.font = `${fontSize}px Liberation Sans`;

			let width;
			if (params.hasOwnProperty('W')) {
				width = parseInt(params.W);
				while (text !== '' && context.measureText(text).width > width) {
					text = text.substr(0, text.length - 1);
				}
			} else {
				width = context.measureText(text).width;
			}

			if (highlight === 1) {
				context.fillStyle = 'rgb(255, 255, 255)';
				context.fillRect(column, row, width, fontSize);
				context.fillStyle = 'rgb(0, 0, 255)';
			} else {
				if (highlight === 2) {
					context.fillStyle = 'rgb(64, 64, 255)';
					context.fillRect(column, row, width, fontSize);
				}
				context.fillStyle = 'rgb(255, 255, 255)';
			}

			switch (params.H) {
				case '1':	// Center
					context.textAlign = 'center';
					context.fillText(text, column + width / 2, row + fontSize - 1, width);
					break;
				case '2':	// Right
					context.textAlign = 'right';
					context.fillText(text, column + width, row + fontSize - 1, width);
					break;
				default:	// Left
					context.textAlign = 'left';
					context.fillText(text, column, row + fontSize - 1, width);
					break;
			}
			return width;
		},
		drawImage(context, filename, highlight) {
			for (let i = 0; i < this.template.display.images.length; i++) {
				const item = this.template.display.images[i];
				if (filename === item.name && item.value.length > 2) {
					const cols = item.value[0], bytesPerRow = Math.ceil(cols / 8);
					const rows = item.value[1];
					if (item.value.length >= bytesPerRow * rows + 2) {
						const imgData = context.getImageData(column, row, cols, rows);
						const pixels = imgData.data;

						let i = 0;
						for (let y = 0; y < rows; y++) {
							for (let x = 0; x < cols; x++) {
								const b = item.value[bytesPerRow * y + Math.trunc(x / 8) + 2];
								const pixelValue = b & (128 >> (x % 8));
								if (pixelValue !== 0) {
									pixels[i * 4 + 0] = 255;
									pixels[i * 4 + 1] = 255;
									pixels[i * 4 + 2] = 255;
								} else if (highlight) {
									pixels[i * 4 + 0] = 64;
									pixels[i * 4 + 1] = 64;
									pixels[i * 4 + 2] = 255;
								} else {
									pixels[i * 4 + 0] = 0;
									pixels[i * 4 + 1] = 0;
									pixels[i * 4 + 2] = 255;
								}
								i++;
							}
						}

						context.putImageData(imgData, column, row);
					}
				}
			}
		}

	},
	props: {
		width: {
			type: Number,
			default: 128
		},
		height: {
			type: Number,
			default: 64
		},
		value: {
			type: String,
			required: true
		},
		currentLine: {
			type: Number,
			default: -1
		},
		machineState: {
			type: Number,
			default: 0
		},
		sdMounted: {
			type: Boolean,
			default: true
		},
		toolHeaterFault: {
			type: Boolean,
			default: false
		},
		bedFault: {
			type: Boolean,
			default: false
		}
	},
	watch: {
		value() { this.draw(); },
		currentLine() { this.draw(); },
		machineState() { this.draw(); },
		sdMounted() { this.draw(); },
		toolHeaterFault() { this.draw(); },
		bedFault() { this.draw(); },
		'template.display.images': {
			deep: true,
			handler() { this.draw(); }
		}
	}
}
</script>
