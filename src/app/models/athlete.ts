import { Coach } from './coach';

export class Athlete {
    id?: number;
    name: string;
    email: string;
    password?: string;
    coach?: Coach;
}
