
export class Booking {
    constructor(
        public userId: string,
        public trainId: string,
        public passengers: string[],
        public totalFare: number
    ) {}
}
