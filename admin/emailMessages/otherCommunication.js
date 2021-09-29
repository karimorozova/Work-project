function getErrorTemplate(code, message) {
	return `<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
		<div class="card" style="font-family:'Roboto'; color:#333; margin: 50px auto; width: 340px; background-color: white; padding: 25px;border-radius: 4px;box-shadow: rgba(99, 99, 99, 0.3) 0px 1px 2px 0px, rgba(99, 99, 99, 0.15) 0px 1px 3px 1px;">
		    <div style="display: flex;height: 50px;align-items: center;gap: 10px;justify-content: center;">
		        <div class="image">
		            <img style="height: 38px;" src="../static/error.svg" alt="">
		        </div>
		        <div style="font-size: 18px; text-transform: uppercase; font-weight: bolder;margin-top: 5px;">
		            ERROR CODE ${ code }
		        </div>
		    </div>
		    <div style="margin-top: 10px; font-size: 16px; text-align: center;">
		    	${ message }
		    </div>
		</div>`
}

function getSuccessTemplate(title, message) {
	return `<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
		<div class="card" style="font-family:'Roboto'; color:#333; margin: 50px auto; width: 340px; background-color: white; padding: 25px;border-radius: 4px;box-shadow: rgba(99, 99, 99, 0.3) 0px 1px 2px 0px, rgba(99, 99, 99, 0.15) 0px 1px 3px 1px;">
		    <div style="display: flex;height: 50px;align-items: center;gap: 10px;justify-content: center;">
		        <div class="image">
		            <img style="height: 38px;" src="../static/success.svg" alt="">
		        </div>
		        <div style="font-size: 18px; text-transform: uppercase; font-weight: bolder;margin-top: 5px;">
		            ${ title }
		        </div>
		    </div>
		    <div style="margin-top: 10px; font-size: 16px; text-align: center;">
		    	${ message }
		    </div>
		</div>`
}


module.exports = {
	getErrorTemplate,
	getSuccessTemplate
}
