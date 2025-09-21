export type AppConfig = {
  name: string;
  storageNamespace: string;
};

export type EnvironmentConfig = {
  production: boolean;
  app: AppConfig;
};
