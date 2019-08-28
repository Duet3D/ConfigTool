<style>
input[type='number'] {
    -moz-appearance: textfield;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    -webkit-appearance: none;
}
</style>

<template>
	<div id="app">
		<b-navbar toggleable="md" variant="light" class="mb-4">
			<b-container>
				<b-navbar-nav>
					<b-nav-item to="Start" :active="$route.path === '/Start'">Start</b-nav-item>
					<b-nav-item to="General" :active="$route.path === '/General'">General</b-nav-item>
					<b-nav-item to="Mapping" :active="$route.path === '/Mapping'" v-show="$route.path === '/Mapping' || template.firmware >= 3">I/O Mapping</b-nav-item>
					<b-nav-item to="Motors" :active="$route.path === '/Motors'">Motors</b-nav-item>
					<b-nav-item to="Endstops" :active="$route.path === '/Endstops'">Endstops</b-nav-item>
					<b-nav-item to="Heaters" :active="$route.path === '/Heaters'">Heaters</b-nav-item>
					<b-nav-item to="Fans" :active="$route.path === '/Fans'">Fans</b-nav-item>
					<b-nav-item to="Tools" :active="$route.path === '/Tools'">Tools</b-nav-item>
					<b-nav-item to="Compensation" :active="$route.path === '/Compensation'">Compensation</b-nav-item>
					<b-nav-item to="Display" :active="$route.path === '/Display'" v-show="$route.path === '/Display' || board.supportsDisplay">Display</b-nav-item>
					<b-nav-item to="Network" :active="$route.path === '/Network'">Network</b-nav-item>
					<b-nav-item to="Finish" :active="$route.path === '/Finish'">Finish</b-nav-item>
				</b-navbar-nav>
			</b-container>
		</b-navbar>
		
		<b-form ref="mainForm">
			<keep-alive>
				<router-view></router-view>
			</keep-alive>
		</b-form>

		<b-container class="mt-3">
			<ul class="pagination float-left">
				<li class="page-item" :class="{ disabled : isFirstPage }">
					<b-link class="page-link" href="#" @click.prevent="goToPreviousPage">
						« Back
					</b-link>
				</li>
			</ul>

			<ul class="pagination float-right">
				<li class="page-item">
					<b-link class="page-link" href="#" @click.prevent="goToNextPage">
						{{ isLastPage ? 'Finish' : 'Next' }} »
					</b-link>
				</li>
			</ul>
		</b-container>

		<b-modal ref="errorModal" :ok-only="true" title="Invalid input" @hidden="highlightErrors">
			<h4>This page contains errors.</h4>
			<h5>Please fix them before you continue.</h5>
		</b-modal>

		<b-modal ref="finishModal" size="lg" title="Configuration Ready" @show="finishShow">
			<p>The following system files will be generated:</p>

			<b-card ref="finishFiles" bg-variant="light" class="mb-3">
				<span v-if="files.length == 0" v-html="message"></span>
				<ul v-else class="pl-4 mb-0">
					<li v-for="filename in files">
						<b-link @click="showFile(filename)" v-text="filename"></b-link>
					</li>
				</ul>
			</b-card>

			<p>If you are using Duet Web Control, you can upload the generated ZIP file <u>without extracting</u> on the Settings page. Otherwise you can unzip the contents of this file directly on your SD card.</p>
			<p>See <a href="https://duet3d.com/wiki/SD_card_folder_structure" target="_blank">this page</a> for further information about the purpose of these files.</p>

			<template slot="modal-footer">
				<a :href="configLink" class="btn btn-secondary" download="config.json">
					<font-awesome-icon icon="save"></font-awesome-icon> Download JSON template
				</a>
				<b-button variant="primary" @click="generateZIP" :disabled="generatingZIP">
					<font-awesome-icon :icon="generatingZIP ? 'hourglass' : 'download'"></font-awesome-icon> {{ generatingZIP ? 'Generating ZIP bundle...' : 'Download configuration bundle as ZIP file' }}
				</b-button>
			</template>
		</b-modal>
	</div>
</template>

<script>
'use strict';

import { mapState } from 'vuex'
import saveAs from 'file-saver'

import Compiler from './Compiler.js'
import { goToNextPage, goToPreviousPage } from './Router.js'

export default {
	computed: {
		...mapState(['board', 'template']),
		isFirstPage() { return this.$route.path === '/Start'; },
		isLastPage() { return this.$route.path === '/Finish'; }
	},
	data() {
		return {
			configLink: '#',
			files: [],
			generatingZIP: false,
			message: 'Loading...',
		}
	},
	methods: {
		goToPreviousPage() {
			const currentPageIndex = this.$router.options.routes.findIndex(route => route.path === this.$route.path);
			if (currentPageIndex > 0) {
				let prevPage = this.$router.options.routes[currentPageIndex - 1];
				if ((prevPage.path === '/Mapping' && this.template.firmware < 3) ||
					(prevPage.path === '/Display' && !this.board.supportsDisplay)) {
					prevPage = this.$router.options.routes[currentPageIndex - 2];
				}
				this.$router.push(prevPage);
			}
		},
		goToNextPage() {
			const currentPageIndex = this.$router.options.routes.findIndex(route => route.path === this.$route.path);
			if (currentPageIndex + 2 < this.$router.options.routes.length) {
				let nextPage = this.$router.options.routes[currentPageIndex + 1];
				if ((nextPage.path === '/Mapping' && this.template.firmware < 3) ||
					(nextPage.path === '/Display' && !this.board.supportsDisplay)) {
					nextPage = this.$router.options.routes[currentPageIndex + 2];
				}
				this.$router.push(nextPage);
			} else if (this.$refs.mainForm && this.$refs.mainForm.checkValidity() && this.$refs.mainForm.querySelector('.is-invalid') === null) {
				this.$refs.finishModal.show();
			} else {
				this.$refs.errorModal.show();
			}
		},
		highlightErrors() {
			this.$refs.mainForm.reportValidity();
		},

		async finishShow() {
			this.message = 'Loading...';
			this.files = [];
			this.configLink = 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.template));

			try {
				const output = await Compiler.compileFile('templates/files.ejs', { template: this.template });
				this.files = output.trim().split('\n');
			} catch (e) {
				this.message = 'Failed to load template from server:<br><br>' + e;
			}
		},
		async generateZIP() {
			this.generatingZIP = true;

			try {
				const zip = await Compiler.compileZIP(this.files, this.template, this.board);
				if (Compiler.canDownloadFiles) {
					saveAs(zip, 'config.zip');
				} else {
					alert('Error: This browser does not support blobs! Save your configuration template and try another one.');
				}
			} catch (e) {
				alert('Failed to generate ZIP bundle:\n\n' + e);
			}

			this.generatingZIP = false;
		},
		async showFile(filename) {
			try {
				const output = await Compiler.compileTemplate(filename, this.template, this.board);

				let tab = window.open('about:blank', '_blank');
				if (tab == null) {
					alert('Could not open a new tab!\n\nPlease allow pop-ups for this page and try again.');
				} else {
					tab.document.write(output.replace(/\n/g, '<br>').replace(/ /g, '&nbsp;'));
					tab.document.body.style='font-family: monospace;'
					tab.document.title = filename;
					tab.document.close();
				}
			} catch (e) {
				alert(`Failed to generate file ${filename}:\n\n${e}`);
			}
		}
	},
	mounted() {
		const form = this.$refs.mainForm;
		const errorModal = this.$refs.errorModal;
		this.$router.beforeEach((to, from, next) => {
			if (form.checkValidity() && form.querySelector('.is-invalid') === null) {
				next();
			} else {
				errorModal.show();
				next(false);
			}
		});
	}
}
</script>
