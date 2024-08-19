import { Account, Client, Databases, ID } from 'appwrite';

class AppwriteSingleton {
  private static clientInstance: Client;
  private static accountInstance: Account;
  private static databasesInstance: Databases;
  private static API_ENDPOINT: string;
  private static PROJECT_ID: string;

  private constructor() {
    // private constructor to prevent instantiation
  }

  public static init(apiEndpoint: string, projectId: string) {
    AppwriteSingleton.API_ENDPOINT = apiEndpoint;
    AppwriteSingleton.PROJECT_ID = projectId;
    AppwriteSingleton.getClient();
  }

  public static getClient(): Client {
    if (!AppwriteSingleton.clientInstance) {
      if (!AppwriteSingleton.API_ENDPOINT || !AppwriteSingleton.PROJECT_ID) {
        throw new Error('AppwriteSingleton not initialized');
      }
      AppwriteSingleton.clientInstance = new Client()
        .setEndpoint(AppwriteSingleton.API_ENDPOINT)
        .setProject(AppwriteSingleton.PROJECT_ID);
    }
    return AppwriteSingleton.clientInstance;
  }

  public static getAccount(): Account {
    if (!AppwriteSingleton.accountInstance) {
      AppwriteSingleton.accountInstance = new Account(AppwriteSingleton.getClient());
    }
    return AppwriteSingleton.accountInstance;
  }

  public static getDatabases(): Databases {
    if (!AppwriteSingleton.databasesInstance) {
      AppwriteSingleton.databasesInstance = new Databases(AppwriteSingleton.getClient());
    }
    return AppwriteSingleton.databasesInstance;
  }
}

export { AppwriteSingleton, ID };

