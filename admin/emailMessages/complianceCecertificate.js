module.exports.getCertificateTemplate = ({ project, task }) => {
	return `<div class="layout" style="color: #333;height: 900px;width: 820px;background-size: 80%;background-repeat: no-repeat;background-position: center;background: lightgrey;font-family: Arial, Helvetica, sans-serif;border: 1px solid #ebebeb;">
		<div class="header" style="padding-top: 40px;display: flex;">
		<div class="green-row" style="width: 70%;background: #48A6A6;height: 52px;"></div>
		<div class="green-row-image" style="width: 200px;margin-top: -14px;margin-left: 10px;">

		</div>
		</div>
		<div class="content">
		<div class="title" style="padding-top: 100px;text-align: center;font-size: 24px;text-decoration: underline;font-weight: bold;">
		Certification of Translation
		</div>
		<div class="description" style="padding: 6px;border: 2px solid #333;font-size: 14px;text-align: center;margin: 20px 40px 60px 40px;">
		Translation of "PrID"-"PrName" from "SOURCE" to "TARGET"
		</div>
		<div class="text" style="padding: 0 40px 40px;">
		We, Pangea Localization Services, a professional translation company, hereby
		certify that the aforementioned project has been translated by a qualified translator
		and that to the best of our knowledge, the translated content is a true, accurate and
		complete translation of the source text in terms of context, meaning and style.
		</div>
		<div class="sub-text" style="padding: 0 40px;">
		A copy of the translation is attached with this certification.
		</div>
		<div class="ceo-container" style="float: right;width: 37%;margin-top: 130px;position: relative;">
		<div class="pangea-row" style="height: 2px;width: 210px;background: #333;position: absolute;top: 147px;"></div>
		<div class="ceo-image" style="width: 190px;">

		</div>
		<div class="ceo" style="margin-top: 10px;">
		<div class="is" style="margin-bottom: 2px;">Michal Shinitzky</div>
		<div class="is" style="margin-bottom: 2px;">Pangea Localization Services</div>
		<div class="is" style="margin-bottom: 2px;">Date: "Date now"</div>
		</div>
		</div>
		</div>
</div>`
}
