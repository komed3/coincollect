export class DatabaseService {

    private static instance: DatabaseService;

    public static getInstance () : DatabaseService {
        return DatabaseService.instance ||= new DatabaseService();
    }

}
