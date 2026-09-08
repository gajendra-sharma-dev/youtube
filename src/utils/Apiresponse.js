class Apiresponse  {
    constructor(statusCode,data,massege="success") {
        this.statusCode = statusCode
        this.data = data
        this.massege = massege
        this.success = statusCode < 400
    }
}


export {Apiresponse}