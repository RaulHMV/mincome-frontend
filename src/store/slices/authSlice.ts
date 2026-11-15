import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { USER } from '../../data/mockData';
import type { RootState } from '../store';

/** Perfil de usuario autenticado (RNF3: sin contraseñas ni credenciales en Redux). */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  initials: string;
  currency: 'MXN';
  plan: 'gratuito' | 'premium';
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  registeredUsers: AuthUser[];
}

function deriveInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  }
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return 'US';
}

function deriveNameFromEmail(email: string): string {
  const localPart = email.split('@')[0] ?? '';
  const words = localPart
    .split(/[._-]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (words.length === 0) return 'Usuario';

  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

const DEMO_USER: AuthUser = {
  id: 'usr-demo-1',
  name: USER.name,
  email: USER.email.toLowerCase(),
  initials: USER.initials,
  currency: 'MXN',
  plan: 'gratuito',
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  registeredUsers: [DEMO_USER],
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ email: string }>) => {
      const normalizedEmail = action.payload.email.trim().toLowerCase();
      const existing = state.registeredUsers.find(
        (u) => u.email.toLowerCase() === normalizedEmail,
      );

      if (existing) {
        state.user = existing;
      } else {
        const derivedName = deriveNameFromEmail(normalizedEmail);
        state.user = {
          id: `usr-${Date.now()}`,
          name: derivedName,
          email: normalizedEmail,
          initials: deriveInitials(derivedName),
          currency: 'MXN',
          plan: 'gratuito',
        };
      }

      state.isAuthenticated = true;
    },

    registerSuccess: (state, action: PayloadAction<{ name: string; email: string }>) => {
      const cleanName = action.payload.name.trim().replace(/\s+/g, ' ');
      const normalizedEmail = action.payload.email.trim().toLowerCase();
      const initials = deriveInitials(cleanName);

      const existingIdx = state.registeredUsers.findIndex(
        (u) => u.email.toLowerCase() === normalizedEmail,
      );

      if (existingIdx !== -1) {
        state.registeredUsers[existingIdx] = {
          ...state.registeredUsers[existingIdx],
          name: cleanName,
          email: normalizedEmail,
          initials,
        };
        state.user = state.registeredUsers[existingIdx];
      } else {
        const newUser: AuthUser = {
          id: `usr-${Date.now()}`,
          name: cleanName,
          email: normalizedEmail,
          initials,
          currency: 'MXN',
          plan: 'gratuito',
        };
        state.registeredUsers.push(newUser);
        state.user = newUser;
      }

      state.isAuthenticated = true;
    },

    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { loginSuccess, registerSuccess, logout } = authSlice.actions;
export default authSlice.reducer;

/* ───────── Selectores memoizados ───────── */

const selectAuthState = (state: RootState) => state.auth;

export const selectCurrentUser = createSelector([selectAuthState], (auth) => auth.user);

export const selectIsAuthenticated = createSelector(
  [selectAuthState],
  (auth) => auth.isAuthenticated,
);

export const selectUserFirstName = createSelector([selectCurrentUser], (user) => {
  const first = user?.name.trim().split(/\s+/)[0];
  return first || 'Usuario';
});

