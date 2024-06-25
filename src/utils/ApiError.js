class ApiError extends Error {      // this is built-in Error class
    constructor(
        statusCode,
        message ="something went wrong",
        errors =[],
        stack ="",
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.errors= errors
        this.success = false
        this.stack= stack
    }
}

export {ApiError}