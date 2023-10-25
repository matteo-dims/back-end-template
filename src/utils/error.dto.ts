
export class ErrorTemplate extends Error {
    statusCode: number;
    serviceName: string;
    message: string;
    constructor(statusCode: number, message: string, serviceName: string) {
        super();
        this.message = message;
        this.statusCode = statusCode;
        this.serviceName = serviceName;
    }
}