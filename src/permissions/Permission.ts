export default abstract class Permission {
  abstract hasPermission(): Promise<boolean>
}
