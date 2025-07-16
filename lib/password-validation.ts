export interface PasswordRequirement {
  id: string;
  label: string;
  met: boolean;
}

export interface PasswordStrength {
  score: number; // 0-4 (0 = very weak, 4 = very strong)
  label: string;
  color: string;
  requirements: PasswordRequirement[];
}

export function validatePassword(password: string): PasswordStrength {
  const requirements: PasswordRequirement[] = [
    {
      id: 'length',
      label: 'At least 8 characters',
      met: password.length >= 8
    },
    {
      id: 'uppercase',
      label: 'One uppercase letter',
      met: /[A-Z]/.test(password)
    },
    {
      id: 'lowercase',
      label: 'One lowercase letter',
      met: /[a-z]/.test(password)
    },
    {
      id: 'number',
      label: 'One number',
      met: /\d/.test(password)
    },
    {
      id: 'special',
      label: 'One special character',
      met: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }
  ];

  const metCount = requirements.filter(req => req.met).length;
  
  let score = 0;
  let label = '';
  let color = '';

  // Calculate score based on requirements met and password length
  if (password.length === 0) {
    score = 0;
    label = '';
    color = 'gray';
  } else if (metCount <= 1) {
    score = 1;
    label = 'Very weak';
    color = 'red';
  } else if (metCount === 2) {
    score = 2;
    label = 'Weak';
    color = 'orange';
  } else if (metCount === 3) {
    score = 3;
    label = 'Good';
    color = 'yellow';
  } else if (metCount === 4) {
    score = 4;
    label = 'Strong';
    color = 'green';
  } else if (metCount === 5) {
    score = 4;
    label = 'Very strong';
    color = 'green';
  }

  // Bonus points for longer passwords
  if (password.length >= 12 && score >= 3) {
    score = Math.min(4, score + 1);
    if (score === 4) {
      label = 'Very strong';
    }
  }

  return {
    score,
    label,
    color,
    requirements
  };
}

export function getPasswordStrengthColor(score: number): string {
  switch (score) {
    case 0:
      return 'bg-gray-300 dark:bg-gray-600';
    case 1:
      return 'bg-red-500';
    case 2:
      return 'bg-orange-500';
    case 3:
      return 'bg-yellow-500';
    case 4:
      return 'bg-green-500';
    default:
      return 'bg-gray-300 dark:bg-gray-600';
  }
}

export function getPasswordStrengthTextColor(score: number): string {
  switch (score) {
    case 0:
      return 'text-gray-500 dark:text-gray-400';
    case 1:
      return 'text-red-600 dark:text-red-400';
    case 2:
      return 'text-orange-600 dark:text-orange-400';
    case 3:
      return 'text-yellow-600 dark:text-yellow-400';
    case 4:
      return 'text-green-600 dark:text-green-400';
    default:
      return 'text-gray-500 dark:text-gray-400';
  }
}