function testSentMessage(obj) {
    let date = new Date();
    date.setDate(date.getDate() + 5);
    const sourceLang = obj.source ? obj.source.lang : "NA";
    return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                    <h4 class="contact-name">Dear ${obj.firstName}</h4>
                    <p>
                        As part of our initial process, please find attached our sample text in: ${sourceLang}.
                        The sample translation focuses on ${obj.industry.name} terminology.
                        Please translate the sample into: ${obj.target.lang} and keep in mind that the translation has to be delivered by ${date}.
                        Kindly confirm you have received this email and please advise ahead if you have any issues with the deadline that was provided.
                    </p>
                    <p>
                        If you have any question, please do not hesitate to contact us.

                        Many thanks,
                        
                        Pangea HR team
                    </p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`;
}

function testNotPassedMessage(obj) {
    return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                    <h4 class="contact-name">Hello ${obj.firstName}</h4>
                    <p>
                        Thank you again for applying for the ${obj.target.lang}-Translator@Pangea position.
                        Your test and qualifications have been reviewed carefully and although your talent is valued, we have decided to pursue other candidates at this stage.
                    </p>
                    <p>
                        Should something change on our side, we will not hesitate to contact you.

                        Thank you again for your time and effort, and we wish you the best in your current endeavors.
                        
                        All the best,
                        
                        Pangea HR Team
                    </p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`;
}

function testPassedMessage(obj) {
    return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                    <h4 class="contact-name">Hello ${obj.firstName}</h4>
                    <p>
                        Your test was evaluated and received positive feedback
                        Please review the test results attached.
                        If you have any comments regarding evaluation, let us know.
                    </p>
                    <p>
                        You will receive shortly email with our offer.
                    </p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`;
}

module.exports = {
    testSentMessage,
    testNotPassedMessage,
    testPassedMessage
}