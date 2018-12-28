import { Athlete } from './athlete';

export class Coach {
    id?: Number;
    name: String;
    email: String;
    password?: String;
    athletes?: Athlete[];
}
