interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

interface GoogleButtonConfig {
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  width?: string;
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
}

interface GoogleAccounts {
  id: {
    initialize(config: {
      client_id: string;
      callback: (response: GoogleCredentialResponse) => void;
      auto_select?: boolean;
    }): void;
    renderButton(element: HTMLElement, config: GoogleButtonConfig): void;
    prompt(): void;
    disableAutoSelect(): void;
  };
}

interface Window {
  google?: {
    accounts: GoogleAccounts;
  };
}
