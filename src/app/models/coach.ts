import { Athlete } from './athlete';

export class Coach {
    id?: number;
    name: string;
    email: string;
    password?: string;
    athletes?: Athlete[];
}
