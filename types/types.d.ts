type AppSpec = {
    startDate: string,
    endDate : string,
    env: AppEnv
}

type AppEnv = {
    database: any,
    workLocation: string
}