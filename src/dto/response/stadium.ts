export interface stadiums {
    StadiumID: number;
    UserID: number;
    StadiumName: string;
    CourtAll: number;
    Location: string;
    ImageStadium?: string | Buffer;
    FavoriteID?: number;
}

export interface UserResponseModel {
    status_code: number;
    status_message: string;
    data: stadiums[];
    total: number;
}

export interface ResponseModel {
    status_code: number;
    status_message: string;
}