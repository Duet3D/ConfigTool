'use strict';

import { render } from 'ejs'
import JSZip from 'jszip'

import Boards from './store/Boards.js'

import { version } from '../package.json'

export default {
	alignComments(file) {
		let lines = file.split('\n');
		let maxCommandLength = 0;

		// Find out how long the maximum command is
		lines.forEach(function(line) {
			var index = line.indexOf(';');
			if (index == 1) {
				index = line.substr(1).indexOf(';') - 1;
			}

			if (index > maxCommandLength) {
				maxCommandLength = index;
			}
		});

		// Align line comments
		let newResult = '';
		lines.forEach(function(line) {
			let index = line.indexOf(';'), startingWithComment = (index == 0);
			if (startingWithComment) {
				line = line.substr(1);
				index = line.indexOf(';');
			}

			if (index == -1) {
				newResult += (startingWithComment ? ';' : '') + line + '\n';
			} else {
				let commandPart = (startingWithComment ? ';' : '') + line.substr(0, index - 1);
				let commentPart = line.substr(index);
				for(let i = commandPart.length; i < maxCommandLength; i++) {
					commandPart += ' ';
				}
				newResult += commandPart + commentPart + '\n';
			}
		});

		return newResult;
	},

	downloadFile(filename, responseType, accept) {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			xhr.open('GET', filename, true);
			xhr.responseType = responseType;
			if (accept) {
				xhr.setRequestHeader('Accept', accept);
			}
			xhr.onload = function() {
				if (xhr.status >= 200 && xhr.status < 300) {
					resolve(xhr.response);
				} else {
					reject(`${xhr.status} ${xhr.statusText}`);
				}
			};
			xhr.onerror = () => reject('Network error');
			xhr.send(null);
		});
	},

	async compileFile(filename, options) {
		const fileContent = await this.downloadFile(filename, 'text');
		return render(fileContent, options);
	},

	async compileTemplate(filename, template, board) {
		let options = { template, board, util: this.util(template), version };

		// tfree/tpre/tpost macros share the same file but need another parameter 'index'
		let targetFilename = 'templates/' + filename.replace('.g', '.ejs');
		if (filename.startsWith('tfree')) {
			targetFilename = 'templates/tfree.ejs';
			options.index = parseInt(filename.match('tfree(\\d+).g')[1]);
		} else if (filename.startsWith('tpre')) {
			targetFilename = 'templates/tpre.ejs';
			options.index = parseInt(filename.match('tpre(\\d+).g')[1]);
		} else if (filename.startsWith('tpost')) {
			targetFilename = 'templates/tpost.ejs';
			options.index = parseInt(filename.match('tpost(\\d+).g')[1]);
		} else if (filename.startsWith("board")) {
            targetFilename = "templates/board.ejs";
            //dont align comments for Board.txt
            const content = await this.compileFile(targetFilename, options);
            return content;

        }

		const content = await this.compileFile(targetFilename, options);
		return this.alignComments(content);
	},

	async compileZIP(filenames, template, board, rrfFile, iapFile, dwcFile) {
		let zip = new JSZip();
		zip.file('sys/config.json', JSON.stringify(template));

		// Generate /menu directory
		if (template.display.type) {
			template.display.menus.forEach(function(item) {
				zip.file('menu/' + item.name, item.value);
			});

			template.display.images.forEach(function(item) {
				zip.file('menu/' + item.name, item.value);
			});
		}

		// Generate /sys directory
		for (let i = 0; i < filenames.length; i++) {
			try {
				const content = await this.compileTemplate(filenames[i], template, board);
				zip.file('sys/' + filenames[i], content);
			} catch (e) {
				throw `Failed to create ${filenames[i]}: ${e}`
			}
		}

		// Add RRF+IAP files
		if (rrfFile) {
			try {
				zip.file('sys/' + rrfFile.name);
			} catch (e) {
				throw `Failed to create ${rrfFile.name}: ${e}`
			}
		}
		if (iapFile) {
			try {
				zip.file('sys/' + iapFile.name);
			} catch (e) {
				throw `Failed to create ${rrfFile.name}: ${e}`
			}
		}

		// Add DWC
		if (dwcFile) {
			try {
				const dwcZIP = new JSZip();
				dwcZIP.load(dwcFile);
				dwcZIP.forEach(function(relativePath, zipEntry) {
					zip.file('www/' + relativePath + '/' + zipEntry.name, zipEntry);
				});
			} catch (e) {
				throw `Failed to integrate DWC bundle: ${e}`
			}
		}

		// Generate final ZIP when all files have been generated
		return await zip.generateAsync({ type: 'blob' });
	},

	canDownloadFiles: JSZip.support.blob,

	util(template) {
		return {
			getFirmwareString() {
				switch (template.firmware) {
					case 1.16: return '1.16 or older';
					case 1.17: return '1.17 to 1.19';
					case 1.20: return '1.20';
					case 1.21: return '1.21';
					case 2: return '2.00';
					case 2.03: return '2.03';
					case 3: return '3';
				}
				return template.firmware.toString();
			},

			formatValue(value, factor, precision) {
				if (isNumber(value)) {
					return (value * factor).toFixed(precision);
				}
				return value;
			},

			makeDriveString(property, factor, precision = 2, condition) {
				let result = '';
				if (condition === undefined || condition(template.drives[0], 0)) {
					result += ' X' + this.formatValue(template.drives[0][property], factor, precision);
				}
				if (condition === undefined || condition(template.drives[1], 1)) {
					result += ' Y' + this.formatValue(template.drives[1][property], factor, precision);
				}
				if (condition === undefined || condition(template.drives[2], 2)) {
					result += ' Z' + this.formatValue(template.drives[2][property], factor, precision);
				}
				for (let i = 3; i < template.drives.length; i++) {
					if (condition === undefined || condition(template.drives[i], i)) {
						if (i === 3) {
							result += ' E' + this.formatValue(template.drives[i][property], factor, precision);
						} else {
							result += ':' + this.formatValue(template.drives[i][property], factor, precision);
						}
					}
				}
				return result.substr(1);
			},

			formatDriver(drive) {
				if (template.firmware >= 3) {
					if (template.board === 'duet3' || drive.driver_v3.indexOf('.') === -1) {
						return drive.driver_v3;
					}
					const driveIndex = parseInt(drive.driver_v3.split('.')[1]);
					return (drive.driver_v3.indexOf('1.') !== -1) ? driveIndex + Boards.getBoard(template.board).numDrives : driveIndex;
				}
				return drive.driver;
			},

			makeDriverString() {
				let result = '';
				result += ' X' + this.formatDriver(template.drives[0]);
				result += ' Y' + this.formatDriver(template.drives[1]);
				result += ' Z' + this.formatDriver(template.drives[2]);
				for (let i = 3; i < template.drives.length; i++) {
					if (i === 3) {
						result += ' E' + this.formatDriver(template.drives[3]);
					} else {
						result += ':' + this.formatDriver(template.drives[i]);
					}
				}
				return result.substr(1);
			},

			getFirstProbePoint(axis) {
				if (template.probe.points == 0) {
					return (axis == 0) ? template.mesh.x_min : template.mesh.y_min;
				}
				return (axis == 0) ? template.probe.points[0].x : template.probe.points[0].y;
			},
            
            //turns an array into a comma seperated string
            makePlainArrayString(arr){
                let result = "";
                for(var i=0; i<arr.length; i++){
                    result += arr[i];
                    if(i != arr.length-1) result +=", ";
                }
                return result;
            },

		}
	}
}
