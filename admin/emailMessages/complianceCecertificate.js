let apiUrl = require('../helpers/apiurl')
const moment = require('moment')

!apiUrl && (apiUrl = 'https://admin.pangea.global')
// apiUrl = 'http://localhost:3001'

const logo = apiUrl + '/static/certificate-images/logo.png'
const background = apiUrl + '/static/certificate-images/watermark.png'
const stamp = apiUrl + '/static/certificate-images/stamp.png'

console.log(apiUrl + '/static/certificate-images/stamp.png')

module.exports.getCertificateTemplate = ({ project, allLanguages, tasks, deliveryData }) => {
	return `
		<img src="file:///static/logo.png">

		<img src="\static\error.svg">
		<img src="\\static\\error.svg">
		
		<img src="http://157.90.235.134/static/certificate-images/stamp.png">
		<img src="./../static/certificate-images/stamp.png">
		
		
		<img src="file:///static/certificate-images/stamp.png">
		<img src="file://../static/certificate-images/stamp.png">
		<img src="file://./../static/certificate-images/stamp.png">
		
		
		<img src="https://admin.pangea.global/static/certificate-images/stamp.png">


<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" version="1.1" width="512" height="512" x="0" y="0" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g>
<ellipse xmlns="http://www.w3.org/2000/svg" style="" cx="256" cy="256" rx="256" ry="255.832" fill="#d15f45" data-original="#e04f5f" class=""/>
<g xmlns="http://www.w3.org/2000/svg" transform="matrix(-0.7071 0.7071 -0.7071 -0.7071 77.26 32)">
<rect x="3.98" y="-427.615" style="" width="55.992" height="285.672" fill="#ffffff" data-original="#ffffff"/>
<rect x="-110.828" y="-312.815" style="" width="285.672" height="55.992" fill="#ffffff" data-original="#ffffff"/>
</g>
<g xmlns="http://www.w3.org/2000/svg">
</g>
<g xmlns="http://www.w3.org/2000/svg">
</g>
<g xmlns="http://www.w3.org/2000/svg">
</g>
<g xmlns="http://www.w3.org/2000/svg">
</g>
<g xmlns="http://www.w3.org/2000/svg">
</g>
<g xmlns="http://www.w3.org/2000/svg">
</g>
<g xmlns="http://www.w3.org/2000/svg">
</g>
<g xmlns="http://www.w3.org/2000/svg">
</g>
<g xmlns="http://www.w3.org/2000/svg">
</g>
<g xmlns="http://www.w3.org/2000/svg">
</g>
<g xmlns="http://www.w3.org/2000/svg">
</g>
<g xmlns="http://www.w3.org/2000/svg">
</g>
<g xmlns="http://www.w3.org/2000/svg">
</g>
<g xmlns="http://www.w3.org/2000/svg">
</g>
<g xmlns="http://www.w3.org/2000/svg">
</g>
</g></svg>

	`

	const dateNow = new Date()
	const projectTasks = project.tasks.filter(item => tasks.includes(item.taskId))
	const languages = [ ...new Set(projectTasks.map(item => `${ getLang(item.sourceLanguage) } >> ${ getLang(item.targetLanguage) }`)) ]

	function getLang(arg) {
		const { lang } = allLanguages.find(({ symbol }) => symbol === arg)
		return lang
	}

	return `<style>* { margin: 0; padding: 0; }</style>
	<div class="layout" style="background-image: url(${ background });color: #333;height: 1054px;width: 814px;background-size: 65%;background-repeat: no-repeat;background-position: center;font-family: Arial, sans-serif;">
    <div class="header2" style="padding-top: 50px; position: relative;">
       <div class="green-row" style="width: 476px;background: #48A7A6;height: 27px;margin-bottom: 25px;"></div>
       <div class="green-row-image" style="position: absolute; top: 30px; right: 40px;">
         	<div style="background-image: url(${ logo });height: 72px;width: 253;background-size: contain;background-repeat: no-repeat;"></div>
	      </div>
	   </div>
	   <div class="content">
	      <div class="title" style="padding-top: 90px;text-align: center;font-size: 24px;text-decoration: underline;font-weight: bold;">
	         Certification of Translation
	      </div>
	      <div class="description" style="padding: 10px;border: 1px solid #333;font-size: 16px;text-align: center;margin: 20px 40px 60px 40px;line-height: 26px;">
	               Translation of ${ project.projectId } - ${ deliveryData.deliveryName || project.projectName }  <br> 
	               from ${ languages.join(', ') }
	      </div>
	      <div class="text" style="padding: 0 40px 40px;line-height: 22px;">
	         We, Pangea Localization Services, a professional translation company, hereby
	         certify that the aforementioned project has been translated by a qualified translator
	         and that to the best of our knowledge, the translated content is a true, accurate and
	         complete translation of the source text in terms of context, meaning and style.
	      </div>
	      <div class="sub-text" style="padding: 0 40px;">
	         A copy of the translation is attached with this certification.
	      </div>
	      <div class="ceo-container" style="float: right;width: 38%;margin-top: 160px;position: relative;">
	         <div class="pangea-row" style="height: 2px;width: 210px;background: #333;position: absolute; top: 147px;"></div>
	         <div class="ceo-image" style="width: 200px; margin-left: 12px;">
	            <img src="${ stamp }" style="width: 100%;">
	         </div>
	            
	         <div class="ceo" style="margin-top: 15px;">
	            <div class="is" style="margin-bottom: 4px;">Michal Shinitzky</div>
	            <div class="is" style="margin-bottom: 4px;">Pangea Localization Services</div>
	            <div class="is" style="margin-bottom: 4px;">Date: ${ moment(dateNow).format('DD-MM-YYYY') }</div>
	         </div>
	      </div>
	   </div>
	</div>`
}
