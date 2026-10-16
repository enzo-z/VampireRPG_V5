import type { ReactNode } from 'react';

// Small stroke icons (24×24 grid, currentColor), drawn for this app.

function Icon({ children, size = 18 }: { children: ReactNode; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export const EyeIcon = () => (
  <Icon>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
);

export const EyeOffIcon = () => (
  <Icon>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <path d="M1 1l22 22" />
  </Icon>
);

export const DownloadIcon = () => (
  <Icon>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="M7 10l5 5 5-5" />
    <path d="M12 15V3" />
  </Icon>
);

export const UploadIcon = () => (
  <Icon>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="M17 8l-5-5-5 5" />
    <path d="M12 3v12" />
  </Icon>
);

export const PencilIcon = () => (
  <Icon size={14}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
  </Icon>
);

export const SaveIcon = () => (
  <Icon size={14}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <path d="M17 21v-8H7v8" />
    <path d="M7 3v5h8" />
  </Icon>
);

export const PlusIcon = () => (
  <Icon>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </Icon>
);

export const CloseIcon = () => (
  <Icon>
    <path d="M18 6L6 18" />
    <path d="M6 6l12 12" />
  </Icon>
);

export const DropIcon = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path fill="currentColor" d="M12 2.5c3.3 4.3 6.2 7.5 6.2 11.2a6.2 6.2 0 0 1-12.4 0C5.8 10 8.7 6.8 12 2.5z" />
  </svg>
);

export const AnkhIcon = () => (
  <Icon size={15}>
    <ellipse cx="12" cy="7" rx="3.8" ry="4.5" />
    <path d="M12 11.5V22" />
    <path d="M6 14.5h12" />
  </Icon>
);

export const MoreIcon = () => (
  <Icon>
    <circle cx="5" cy="12" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
  </Icon>
);

export const TableIcon = () => (
  <Icon>
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
  </Icon>
);

export const BookIcon = () => (
  <Icon>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14z" />
    <path d="M6.5 17A2.5 2.5 0 0 0 4 19.5 2.5 2.5 0 0 0 6.5 22H20v-5" />
  </Icon>
);

export const ListIcon = () => (
  <Icon>
    <path d="M9 6h12M9 12h12M9 18h12" />
    <path d="M4 6h.01M4 12h.01M4 18h.01" />
  </Icon>
);

export const ChevronLeftIcon = () => (
  <Icon>
    <path d="M15 18l-6-6 6-6" />
  </Icon>
);

export const ChevronRightIcon = () => (
  <Icon>
    <path d="M9 18l6-6-6-6" />
  </Icon>
);

export const MenuIcon = () => (
  <Icon>
    <path d="M3 6h18M3 12h18M3 18h18" />
  </Icon>
);

/** A ten-sided die, for the player's cheat sheet. */
export const LockIcon = () => (
  <Icon>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </Icon>
);

export const DieIcon = () => (
  <Icon>
    <path d="M12 2l9 9.5-9 10.5-9-10.5z" />
    <path d="M12 2l4.5 11-4.5 3.5-4.5-3.5z" />
  </Icon>
);
