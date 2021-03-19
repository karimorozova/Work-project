<template lang="pug">
  .container
    ckeditor(v-model="editorDataUpdate" :config="editorConfig")
</template>

<script>
	let CKEditor
	if (process.client || !!CKEditor) CKEditor = require('ckeditor4-vue')
	else CKEditor = { component: { template: '<div></div>' } }
	export default {
	  props: {
      editorData: {
        type: String,
        default: ''
      },
    },
		data() {
			return {
				editorConfig: {
					extraPlugins: ['colorbutton', 'smiley'],
					toolbarGroups: [
						{ name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },
						{ name: 'document', groups: ['mode', 'document', 'doctools'] },
						{ name: 'editing', groups: ['find', 'selection', 'spellchecker', 'editing'] },
						{ name: 'forms', groups: ['forms'] },
						{ name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'bidi', 'paragraph'] },
						{ name: 'clipboard', groups: ['clipboard', 'undo'] },
						{ name: 'links', groups: ['links'] },
						{ name: 'insert', groups: ['insert'] },
						{ name: 'styles', groups: ['styles'] },
						{ name: 'colors', groups: ['colors'] },
						{ name: 'tools', groups: ['tools'] },
						{ name: 'others', groups: ['others'] },
						{ name: 'about', groups: ['about'] }
					],
					removeButtons: 'Source,Save,NewPage,ExportPdf,Preview,Print,Templates,Cut,Copy,Paste,PasteText,PasteFromWord,Find,Replace,SelectAll,Form,Checkbox,Radio,TextField,Textarea,Select,ImageButton,HiddenField,Button,Superscript,Subscript,CopyFormatting,NumberedList,Blockquote,CreateDiv,JustifyLeft,JustifyCenter,JustifyRight,JustifyBlock,BidiLtr,BidiRtl,Language,Anchor,HorizontalRule,Table,Flash,PageBreak,Iframe,Styles,Format,Font,FontSize,ShowBlocks,Maximize,About',
					uiColor: "#F2EFEB",
					height: 100,
				}
			}
		},
    computed: {
      editorDataUpdate: {
        get () { return this.editorData },
        set (value) { this.$emit('editorBlur', value) },
      },
    },
		components: {
			ckeditor: CKEditor.component
		}
	}
</script>

<style lang="scss" scoped>

</style>
