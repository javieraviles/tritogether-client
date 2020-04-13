import { Coach } from './coach';
import { Availability } from './availability';

export class Athlete {
    id?: number;
    name: string;
    email: string;
    password?: string;
    availability?: Availability;
    coach?: Coach;
}
