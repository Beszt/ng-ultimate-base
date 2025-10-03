export type AppConfig = {
  name: string;
  storageNamespace: string;
};

export type RuntimeConfig = {
  app: AppConfig;
  [key: string]: unknown;
};
