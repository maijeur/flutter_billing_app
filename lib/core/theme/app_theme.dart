import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Central visual system for the app.
///
/// Keep shared colors and component styles here so every screen feels
/// consistent without changing any business logic.
class AppTheme {
  static const Color primaryColor = Color(0xFF5B5FEF);
  static const Color secondaryColor = Color(0xFF18B8A5);
  static const Color backgroundColor = Color(0xFFF5F7FB);
  static const Color surfaceColor = Colors.white;
  static const Color errorColor = Color(0xFFB42336);
  static const Color textColor = Color(0xFF172033);
  static const Color mutedTextColor = Color(0xFF667085);
  static const Color borderColor = Color(0xFFE4E8F0);

  static final TextTheme textTheme = GoogleFonts.ibmPlexSansTextTheme().copyWith(
    displayLarge: GoogleFonts.ibmPlexSans(
      fontWeight: FontWeight.w700,
      color: textColor,
    ),
    displayMedium: GoogleFonts.ibmPlexSans(
      fontWeight: FontWeight.w700,
      color: textColor,
    ),
    headlineLarge: GoogleFonts.ibmPlexSans(
      fontWeight: FontWeight.w700,
      color: textColor,
    ),
    headlineMedium: GoogleFonts.ibmPlexSans(
      fontWeight: FontWeight.w700,
      color: textColor,
    ),
    titleLarge: GoogleFonts.ibmPlexSans(
      fontSize: 20,
      fontWeight: FontWeight.w700,
      color: textColor,
    ),
    titleMedium: GoogleFonts.ibmPlexSans(
      fontSize: 16,
      fontWeight: FontWeight.w600,
      color: textColor,
    ),
    bodyLarge: GoogleFonts.ibmPlexSans(
      fontSize: 15,
      fontWeight: FontWeight.w400,
      color: textColor,
    ),
    bodyMedium: GoogleFonts.ibmPlexSans(
      fontSize: 14,
      fontWeight: FontWeight.w400,
      color: textColor,
    ),
    bodySmall: GoogleFonts.ibmPlexSans(
      fontSize: 12,
      fontWeight: FontWeight.w400,
      color: mutedTextColor,
    ),
    labelLarge: GoogleFonts.ibmPlexSans(
      fontSize: 14,
      fontWeight: FontWeight.w600,
    ),
  );

  static ThemeData get lightTheme {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: primaryColor,
      brightness: Brightness.light,
      primary: primaryColor,
      secondary: secondaryColor,
      surface: surfaceColor,
      error: errorColor,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: colorScheme,
      primaryColor: primaryColor,
      scaffoldBackgroundColor: backgroundColor,
      textTheme: textTheme,
      visualDensity: VisualDensity.standard,
      dividerTheme: const DividerThemeData(
        color: borderColor,
        thickness: 1,
        space: 1,
      ),
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: surfaceColor,
        surfaceTintColor: Colors.transparent,
        showDragHandle: false,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: backgroundColor,
        foregroundColor: textColor,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleTextStyle: textTheme.titleLarge,
        iconTheme: const IconThemeData(color: textColor),
      ),
      cardTheme: CardThemeData(
        color: surfaceColor,
        surfaceTintColor: Colors.transparent,
        elevation: 1,
        shadowColor: const Color(0xFF172033).withValues(alpha: 0.05),
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(18),
          side: const BorderSide(color: borderColor, width: 0.7),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surfaceColor,
        hintStyle: textTheme.bodyMedium?.copyWith(color: mutedTextColor),
        labelStyle: textTheme.bodyMedium?.copyWith(color: mutedTextColor),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 15,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: borderColor),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: borderColor),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: primaryColor, width: 1.7),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: errorColor),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: errorColor, width: 1.7),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryColor,
          foregroundColor: Colors.white,
          disabledBackgroundColor: const Color(0xFFE5E7F5),
          disabledForegroundColor: mutedTextColor,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
          textStyle: textTheme.labelLarge,
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: primaryColor,
          foregroundColor: Colors.white,
          disabledBackgroundColor: const Color(0xFFE5E7F5),
          disabledForegroundColor: mutedTextColor,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
          textStyle: textTheme.labelLarge,
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: primaryColor,
          side: const BorderSide(color: borderColor),
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
          textStyle: textTheme.labelLarge,
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: primaryColor,
          textStyle: textTheme.labelLarge,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
        ),
      ),
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: secondaryColor,
        foregroundColor: Colors.white,
        elevation: 2,
      ),
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        backgroundColor: const Color(0xFF20283A),
        contentTextStyle: textTheme.bodyMedium?.copyWith(color: Colors.white),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ),
      chipTheme: colorScheme.brightness == Brightness.light
          ? ChipThemeData(
              backgroundColor: const Color(0xFFEEF0FF),
              selectedColor: primaryColor.withValues(alpha: 0.14),
              secondarySelectedColor: secondaryColor.withValues(alpha: 0.14),
              labelStyle: textTheme.labelMedium?.copyWith(color: textColor),
              side: BorderSide.none,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            )
          : const ChipThemeData(),
    );
  }
}
