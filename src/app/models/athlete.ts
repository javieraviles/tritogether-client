import { Coach } from './coach';

export class Athlete {
    id?: Number;
    name: String;
    email: String;
    password?: String;
    coach?: Coach;
}
