export interface TimeStop {
    paymentTime?: string;
}

export interface TimeStopResponseModel {
    status_code: number;
    status_message: string;
    data: TimeStop[];
    total: number;
}

export interface ResponseModel {
    status_code: number;
    status_message: string;
}