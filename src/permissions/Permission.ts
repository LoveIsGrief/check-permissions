export default abstract class Permission {
  abstract async hasPermission(): Promise<boolean>
}
