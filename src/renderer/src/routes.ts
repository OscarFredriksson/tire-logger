const CARS = '/cars';
const CAR = '/car/:carId';

const STINTS = `${CAR}/stints`;

const TIRES = `${CAR}/tires`;
const TIRE_tireId = `${TIRES}/:tireId`;

const TRACKS = '/tracks';

export const routes = { STINTS, TIRES, TIRE_tireId, TRACKS, CARS };
