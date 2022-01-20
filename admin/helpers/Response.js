class Response {
	constructor(status, data) {
		this.status = status
		status === 'success'
				? this.data = data
				: this.message = data
	}
}

Response.Error = 'error'
Response.Success = 'success'

module.exports = Response