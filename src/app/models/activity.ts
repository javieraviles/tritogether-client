import { Discipline } from '../models';

export class Activity {
    id?: number;
    description: string;
    date: Date;
    discipline: Discipline;
}
