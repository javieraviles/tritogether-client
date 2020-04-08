export interface IConfig {
    apiUrl: string;
}

const config: IConfig = {
    // apiUrl: 'http://localhost:4000'
    apiUrl: 'https://tritogether-api.herokuapp.com'
};

export { config };
