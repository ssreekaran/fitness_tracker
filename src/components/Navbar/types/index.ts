import { User } from 'firebase/auth';

export interface NavLinkItem {
  title: string;
  path: string;
  requiresAuth?: boolean;
  hideWhenAuth?: boolean;
  children?: NavLinkItem[];
}

export interface UserMenuProps {
  user: User | null;
  onSignOut: () => Promise<void>;
  isMenuOpen: boolean;
  toggleMenu: () => void;
}

export interface ThemeToggleProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export interface Suggestion {
  title: string;
  path: string;
}

export interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  showSuggestions: boolean;
  suggestions: Suggestion[];
  onSuggestionClick: (suggestion: Suggestion) => void;
}

export interface MobileMenuProps {
  isMenuOpen: boolean;
  toggleMenu: () => void;
  children: React.ReactNode;
}

export interface NavbarProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  user: User | null;
  onSignOut: () => Promise<void>;
}
