class DateTimeUtils {
  static String formatDateToParam(DateTime dateTime) {
    return "${dateTime.year}-${dateTime.month}-${dateTime.day}";
  }
}
