function getErrorTemplate(code, message) {
	return `
		<style> body {background: #fcfcfc} </style>
		<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
		<div class="card" style="font-family:'Roboto'; color:#333; margin: 50px auto;  box-sizing: border-box; width: 390px; background-color: white; padding: 25px;border-radius: 4px;box-shadow: rgba(99, 99, 99, 0.3) 0px 1px 2px 0px, rgba(99, 99, 99, 0.15) 0px 1px 3px 1px;">
		    <div style="display: flex;height: 50px;align-items: center;gap: 10px;justify-content: center;">
		        <div class="image">
		            <img style="height: 32px;" src="../static/error.svg" alt="">
		        </div>
		        <div style="font-size: 19px;  margin-top: 4px; margin-left: 2px; text-transform: uppercase; font-weight: bolder;margin-top: 5px;">
		            ERROR CODE ${ code }
		        </div>
		    </div>
		    <div style="margin-top: 10px; font-size: 16px; text-align: center;">
		    	${ message }
		    </div>
		</div>`
}

function getSuccessTemplate(title, message, footer) {
	const footerBlock = footer
			? `<div style="font-size: 16px; text-align: center; background: #f4f4f4; border-bottom-left-radius: 4px; border-bottom-right-radius: 4px; padding: 10px;">${ footer }</div>`
			: ``

	return `
		<style> 
			body {background: #fcfcfc} 
			a{color:#005282;}
			a:hover{text-decoration: none;}
		</style>
		<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
		<div class="card" style="font-family:'Roboto'; color:#333; margin: 50px auto; box-sizing: border-box; width: 390px; background-color: white; border-radius: 4px;box-shadow: rgba(99, 99, 99, 0.3) 0px 1px 2px 0px, rgba(99, 99, 99, 0.15) 0px 1px 3px 1px;">
		    <div style="padding: 25px;">
			    <div style="display: flex;height: 50px;align-items: center;gap: 10px;justify-content: center;">
			        <div class="image">
			            <img style="height: 32px;" src="../static/success.svg" alt="">
			        </div>
			        <div style="font-size: 19px; margin-top: 4px; margin-left: 2px; text-transform: uppercase; font-weight: bolder;">
			            ${ title }
			        </div>
			    </div>
			    <div style="font-size: 16px; text-align: center;">
			      ${ message }
			    </div>
		    </div>
				${ footerBlock }
		</div>`
}

function getEmailBackbone(message) {
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
                <header style="background-color:#efefef;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
                </header>
                <div class="main" style="padding:25px;" >
											${ message }  
                </div>
                <footer>
                    <hr size="10" style="border:none;" color="#efefef">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#333;" >www.pangea.global</a>
                </footer>
            </div>`
}


module.exports = {
	getEmailBackbone,
	getErrorTemplate,
	getSuccessTemplate
}
