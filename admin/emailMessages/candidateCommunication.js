function testSentMessage(obj) {
	let date = new Date();
	date.setDate(date.getDate() + 5);
	const sourceLang = obj.source ? obj.source.lang : "NA";
	const industriesList = obj.industries.reduce((acc, curr) => acc + `<li>${ curr.name };</li>`, '');
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
                <header style="background-color:#efefef;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
                </header>
                <div class="main" style="padding:25px;" >
                    <p style="background: #f7f7f7; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ obj.firstName }</span></p>
                    <p style="font-weight: 400;">
                        As part of our initial process, please find attached our sample text in: ${ sourceLang }. <br>
                        The sample translation focuses on terminology(s): <br>
                        <ul style="font-weight: 400;">
                          ${ industriesList }
                        </ul>
                        <span style="font-weight: 400;">
	                        Please translate the sample into: ${ obj.target.lang } and keep in mind that the translation has to be delivered by ${ date }. <br>
	                        Kindly confirm you have received this email and please advise ahead if you have any issues with the deadline that was provided.
                        </span>
                    </p>
                    <p>
                    	Please sent the completed test to <span style="color: #d66f58">career@pangea.global</span>
                    </p>
                    <p style="font-weight: 400;">
                        If you have any question, please do not hesitate to contact us in <span style="color: #d66f58">career@pangea.global</span> <br>
                        Many thanks,<br>
                        Pangea HR team
                    </p>
                </div>
                <footer>
                    <hr size="10" style="border:none;" color="#efefef">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#333;" >www.pangea.global</a>
                </footer>
            </div>`;
}

function testNotPassedMessage(obj) {
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
                <header style="background-color:#efefef;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
                </header>
                <div class="main" style="padding:25px;" >
                    <p style="background: #f7f7f7; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Hello ${ obj.firstName }</span></p>
                    <p style="font-weight: 400;" >
                        Thank you again for applying for the ${ obj.target.lang }-Translator@Pangea position. <br>
                        Your test and qualifications have been reviewed carefully and although your talent is valued, we have decided to pursue other candidates at this stage.
                    </p>
                    <p style="font-weight: 400;" >
                        Should something change on our side, we will not hesitate to contact you. <br>
                        Thank you again for your time and effort, and we wish you the best in your current endeavors. <br>
                        All the best, <br>
                        Pangea HR Team
                    </p>
                </div>
                <footer>
                    <hr size="10" style="border:none;" color="#efefef">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#333;" >www.pangea.global</a>
                </footer>
            </div>`;
}

function testPassedMessage(obj) {
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
                <header style="background-color:#efefef;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
                </header>
                <div class="main" style="padding:25px;" >
                    <p style="background: #f7f7f7; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Hello ${ obj.firstName }</span></p>
                    <p style="font-weight: 400;">
                        Your test was evaluated and received positive feedback <br>
                        Please review the test results attached. <br>
                        If you have any comments regarding evaluation, let us know.
                    </p>
                    <p style="font-weight: 400;">
                        You will receive shortly email with our offer.
                    </p>
                </div>
                <footer>
                    <hr size="10" style="border:none;" color="#efefef">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#333;" >www.pangea.global</a>
                </footer>
            </div>`;
}

function rejectedPendingCompetenceTemplate({vendorName, sourceLanguage, targetLanguage, industry, step}) {
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
                <header style="background-color:#efefef;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
                </header>
                <div class="main" style="padding:25px;" >
                    <p style="background: #f7f7f7; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ vendorName },</span></p>
                    <p style="font-weight: 400;" >
                      We appreciate the time and effort you invested in completing this form.
                      Unfortunately, your profile does not match our requirements. Here are the details:
                    </p>
                    <p style="font-weight: 400;">
                    	Competency: <br>
                      - Language pair: ${sourceLanguage.lang + ' >> ' + targetLanguage.lang}<br>
                      - Industry: ${industry.name}<br>
                      - Step: ${step.title}
                    </p>
                    <p style="font-weight: 400;">Reason: <br>
                    	VM to enter more details here
                    </p>
                    <p style="font-weight: 400;">
                    We wish you good luck in pursuing other opportunities. <br>
                    Kind regards, <br>
                    Pangea HR team
                    </p>
                </div>
                <footer>
                    <hr size="10" style="border:none;" color="#efefef">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#333;" >www.pangea.global</a>
                </footer>
            </div>`;
}

module.exports = {
	testSentMessage,
	testNotPassedMessage,
	testPassedMessage,
	rejectedPendingCompetenceTemplate
}
