
# Design System

This document outlines the design system for the TutorHub v2.0 application. It includes the color palette and typography guidelines to ensure a consistent and cohesive user experience.

## Color Palette

The color palette is defined in `src/app/globals.css` and is used throughout the application. It includes a comprehensive set of CSS variables for both light and dark themes.

### Light Theme

| Variable | HSL | Description |
|---|---|---|
| `--background` | `210 20% 98%` | The background color for the entire application. |
| `--foreground` | `222.2 84% 4.9%` | The primary text color. |
| `--card` | `210 17% 95%` | The background color for cards and other elevated surfaces. |
| `--card-foreground` | `222.2 84% 4.9%` | The text color for cards. |
| `--popover` | `210 17% 95%` | The background color for popovers. |
| `--popover-foreground` | `222.2 84% 4.9%` | The text color for popovers. |
| `--primary` | `217 91% 60%` | The primary brand color. |
| `--primary-foreground` | `210 40% 98%` | The text color for primary buttons. |
| `--secondary` | `210 40% 96.1%` | A secondary brand color. |
| `--secondary-foreground` | `222.2 84% 4.9%` | The text color for secondary buttons. |
| `--muted` | `210 40% 96.1%` | A muted color for less prominent elements. |
| `--muted-foreground` | `215.4 16.3% 46.9%` | The text color for muted elements. |
| `--accent` | `36 100% 50%` | An accent color for highlighting elements. |
| `--accent-foreground` | `36 100% 10%` | The text color for accent elements. |
| `--destructive` | `0 84.2% 60.2%` | A color for destructive actions. |
| `--destructive-foreground` | `210 40% 98%` | The text color for destructive buttons. |
| `--border` | `214.3 31.8% 91.4%` | The color for borders and dividers. |
| `--input` | `214.3 31.8% 91.4%` | The color for input fields. |
| `--ring` | `217 91% 60%` | The color for focus rings. |

### Dark Theme

| Variable | HSL | Description |
|---|---|---|
| `--background` | `222.2 84% 4.9%` | The background color for the entire application. |
| `--foreground` | `210 40% 98%` | The primary text color. |
| `--card` | `222.2 84% 4.9%` | The background color for cards and other elevated surfaces. |
| `--card-foreground` | `210 40% 98%` | The text color for cards. |
| `--popover` | `222.2 84% 4.9%` | The background color for popovers. |
| `--popover-foreground` | `210 40% 98%` | The text color for popovers. |
| `--primary` | `217 91% 60%` | The primary brand color. |
| `--primary-foreground` | `210 40% 98%` | The text color for primary buttons. |
| `--secondary` | `217.2 32.6% 17.5%` | A secondary brand color. |
| `--secondary-foreground` | `210 40% 98%` | The text color for secondary buttons. |
| `--muted` | `217.2 32.6% 17.5%` | A muted color for less prominent elements. |
| `--muted-foreground` | `215.4 16.3% 56.9%` | The text color for muted elements. |
| `--accent` | `36 100% 50%` | An accent color for highlighting elements. |
| `--accent-foreground` | `36 100% 10%` | The text color for accent elements. |
| `--destructive` | `0 62.8% 30.6%` | A color for destructive actions. |
| `--destructive-foreground` | `210 40% 98%` | The text color for destructive buttons. |
| `--border` | `217.2 32.6% 17.5%` | The color for borders and dividers. |
| `--input` | `217.2 32.6% 17.5%` | The color for input fields. |
| `--ring` | `217 91% 60%` | The color for focus rings. |

## Typography

The typography is defined in `tailwind.config.ts` and uses custom font families for body text, headlines, and code.

| Font Family | Usage |
|---|---|
| `PT Sans` | The primary font for all body text. |
| `Playfair Display` | Used for headlines and other prominent text elements. |
| `monospace` | Used for code blocks and other monospaced text. |

