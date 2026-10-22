class AppValidators {
  static String? Function(String?) required(String message) {
    return (String? value) {
      if (value == null || value.trim().isEmpty) {
        return message;
      }
      return null;
    };
  }

  static String? price(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Veuillez saisir un prix';
    }
    final normalizedValue = value.replaceAll(',', '.');
    final parsedValue = double.tryParse(normalizedValue);
    if (parsedValue == null) {
      return 'Veuillez saisir un nombre valide';
    }
    if (parsedValue < 0) {
      return 'Le prix ne peut pas être négatif';
    }
    return null;
  }
}
